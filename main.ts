#!/usr/bin/env -S deno run --allow-net --allow-write --allow-read --allow-env

import { load } from "@std/dotenv";
import { YouTubeAPIClient } from "./src/youtube-api.ts";
import {
  displayCommentStats,
  displayError,
  displayProgress,
  saveCommentsToFile,
} from "./src/file-utils.ts";
import { APIError, type ProgressInfo } from "./src/types.ts";

/**
 * コマンドライン引数を解析
 */
function parseArgs(): { videoId: string; outputDir: string } {
  const args = Deno.args;

  if (args.length === 0) {
    console.error(
      "❌ 使用方法: deno run --allow-net --allow-write --allow-env main.ts <動画ID> [出力ディレクトリ]",
    );
    console.error("例: deno run --allow-net --allow-write --allow-env main.ts dQw4w9WgXcQ");
    console.error(
      "例: deno run --allow-net --allow-write --allow-env main.ts https://www.youtube.com/watch?v=dQw4w9WgXcQ ./output",
    );
    Deno.exit(1);
  }

  const videoId = args[0];
  const outputDir = args[1] || ".";

  if (!videoId) {
    console.error("❌ 動画IDが指定されていません");
    Deno.exit(1);
  }

  return {
    videoId,
    outputDir,
  };
}

/**
 * 環境変数からAPIキーを取得
 */
async function getAPIKey(): Promise<string> {
  // .envファイルを読み込み
  try {
    const env = await load();
    console.log("📄 .envファイルを読み込みました");

    // .envファイルから取得を試行
    if (env.YOUTUBE_API_KEY) {
      console.log("✓ .envファイルからAPIキーを取得しました");
      return env.YOUTUBE_API_KEY;
    }
  } catch {
    console.log("💡 .envファイルが見つからないため、環境変数から読み込みます");
  }

  // 環境変数から取得
  const apiKey = Deno.env.get("YOUTUBE_API_KEY");

  if (!apiKey) {
    console.error("❌ APIキーが設定されていません。");
    console.error("以下のいずれかの方法でYouTube Data API v3のAPIキーを設定してください：");
    console.error("");
    console.error("方法1: .envファイルに記述");
    console.error("  echo 'YOUTUBE_API_KEY=your_api_key_here' > .env");
    console.error("");
    console.error("方法2: 環境変数に設定");
    console.error("  export YOUTUBE_API_KEY=your_api_key_here");
    Deno.exit(1);
  }

  console.log("✓ 環境変数からAPIキーを取得しました");
  return apiKey;
}

/**
 * メイン処理
 */
async function main() {
  console.log("🎬 YouTube コメント全件収集ツール");
  console.log("=====================================\n");

  try {
    // コマンドライン引数の解析
    const { videoId, outputDir } = parseArgs();

    // APIキーの取得
    const apiKey = await getAPIKey();

    // YouTubeAPIクライアントの初期化
    const client = new YouTubeAPIClient(apiKey);

    console.log(`📹 対象動画: ${videoId}`);
    console.log(`📁 出力先: ${outputDir}`);
    console.log("");

    // 進捗表示のためのコールバック関数
    const onProgress = (progress: ProgressInfo) => {
      displayProgress(progress);
    };

    // コメントの収集開始
    const startTime = Date.now();
    const comments = await client.getAllComments(videoId, onProgress);
    const endTime = Date.now();

    const executionTime = (endTime - startTime) / 1000;

    // 統計情報の表示
    displayCommentStats(comments);

    // API使用統計の表示
    const stats = client.getStats();
    console.log(`\n📊 API使用統計:`);
    console.log(`  APIリクエスト数: ${stats.requestCount} 回`);
    console.log(`  推定クォータ使用量: ${stats.estimatedQuotaUsage} 単位`);
    console.log(`  実行時間: ${executionTime.toFixed(2)} 秒`);

    // コメントが存在しない場合
    if (comments.length === 0) {
      console.log("\n💡 この動画にはコメントがありません（またはコメントが無効になっています）。");

      // 空のJSONファイルを作成
      await saveCommentsToFile([], videoId, outputDir);
      return;
    }

    // ファイルに保存
    await saveCommentsToFile(comments, videoId, outputDir);

    console.log("\n✅ コメント収集が完了しました！");
  } catch (error) {
    if (error instanceof APIError) {
      displayError(error);

      // 特定のAPIエラーに対する追加情報
      switch (error.code) {
        case 403:
          console.error("\n💡 対処法:");
          console.error("  - APIキーが正しく設定されているか確認してください");
          console.error("  - YouTube Data API v3が有効になっているか確認してください");
          console.error("  - クォータ制限に達していないか確認してください");
          break;
        case 404:
          console.error("\n💡 対処法:");
          console.error("  - 動画IDが正しいか確認してください");
          console.error("  - 動画が削除されていないか確認してください");
          console.error("  - 動画が非公開になっていないか確認してください");
          break;
        case 400:
          console.error("\n💡 対処法:");
          console.error("  - 動画IDの形式が正しいか確認してください");
          break;
      }
    } else {
      displayError(error as Error);
    }

    Deno.exit(1);
  }
}

// メイン処理の実行
if (import.meta.main) {
  await main();
}

import type { CommentData } from "./types.ts";
import { APIError } from "./types.ts";

/**
 * コメントデータをJSONファイルに出力
 */
export async function saveCommentsToFile(
  comments: CommentData[],
  videoId: string,
  outputDir = ".",
): Promise<void> {
  const filename = `${videoId}_comments.json`;
  const filepath = `${outputDir}/${filename}`;

  try {
    // 出力ディレクトリが存在しない場合は作成
    await Deno.mkdir(outputDir, { recursive: true });

    // JSONファイルとして保存（インデント付きで見やすく）
    const jsonContent = JSON.stringify(comments, null, 2);
    await Deno.writeTextFile(filepath, jsonContent);

    console.log(`✓ コメントデータを保存しました: ${filepath}`);
    console.log(`  総コメント数: ${comments.length}`);
    console.log(`  ファイルサイズ: ${(jsonContent.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`ファイル保存に失敗しました: ${errorMessage}`);
  }
}

/**
 * 進捗状況を表示
 */
export function displayProgress(progress: { processedComments: number; currentOperation: string }) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(
    `[${timestamp}] 処理済み: ${progress.processedComments} 件 - ${progress.currentOperation}`,
  );
}

/**
 * コメント統計情報を表示
 */
export function displayCommentStats(comments: CommentData[]) {
  const topLevelComments = comments.filter((c) => !c.parentId);
  const replyComments = comments.filter((c) => c.parentId);
  const totalLikes = comments.reduce((sum, c) => sum + (c.likeCount || 0), 0);

  console.log("\n📊 コメント統計:");
  console.log(`  トップレベルコメント: ${topLevelComments.length} 件`);
  console.log(`  返信コメント: ${replyComments.length} 件`);
  console.log(`  総コメント数: ${comments.length} 件`);
  console.log(`  総高評価数: ${totalLikes} 件`);

  // 最も古いコメントと新しいコメント
  if (comments.length > 0) {
    const sortedByDate = comments.sort((a, b) =>
      new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    );
    const oldestComment = sortedByDate[0];
    const newestComment = sortedByDate[sortedByDate.length - 1];

    if (oldestComment && newestComment) {
      console.log(`  最古のコメント: ${new Date(oldestComment.publishedAt).toLocaleString()}`);
      console.log(`  最新のコメント: ${new Date(newestComment.publishedAt).toLocaleString()}`);
    }
  }
}

/**
 * エラー情報を表示
 */
export function displayError(error: Error) {
  console.error(`\n❌ エラーが発生しました:`);
  console.error(`  ${error.message}`);

  if (error instanceof APIError) {
    console.error(`  HTTPステータス: ${error.code}`);
    if (error.errors) {
      console.error(`  詳細:`, error.errors);
    }
  }
}

# YouTube コメント全件収集ツール

指定されたYouTube動画のコメント（トップレベルコメントおよびその返信）を全件収集し、JSON形式で保存するDenoアプリケーションです。

## 🚀 特徴

- **全件収集**: トップレベルコメントと返信コメントを漏れなく収集
- **レート制限対応**: YouTube Data API v3のレート制限を考慮した安全な処理
- **進捗表示**: リアルタイムで収集状況を表示
- **統計情報**: コメント数、高評価数、期間などの統計を表示
- **エラーハンドリング**: 分かりやすいエラーメッセージと対処法を提示
- **柔軟な入力**: 動画IDまたはYouTube URLを受け付け

## 📋 必要な環境

- [Deno](https://deno.land/) v1.40以上
- YouTube Data API v3のAPIキー

## 🔧 セットアップ

### 1. APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. YouTube Data API v3を有効化
3. APIキーを作成
4. 環境変数に設定:

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

### 2. プロジェクトのクローン

```bash
git clone <repository-url>
cd youtube-comments
```

## 💻 使用方法

### 基本的な使用方法

```bash
# 動画IDを指定
deno task start dQw4w9WgXcQ

# YouTube URLを指定
deno task start "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# 出力ディレクトリを指定
deno task start dQw4w9WgXcQ ./output
```

### 直接実行

```bash
deno run --allow-net --allow-write --allow-env main.ts <動画ID> [出力ディレクトリ]
```

## 📊 出力形式

コメントデータは `<動画ID>_comments.json` というファイル名で保存されます。

### JSON構造

```json
[
  {
    "id": "コメントID",
    "textOriginal": "コメント本文（生テキスト）",
    "textDisplay": "コメント本文（表示用HTML）",
    "authorDisplayName": "投稿者名",
    "authorProfileImageUrl": "プロフィール画像URL",
    "authorChannelUrl": "投稿者チャンネルURL",
    "publishedAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "likeCount": 123,
    "totalReplyCount": 5,
    "parentId": null
  }
]
```

### データ項目の説明

| 項目                    | 説明                     | 備考                     |
| ----------------------- | ------------------------ | ------------------------ |
| `id`                    | コメントの一意識別子     | 必須                     |
| `textOriginal`          | コメントの生テキスト     | 必須                     |
| `textDisplay`           | 表示用のHTMLテキスト     | 任意                     |
| `authorDisplayName`     | 投稿者の表示名           | 必須                     |
| `authorProfileImageUrl` | プロフィール画像のURL    | 任意                     |
| `authorChannelUrl`      | 投稿者のチャンネルURL    | 必須                     |
| `publishedAt`           | 投稿日時（ISO 8601形式） | 必須                     |
| `updatedAt`             | 更新日時（ISO 8601形式） | 必須                     |
| `likeCount`             | 高評価数                 | 必須                     |
| `totalReplyCount`       | 返信数                   | トップレベルコメントのみ |
| `parentId`              | 親コメントID             | 返信コメントのみ         |

## 🔍 実行例

```bash
$ deno task start dQw4w9WgXcQ

🎬 YouTube コメント全件収集ツール
=====================================

📹 対象動画: dQw4w9WgXcQ
📁 出力先: .

動画 dQw4w9WgXcQ のコメント収集を開始します...
[API Request 1] https://www.googleapis.com/youtube/v3/commentThreads?...
[15:30:45] 処理済み: 100 件 - トップレベルコメントを取得中...
[API Request 2] https://www.googleapis.com/youtube/v3/commentThreads?...
...
収集完了: 合計 1,234 件のコメント

📊 コメント統計:
  トップレベルコメント: 800 件
  返信コメント: 434 件
  総コメント数: 1,234 件
  総高評価数: 5,678 件
  最古のコメント: 2023/01/15 10:30:00
  最新のコメント: 2024/03/10 14:20:30

📊 API使用統計:
  APIリクエスト数: 15 回
  推定クォータ使用量: 15 単位
  実行時間: 18.45 秒

✓ コメントデータを保存しました: ./dQw4w9WgXcQ_comments.json
  総コメント数: 1,234
  ファイルサイズ: 2.45 MB

✅ コメント収集が完了しました！
```

## ⚠️ 制限事項

### APIクォータ制限

- YouTube Data API v3は1日あたり10,000単位のクォータ制限があります
- 各APIリクエストは1単位を消費します
- 大量のコメントがある動画では、クォータを使い切る可能性があります

### レート制限

- 100リクエスト/100秒/ユーザーの制限があります
- 本ツールは自動的に1秒間隔でリクエストを送信します

## 🛠️ 開発

### テストの実行

```bash
deno task test
```

### コードのフォーマット

```bash
deno fmt
```

### コードの検査

```bash
deno lint
```

## 📂 プロジェクト構造

```
.
├── main.ts                 # メインアプリケーション
├── src/
│   ├── types.ts           # TypeScript型定義
│   ├── youtube-api.ts     # YouTube API クライアント
│   └── file-utils.ts      # ファイル操作ユーティリティ
├── docs/
│   └── 要件定義.md         # 要件定義書
├── deno.json              # Deno設定ファイル
└── README.md              # このファイル
```

## 🐛 トラブルシューティング

### よくあるエラー

#### `❌ 環境変数 YOUTUBE_API_KEY が設定されていません。`

**原因**: APIキーが設定されていない

**対処法**:

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

#### `HTTP 403` エラー

**考えられる原因**:

- APIキーが無効
- YouTube Data API v3が有効になっていない
- クォータ制限に達している

#### `HTTP 404` エラー

**考えられる原因**:

- 動画IDが間違っている
- 動画が削除されている
- 動画が非公開設定になっている

#### `HTTP 400` エラー

**考えられる原因**:

- 動画IDの形式が無効

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤝 貢献

プルリクエストやイシューの報告を歓迎します。

## 📝 更新履歴

- v1.0.0: 初回リリース
  - 基本的なコメント収集機能
  - レート制限対応
  - 進捗表示機能
  - 統計情報表示機能

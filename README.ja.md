# YouTube コメント全件収集ツール

指定されたYouTube動画のコメント（トップレベルコメントおよびその返信）を全件収集し、JSON形式で保存するDenoアプリケーションです。

## 必要な環境

- [Deno](https://deno.land/) v1.40以上
- YouTube Data API v3のAPIキー

## 🔧 セットアップ

### 1. APIキーの取得

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. YouTube Data API v3を有効化
3. APIキーを作成
4. 環境変数に設定:

#### 方法1: シェルで直接設定する

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

#### 方法2: `.env` ファイルを使用する

プロジェクトのルートディレクトリに `.env` という名前のファイルを作成し、以下のようにAPIキーを記述します。

```env
YOUTUBE_API_KEY=your_api_key_here
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
deno run --allow-net --allow-write --allow-env --allow-read main.ts <動画ID> [出力ディレクトリ]
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
    "replies": [
      {
        "id": "返信コメントID",
        "textOriginal": "返信コメント本文（生テキスト）",
        "textDisplay": "返信コメント本文（表示用HTML）",
        "authorDisplayName": "返信投稿者名",
        "authorProfileImageUrl": "返信プロフィール画像URL",
        "authorChannelUrl": "返信投稿者チャンネルURL",
        "publishedAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "likeCount": 42
      }
    ]
  }
]
```

### データ項目の説明

| 項目                    | 説明                     | 備考                           |
| ----------------------- | ------------------------ | ------------------------------ |
| `id`                    | コメントの一意識別子     | 必須                           |
| `textOriginal`          | コメントの生テキスト     | 必須                           |
| `textDisplay`           | 表示用のHTMLテキスト     | 任意                           |
| `authorDisplayName`     | 投稿者の表示名           | 必須                           |
| `authorProfileImageUrl` | プロフィール画像のURL    | 任意                           |
| `authorChannelUrl`      | 投稿者のチャンネルURL    | 必須                           |
| `publishedAt`           | 投稿日時（ISO 8601形式） | 必須                           |
| `updatedAt`             | 更新日時（ISO 8601形式） | 必須                           |
| `likeCount`             | 高評価数                 | 必須                           |
| `totalReplyCount`       | 返信数                   | 任意、トップレベルコメントのみ |
| `replies`               | 返信コメントの配列       | 任意、トップレベルコメントのみ |

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

## 制限事項

- Quota, Rate Limit の制限があります
- 本ツールは自動的に1秒間隔でリクエストを送信します
- コメント数が極端に多い動画では、Quota を使い切る可能性があります

## 🐛 トラブルシューティング

### よくあるエラー

#### `❌ 環境変数 YOUTUBE_API_KEY が設定されていません。`

**原因**: APIキーが設定されていない

**対処法**:

- **シェルで直接設定する場合**: 以下のコマンドを実行してAPIキーを設定します。
  ```bash
  export YOUTUBE_API_KEY=your_api_key_here
  ```
- **`.env` ファイルを使用する場合**:
  1. プロジェクトのルートディレクトリに `.env` ファイルが存在し、その中に `YOUTUBE_API_KEY=your_api_key_here` と記述されているか確認してください。

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

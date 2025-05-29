# YouTube Comment Fetcher

This Deno application fetches all comments (including top-level comments and their replies) from a YouTube video and saves them as a JSON file.

## Requirements

- [Deno](https://deno.land/) v1.40 or higher
- YouTube Data API v3 API Key

## 🔧 Setup

### 1. Obtain API Key

1. Create a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the YouTube Data API v3.
3. Create an API key.
4. Set up the environment variable using one of the following methods:

#### Method 1: Set directly in the shell

```bash
export YOUTUBE_API_KEY=your_api_key_here
```

#### Method 2: Use an `.env` file

Create a file named `.env` in the project root directory and write the API key as follows:

```env
YOUTUBE_API_KEY=your_api_key_here
```

## 💻 Usage

### Basic Usage

```bash
# Using a video ID
deno task start dQw4w9WgXcQ

# Using a YouTube URL
deno task start "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

# Specifying an output directory
deno task start dQw4w9WgXcQ ./output
```

### Direct Execution

```bash
deno run --allow-net --allow-write --allow-env --allow-read main.ts <videoID> [outputDirectory]
```

## 📊 Output Format

The comment data is saved to a file named `<videoID>_comments.json`.

### JSON Structure

```json
[
  {
    "id": "Comment ID",
    "textOriginal": "Comment body (raw text)",
    "textDisplay": "Comment body (display HTML)",
    "authorDisplayName": "Author name",
    "authorProfileImageUrl": "Profile image URL",
    "authorChannelUrl": "Author channel URL",
    "publishedAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z",
    "likeCount": 123,
    "totalReplyCount": 5,
    "replies": [
      {
        "id": "Reply Comment ID",
        "textOriginal": "Reply comment body (raw text)",
        "textDisplay": "Reply comment body (display HTML)",
        "authorDisplayName": "Reply Author name",
        "authorProfileImageUrl": "Reply Profile image URL",
        "authorChannelUrl": "Reply Author channel URL",
        "publishedAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "likeCount": 42
      }
    ]
  }
]
```

### Data Item Descriptions

| Item                    | Description                       | Remarks                           |
| ----------------------- | --------------------------------- | --------------------------------- |
| `id`                    | Unique identifier for the comment | Required                          |
| `textOriginal`          | Raw text of the comment           | Required                          |
| `textDisplay`           | HTML text for display             | Optional                          |
| `authorDisplayName`     | Display name of the author        | Required                          |
| `authorProfileImageUrl` | URL of the profile image          | Optional                          |
| `authorChannelUrl`      | URL of the author's channel       | Required                          |
| `publishedAt`           | Posting date (ISO 8601 format)    | Required                          |
| `updatedAt`             | Update date (ISO 8601 format)     | Required                          |
| `likeCount`             | Number of likes                   | Required                          |
| `totalReplyCount`       | Number of replies                 | Optional, Top-level comments only |
| `replies`               | Array of reply comments           | Optional, Top-level comments only |

## 🔍 Execution Example

```bash
$ deno task start dQw4w9WgXcQ

🎬 YouTube Comment Fetcher
=====================================

📹 Video: dQw4w9WgXcQ
📁 Output directory: .

Fetching comments for video dQw4w9WgXcQ...
[API Request 1] https://www.googleapis.com/youtube/v3/commentThreads?...
[15:30:45] Processed: 100 items - Fetching top-level comments...
[API Request 2] https://www.googleapis.com/youtube/v3/commentThreads?...
...
Finished fetching: 1,234 comments found.

📊 Comment Statistics:
  Top-level comments: 800
  Reply comments: 434
  Total comments: 1,234
  Total likes: 5,678
  Oldest comment: 2023/01/15 10:30:00
  Newest comment: 2024/03/10 14:20:30

📊 API Usage Statistics:
  API requests: 15
  Estimated quota usage: 15 units
  Execution time: 18.45 seconds

✓ Comments saved to: ./dQw4w9WgXcQ_comments.json
  Total comments: 1,234
  File size: 2.45 MB

✅ Comment fetching complete!
```

## Limitations

- This tool is subject to YouTube Data API v3 Quota and Rate Limit restrictions.
- This tool automatically sends requests at 1-second intervals.
- Fetching comments from videos with a very large number of comments may exhaust your daily API quota.

## 🐛 Troubleshooting

### Common Errors

#### `❌ Environment variable YOUTUBE_API_KEY is not set.`

**Cause**: API key is not set.

**Solution**:

- **Shell**: Execute the following command:
  ```bash
  export YOUTUBE_API_KEY=your_api_key_here
  ```
- **`.env` file**:
  1. Ensure that an `.env` file exists in the project's root directory and contains the line `YOUTUBE_API_KEY=your_api_key_here`.

#### `HTTP 403` Error

**Possible Causes**:

- Invalid API key
- YouTube Data API v3 is not enabled
- Quota limit reached

#### `HTTP 404` Error

**Possible Causes**:

- Incorrect video ID
- Video has been deleted
- Video is set to private

#### `HTTP 400` Error

**Possible Causes**:

- Invalid video ID format

## 📄 License

This project is licensed under the MIT License.

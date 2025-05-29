// YouTube Data API v3 の型定義

export interface CommentSnippet {
  textOriginal: string;
  textDisplay: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  authorChannelUrl: string;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  parentId?: string; // 返信コメントのみ
}

export interface Comment {
  kind: string;
  etag: string;
  id: string;
  snippet: CommentSnippet;
}

export interface CommentThreadSnippet {
  videoId: string;
  topLevelComment: Comment;
  canReply: boolean;
  totalReplyCount: number;
  isPublic: boolean;
}

export interface CommentThreadReplies {
  comments: Comment[];
}

export interface CommentThread {
  kind: string;
  etag: string;
  id: string;
  snippet: CommentThreadSnippet;
  replies?: CommentThreadReplies;
}

export interface CommentThreadsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: CommentThread[];
}

export interface CommentsResponse {
  kind: string;
  etag: string;
  nextPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  items: Comment[];
}

// 出力用のコメントデータ型
export interface CommentData {
  id: string;
  textOriginal: string;
  textDisplay?: string;
  authorDisplayName: string;
  authorProfileImageUrl?: string;
  authorChannelUrl: string;
  publishedAt: string;
  updatedAt: string;
  likeCount: number;
  totalReplyCount?: number; // トップレベルコメントのみ
  parentId?: string; // 返信コメントのみ
}

// 進捗情報
export interface ProgressInfo {
  totalComments: number;
  processedComments: number;
  currentOperation: string;
}

// エラー情報
export class APIError extends Error {
  constructor(
    public code: number,
    message: string,
    public errors?: Array<{
      domain: string;
      reason: string;
      message: string;
    }>,
  ) {
    super(message);
    this.name = "APIError";
  }
}

import {
  APIError,
  Comment,
  CommentData,
  CommentsResponse,
  CommentThreadsResponse,
  ProgressInfo,
} from "./types.ts";

export class YouTubeAPIClient {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/youtube/v3";
  private requestCount = 0;
  private lastRequestTime = 0;
  private readonly minRequestInterval = 1000; // 1秒間隔でリクエスト制限

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * レート制限を考慮したHTTPリクエスト
   */
  private async makeRequest(url: string): Promise<Response> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      await new Promise((resolve) =>
        setTimeout(resolve, this.minRequestInterval - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    console.log(`[API Request ${this.requestCount}] ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error?.message || `HTTP ${response.status}`,
        errorData.error?.errors,
      );
    }

    return response;
  }

  /**
   * 動画IDの検証
   */
  private validateVideoId(videoId: string): string {
    // YouTube URLから動画IDを抽出
    const urlMatch = videoId.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1];
    }

    // 直接動画IDが渡された場合
    if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return videoId;
    }

    throw new Error(`無効な動画ID形式です: ${videoId}`);
  }

  /**
   * コメントスレッド（トップレベルコメント）を取得
   */
  async getCommentThreads(
    videoId: string,
    maxResults = 100,
    pageToken?: string,
  ): Promise<CommentThreadsResponse> {
    const validVideoId = this.validateVideoId(videoId);

    const params = new URLSearchParams({
      part: "snippet,replies",
      videoId: validVideoId,
      key: this.apiKey,
      maxResults: maxResults.toString(),
      order: "time", // 時系列順で取得
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const url = `${this.baseUrl}/commentThreads?${params}`;
    const response = await this.makeRequest(url);

    return await response.json();
  }

  /**
   * 返信コメントを取得（maxResultsを超える場合）
   */
  async getComments(
    parentId: string,
    maxResults = 100,
    pageToken?: string,
  ): Promise<CommentsResponse> {
    const params = new URLSearchParams({
      part: "snippet",
      parentId: parentId,
      key: this.apiKey,
      maxResults: maxResults.toString(),
    });

    if (pageToken) {
      params.append("pageToken", pageToken);
    }

    const url = `${this.baseUrl}/comments?${params}`;
    const response = await this.makeRequest(url);

    return await response.json();
  }

  /**
   * 指定された動画の全コメントを収集
   */
  async getAllComments(
    videoId: string,
    onProgress?: (progress: ProgressInfo) => void,
  ): Promise<CommentData[]> {
    const validVideoId = this.validateVideoId(videoId);
    const allComments: CommentData[] = [];
    let pageToken: string | undefined;
    let totalProcessed = 0;

    console.log(`動画 ${validVideoId} のコメント収集を開始します...`);

    // トップレベルコメントの取得
    do {
      onProgress?.({
        totalComments: 0, // まだ不明
        processedComments: totalProcessed,
        currentOperation: "トップレベルコメントを取得中...",
      });

      const response = await this.getCommentThreads(validVideoId, 100, pageToken);

      for (const thread of response.items) {
        const topLevelComment = thread.snippet.topLevelComment;

        // トップレベルコメントを追加
        allComments.push(this.convertToCommentData(
          topLevelComment,
          thread.snippet.totalReplyCount,
        ));
        totalProcessed++;

        // 返信コメントがある場合
        if (thread.replies && thread.replies.comments.length > 0) {
          // APIレスポンスに含まれる返信コメントを追加
          for (const reply of thread.replies.comments) {
            allComments.push(this.convertToCommentData(reply));
            totalProcessed++;
          }

          // まだ取得していない返信コメントがある場合
          if (thread.snippet.totalReplyCount > thread.replies.comments.length) {
            const remainingReplies = await this.getAllReplies(topLevelComment.id);
            allComments.push(...remainingReplies);
            totalProcessed += remainingReplies.length;
          }
        }
      }

      pageToken = response.nextPageToken;

      onProgress?.({
        totalComments: 0, // まだ不明
        processedComments: totalProcessed,
        currentOperation: pageToken ? "次のページを取得中..." : "完了",
      });
    } while (pageToken);

    console.log(`収集完了: 合計 ${allComments.length} 件のコメント`);
    return allComments;
  }

  /**
   * 特定のコメントに対する全ての返信を取得
   */
  private async getAllReplies(parentId: string): Promise<CommentData[]> {
    const replies: CommentData[] = [];
    let pageToken: string | undefined;

    do {
      const response = await this.getComments(parentId, 100, pageToken);

      for (const comment of response.items) {
        replies.push(this.convertToCommentData(comment));
      }

      pageToken = response.nextPageToken;
    } while (pageToken);

    return replies;
  }

  /**
   * APIレスポンスのコメントを出力用形式に変換
   */
  private convertToCommentData(
    comment: Comment,
    totalReplyCount?: number,
  ): CommentData {
    const snippet = comment.snippet;

    return {
      id: comment.id,
      textOriginal: snippet.textOriginal,
      textDisplay: snippet.textDisplay,
      authorDisplayName: snippet.authorDisplayName,
      authorProfileImageUrl: snippet.authorProfileImageUrl,
      authorChannelUrl: snippet.authorChannelUrl,
      publishedAt: snippet.publishedAt,
      updatedAt: snippet.updatedAt,
      likeCount: snippet.likeCount,
      totalReplyCount: totalReplyCount,
      parentId: snippet.parentId,
    };
  }

  /**
   * API使用状況の統計を取得
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      estimatedQuotaUsage: this.requestCount, // 各リクエストは1クォータ単位
    };
  }
}

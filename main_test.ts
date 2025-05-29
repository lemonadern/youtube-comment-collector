import { assertEquals, assertThrows } from "@std/assert";
import { YouTubeAPIClient } from "./src/youtube-api.ts";
import { APIError } from "./src/types.ts";

Deno.test("YouTubeAPIClient - 動画ID検証テスト", async (t) => {
  const client = new YouTubeAPIClient("test-api-key");

  await t.step("有効な動画IDを受け入れる", () => {
    // privateメソッドにアクセスするためのハック
    const validateVideoId = (client as unknown as { validateVideoId: (id: string) => string })
      .validateVideoId.bind(client);

    assertEquals(validateVideoId("dQw4w9WgXcQ"), "dQw4w9WgXcQ");
    assertEquals(validateVideoId("_abc123-XyZ"), "_abc123-XyZ");
  });

  await t.step("YouTube URLから動画IDを抽出する", () => {
    const validateVideoId = (client as unknown as { validateVideoId: (id: string) => string })
      .validateVideoId.bind(client);

    assertEquals(
      validateVideoId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
    assertEquals(
      validateVideoId("https://youtu.be/dQw4w9WgXcQ"),
      "dQw4w9WgXcQ",
    );
  });

  await t.step("無効な動画IDを拒否する", () => {
    const validateVideoId = (client as unknown as { validateVideoId: (id: string) => string })
      .validateVideoId.bind(client);

    assertThrows(
      () => validateVideoId("invalid"),
      Error,
      "無効な動画ID形式です",
    );
    assertThrows(
      () => validateVideoId(""),
      Error,
      "無効な動画ID形式です",
    );
    assertThrows(
      () => validateVideoId("dQw4w9WgXcQ123"), // 長すぎる
      Error,
      "無効な動画ID形式です",
    );
  });
});

Deno.test("APIError クラステスト", () => {
  const error = new APIError(404, "Video not found", [
    {
      domain: "youtube.video",
      reason: "videoNotFound",
      message: "The video was not found.",
    },
  ]);

  assertEquals(error.code, 404);
  assertEquals(error.message, "Video not found");
  assertEquals(error.name, "APIError");
  assertEquals(error.errors?.length, 1);
  if (error.errors && error.errors[0]) {
    assertEquals(error.errors[0].reason, "videoNotFound");
  }
});

Deno.test("統計情報テスト", () => {
  const client = new YouTubeAPIClient("test-api-key");

  // 初期状態のテスト
  const initialStats = client.getStats();
  assertEquals(initialStats.requestCount, 0);
  assertEquals(initialStats.estimatedQuotaUsage, 0);
});

import { Redis } from "@upstash/redis";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";

type EnvConfig = {
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;
};

// エンドポイントのbasePathを/apiにする
const app = new Hono().basePath("/api");

// appに対して/pingを生やすとapi/pingを叩くとpongが返却されるようになる
app.get("/ping", (c) => {
  return c.text("pong");
});

app.post("/result", async (c) => {
  try {
    // リクエストボディからスコアとユーザー名を取得
    const { score, userName } = await c.req.json();

    if(!score || !userName) {
      return c.json({ error: "Missing score or userName" }, 400);
    }

    const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = env<EnvConfig>(c);

    // Redisクライアントを初期化してzaddにスコアとユーザー名のオブジェクトを入れることでデータの追加が可能
    const redis = new Redis({
      url: UPSTASH_REDIS_REST_URL,
      token: UPSTASH_REDIS_REST_TOKEN,
    });

    const result = {
      score: score,
      member: userName,
    };
    // ZADD:スコア付きのソート済みセット（Sorted Set）にメンバー（データ）を追加更新するコマンド
    await redis.zadd("typing-score-rank", result);

    return c.json({
      message: "Score submitted successfully",
    });

  }catch(e) {
    return c.json({ error: `Error: ${e}` }, 500);
  }
})

// handleはHonoとNext.jsを接続するもの
export const GET = handle(app);
export const POST = handle(app);
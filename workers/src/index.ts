/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx): Promise<Response> {
// 		return new Response('Hello World!');
// 	},
// } satisfies ExportedHandler<Env>;

import { Redis } from '@upstash/redis';
import { Hono } from 'hono';
import { env } from 'hono/adapter';
// import { handle } from 'hono/vercel';

type EnvConfig = {
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
};

// エンドポイントのbasePathを/apiにする
// const app = new Hono().basePath('/api');
const app = new Hono();

// appに対して/pingを生やすとapi/pingを叩くとpongが返却されるようになる
app.get('/ping', (c) => {
	return c.text('pong');
});

app.post('/result', async (c) => {
	try {
		// リクエストボディからスコアとユーザー名を取得
		const { score, userName } = await c.req.json();

		if (score === undefined || userName === undefined || userName === "") {
			return c.json({ error: 'Missing score or userName' }, 400);
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
		await redis.zadd('typing-score-rank', result);

		return c.json({
			message: 'Score submitted successfully',
		});
	} catch (e) {
		return c.json({ error: `Error: ${e}` }, 500);
	}
});

app.get('/result', async (c) => {
	try {
		const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = env<EnvConfig>(c);

		const redis = new Redis({
			url: UPSTASH_REDIS_REST_URL,
			token: UPSTASH_REDIS_REST_TOKEN,
		});

		const results = await redis.zrange('typing-score-rank', 0, 9, {
			rev: true,
			withScores: true,
		});

		const scores = [];
		for (let i = 0; i < results.length; i += 2) {
			scores.push({
				userName: results[i],
				score: results[i + 1],
			});
		}
		return c.json({
			results: scores,
		});
	} catch (e) {
		return c.json({ message: `Error: ${e}` });
	}
});

// handleはHonoとNext.jsを接続するもの
// export const GET = handle(app);
// export const POST = handle(app);

// workersではこれ
export default app;

import { Redis } from '@upstash/redis';
import { Hono } from 'hono';
import type { Score, ResultResponse } from "../../shared/types";

type Bindings = {
	UPSTASH_REDIS_REST_URL: string;
	UPSTASH_REDIS_REST_TOKEN: string;
};

type CreateScoreBody = {
	userName: string,
	score: number,
}

// Honoでの書き方
const app = new Hono<{ Bindings: Bindings }>();

// 動作確認用
app.get('/ping', (c) => {
	return c.text('pong');
});

app.post('/result', async (c) => {
	try {
		// リクエストボディからスコアとユーザー名を取得
		const { score, userName } = await c.req.json<CreateScoreBody>();

		if (score === undefined || userName === undefined || userName === "") {
			return c.json({ error: 'Missing score or userName' }, 400);
		}

		// Redisクライアントを初期化
		const redis = new Redis({
			url: c.env.UPSTASH_REDIS_REST_URL,
			token: c.env.UPSTASH_REDIS_REST_TOKEN,
		});

		const result = {
			score: score,
			member: userName,
		};
		// Sorted Setはmemberとscoreのペアを保持、zaddで追加でき、同じmemberで再度登録するとスコアが更新される
		await redis.zadd('typing-score-rank', result);

		return c.json({
			message: 'Score submitted successfully',
		});
	} catch (e) {
		return c.json({ error: `Error: ${String(e)}` }, 500);
	}
});

app.get('/result', async (c) => {
	try {
		const redis = new Redis({
			url: c.env.UPSTASH_REDIS_REST_URL,
			token: c.env.UPSTASH_REDIS_REST_TOKEN,
		});

		const bests = await redis.zrange('typing-score-rank', 0, 4, {
			rev: true,
			withScores: true,
		});

		const bestScores: Score[] = [];
		for (let i = 0; i < bests.length; i += 2) {
			bestScores.push({
				userName: String(bests[i]),
				score: Number(bests[i + 1]),
			});
		}

		// 下位5人を取得
		const worsts = await redis.zrange('typing-score-rank', 0, 4, {
			withScores: true,
		})

		const worstScores: Score[] = [];
		for (let i = 0; i < worsts.length; i += 2) {
			worstScores.push({
				userName: String(worsts[i]),
				score: Number(worsts[i + 1]),
			});
		}

		const response: ResultResponse = { bests: bestScores, worsts: worstScores };

		return c.json(response);
	} catch (e) {
		return c.json({ message: `Error: ${String(e)}` }, 500);
	}
});

// workersではこれ
export default app;

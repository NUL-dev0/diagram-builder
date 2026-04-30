// backend/src/app.ts

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ヘルスチェック用エンドポイント
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'DiagramBuilder Backend is running' });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

export default app;
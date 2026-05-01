import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import diagramsRouter from './routes/diagrams';
import configRouter from './routes/config';
import exportRouter from './routes/export';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'DiagramBuilder Backend is running' });
});

app.use('/api/diagrams', diagramsRouter);
app.use('/api/config', configRouter);
app.use('/api/export', exportRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;

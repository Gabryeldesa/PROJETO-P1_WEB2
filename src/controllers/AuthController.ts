import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send('Bem vindo pessoal Tela de login da rota!');
});

export default router;
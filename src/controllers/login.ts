import express, { Request, Response } from 'express';

import { AppDataSource } from '../data-source';

const router = express.Router();

AppDataSource.initialize()
  .then(() => {
    console.log('conexão do banco de dados realizado com sucesso!');
  })
  .catch((error) => console.log('Erro na conexão com o banco de dados', error));

router.get('/', (req: Request, res: Response) => {
  res.send('Bem vindo pessoal Tela de login da rota!');
});

export default router;
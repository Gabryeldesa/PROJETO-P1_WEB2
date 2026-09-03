import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Situations } from '../entity/Situations';

const router = express.Router();

router.get('/situations', (req: Request, res: Response) => {
  res.send('Bem vindo pessoal tela de situações da rota!');
});

router.post('/situations', async(req: Request, res: Response) => {
  try {

    const data = req.body;

    const situationRepository = AppDataSource.getRepository(Situations);
    const situation = situationRepository.create(data);

    await situationRepository.save(situation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: situation,
    });

    
  } catch (error) {

    res.status(500).json({
      message: 'Erro ao cadastrar situação.',
     
    });

  }
});

export default router;
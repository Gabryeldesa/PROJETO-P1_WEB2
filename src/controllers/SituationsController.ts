import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Situations } from '../entity/Situations';

const router = express.Router();

router.get('/situations', async(req: Request, res: Response) => {

  try {
  const situationRepository = AppDataSource.getRepository(Situations);

  const situations = await situationRepository.find();

  res.status(200).json(situations);
  return;
  
  }catch (error) {
    res.status(500).json({
      message: 'Erro ao listar situações.',
    });
    return;
  }
});

//Criar a Visualização do item cadastrado em situação
router.get("/situations/:id", async (req:Request, res:Response)=>{
  try{

    const { id } = req.params as { id: string };

    const situationRepository = AppDataSource.getRepository(Situations);

    const situation = await situationRepository.findOneBy({id : parseInt(id)});

    if(!situation){
      res.status(404).json({
        messagem : "Situação não encontrada!",
      });
      return
    }

    res.status(200).json(situation);
    return

  }catch(error){
    res.status(500).json({
      messagem : "Erro ao Listar situação!",
    });
    return
  }
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
import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Situations } from '../entity/Situations';
import { PaginationService } from '../services/PaginationService';
import * as yup from 'yup';
import { Not } from 'typeorm';

const router = express.Router();

router.get('/situations', async(req: Request, res: Response) => {

  try {

  const situationRepository = AppDataSource.getRepository(Situations);

  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;


  const result = await PaginationService.paginate(situationRepository, page, limit, { id: "DESC" });

  
  res.status(200).json(result);
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
      messagem : "Erro ao listar situação!",
    });
    return
  }
});

router.post('/situations', async(req: Request, res: Response) => {
  try {

    const data = req.body;

    const schema = yup.object().shape({
      nameSituation: yup.string().required('O campo nome é obrigatório.')
      .min(3, 'O campo nome deve ter no mínimo 3 caracteres.'),
    });

    await schema.validate(data, { abortEarly: false });

    const situationRepository = AppDataSource.getRepository(Situations);

    const existingSituation = await situationRepository.findOne({
      where: {nameSituation: data.nameSituation}
    });

    if (existingSituation) {
      res.status(400).json({
        message: 'Já existe uma situação cadastrada com esse nome.',
      });
      return;
    }


    const situation = situationRepository.create(data);

    await situationRepository.save(situation);

    res.status(201).json({
      message: 'Situação cadastrada com sucesso!',
      situation: situation,
    });

    
  } catch (error) {

    if (error instanceof yup.ValidationError) {
      res.status(500).json({
      message: error.errors
      });
      return;
  
    }


    res.status(500).json({
      message: 'Erro ao cadastrar situação.',
     
    });

  }
});

//Criar a Visualização do item cadastrado em situação
router.put("/situations/:id", async (req:Request, res:Response)=>{
  try{

    const { id } = req.params as { id: string };

    const data = req.body;

    const schema = yup.object().shape({
      nameSituation: yup.string().required('O campo nome é obrigatório.')
      .min(3, 'O campo nome deve ter no mínimo 3 caracteres.'),
    });

    await schema.validate(data, { abortEarly: false });


    const situationRepository = AppDataSource.getRepository(Situations);

    const situation = await situationRepository.findOneBy({id : parseInt(id)});

    if(!situation){
      res.status(404).json({
        messagem : "Situação não encontrada!",
      });
      return
    }

     const existingSituation = await situationRepository.findOne({
      where: {
        nameSituation: data.nameSituation,
        id: Not(parseInt(id)),
      }
    });

    if (existingSituation) {
      res.status(400).json({
        message: 'Já existe uma situação cadastrada com esse nome.',
      });
      return;
    }


    situationRepository.merge(situation, data);
    const updatedSituation = await situationRepository.save(situation);

    res.status(200).json({
      message: 'Situação atualizada com sucesso!',
      situation: updatedSituation,
    });
    return

  }catch(error){

    if (error instanceof yup.ValidationError) {
      res.status(500).json({
      message: error.errors
      });
      return;
  
    }


    res.status(500).json({
      messagem : "Erro ao atualizar situação!",
    });
  
  }
});

router.delete("/situations/:id", async (req:Request, res:Response)=>{
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

    await situationRepository.remove(situation);

    res.status(200).json({
      message: 'Situação removida com sucesso!',

    }); 
  
  }catch(error){
    res.status(500).json({
      messagem : "Erro ao remover situação!",
    });
    return
  }
});



export default router;
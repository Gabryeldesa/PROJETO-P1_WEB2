import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ProductSituations } from '../entity/ProductSituations';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

// Listar situações de produtos (com paginação)
router.get('/product-situations', async (req: Request, res: Response) => {
  try {
    const situationRepository = AppDataSource.getRepository(ProductSituations);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(situationRepository, page, limit, { id: "DESC" });

    res.status(200).json(result);
    return;

  } catch (error: any) {

    if (error instanceof Error && error.message.startsWith('Página inválida')) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao listar situações de produtos.',
    });
    return;
  }
});

// Visualizar uma situação de produto
router.get('/product-situations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const situationRepository = AppDataSource.getRepository(ProductSituations);

    const situation = await situationRepository.findOneBy({ id: parseInt(id) });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada!',
      });
      return;
    }

    res.status(200).json(situation);
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao visualizar situação de produto.',
    });
    return;
  }
});

// Cadastrar situação de produto
router.post('/product-situations', async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.name) {
      res.status(400).json({
        message: 'O campo name é obrigatório.',
      });
      return;
    }

    const situationRepository = AppDataSource.getRepository(ProductSituations);
    const situation = situationRepository.create(data);

    await situationRepository.save(situation);

    res.status(201).json({
      message: 'Situação de produto cadastrada com sucesso!',
      situation: situation,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe uma situação de produto com esse nome.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao cadastrar situação de produto.',
    });
    return;
  }
});

// Editar situação de produto
router.put('/product-situations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data = req.body;

    const situationRepository = AppDataSource.getRepository(ProductSituations);

    const situation = await situationRepository.findOneBy({ id: parseInt(id) });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada!',
      });
      return;
    }

    situationRepository.merge(situation, data);
    const updatedSituation = await situationRepository.save(situation);

    res.status(200).json({
      message: 'Situação de produto atualizada com sucesso!',
      situation: updatedSituation,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe uma situação de produto com esse nome.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao atualizar situação de produto.',
    });
    return;
  }
});

// Remover situação de produto
router.delete('/product-situations/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const situationRepository = AppDataSource.getRepository(ProductSituations);

    const situation = await situationRepository.findOneBy({ id: parseInt(id) });

    if (!situation) {
      res.status(404).json({
        message: 'Situação de produto não encontrada!',
      });
      return;
    }

    await situationRepository.remove(situation);

    res.status(200).json({
      message: 'Situação de produto removida com sucesso!',
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({
        message: 'Não é possível remover: existem produtos vinculados a essa situação.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao remover situação de produto.',
    });
    return;
  }
});

export default router;
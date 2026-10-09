import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { ProductCategories } from '../entity/ProductCategories';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

// Listar categorias (com paginação)
router.get('/product-categories', async (req: Request, res: Response) => {
  try {
    const categoryRepository = AppDataSource.getRepository(ProductCategories);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(categoryRepository, page, limit, { id: "DESC" });

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
      message: 'Erro ao listar categorias de produtos.',
    });
    return;
  }
});

// Visualizar uma categoria
router.get('/product-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const categoryRepository = AppDataSource.getRepository(ProductCategories);

    const category = await categoryRepository.findOneBy({ id: parseInt(id) });

    if (!category) {
      res.status(404).json({
        message: 'Categoria não encontrada!',
      });
      return;
    }

    res.status(200).json(category);
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao visualizar categoria.',
    });
    return;
  }
});

// Cadastrar categoria
router.post('/product-categories', async (req: Request, res: Response) => {
  try {
    const data = req.body;

    if (!data.name) {
      res.status(400).json({
        message: 'O campo name é obrigatório.',
      });
      return;
    }

    const categoryRepository = AppDataSource.getRepository(ProductCategories);
    const category = categoryRepository.create(data);

    await categoryRepository.save(category);

    res.status(201).json({
      message: 'Categoria cadastrada com sucesso!',
      category: category,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe uma categoria com esse nome.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao cadastrar categoria.',
    });
    return;
  }
});

// Editar categoria
router.put('/product-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const data = req.body;

    const categoryRepository = AppDataSource.getRepository(ProductCategories);

    const category = await categoryRepository.findOneBy({ id: parseInt(id) });

    if (!category) {
      res.status(404).json({
        message: 'Categoria não encontrada!',
      });
      return;
    }

    categoryRepository.merge(category, data);
    const updatedCategory = await categoryRepository.save(category);

    res.status(200).json({
      message: 'Categoria atualizada com sucesso!',
      category: updatedCategory,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe uma categoria com esse nome.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao atualizar categoria.',
    });
    return;
  }
});

// Remover categoria
router.delete('/product-categories/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const categoryRepository = AppDataSource.getRepository(ProductCategories);

    const category = await categoryRepository.findOneBy({ id: parseInt(id) });

    if (!category) {
      res.status(404).json({
        message: 'Categoria não encontrada!',
      });
      return;
    }

    await categoryRepository.remove(category);

    res.status(200).json({
      message: 'Categoria removida com sucesso!',
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res.status(409).json({
        message: 'Não é possível remover: existem produtos vinculados a essa categoria.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao remover categoria.',
    });
    return;
  }
});

export default router;
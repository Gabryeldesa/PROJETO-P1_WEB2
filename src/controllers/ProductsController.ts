import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Products } from '../entity/Products';
import { ProductSituations } from '../entity/ProductSituations';
import { ProductCategories } from '../entity/ProductCategories';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

const relations = { productSituation: true, productCategory: true };

// Listar produtos (com paginação)
router.get('/products', async (req: Request, res: Response) => {
  try {
    const productRepository = AppDataSource.getRepository(Products);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(productRepository, page, limit, { id: "DESC" }, relations);

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
      message: 'Erro ao listar produtos.',
    });
    return;
  }
});

// Visualizar um produto
router.get('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const productRepository = AppDataSource.getRepository(Products);

    const product = await productRepository.findOne({
      where: { id: parseInt(id) },
      relations: relations,
    });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado!',
      });
      return;
    }

    res.status(200).json(product);
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao visualizar produto.',
    });
    return;
  }
});

// Cadastrar produto
router.post('/products', async (req: Request, res: Response) => {
  try {
    const { name, productSituationId, productCategoryId } = req.body;

    if (!name || !productSituationId || !productCategoryId) {
      res.status(400).json({
        message: 'Os campos name, productSituationId e productCategoryId são obrigatórios.',
      });
      return;
    }

    const situation = await AppDataSource.getRepository(ProductSituations).findOneBy({ id: productSituationId });

    if (!situation) {
      res.status(400).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const category = await AppDataSource.getRepository(ProductCategories).findOneBy({ id: productCategoryId });

    if (!category) {
      res.status(400).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    const productRepository = AppDataSource.getRepository(Products);
    const product = productRepository.create({ name, productSituationId, productCategoryId });

    await productRepository.save(product);

    const createdProduct = await productRepository.findOne({
      where: { id: product.id },
      relations: relations,
    });

    res.status(201).json({
      message: 'Produto cadastrado com sucesso!',
      product: createdProduct,
    });
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao cadastrar produto.',
    });
    return;
  }
});

// Editar produto
router.put('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, productSituationId, productCategoryId } = req.body;

    const productRepository = AppDataSource.getRepository(Products);

    const product = await productRepository.findOneBy({ id: parseInt(id) });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado!',
      });
      return;
    }

    const changes: Partial<Products> = {};

    if (name !== undefined) {
      changes.name = name;
    }

    if (productSituationId !== undefined) {
      const situation = await AppDataSource.getRepository(ProductSituations).findOneBy({ id: productSituationId });

      if (!situation) {
        res.status(400).json({
          message: 'Situação de produto não encontrada.',
        });
        return;
      }

      changes.productSituationId = productSituationId;
    }

    if (productCategoryId !== undefined) {
      const category = await AppDataSource.getRepository(ProductCategories).findOneBy({ id: productCategoryId });

      if (!category) {
        res.status(400).json({
          message: 'Categoria de produto não encontrada.',
        });
        return;
      }

      changes.productCategoryId = productCategoryId;
    }

    productRepository.merge(product, changes);
    await productRepository.save(product);

    const updatedProduct = await productRepository.findOne({
      where: { id: product.id },
      relations: relations,
    });

    res.status(200).json({
      message: 'Produto atualizado com sucesso!',
      product: updatedProduct,
    });
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao atualizar produto.',
    });
    return;
  }
});

// Remover produto
router.delete('/products/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const productRepository = AppDataSource.getRepository(Products);

    const product = await productRepository.findOneBy({ id: parseInt(id) });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado!',
      });
      return;
    }

    await productRepository.remove(product);

    res.status(200).json({
      message: 'Produto removido com sucesso!',
    });
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao remover produto.',
    });
    return;
  }
});

export default router;
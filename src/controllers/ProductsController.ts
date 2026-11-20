import express, { Request, Response } from 'express';
import * as yup from 'yup';
import slugify from 'slugify';
import { Not } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Products } from '../entity/Products';
import { ProductSituations } from '../entity/ProductSituations';
import { ProductCategories } from '../entity/ProductCategories';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

const relations = { productSituation: true, productCategory: true };

// Listar produtos
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
    const data = req.body;

    const schema = yup.object().shape({
      name: yup
        .string()
        .required("O campo nome é obrigatório!")
        .min(3, "O campo nome deve ter no mínimo 3 caracteres!")
        .max(255, "O campo nome deve ter no máximo 255 caracteres!"),

      slug: yup
        .string()
        .required("O campo slug é obrigatório!")
        .min(3, "O campo slug deve ter no mínimo 3 caracteres!")
        .max(255, "O campo slug deve ter no máximo 255 caracteres!"),

      description: yup
        .string()
        .required("O campo descrição é obrigatório!")
        .min(10, "A descrição deve ter pelo menos 10 caracteres!"),

      price: yup
        .number()
        .typeError("O preço deve ser um número!")
        .required("O campo preço é obrigatório!")
        .positive("O preço deve ser um valor positivo!")
        .test(
          "is-decimal",
          "O preço deve ter no máximo duas casas decimais!",
          (value) => value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
        ),

      productSituationId: yup.number().required("O campo situação do produto é obrigatório!"),
      productCategoryId: yup.number().required("O campo categoria do produto é obrigatório!"),
    });

    await schema.validate(data, { abortEarly: false });

    data.slug = slugify(data.slug, { lower: true, strict: true });

    const productRepository = AppDataSource.getRepository(Products);

    const existingProduct = await productRepository.findOne({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      res.status(400).json({
        message: 'Já existe um produto cadastrado com esse slug!',
      });
      return;
    }

    const situation = await AppDataSource.getRepository(ProductSituations).findOneBy({ id: data.productSituationId });

    if (!situation) {
      res.status(400).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const category = await AppDataSource.getRepository(ProductCategories).findOneBy({ id: data.productCategoryId });

    if (!category) {
      res.status(400).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    const product = productRepository.create(data as Partial<Products>);
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
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });
      return;
    }

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
    const data = req.body;

    const schema = yup.object().shape({
      name: yup
        .string()
        .required("O campo nome é obrigatório!")
        .min(3, "O campo nome deve ter no mínimo 3 caracteres!")
        .max(255, "O campo nome deve ter no máximo 255 caracteres!"),

      slug: yup
        .string()
        .required("O campo slug é obrigatório!")
        .min(3, "O campo slug deve ter no mínimo 3 caracteres!")
        .max(255, "O campo slug deve ter no máximo 255 caracteres!"),

      description: yup
        .string()
        .required("O campo descrição é obrigatório!")
        .min(10, "A descrição deve ter pelo menos 10 caracteres!"),

      price: yup
        .number()
        .typeError("O preço deve ser um número!")
        .required("O campo preço é obrigatório!")
        .positive("O preço deve ser um valor positivo!")
        .test(
          "is-decimal",
          "O preço deve ter no máximo duas casas decimais!",
          (value) => value === undefined || /^\d+(\.\d{1,2})?$/.test(value.toString())
        ),

      productSituationId: yup.number().required("O campo situação do produto é obrigatório!"),
      productCategoryId: yup.number().required("O campo categoria do produto é obrigatório!"),
    });

    await schema.validate(data, { abortEarly: false });

    const productRepository = AppDataSource.getRepository(Products);

    const product = await productRepository.findOneBy({ id: parseInt(id) });

    if (!product) {
      res.status(404).json({
        message: 'Produto não encontrado!',
      });
      return;
    }

    data.slug = slugify(data.slug, { lower: true, strict: true });

    const existingProduct = await productRepository.findOne({
      where: {
        slug: data.slug,
        id: Not(parseInt(id)),
      },
    });

    if (existingProduct) {
      res.status(400).json({
        message: 'Já existe um produto cadastrado com esse slug!',
      });
      return;
    }

    const situation = await AppDataSource.getRepository(ProductSituations).findOneBy({ id: data.productSituationId });

    if (!situation) {
      res.status(400).json({
        message: 'Situação de produto não encontrada.',
      });
      return;
    }

    const category = await AppDataSource.getRepository(ProductCategories).findOneBy({ id: data.productCategoryId });

    if (!category) {
      res.status(400).json({
        message: 'Categoria de produto não encontrada.',
      });
      return;
    }

    productRepository.merge(product, data);
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
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors,
      });
      return;
    }

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
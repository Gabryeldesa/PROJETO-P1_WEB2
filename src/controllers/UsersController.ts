import express, { Request, Response } from 'express';
import * as yup from 'yup';
import { Not } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Users } from '../entity/Users';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

const relations = { situation: true };

// Listar usuários
router.get('/users', async (req: Request, res: Response) => {
  try {
    const userRepository = AppDataSource.getRepository(Users);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await PaginationService.paginate(userRepository, page, limit, { id: "DESC" }, relations);

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
      message: 'Erro ao listar usuários.',
    });
    return;
  }
});

// Visualizar um usuário
router.get('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOne({
      where: { id: parseInt(id) },
      relations: relations,
    });

    if (!user) {
      res.status(404).json({
        message: 'Usuário não encontrado!',
      });
      return;
    }

    res.status(200).json(user);
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao visualizar usuário.',
    });
    return;
  }
});

// Cadastrar usuário
router.post("/users", async (req: Request, res: Response) => {
  try {
    var data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório!").min(3, "O campo nome deve ter no mínimo 3 caracteres!"),
      email: yup.string().email("E-mail inválido!").required("O campo e-mail é obrigatório!"),
      password: yup.string().required("O campo senha é obrigatório!").min(6, "O campo senha deve ter no mínimo 6 caracteres!"),
      situation: yup.number().required("O campo situação é obrigatório!"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(Users);

    const existingUser = await userRepository.findOne({
      where: { email: data.email }
    });

    if (existingUser) {
      res.status(400).json({
        message: "Já existe um usuário cadastrado com esse e-mail!",
      });
      return;
    }

    const newUser = userRepository.create(data);

    await userRepository.save(newUser);

    res.status(201).json({
      message: "Usuário cadastrado com sucesso!",
      situation: newUser,
    });

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors
      });
      return;
    }

    res.status(500).json({
      message: "Erro ao cadastrar usuário!",
    });
  }
});

// Editar usuário
router.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const data = req.body;

    const schema = yup.object().shape({
      name: yup.string().required("O campo nome é obrigatório!").min(3, "O campo nome deve ter no mínimo 3 caracteres!"),
      email: yup.string().email("E-mail inválido!").required("O campo e-mail é obrigatório!"),
      situation: yup.number().required("O campo situação é obrigatório!"),
    });

    await schema.validate(data, { abortEarly: false });

    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });
      return;
    }

    const existingUser = await userRepository.findOne({
      where: {
        email: data.email,
        id: Not(parseInt(id)),
      },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Já existe um usuário cadastrado com esse e-mail!",
      });
      return;
    }

    userRepository.merge(user, data);

    const updateUser = await userRepository.save(user);

    res.status(200).json({
      message: "Usuário atualizado com sucesso!",
      user: updateUser
    });

  } catch (error) {
    if (error instanceof yup.ValidationError) {
      res.status(400).json({
        message: error.errors
      });
      return;
    }

    res.status(500).json({
      message: "Erro ao editar usuário!",
    });
  }
});

// Apagar usuário
router.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: "Usuário não encontrado!",
      });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({
      message: "Usuário apagado com sucesso!"
    });

  } catch (error) {
    res.status(500).json({
      message: "Erro ao apagar o usuário!",
    });
  }
});

export default router;
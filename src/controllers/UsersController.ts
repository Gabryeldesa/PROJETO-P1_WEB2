import express, { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Users } from '../entity/Users';
import { Situations } from '../entity/Situations';
import { PaginationService } from '../services/PaginationService';

const router = express.Router();

const relations = { situation: true };

const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Listar usuários (com paginação)
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
router.post('/users', async (req: Request, res: Response) => {
  try {
    const { name, email, situationId } = req.body;

    if (!name || !email || !situationId) {
      res.status(400).json({
        message: 'Os campos name, email e situationId são obrigatórios.',
      });
      return;
    }

    if (!emailValido(email)) {
      res.status(400).json({
        message: 'E-mail inválido.',
      });
      return;
    }

    const situation = await AppDataSource.getRepository(Situations).findOneBy({ id: situationId });

    if (!situation) {
      res.status(400).json({
        message: 'Situação não encontrada.',
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(Users);
    const user = userRepository.create({ name, email, situation });

    await userRepository.save(user);

    const createdUser = await userRepository.findOne({
      where: { id: user.id },
      relations: relations,
    });

    res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: createdUser,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe um usuário com esse e-mail.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao cadastrar usuário.',
    });
    return;
  }
});

// Editar usuário
router.put('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const { name, email, situationId } = req.body;

    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: 'Usuário não encontrado!',
      });
      return;
    }

    const changes: Partial<Users> = {};

    if (name !== undefined) {
      changes.name = name;
    }

    if (email !== undefined) {
      if (!emailValido(email)) {
        res.status(400).json({
          message: 'E-mail inválido.',
        });
        return;
      }

      changes.email = email;
    }

    if (situationId !== undefined) {
      const situation = await AppDataSource.getRepository(Situations).findOneBy({ id: situationId });

      if (!situation) {
        res.status(400).json({
          message: 'Situação não encontrada.',
        });
        return;
      }

      changes.situation = situation;
    }

    userRepository.merge(user, changes);
    await userRepository.save(user);

    const updatedUser = await userRepository.findOne({
      where: { id: user.id },
      relations: relations,
    });

    res.status(200).json({
      message: 'Usuário atualizado com sucesso!',
      user: updatedUser,
    });
    return;

  } catch (error: any) {

    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        message: 'Já existe um usuário com esse e-mail.',
      });
      return;
    }

    res.status(500).json({
      message: 'Erro ao atualizar usuário.',
    });
    return;
  }
});

// Remover usuário
router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };

    const userRepository = AppDataSource.getRepository(Users);

    const user = await userRepository.findOneBy({ id: parseInt(id) });

    if (!user) {
      res.status(404).json({
        message: 'Usuário não encontrado!',
      });
      return;
    }

    await userRepository.remove(user);

    res.status(200).json({
      message: 'Usuário removido com sucesso!',
    });
    return;

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao remover usuário.',
    });
    return;
  }
});

export default router;
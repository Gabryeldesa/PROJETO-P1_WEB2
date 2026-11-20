import { DataSource } from "typeorm";
import { Users } from "../entity/Users";
import { Situations } from "../entity/Situations";

export default class CreateUsersSeed {
    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'users'...");

        const userRepository = dataSource.getRepository(Users);
        const situationRepository = dataSource.getRepository(Situations);

        const existingCount = await userRepository.count();

        if (existingCount > 0) {
            console.log("A tabela 'users' já possui dados. Nenhuma alteração foi realizada!");
            return;
        }

        const situation = await situationRepository.findOne({ where: { id: 1 } });

        if (!situation) {
            console.error("Erro: Nenhuma situação encontrada com ID 1. Verifique se a tabela 'situations' está populada.");
            return;
        }

        const users = [
            {
                id: 1,
                name: "Adriano Baião",
                email: "baiao@baiao.com.br",
                password: "123456",
                situation: situation,
            },
            {
                id: 2,
                name: "Aurora",
                email: "aurora@baiao.com.br",
                password: "123456",
                situation: situation,
            },
        ];

        await userRepository.save(users);
        console.log("Seed concluído com sucesso: usuarios cadastrados!");
    }
}
import { DataSource } from "typeorm";
import { ProductSituations } from "../entity/ProductSituations";

export default class CreateProductSituationsSeeds {
    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'product_situations'...");

        const repository = dataSource.getRepository(ProductSituations);

        const existingCount = await repository.count();

        if (existingCount > 0) {
            console.log("A tabela 'product_situations' já possui dados. Nenhuma alteração foi realizada!");
            return;
        }

        const productSituations = [
            { id: 1, name: "Ativo" },
            { id: 2, name: "Inativo" },
        ];

        await repository.save(productSituations);
        console.log("Seed concluído com sucesso: situações de produto cadastradas!");
    }
}
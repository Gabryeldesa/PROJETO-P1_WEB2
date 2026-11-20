import { DataSource } from "typeorm";
import { ProductCategories } from "../entity/ProductCategories";

export default class CreateProductCategoriesSeeds {
    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'product_categories'...");

        const repository = dataSource.getRepository(ProductCategories);

        const existingCount = await repository.count();

        if (existingCount > 0) {
            console.log("A tabela 'product_categories' já possui dados. Nenhuma alteração foi realizada!");
            return;
        }

        const productCategories = [
            { id: 1, name: "Eletrônicos" },
            { id: 2, name: "Roupas" },
            { id: 3, name: "Alimentos" },
        ];

        await repository.save(productCategories);
        console.log("Seed concluído com sucesso: categorias de produto cadastradas!");
    }
}
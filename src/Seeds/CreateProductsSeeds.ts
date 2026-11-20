import { DataSource } from "typeorm";
import { Products } from "../entity/Products";
import { ProductSituations } from "../entity/ProductSituations";
import { ProductCategories } from "../entity/ProductCategories";

export default class CreateProductsSeeds {
    public async run(dataSource: DataSource): Promise<void> {
        console.log("Iniciando o seed para a tabela 'products'...");

        const productRepository = dataSource.getRepository(Products);
        const situationRepository = dataSource.getRepository(ProductSituations);
        const categoryRepository = dataSource.getRepository(ProductCategories);

        const existingCount = await productRepository.count();

        if (existingCount > 0) {
            console.log("A tabela 'products' já possui dados. Nenhuma alteração foi realizada!");
            return;
        }

        const situation = await situationRepository.findOne({ where: { id: 1 } });

        if (!situation) {
            console.error("Erro: Nenhuma situação de produto encontrada com ID 1. Verifique se a tabela 'product_situations' está populada.");
            return;
        }

        const category = await categoryRepository.findOne({ where: { id: 1 } });

        if (!category) {
            console.error("Erro: Nenhuma categoria de produto encontrada com ID 1. Verifique se a tabela 'product_categories' está populada.");
            return;
        }

        const products = [
            Object.assign(new Products(), {
                id: 1,
                name: "Curso de Node.js",
                slug: "curso-de-nodejs",
                price: 397.67,
                description: "No Curso de Node.js é abordado o desenvolvimento de APIs com Express e TypeORM.",
                productSituation: situation,
                productCategory: category,
            }),
            Object.assign(new Products(), {
                id: 2,
                name: "Curso de React",
                slug: "curso-de-react",
                price: 467.57,
                description: "No Curso de React é abordado o desenvolvimento de interfaces com componentes e hooks.",
                productSituation: situation,
                productCategory: category,
            }),
            Object.assign(new Products(), {
                id: 3,
                name: "Curso de Node.js e React",
                slug: "curso-de-nodejs-e-react",
                price: 497.67,
                description: "No Curso de Node.js e React é abordado o desenvolvimento de aplicações completas.",
                productSituation: situation,
                productCategory: category,
            }),
        ];

        await productRepository.save(products);

        console.log("Seed concluído com sucesso: produtos cadastrados!");
    }
}
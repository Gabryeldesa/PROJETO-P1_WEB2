import { AppDataSource } from "./data-source";
import CreateSituationsSeeds from "./Seeds/CreateSituationsSeeds";
import CreateUsersSeeds from "./Seeds/CreateUsersSeeds";
import CreateProductSituationsSeeds from "./Seeds/CreateProductSituationsSeeds";
import CreateProductCategoriesSeeds from "./Seeds/CreateProductCategoriesSeeds";
import CreateProductsSeeds from "./Seeds/CreateProductsSeeds";

const runSeeds = async () => {
    console.log("Conectando ao banco de dados...");

    await AppDataSource.initialize();
    console.log("Banco de dados conectado.");

    try {
        const situationsSeed = new CreateSituationsSeeds();
        const userSeed = new CreateUsersSeeds();
        const productSituationsSeed = new CreateProductSituationsSeeds();
        const productCategoriesSeed = new CreateProductCategoriesSeeds();
        const productsSeed = new CreateProductsSeeds();

        await situationsSeed.run(AppDataSource);
        await userSeed.run(AppDataSource);
        await productSituationsSeed.run(AppDataSource);
        await productCategoriesSeed.run(AppDataSource);
        await productsSeed.run(AppDataSource);

    } catch (error) {
        console.error("Erro ao executar o seed: ", error);
    } finally {
        await AppDataSource.destroy();
        console.log("Conexão com o banco de dados encerrada.");
    }
};

runSeeds();
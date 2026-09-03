import "reflect-metadata"
import { DataSource } from "typeorm"
import dotenv from 'dotenv';
dotenv.config();
import { Users } from "./entity/Users";
import { Situations } from "./entity/Situations";


const dialect = process.env.DB_DIALECT ?? "mysql";

export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    synchronize: false,
    logging: true,
    entities: [Situations, Users],
    subscribers: [],
    migrations: [__dirname + "/migration/*.js"],
})

AppDataSource.initialize()
  .then(() => {
    console.log('conexão do banco de dados realizado com sucesso!');
  })
  .catch((error) => console.log('Erro na conexão com o banco de dados', error));

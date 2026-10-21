import express from 'express';

import dotenv from 'dotenv';
dotenv.config();

const app = express();

app.set('json spaces', 2);

app.use(express.json());

import AuthController from './controllers/AuthController';
import SituationsController from './controllers/SituationsController';
import ProductCategoriesController from './controllers/ProductCategoriesController';
import ProductSituationsController from './controllers/ProductSituationsController';
import ProductsController from './controllers/ProductsController';
import UsersController from './controllers/UsersController';

app.use('/', SituationsController);

app.use('/', AuthController);

app.use('/', ProductCategoriesController);

app.use('/', ProductSituationsController);

app.use('/', ProductsController);

app.use('/', UsersController);


app.listen(process.env.PORT, () => {
  console.log(`servidor iniciado na porta ${process.env.PORT}: http://localhost:${process.env.PORT}`);
});
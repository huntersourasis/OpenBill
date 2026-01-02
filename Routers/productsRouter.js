import express from 'express';
import { createProductController , readProductController , updateProductController , deleteProductController , createCategoryController , readCategoryController , updateCategoryController , deleteCategoryController , createSKUController , readSKUController , updateSKUController , deleteSKUController  , readOneProductController} from '../Controllers/productsController.js';
const productsRouter = express.Router();

productsRouter
    .post("/create" , createProductController)
    .post("/update" , updateProductController)
    .post("/read" , readProductController)
    .post("/read-one" , readOneProductController)
    .post("/delete" , deleteProductController)
    .post("/category/create" , createCategoryController)
    .post("/category/update" , updateCategoryController)
    .post("/category/read" , readCategoryController)
    .post("/category/delete" , deleteCategoryController)
    .post("/sku/create" , createSKUController)
    .post("/sku/update" , updateSKUController)
    .post("/sku/read" , readSKUController)
    .post("/sku/delete" , deleteSKUController);

export default productsRouter;
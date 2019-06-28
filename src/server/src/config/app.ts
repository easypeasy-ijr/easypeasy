import express from "express";
import bodyParser from "body-parser";
import * as path from "path";
import { createDbConnection } from "./db";
import { getOrderProductController } from "../controllers/order_product_controller";
import { getOrderController } from "../controllers/order_controller";
import { getProductController } from "../controllers/product_controller";
import { getSupplierController } from "../controllers/supplier_controller";
import { getAuthController } from "../controllers/auth_controller";
import { getUserController } from "../controllers/user_controller";
import { Connection } from "typeorm";
import { getOrderSupplierController } from "../controllers/order_supplier_controller";

export async function createApp(conn?: Connection) {

    // Create db connection if a connection is not passed
    if (conn === undefined) {
        conn = await createDbConnection();
    }

    // Creates app
    const app = express();

    // Server config to be able to send JSON
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Declare main path
    app.use(express.static('src/client/build'));

    // Declare controller instances
    const authController = getAuthController();
    const userController = getUserController();
    const orderController = getOrderController();
    const productController = getProductController();
    const supplierController = getSupplierController();
    const orderProductController = getOrderProductController();
    const orderSupplierController = getOrderSupplierController();

    // Declare routes
    app.use("/api/v1/auth", authController);
    app.use("/api/v1/users", userController);
    app.use("/api/v1/orders", orderController);
    app.use("/api/v1/products", productController);
    app.use("/api/v1/suppliers", supplierController);
    app.use("/api/v1/orderproduct", orderProductController);
    app.use("/api/v1/ordersupplier", orderSupplierController);

    return app;
}

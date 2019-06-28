import * as express from "express";
import * as joi from "joi";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import { getOrderProductRepository } from "../repositories/order_product_repository";
import { getOrderRepository } from "../repositories/order_repository";
import { getUserRepository } from "../repositories/user_repository";
import { getProductRepository } from "../repositories/product_repository";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { Order } from "../entities/order";
import { OrderProduct } from "../entities/orderproduct";
import { Repository } from "typeorm";
import { Product } from "../entities/product";

/**
 * Interface for products
 */
interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
    qty: number;
}

/**
 * Interface for Orders
 */
interface OrdersItem {
    id: number;
    user: UserItem;
    date: string;
    products: ProductsItem[];
    suppliers: SuppliersItem[];
    confirmed: boolean;
    favourite: string;
}

/**
 * Interface for Orders
 */
interface OrdersProductItem {
    qty: number;
    order: OrdersItem;
    product: ProductsItem;
}

/**
 * Interface for Suppliers
 */
interface SuppliersItem {
    user: UserItem;
    id: number;
    email: string;
    companyName: string;
    products: ProductsItem[];
    orders: OrdersItem[];
    phoneNumber: string;
    contactName: string;
}

/**
 * Interface for User
 */
interface UserItem {
    id: number;
    email: string;
    password: string;
    contactName: string;
    companyName: string;
    suppliers: SuppliersItem[];
    products: ProductsItem[];
    orders: OrdersItem[];
}

export function getHandlers(orderProductRepo: Repository<OrderProduct>) {

    const getOrderProductByIDHandler = (req: express.Request, res: express.Response) => {
        (async () => {
            const id = req.params.id;
            const orderProducts = await orderProductRepo.findOne(id);
            res.json(orderProducts).send();
        })();
    };

    return {
        getOrderProductByIDHandler: getOrderProductByIDHandler
    };
}

export function getOrderProductController() {

    // Create respository so we can perform database operations
    const orderRepository = getOrderRepository();
    const orderProductRepository = getOrderProductRepository();
    const productRepository = getProductRepository();
    const userRepository = getUserRepository();
    const supplierRepository = getSupplierRepository();

    // Create handlers
    const handlers = getHandlers(orderProductRepository);

    // Create router instance so we can declare enpoints
    const router = express.Router();

    // Declare Joi Schema so we can validate orders
    const orderSchemaForPost = {
        //content: joi.string().required()
    };

    // HTTP GET http://localhost:8080/orders/
    router.get("/", (req, res) => {
        (async () => {
            const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                .leftJoinAndSelect("orderproduct.user", "user")
                .leftJoinAndSelect("orderproduct.product", "product")
                .leftJoinAndSelect("orderproduct.order", "order")
                .getMany();
            res.json(orderProduct).send();
        })();
    });

    // HTTP GET products from order idhttp://localhost:8080/orders/1
    router.get("/:orderId", (req, res) => { 
        (async () => {
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(orderIdNbr || productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                
                const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                .leftJoinAndSelect("orderproduct.user", "user")
                .leftJoinAndSelect("orderproduct.product", "product")
                .leftJoinAndSelect("orderproduct.order", "order")
                .where('order.id = :id', { id: orderIdNbr })
                .getMany();
                for(let element of orderProduct){
                    const product = await productRepository.createQueryBuilder("product")
                            .leftJoinAndSelect("product.supplier", "supplier")
                            .leftJoinAndSelect("product.orderproducts", "orderproduct")
                            .where("product.id = :id", { id: element.productId })
                            .andWhere("product.deleted = :status", { status: false })
                            .getOne();
                            if(product){
                                element.product = product;
                            }
                }
                if (orderProduct == null) {
                    res.status(404).send({
                        msg: "orderProduct not found!"
                    });
                } else {
                    let products : Product[] = [];
                    for(let order of orderProduct){
                        
                        products.push(order.product);
                    }
                    res.json(products).send();
                }
            }
        })();
    });

    // HTTP GET 1 with both ids http://localhost:8080/orders/1/1
    router.get("/:orderId/:productId", (req, res) => { 
        (async () => {
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(orderIdNbr || productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                
                const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                .leftJoinAndSelect("orderproduct.user", "user")
                .leftJoinAndSelect("orderproduct.product", "product")
                .leftJoinAndSelect("orderproduct.order", "order")
                .where('product.id = :pid', { pid: productIdNbr})
                .andWhere('order.id = :id', { id: orderIdNbr })
                .getOne();
                if (orderProduct == null) {
                    res.status(404).send({
                        msg: "orderProduct not found!"
                    });
                } else {
                    res.json(orderProduct).send();
                }
            }
        })();
    });

    
    // SIMPLE HTTP POST http://localhost:8080/orders/
    router.post("/", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const neworderproduct = req.body;
            const user = await userRepository.findOne(userId);
            neworderproduct.user = user;
            const ordersproduct = await orderProductRepository.save(neworderproduct);
            res.json(ordersproduct).send();
        })();
    });

    // HTTP DELETE http://localhost:8080/orders/1
    router.delete("/:orderId/:productId", (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(orderIdNbr || productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                .leftJoinAndSelect("orderproduct.user", "user")
                .leftJoinAndSelect("orderproduct.product", "product")
                .leftJoinAndSelect("orderproduct.order", "order")
                .where('product.id = :pid', { pid: productIdNbr})
                .andWhere('order.id = :id', { id: orderIdNbr })
                .getOne();
                if (orderProduct == undefined) {
                    res.status(404).send({
                        msg: "only user can delete!"
                    });
                } else {
                orderProductRepository.delete(orderProduct);
                res.json(orderProduct).send();
                }
            }
        })();

    });

    return router;
}
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
import { Product } from "../entities/product";
import { Repository } from "typeorm";
import { OrderSupplier } from "../entities/ordersupplier";
import { getOrderSupplierRepository } from "../repositories/order_supplier_repository";
import { Supplier } from "../entities/supplier";

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
interface OrdersSupplierItem {
    emailSent: string;
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
    emailSent : string;
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

export function getHandlers(orderSupplierRepo: Repository<OrderSupplier>) {

    const getOrderSupplierByIDHandler = (req: express.Request, res: express.Response) => {
        (async () => {
            const id = req.params.id;
            const orderSuppliers = await orderSupplierRepo.findOne(id);
            res.json(orderSuppliers).send();
        })();
    };

    return {
        getOrderSupplierByIDHandler: getOrderSupplierByIDHandler
    };
}

export function getOrderSupplierController() {

    // Create respository so we can perform database operations
    const orderRepository = getOrderRepository();
    const orderSupplierRepository = getOrderSupplierRepository();
    const productRepository = getProductRepository();
    const userRepository = getUserRepository();
    const supplierRepository = getSupplierRepository();

    // Create handlers
    const handlers = getHandlers(orderSupplierRepository);

    // Create router instance so we can declare enpoints
    const router = express.Router();

    // Declare Joi Schema so we can validate orders
    const orderSchemaForPost = {
        //content: joi.string().required()
    };

    // HTTP GET http://localhost:8080/orders/
    router.get("/", (req, res) => {
        (async () => {
            const orderSupplier = await orderSupplierRepository.createQueryBuilder("ordersupplier")
                .leftJoinAndSelect("ordersupplier.user", "user")
                .leftJoinAndSelect("ordersupplier.supplier", "supplier")
                .leftJoinAndSelect("ordersupplier.order", "order")
                .getMany();
            res.json(orderSupplier).send();
        })();
    });

    // HTTP GET suppliers from order http://localhost:8080/orders/1
    router.get("/:orderId", (req, res) => { 
        (async () => {
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const SupplierIdStr = req.params.SupplierId as string;
            const SupplierIdNbr = parseInt(SupplierIdStr);
            if (isNaN(orderIdNbr || SupplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                
                const orderSupplier = await orderSupplierRepository.createQueryBuilder("ordersupplier")
                .leftJoinAndSelect("ordersupplier.user", "user")
                .leftJoinAndSelect("ordersupplier.supplier", "supplier")
                .leftJoinAndSelect("ordersupplier.order", "order")
                .where('order.id = :id', { id: orderIdNbr })
                .getMany();
                if (orderSupplier == null) {
                    res.status(404).send({
                        msg: "orderSupplier not found!"
                    });
                } else {
                    let suppliers: Supplier[] = [];
                    for(let order of orderSupplier){
                        suppliers.push(order.supplier);
                    }
                    res.json(suppliers).send();
                }
            }
        })();
    });

    // HTTP GET 1 using 2 id's http://localhost:8080/orders/1
    router.get("/:orderId/:SupplierId", (req, res) => { 
        (async () => {
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const SupplierIdStr = req.params.SupplierId as string;
            const SupplierIdNbr = parseInt(SupplierIdStr);
            if (isNaN(orderIdNbr || SupplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                
                const orderSupplier = await orderSupplierRepository.createQueryBuilder("ordersupplier")
                .leftJoinAndSelect("ordersupplier.user", "user")
                .leftJoinAndSelect("ordersupplier.supplier", "supplier")
                .leftJoinAndSelect("ordersupplier.order", "order")
                .where('supplier.id = :pid', { pid: SupplierIdNbr})
                .andWhere('order.id = :id', { id: orderIdNbr })
                .getOne();
                if (orderSupplier == null) {
                    res.status(404).send({
                        msg: "orderSupplier not found!"
                    });
                } else {
                    res.json(orderSupplier).send();
                }
            }
        })();
    });

    // SIMPLE HTTP POST http://localhost:8080/orders/
    router.post("/", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const newordersupplier = req.body;
            const user = await userRepository.findOne(userId);
            newordersupplier.user = user;
            const ordersupplier = await orderSupplierRepository.save(newordersupplier);
            res.json(ordersupplier).send();
        })();
    });

    // HTTP DELETE http://localhost:8080/orders/1
    router.delete("/:orderId/:supplierId", (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.orderId as string;
            const orderIdNbr = parseInt(orderIdStr);
            const supplierIdStr = req.params.supplierId as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(orderIdNbr || supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr) as any;
                const supplier = await supplierRepository.findOne(supplierIdNbr) as any;
                const orderSupplier = await orderSupplierRepository.findOne({ user: user, order: order, supplier: supplier});
                if (orderSupplier == undefined) {
                    res.status(404).send({
                        msg: "only user can delete!"
                    });
                } else {
                orderSupplierRepository.delete(orderSupplier);
                res.json(orderSupplier).send();
                }
            }
        })();

    });

    // Simple HTTP PATCH http://localhost:8080/ordersupplier/1
    router.patch("/:id/:supid", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const supplierIdStr = req.params.supid as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const update = req.body;
                const order = await orderRepository.findOne(orderIdNbr) as any;
                const supplier = await supplierRepository.findOne(supplierIdNbr) as any;
                const oldOrder = await orderSupplierRepository.createQueryBuilder("ordersupplier")
                .leftJoinAndSelect("ordersupplier.user", "user")
                .leftJoinAndSelect("ordersupplier.supplier", "supplier")
                .leftJoinAndSelect("ordersupplier.order", "order")
                .where('supplier.id = :pid', { pid: supplierIdNbr})
                .andWhere('order.id = :id', { id: orderIdNbr })
                .getOne();
                if (oldOrder == undefined) {
                    res.status(404).send({
                        msg: "order not found!"
                    });
                } 

                if (oldOrder) {
                    const key = Object.keys(update)[0];
                    const val = update[key];
                    (oldOrder as any)[key] = val;
                    const updatedorder = await orderSupplierRepository.save(oldOrder);
                    res.json(updatedorder).send();
                } else {
                    res.status(404).send({
                        msg: "order not found!"
                    });
                }
            }
        })();
    });

    return router;
}
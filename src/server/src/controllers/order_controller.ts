import * as express from "express";
import * as joi from "joi";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import { getOrderProductRepository } from "../repositories/order_product_repository";
import { getOrderSupplierRepository } from "../repositories/order_supplier_repository";
import { getOrderRepository } from "../repositories/order_repository";
import { getUserRepository } from "../repositories/user_repository";
import { getProductRepository } from "../repositories/product_repository";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { Order } from "../entities/order";
import { Product } from "../entities/product";
import { Repository } from "typeorm";
import { OrderProduct } from "../entities/orderproduct";
import { OrderSupplier } from "../entities/ordersupplier";
import { Supplier } from "../entities/supplier";
import { User } from "../entities/user";

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
    deleted: boolean;
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
    emailSent: string;
    deleted: boolean;
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

/**
 * Interface for OrderProduct
 */
interface OrdersProductItem {
    qty: number;
    order: OrdersItem;
    product: ProductsItem;
    productId: number;
    supplier: SuppliersItem;
    supplierId: number;
    user: UserItem;
    userId: number;
}

export function getHandlers(orderRepo: Repository<Order>) {

    const getOrderByIDHandler = (req: express.Request, res: express.Response) => {
        (async () => {
            const id = req.params.id;
            const orders = await orderRepo.findOne(id);
            res.json(orders).send();
        })();
    };

    return {
        getOrderByIDHandler: getOrderByIDHandler
    };
}

export function getOrderController() {

    // Create respository so we can perform database operations
    const orderSupplierRepository = getOrderSupplierRepository();
    const orderProductRepository = getOrderProductRepository();
    const orderRepository = getOrderRepository();
    const productRepository = getProductRepository();
    const userRepository = getUserRepository();
    const supplierRepository = getSupplierRepository();

    // Create handlers
    const handlers = getHandlers(orderRepository);

    // Create router instance so we can declare enpoints
    const router = express.Router();

    // Declare Joi Schema so we can validate orders
    const orderSchemaForPost = {
        //content: joi.string().required()
    };

    // HTTP GET http://localhost:8080/orders/
    router.get("/", (req, res) => {
        (async () => {
            const orders = await orderRepository.createQueryBuilder("order")
                .leftJoinAndSelect("order.user", "user")
                .leftJoinAndSelect("order.ordersuppliers", "ordersupplier")
                .leftJoinAndSelect("order.orderproducts", "orderproduct")
                .getMany();
            res.json(orders).send();
        })();
    });

    // HTTP GET favourite orders http://localhost:8080/orders/
    router.get("/favorites/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            const orders = await orderRepository.createQueryBuilder("order")
                .leftJoinAndSelect("order.user", "user")
                .leftJoinAndSelect("order.ordersuppliers", "ordersupplier")
                .leftJoinAndSelect("order.orderproducts", "orderproduct")
                .where("order.favourite != :false", { false: "false" })
                .andWhere('order.user.id = :id', { id: userIdNbr })
                .getMany();
            res.json(orders).send();
        })();
    });

    // HTTP GET order by id http://localhost:8080/orders/1
    router.get("/:id", (req, res) => {
        (async () => {
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const orders = await orderRepository.createQueryBuilder("order")
                    .leftJoinAndSelect("order.user", "user")
                    .leftJoinAndSelect("order.ordersuppliers", "ordersupplier")
                    .leftJoinAndSelect("order.orderproducts", "orderproduct")
                    .where("order.id = :id", { id: orderIdNbr })
                    .getOne() as unknown as OrdersItem;

                const orderProduct = await orderProductRepository.find({ orderId: orderIdNbr })
                if (orderProduct) {
                    let products: ProductsItem[] = []
                    for (let element of orderProduct) {
                        const product = await productRepository.createQueryBuilder("product")
                            .leftJoinAndSelect("product.supplier", "supplier")
                            .leftJoinAndSelect("product.user", "user")
                            .leftJoinAndSelect("product.orderproducts", "orderproduct")
                            .where("product.id = :id", { id: element.productId })
                            .andWhere("product.deleted = :status", { status: false })
                            .getOne() as unknown as ProductsItem;

                        if (product) {
                            product.qty = element.qty;
                            products.push(product)
                        }
                    }
                    orders.products = products;
                }

                const orderSupplier = await orderSupplierRepository.find({ orderId: orderIdNbr })
                if (orderSupplier) {
                    let suppliers: SuppliersItem[] = []
                    for (let element of orderSupplier) {
                        const supplier = await supplierRepository.createQueryBuilder("supplier")
                            .leftJoinAndSelect("supplier.products", "product")
                            .leftJoinAndSelect("supplier.user", "user")
                            .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                            .where("supplier.id = :id", { id: element.supplierId })
                            .andWhere("supplier.deleted = :status", { status: false })
                            .getOne() as unknown as SuppliersItem;

                        if (supplier) {
                            supplier.emailSent = element.emailSent;
                            suppliers.push(supplier)
                        }
                    }
                    orders.suppliers = suppliers;
                }

                if (orders == null) {
                    res.status(404).send({
                        msg: "order not found!"
                    });
                } else {
                    res.json(orders).send();
                }
            }
        })();
    });

    // HTTP GET order products from http://localhost:8080/orders/1/products
    router.get("/:id/products", (req, res) => {
        (async () => {
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const orderResult = await orderProductRepository.find({ orderId: orderIdNbr })
                if (orderResult) {
                    let products: ProductsItem[] = []
                    for (let element of orderResult) {
                        const product = await productRepository.createQueryBuilder("product")
                            .leftJoinAndSelect("product.supplier", "supplier")
                            .leftJoinAndSelect("product.user", "user")
                            .leftJoinAndSelect("product.orderproducts", "orderproduct")
                            .where("product.id = :id", { id: element.productId })
                            .andWhere("product.deleted = :status", { status: false })
                            .getOne() as unknown as ProductsItem;

                        if (product) {
                            product.qty = element.qty;
                            products.push(product)
                        }
                    }
                    if (products == null) {
                        res.status(404).send({
                            msg: "order not found!"
                        });
                    } else {
                        res.json(products).send();
                    }
                }

            }
        })();
    });

    /**
     * Get Suppliers with only the products in this order
     */
    // HTTP GET suppliers from order http://localhost:8080/orders/1
    router.get("/:id/suppliers", (req, res) => {
        (async () => {
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                //Get order-supplier data
                const orderResult = await orderSupplierRepository.find({ orderId: orderIdNbr })
                //Get order-product data
                const orderResultProducts = await orderProductRepository.createQueryBuilder("orderproduct")
                    .leftJoinAndSelect("orderproduct.user", "user")
                    .leftJoinAndSelect("orderproduct.product", "product")
                    .leftJoinAndSelect("orderproduct.order", "order")
                    .where('order.id = :id', { id: orderIdNbr })
                    .getMany() as unknown as OrdersProductItem[];
                if (orderResult && orderResultProducts) {
                    //empty array of suppliers that will be filled with updated suppliers
                    let suppliers: SuppliersItem[] = []
                    for (let orderSupplier of orderResult) {
                        const supplier = await supplierRepository.createQueryBuilder("supplier")
                            .leftJoinAndSelect("supplier.user", "user")
                            .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                            .where("supplier.id = :id", { id: orderSupplier.supplierId })
                            .getOne() as unknown as SuppliersItem;
                        //empty array of products that will be filled with the products in order
                        let productsInOrder: ProductsItem[] = [];
                        for (let orderProduct of orderResultProducts) {
                            const product = await productRepository.createQueryBuilder("product")
                                .leftJoinAndSelect("product.supplier", "supplier")
                                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                                .where("product.id = :id", { id: orderProduct.productId })
                                .andWhere("product.deleted = :status", { status: false })
                                .getOne() as unknown as ProductsItem;
                            if (product) {
                                if (product.supplier.id == orderSupplier.supplierId) {
                                    let product = orderProduct.product;
                                    //assign qty to product in order
                                    product.qty = orderProduct.qty;
                                    //add product to products in order
                                    productsInOrder.push(orderProduct.product);
                                }
                            }
                        }
                        //Assign products in order to supplier in order
                        supplier.products = productsInOrder;
                        if (supplier) {
                            //Assign email to supplier in order
                            supplier.emailSent = orderSupplier.emailSent;
                            suppliers.push(supplier)
                        }
                    }
                    if (suppliers == null) {
                        res.status(404).send({
                            msg: "order not found!"
                        });
                    } else {
                        res.json(suppliers).send();
                    }
                }
            }
        })();
    });

    // HTTP DELETE order http://localhost:8080/orders/1
    router.delete("/:id", (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr) as any;
                const orderResult = await orderRepository.find({ user: user, id: orderIdNbr });
                if (order == undefined) {
                    res.status(404).send({
                        msg: "order not found!"
                    });
                } else {
                    if (orderResult.length == 0) {
                        res.status(400).send({
                            msg: "Only owner can delete!"
                        });
                    }
                }
                const orderIdStr = req.params.id as string;
                orderRepository.delete(orderIdStr);
                res.json(true).send();
            }
        })();

    });

    // SIMPLE HTTP POST order  http://localhost:8080/orders/
    router.post("/", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const neworder = req.body;
            const user = await userRepository.findOne(userId);
            neworder.user = user;
            const orders = await orderRepository.save(neworder);
            res.json(orders).send();
        })();
    });

    // ADD PRODUCT HTTP POST http://localhost:8080/orders/id/add/productId
    router.post("/:id/add/:productId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            const newOrderProduct = req.body;
            const qty = newOrderProduct.qty;
            if (isNaN(orderIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr);
                const product = await productRepository.findOne(productIdNbr);
                if (order == null || product == null || user == null) {
                    res.status(404).send({
                        msg: "order or product or user not found!"
                    });
                } else {
                    let newOrderProduct = new OrderProduct();
                    newOrderProduct.order = order;
                    newOrderProduct.product = product;
                    newOrderProduct.user = user;
                    newOrderProduct.qty = qty;
                    const orders = await orderProductRepository.save(newOrderProduct);
                    res.json(orders).send();
                }
            }
            res.json({

            });
        })();
    });

    // REMOVE PRODUCT HTTP POST http://localhost:8080/orders/id/remove/productId
    router.post("/:id/remove/:productId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(orderIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {

                const order = await orderRepository.findOne(orderIdNbr);
                const product = await productRepository.findOne(productIdNbr);

                if (order == null || product == null || user == null) {
                    res.status(404).send({
                        msg: "order or product or user not found!"
                    });
                } else {
                    const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                        .leftJoinAndSelect("orderproduct.user", "user")
                        .leftJoinAndSelect("orderproduct.product", "product")
                        .leftJoinAndSelect("orderproduct.order", "order")
                        .where('product.id = :pid', { pid: productIdNbr })
                        .andWhere('order.id = :id', { id: orderIdNbr })
                        .getOne();
                    if (orderProduct) {
                        const orders = await orderProductRepository.delete(orderProduct);
                        res.json(orders).send();
                    } else {
                        res.status(404).send({
                            msg: "orderProduct not found!"
                        });
                    }
                }
            }
            res.json({

            });
        })();
    });

    // REMOVE Products of a supplier from the order
    // HTTP POST /orders/id/removeproducts/supplierId
    router.post("/:id/removeproducts/:supplierId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const supplierIdStr = req.params.supplierId as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr);
                const supplier = await supplierRepository.createQueryBuilder("supplier")
                    .leftJoinAndSelect("supplier.products", "product")
                    .leftJoinAndSelect("supplier.user", "user")
                    .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                    .where("supplier.id = :id", { id: supplierIdNbr })
                    .getOne() as unknown as SuppliersItem;
                if (order == null || user == null) {
                    res.status(404).send({
                        msg: "order or product or user not found!"
                    });
                } else {
                    const orderProduct = await orderProductRepository.createQueryBuilder("orderproduct")
                        .leftJoinAndSelect("orderproduct.user", "user")
                        .leftJoinAndSelect("orderproduct.product", "product")
                        .leftJoinAndSelect("orderproduct.order", "order")
                        .where('order.id = :id', { id: orderIdNbr })
                        .getMany();
                    if (orderProduct) {
                        for (let orderP of orderProduct) {
                            const products = await productRepository.createQueryBuilder("product")
                                .leftJoinAndSelect("product.supplier", "supplier")
                                .leftJoinAndSelect("product.user", "user")
                                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                                .where("product.id = :id", { id: orderP.productId })
                                .getOne() as unknown as ProductsItem;
                            if (products.supplier.id == supplier.id) {
                                const orders = await orderProductRepository.delete(orderP);
                            }
                        }
                        res.json(orderProduct).send();
                    } else {
                        res.status(404).send({
                            msg: "orderProduct not found!"
                        });
                    }
                }
            }
            res.json({

            });
        })();
    });


    // ADD Supplier to order
    // HTTP POST orders/id/addsup/supplierId
    router.post("/:id/addsup/:supplierId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const supplierIdStr = req.params.supplierId as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            const newOrderSupplier = req.body;
            const email = newOrderSupplier.email;
            if (isNaN(orderIdNbr) || isNaN(supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr) as any; //as any, otherwise doesnt let you modify
                const supplier = await supplierRepository.findOne(supplierIdNbr) as any; //as any, otherwise doesnt let you modify
                if (order == null || supplier == null || user == null) {
                    res.status(404).send({
                        msg: "order or supplier not found!"
                    });
                } else {
                    let newOrderSupplier = new OrderSupplier();
                    newOrderSupplier.order = order;
                    newOrderSupplier.supplier = supplier;
                    newOrderSupplier.user = user;
                    newOrderSupplier.emailSent = email;
                    const orders = await orderSupplierRepository.save(newOrderSupplier);
                    res.json(orders).send();
                }
            }
        })();
    });

    // REMOVE Supplier from order
    // HTTP POST orders/id/removesup/supplierId
    router.post("/:id/removesup/:supplierId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            const supplierIdStr = req.params.supplierId as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(orderIdNbr) || isNaN(supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const order = await orderRepository.findOne(orderIdNbr) as any; //as any, otherwise doesnt let you modify
                const supplier = await supplierRepository.findOne(supplierIdNbr) as any; //as any, otherwise doesnt let you modify
                if (order == null || supplier == null) {
                    res.status(404).send({
                        msg: "order or supplier not found!"
                    });
                } else {
                    const orderSupplier = await orderSupplierRepository.createQueryBuilder("ordersupplier")
                        .leftJoinAndSelect("ordersupplier.user", "user")
                        .leftJoinAndSelect("ordersupplier.supplier", "supplier")
                        .leftJoinAndSelect("ordersupplier.order", "order")
                        .where('supplier.id = :pid', { pid: supplierIdNbr })
                        .andWhere('order.id = :id', { id: orderIdNbr })
                        .getOne();
                    if (orderSupplier) {
                        const orders = await orderSupplierRepository.delete(orderSupplier);
                        res.json(orders).send();
                    } else {
                        res.status(404).send({
                            msg: "orderSupplier not found!"
                        });
                    }
                }
            }
        })();
    });

    // Update order info HTTP PATCH orders/id
    router.patch("/:id", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const orderIdStr = req.params.id as string;
            const orderIdNbr = parseInt(orderIdStr);
            if (isNaN(orderIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const update = req.body;
                const oldOrder = await orderRepository.findOne(orderIdNbr) as any;
                const orderResult = await orderRepository.find({ user: user, id: orderIdNbr });
                if (oldOrder == undefined) {
                    res.status(404).send({
                        msg: "order not found!"
                    });
                } else {
                    if (orderResult.length == 0) {
                        res.status(400).send({
                            msg: "Order not found :(!"
                        });
                    }
                }

                if (oldOrder) {
                    const key = Object.keys(update)[0];
                    const val = update[key];
                    (oldOrder as any)[key] = val;
                    const updatedorder = await orderRepository.save(oldOrder);
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
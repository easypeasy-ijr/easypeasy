import * as express from "express";
import * as joi from "joi";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import { Product } from "../entities/product";
import { Supplier } from "../entities/supplier";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { getUserRepository } from "../repositories/user_repository";
import { getProductRepository } from "../repositories/product_repository";
import { getOrderRepository } from "../repositories/order_repository";
import { Repository } from "typeorm";

interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
    deleted: boolean;
}

interface OrdersItem {
    id: number;
    user: UserItem;
    date: string;
    products: ProductsItem[];
    suppliers: SuppliersItem[];
    confirmed: boolean;
    favourite: string;
}


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

export function getHandlers(productRepo: Repository<Product>) {

    const httpGetHandler = (
        req: express.Request,
        res: express.Response
    ) => {
        (async () => {
            const products = await productRepo.find();
            res.json(products);
        })();
    }

    const getproductByIDHandler = (req: express.Request, res: express.Response) => {
        (async () => {
            const id = req.params.id;
            const products = await productRepo.createQueryBuilder("product")
                .leftJoinAndSelect("product.supplier", "supplier")
                .leftJoinAndSelect("product.user", "user")
                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                .where("product.id = :id", { id: id })
                .getOne();
            res.json(products);
        })();
    };


    return {
        httpGetHandler,
        getproductByIDHandler: getproductByIDHandler
    };
}

export function getProductController() {

    // Create respository so we can perform database operations
    const productRepository = getProductRepository();
    const supplierRepository = getSupplierRepository();
    const userRepository = getUserRepository();
    const orderRepository = getOrderRepository();

    // Create handlers
    const handlers = getHandlers(productRepository);

    // Create router instance so we can declare enpoints
    const router = express.Router();

    // Declare Joi Schema so we can validate products
    const productSchemaForPost = {
        // title: joi.string().required(),
        //voteCount: joi.number().equal(0),
        // url: joi.string().uri().required()
    };

    // HTTP GET http://localhost:8080/products/
    router.get("/", (req, res) => {
        (async () => {
            const products = await productRepository.createQueryBuilder("product")
                .leftJoinAndSelect("product.supplier", "supplier")
                .leftJoinAndSelect("product.user", "user")
                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                .where("product.deleted = :status", { status: false })
                .getMany();
            res.json(products).send();
        })();
    });

    // HTTP GET all products from user (Including the deleted ones)
    // http://localhost:8080/products/all/userIs
    router.get("/all/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            const products = await productRepository.createQueryBuilder("product")
                .leftJoinAndSelect("product.supplier", "supplier")
                .leftJoinAndSelect("product.user", "user")
                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                .where("product.user.id = :id", {id: userIdNbr})
                .getMany();
            res.json(products).send();
        })();
    });

    // HTTP GET user's products (Only the ones not deleted) 
    // http://localhost:8080/products/user/userId
    router.get("/user/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            const products = await productRepository.createQueryBuilder("product")
                .leftJoinAndSelect("product.user", "user")
                .leftJoinAndSelect("product.supplier", "supplier")
                .leftJoinAndSelect("product.orderproducts", "orderproduct")
                .where("product.deleted = :status", { status: false })
                .andWhere("product.user.id = :id", { id: userIdNbr })
                .getMany() as unknown as ProductsItem[];
            res.json(products).send();
        })();
    });

    // HTTP GET  active products of supplier 
    // http://localhost:8080/products/supplier/supId
    router.get("/supplier/:id", (req, res) => {
        (async () => {
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.supplier.id = :id", { id: supplierIdNbr })
                    .andWhere("product.deleted = :status", { status: false })
                    .getMany();
            res.json(products).send();
        })();
    });

    // HTTP GET product by id http://localhost:8080/products/1
    router.get("/:id", (req, res) => {
        (async () => {
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                //const products = await productRepository.findOne(productIdNbr);
                const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.user", "user")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.id = :id", { id: productIdNbr })
                    .getOne();
                if (products == null) {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                } else {
                    res.json(products).send();
                }
            }
        })();
    });

    // HTTP DELETE http://localhost:8080/products/1
    router.delete("/:id", (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const product = await productRepository.findOne(productIdNbr) as any;
                const productResult = await productRepository.find({ user: user, id: productIdNbr });
                if (product == undefined) {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                } else {
                    if (productResult.length == 0) {
                        res.status(400).send({
                            msg: "Only owner can delete!"
                        });
                    } else {
                        const productIdStr = req.params.id as string;
                        productRepository.delete(productIdStr);
                        res.json(product).send();
                    }
                }
            }
        })();

    });

    // "DELETE" PRODUCT HTTP POST http://localhost:8080/products/id/delete
    router.post("/:id/delete", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const product = await productRepository.findOne({ user: user, id: productIdNbr }) as any; //as any, otherwise doesnt let you modify

                if (product == null) {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                } else {
                    product.deleted = true;
                    const products = await productRepository.save(product);
                    res.json(products).send();
                }
            }
            res.json({

            });
        })();
    });


    // HTTP POST  with supplier http://localhost:8080/products/4
    router.post("/:supplierId/", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const supplierIdStr = req.params.supplierId as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            const newproduct = req.body;
            /** 
            const result = joi.validate(newproduct, productSchemaForPost);
            if (result.error) {
                res.status(400).send({
                    msg: "error :(!"
                });
            } else {*/
            const user = await userRepository.findOne(userId);
            const supplier = await supplierRepository.findOne(supplierIdNbr);
            newproduct.user = user;
            newproduct.supplier = supplier;
            const products = await productRepository.save(newproduct);
            res.json(products).send();
            //}
        })();
    });


    // Simple HTTP PATCH http://localhost:8080/orders/1
    router.patch("/:id", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const update = req.body;
                const oldProduct = await productRepository.findOne(productIdNbr) as any;
                const productResult = await productRepository.find({ user: user, id: productIdNbr });
                if (oldProduct == undefined) {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                } else {
                    if (productResult.length == 0) {
                        res.status(400).send({
                            msg: "Order not found :(!"
                        });
                    }
                }
                if (oldProduct) {
                    const key = Object.keys(update)[0];
                    const val = update[key];
                    (oldProduct as any)[key] = val;
                    const updatedproduct = await productRepository.save(oldProduct);
                    res.json(updatedproduct).send();
                } else {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                }
            }
        })();
    });

    // Simple HTTP PATCH products that belong to a Supplier http://localhost:8080/orders/1
    router.patch("/:id/supplier", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const update = req.body;
                const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.user", "user")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.supplier.id = :id", { id: supplierIdNbr })
                    .getMany();
                if (products == undefined) {
                    res.status(404).send({
                        msg: "products not found!"
                    });
                } else {
                    if (products.length == 0) {
                        res.status(400).send({
                            msg: "products not found not found :(!"
                        });
                    }
                }
                if (products) {
                    for (let product of products) {
                        const key = Object.keys(update)[0];
                        const val = update[key];
                        (product as any)[key] = val;
                        const updatedproduct = await productRepository.save(product);
                    }
                    res.json(products).send();
                } else {
                    res.status(404).send({
                        msg: "product not found!"
                    });
                }
            }
        })();
    });

    // ADD SUPPLIER HTTP POST http://localhost:8080/products/id/add/productId
    router.post("/:id/add/:supplierId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.supplierId as string;;
            const supplierIdNbr = parseInt(supplierIdStr);
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(supplierIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const product = await productRepository.findOne(productIdNbr, { relations: ["suppliers"] }) as any; //as any, otherwise doesnt let you modify
                const supplier = await supplierRepository.findOne(supplierIdNbr) as any; //as any, otherwise doesnt let you modify
                if (supplier == null || product == null) {
                    res.status(404).send({
                        msg: "supplier or product not found!"
                    });
                } else {
                    console.log(supplier);
                    console.log(product);
                    product.suppliers.push(supplier);

                    console.log(product.suppliers);
                    const products = await productRepository.save(product);
                    res.json(products).send();
                }
            }
            res.json({

            });
        })();
    });

    // REMOVE products Supplier HTTP POST http://localhost:8080/products/id/remove/productId
    router.post("/:id/remove/:supplierId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.supplierId as string;;
            const supplierIdNbr = parseInt(supplierIdStr);
            const productIdStr = req.params.id as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(supplierIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const product = await productRepository.findOne(productIdNbr, { relations: ["suppliers"] }) as any; //as any, otherwise doesnt let you modify
                const supplierToRemove = await supplierRepository.findOne(supplierIdNbr) as any; //as any, otherwise doesnt let you modify
                if (supplierToRemove == null || product == null) {
                    res.status(404).send({
                        msg: "supplier or product not found!"
                    });
                } else {
                    product.suppliers.splice(product.suppliers.indexOf(supplierToRemove), 1);
                    const products = await productRepository.save(product);
                    res.json(products).send();
                }
            }
            res.json({

            });
        })();
    });

    return router;
}
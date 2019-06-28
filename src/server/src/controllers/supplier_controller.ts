import * as express from "express";
import * as joi from "joi";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import { getOrderRepository } from "../repositories/order_repository";
import { getUserRepository } from "../repositories/user_repository";
import { getProductRepository } from "../repositories/product_repository";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { Supplier } from "../entities/supplier";
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

export function getHandlers(supplierRepo: Repository<Supplier>) {

    const getSupplierByIDHandler = (req: express.Request, res: express.Response) => {
        (async () => {
            const id = req.params.id;
            const suppliers = await supplierRepo.findOne(id);
            res.json(suppliers);
        })();
    };

    return {
        getSuppliertByIDHandler: getSupplierByIDHandler
    };
}

export function getSupplierController() {

    // Create respository so we can perform database operations
    const supplierRepository = getSupplierRepository();
    const productRepository = getProductRepository();
    const userRepository = getUserRepository();
    const orderRepository = getOrderRepository();

    // Create handlers
    const handlers = getHandlers(supplierRepository);

    // Create router instance so we can declare enpoints
    const router = express.Router();

    // Declare Joi Schema so we can validate suppliers
    const supplierSchemaForPost = {
        email: joi.string().email().required()
    };

    // HTTP GET http://localhost:8080/suppliers/
    router.get("/", (req, res) => {
        (async () => {
            let suppliersUpdated: SuppliersItem[] = [];
            const suppliers = await supplierRepository.createQueryBuilder("supplier")
                .leftJoinAndSelect("supplier.user", "user")
                .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                .where("supplier.deleted = :status", { status: false })
                .getMany() as unknown as SuppliersItem[];
            for (let supplier of suppliers) {
                const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.supplier.id = :id", { id: supplier.id })
                    .andWhere("product.deleted = :status", { status: false })
                    .getMany() as unknown as ProductsItem[];
                supplier.products = products;
                suppliersUpdated.push(supplier)
            }
            res.json(suppliersUpdated).send();
        })();
    });

    // HTTP GET all suppliers (Including the deleted ones) 
    // http://localhost:8080/suppliers/all/id
    router.get("/all/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            const suppliers = await supplierRepository.createQueryBuilder("supplier")
                .leftJoinAndSelect("supplier.user", "user")
                .leftJoinAndSelect("supplier.products", "product")
                .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                .where("supplier.user.id = :id", {id: userIdNbr})
                .getMany() as unknown as SuppliersItem[];
            res.json(suppliers).send();
        })();
    });

    // HTTP GET user's active suppliers 
    // http://localhost:8080/suppliers/
    router.get("/user/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            let suppliersUpdated: SuppliersItem[] = [];
            const suppliers = await supplierRepository.createQueryBuilder("supplier")
                .leftJoinAndSelect("supplier.user", "user")
                .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                .where("supplier.deleted = :status", { status: false })
                .andWhere("supplier.user.id = :id", { id: userIdNbr })
                .getMany() as unknown as SuppliersItem[];
            for (let supplier of suppliers) {
                const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.supplier.id = :id", { id: supplier.id })
                    .andWhere("product.deleted = :status", { status: false })
                    .getMany() as unknown as ProductsItem[];
                supplier.products = products;
                suppliersUpdated.push(supplier)
            }
            res.json(suppliers).send();
        })();
    });

    // HTTP GET  supplier by id http://localhost:8080/suppliers/1
    router.get("/:id", (req, res) => {
        (async () => {
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            if (isNaN(supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const suppliers = await supplierRepository.createQueryBuilder("supplier")
                    .leftJoinAndSelect("supplier.user", "user")
                    .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                    .where("supplier.id = :id", { id: supplierIdNbr })
                    .getOne() as unknown as SuppliersItem;
                const products = await productRepository.createQueryBuilder("product")
                    .leftJoinAndSelect("product.supplier", "supplier")
                    .leftJoinAndSelect("product.orderproducts", "orderproduct")
                    .where("product.supplier.id = :id", { id: supplierIdNbr })
                    .andWhere("product.deleted = :status", { status: false })
                    .getMany() as unknown as ProductsItem[];
                suppliers.products = products;
                if (suppliers == null) {
                    res.status(404).send({
                        msg: "supplier not found!"
                    });
                } else {
                    res.json(suppliers).send();
                }
            }
        })();
    });


    // HTTP DELETE http://localhost:8080/suppliers/1
    router.delete("/:id", (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            /** 
            if (isNaN(supplierIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {*/
            const supplier = await supplierRepository.findOne(supplierIdNbr) as unknown as SuppliersItem;
            const supplierResult = await supplierRepository.find({ user: user, id: supplierIdNbr });
            if (supplier == undefined) {
                res.status(404).send({
                    msg: "supplier not found!"
                });
            } else {
                if (supplierResult.length == 0) {
                    res.status(400).send({
                        msg: "Only owner can delete!"
                    });
                    // }
                }
                const supplierIdStr = req.params.id as string;
                supplierRepository.delete(supplierIdStr);
                res.json(supplier).send();
            }
        })();

    });

    // ADD product to supplier HTTP POST http://localhost:8080/suppliers/id/add/productId
    router.post("/:id/add/:productId", authMiddleware, (req, res) => {
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
                const supplier = await supplierRepository.find({ user: user, id: supplierIdNbr }) as any;
                if (supplier == null) {
                    res.status(404).send({
                        msg: "order or product not found!"
                    });
                } else {
                    supplier.deleted = true;
                    const suppliers = await supplierRepository.save(supplier);
                    res.json(suppliers).send();
                }
            }
            res.json({

            });
        })();
    });


    // SIMPLE HTTP POST http://localhost:8080/suppliers/
    router.post("/", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const newsupplier = req.body;
            //const result = joi.validate(newsupplier, supplierSchemaForPost);
            /*
            if (result.error) {
                res.status(400).send({
                    msg: "error!"
                });
            } else {*/
            const user = await userRepository.findOne(userId);
            newsupplier.user = user;
            const suppliers = await supplierRepository.save(newsupplier);
            res.json(suppliers).send();
            //}
        })();
    });

    // Simple HTTP PATCH http://localhost:8080/suppliers/1
    router.patch("/:id", authMiddleware, (req, res) => {
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
                const oldsupplier = await supplierRepository.findOne(supplierIdNbr) as any;
                const supplierResult = await supplierRepository.find({ user: user, id: supplierIdNbr });
                console.log(supplierResult);
                if (oldsupplier == undefined) {
                    res.status(404).send({
                        msg: "supplier not found!"
                    });
                } else {
                    if (supplierResult.length == 0) {
                        res.status(400).send({
                            msg: "supplier not found :(!"
                        });
                    }
                }

                if (oldsupplier) {
                    const key = Object.keys(update)[0];
                    const val = update[key];
                    (oldsupplier as any)[key] = val;
                    const updatedsupplier = await supplierRepository.save(oldsupplier);
                    res.json(updatedsupplier).send();
                } else {
                    res.status(404).send({
                        msg: "supplier not found!"
                    });
                }
            }
        })();
    });

    // ADD PRODUCT HTTP POST http://localhost:8080/suppliers/id/add/productId
    router.post("/:id/add/:productId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(supplierIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const supplier = await supplierRepository.findOne(supplierIdNbr, { relations: ["products"] }) as any; //as any, otherwise doesnt let you modify
                const product = await productRepository.findOne(productIdNbr) as any; //as any, otherwise doesnt let you modify
                if (supplier == null || product == null) {
                    res.status(404).send({
                        msg: "order or product not found!"
                    });
                } else {
                    supplier.products.push(product);
                    console.log(supplier.products);
                    const suppliers = await supplierRepository.save(supplier);
                    res.json(suppliers).send();
                }
            }
            res.json({

            });
        })();
    });

    // REMOVE PRODUCT HTTP POST http://localhost:8080/suppliers/id/remove/productId
    router.post("/:id/remove/:productId", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            const supplierIdStr = req.params.id as string;
            const supplierIdNbr = parseInt(supplierIdStr);
            const productIdStr = req.params.productId as string;
            const productIdNbr = parseInt(productIdStr);
            if (isNaN(supplierIdNbr) || isNaN(productIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            } else {
                const supplier = await supplierRepository.findOne(supplierIdNbr, { relations: ["products"] }) as any; //as any, otherwise doesnt let you modify
                const productToRemove = await productRepository.findOne(productIdNbr) as any; //as any, otherwise doesnt let you modify
                if (supplier == null || productToRemove == null) {
                    res.status(404).send({
                        msg: "supplier or product not found!"
                    });
                } else {
                    console.log(supplier.products);
                    supplier.products.splice(supplier.products.indexOf(productToRemove), 1);
                    const suppliers = await supplierRepository.save(supplier);
                    res.json(suppliers).send();
                }
            }
            res.json({

            });
        })();
    });



    return router;
}
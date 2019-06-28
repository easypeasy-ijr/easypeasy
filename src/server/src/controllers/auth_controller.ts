import * as express from "express";
import * as joi from "joi";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { getUserRepository } from "../repositories/user_repository";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { getOrderRepository } from "../repositories/order_repository";
import { getProductRepository } from "../repositories/product_repository";
import { User } from "../entities/user";
import { AuthTokenContent, authMiddleware, AuthenticatedRequest } from "../config/auth";

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

// We pass the repository instance as an argument
// We use this pattern so we can unit test the handlers with ease
export function getHandlers(AUTH_SECRET: string, userRepository: Repository<User>) {

    const userDetailsSchema = {
        email: joi.string().email(),
        password: joi.string()
    };

    // Instances of Repositories that will be used by the controllers
    const supplierRepository = getSupplierRepository();
    const productRepository = getProductRepository();

    // Returns a JWT when the user credentials are valid
    const login = (req: express.Request, res: express.Response) => {
        (async () => {
            try {

                // Read and validate the user details from the request body
                const userDetails = req.body;
                const result = joi.validate(userDetails, userDetailsSchema);

                if (result.error) {
                    res.status(400).json({ error: "Bad Request" }).send();
                } else {

                    // Try to find the user with the given credentials
                    const user = await userRepository.findOne({
                        where: {
                            email: userDetails.email,
                            password: userDetails.password
                        }
                    });

                    // Return error HTTP 404 not found if not found
                    if (user === undefined) {
                        res.status(401).json({ error: "Unauthorized" }).send();
                    } else {

                        // Create JWT token
                        if (AUTH_SECRET === undefined) {
                            throw new Error("Missing environment variable AUTH_SECRET");
                        } else {
                            const tokenContent: AuthTokenContent = { id: user.id };
                            const token = jwt.sign(tokenContent, AUTH_SECRET);
                            res.json({ token: token }).send();
                        }
                    }
                }

            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                    .json({ error: "Internal server error" })
                    .send();
            }
        })();
    }

    // Returns user's info using the token
    const getProfile = (req: express.Request, res: express.Response) => {
        (async () => {
            try {
                const userId = (req as AuthenticatedRequest).userId;
                const user = await userRepository.createQueryBuilder("user")
                    .leftJoinAndSelect("user.products", "product")
                    .leftJoinAndSelect("user.suppliers", "supplier")
                    .leftJoinAndSelect("user.orders", "order")
                    .where("user.id = :id", { id: userId })
                    .getOne() as unknown as UserItem;
                if (user) {
                    const products = await productRepository.createQueryBuilder("product")
                        .leftJoinAndSelect("product.supplier", "supplier")
                        .leftJoinAndSelect("product.user", "user")
                        .leftJoinAndSelect("product.orderproducts", "orderproduct")
                        .where("product.user.id = :id", { id: user.id })
                        .andWhere("product.deleted = :status", { status: false })
                        .getMany() as unknown as ProductsItem[];
                    user.products = products;
                    const suppliers = await supplierRepository.createQueryBuilder("supplier")
                        .leftJoinAndSelect("supplier.user", "user")
                        .leftJoinAndSelect("supplier.products", "product")
                        .leftJoinAndSelect("supplier.ordersuppliers", "ordersupplier")
                        .where("supplier.user.id = :id", { id: user.id })
                        .andWhere("supplier.deleted = :status", { status: false })
                        .getMany() as unknown as SuppliersItem[];
                    user.suppliers = suppliers;
                }


                res.json(user).send();
            } catch (err) {
                // Handle unexpected errors
                console.error(err);
                res.status(500)
                    .json({ error: "Internal server error" })
                    .send();
            }
        })();
    }

    return {
        login,
        getProfile
    };

}

export function getAuthController() {

    const AUTH_SECRET = process.env.AUTH_SECRET;

    if (AUTH_SECRET === undefined) {
        throw new Error("Missing environment variable AUTH_SECRET");
    }

    const repository = getUserRepository();
    const handlers = getHandlers(AUTH_SECRET, repository);
    const router = express.Router();

    // Public
    router.post("/login", handlers.login);

    // Private
    router.post("/profile", authMiddleware, handlers.getProfile);

    return router;
}

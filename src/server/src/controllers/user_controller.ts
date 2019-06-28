import * as express from "express";
import * as nodemailer from "nodemailer";
import { authMiddleware, AuthenticatedRequest } from "../config/auth";
import { getUserRepository } from "../repositories/user_repository";
import { getSupplierRepository } from "../repositories/supplier_repository";
import { getOrderRepository } from "../repositories/order_repository";
import { getProductRepository } from "../repositories/product_repository";
import * as joi from "joi";

interface ProductsItem {
    id: number;
    user: UserItem;
    supplier: SuppliersItem;
    name: string;
    unit: string;
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
    deleted : boolean;
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

export function getUserController() {

    const userRepository = getUserRepository();
    const supplierRepository = getSupplierRepository();
    const orderRepository = getOrderRepository();
    const productRepository = getProductRepository();
    const router = express.Router();


    const userDetailsSchema = {
        email: joi.string().email(),
        password: joi.string()
    };

    const emailSchema = {
        to: joi.string().email().required(),
        subject: joi.string().required(),
        text: joi.string().required()
    };

    /**
     * Email Account that will be used to send emails
     * Port that the transporter ill use
     */
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        port: 465,
        secure: true,
        auth: {
            user: 'easypeasyserviceapp@gmail.com',
            pass: 'easy2016234'
        }
    });

    /**
     * App's Email
     */
    const appEmail = 'easypeasyserviceapp@gmail.com';


    
    // HTTP Send Email POST http://localhost:8080/users/sendemail
    router.post("/sendemail", authMiddleware, (req, res) => {
        (async () => {
            const newEmail = req.body;
            newEmail.from = appEmail;
            transporter.sendMail(newEmail, (error, info) => {
                if (error) {
                    res.status(400).send({
                        msg: error
                    });
                } else {
                    res.json({ ok: "email sent!"}).send();
                }
            });
        })();
    });

    // HTTP POST http://localhost:8080/users/
    router.post("/", (req, res) => {
        (async () => {
            const newUser = req.body;
            const result = joi.validate(newUser, userDetailsSchema);
            const email = newUser.email;
            const usersEmail = await userRepository.find({ email: email });
            if (/** result.error || */usersEmail.length > 0) {
                res.status(400).send({
                    msg: "email already used by another account!"
                });
            } else {
                const users = await userRepository.save(newUser);
                res.json({ ok: "user added!", users }).send();
            }
        })();
    });

    // HTTP GET http://localhost:8080/users/1
    router.get("/:id", (req, res) => {
        (async () => {
            const userIdStr = req.params.id as string;
            const userIdNbr = parseInt(userIdStr);
            if (isNaN(userIdNbr)) {
                res.status(400).send({
                    msg: "Id must be a number!"
                });
            }
            const users = await userRepository.findOne(userIdNbr);
            if (users == null) {
                res.status(404).send({
                    msg: "user not found!"
                });
            }
            let activeSuppliers : SuppliersItem [] = [];
            const suppliers = await supplierRepository.find({ user: users }) as unknown as SuppliersItem[];
            for(let supplier of suppliers){
                if(supplier.deleted == false){
                    activeSuppliers.push(supplier);
                }
            }
            const orders = await orderRepository.find({ user: users });
            const products = await productRepository.find({ user: users });

            res.json({
                user: users,
                suppliers: activeSuppliers,
                orders: orders,
                products: products
            });

        })();
    });



    // HTTP DELETE http://localhost:8080/users/1
    router.delete("/:id", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            if (user == undefined) {
                res.status(404).send({
                    msg: "User not found!"
                });
            } else {
                const userProducts = await productRepository.delete({ user: user }); //delete users products first
                const userSuppliers = await supplierRepository.delete({ user: user });//delete users suppliers first
                const userOrders = await orderRepository.delete({ user: user });//delete users suppliers first
                const userIdStr = req.params.id as string;
                const userDelete = await userRepository.delete(userId);
                //userRepository.delete(userIdStr);
                res.json(true);
            }


        })();

    });

    // Simple HTTP PATCH http://localhost:8080/users/1
    router.patch("/:id", authMiddleware, (req, res) => {
        (async () => {
            const userId = (req as any).userId;
            const user = await userRepository.findOne(userId);
            if (user == undefined) {
                res.status(404).send({
                    msg: "User not found!"
                });
            } else {
                const update = req.body;
                const oldUser = await userRepository.findOne(userId) as any;
                if (oldUser) {
                    const key = Object.keys(update)[0];
                    const val = update[key];
                    (oldUser as any)[key] = val;
                    const updatedUser = await userRepository.save(oldUser);
                    res.json(updatedUser).send();
                } else {
                    res.status(404).send({
                        msg: "user not found!"
                    });
                }
            }
        })();
    });

    return router;
}

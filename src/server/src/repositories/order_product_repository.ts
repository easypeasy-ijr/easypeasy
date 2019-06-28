import { getConnection } from "typeorm";
import { OrderProduct } from "../entities/orderproduct";

export function getOrderProductRepository() {
    const connection = getConnection();
    const orderProductRepository = connection.getRepository(OrderProduct);
    return orderProductRepository;
}
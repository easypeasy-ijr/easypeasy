import { getConnection } from "typeorm";
import { Order } from "../entities/order";

export function getOrderRepository() {
    const connection = getConnection();
    const orderRepository = connection.getRepository(Order);
    return orderRepository;
}
import { getConnection } from "typeorm";
import { OrderProduct } from "../entities/orderproduct";
import { OrderSupplier } from "../entities/ordersupplier";

export function getOrderSupplierRepository() {
    const connection = getConnection();
    const orderSupplierRepository = connection.getRepository(OrderSupplier);
    return orderSupplierRepository;
}
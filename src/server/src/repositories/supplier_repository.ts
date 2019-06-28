import { getConnection } from "typeorm";
import { Supplier } from "../entities/supplier";

export function getSupplierRepository() {
    const connection = getConnection();
    const supplierRepository = connection.getRepository(Supplier);
    return supplierRepository;
}
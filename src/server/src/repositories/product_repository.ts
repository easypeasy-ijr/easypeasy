import { getConnection } from "typeorm";
import { Product } from "../entities/product";

export function getProductRepository() {
    const connection = getConnection();
    const productRepository = connection.getRepository(Product);
    return productRepository;
}

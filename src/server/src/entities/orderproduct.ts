import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from "typeorm";
import { User } from "./user";
import { Supplier } from "./supplier";
import { Order } from "./order";
import { Product } from "./product";

/**
 * Relational table Order-Product
 */
@Entity()
export class OrderProduct {
    @PrimaryColumn()
    public orderId!: number;

    @ManyToOne(type => Order, order => order.orderproducts)
    @JoinColumn({ name: "orderId" })
    public order!: Order;

    @PrimaryColumn()
    public productId!: number;

    @ManyToOne(type => Product, product => product.orderproducts)
    @JoinColumn({ name: "productId" })
    public product!: Product;

    @ManyToOne(type => User, user => user.products)
    public user!: User;

    @Column()
    public qty!: number;
}
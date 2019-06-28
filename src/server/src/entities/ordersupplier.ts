import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, JoinColumn } from "typeorm";
import { User } from "./user";
import { Supplier } from "./supplier";
import { Order } from "./order";
import { Product } from "./product";


/**
 * Relational table Order-Supplier
 */
@Entity()
export class OrderSupplier {
    @PrimaryColumn()
    public orderId!: number;

    @ManyToOne(type => Order, order => order.ordersuppliers)
    @JoinColumn({ name: "orderId" })
    public order!: Order;

    @PrimaryColumn()
    public supplierId!: number;

    @ManyToOne(type => Supplier, supplier => supplier.ordersuppliers)
    @JoinColumn({ name: "supplierId" })
    public supplier!: Supplier;

    @ManyToOne(type => User, user => user.products)
    public user!: User;

    @Column({nullable: true})
    public emailSent!: string;
}
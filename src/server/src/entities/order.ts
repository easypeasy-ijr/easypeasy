import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, ManyToMany, OneToMany, JoinTable } from "typeorm";
import { User } from "./user";
import { Product } from "./product";
import { Supplier } from "./supplier";
import { OrderProduct } from "./orderproduct";
import { OrderSupplier } from "./ordersupplier";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column()
    public date!: string; 
    @Column()
    public confirmed!: boolean; 
    @Column({ nullable: true })
    public favourite!: string;
    @ManyToOne(type => User, user => user.orders)
    public user!: User;
    @OneToMany(type => OrderSupplier, ordersupplier => ordersupplier.order)
    public ordersuppliers!: OrderSupplier[];
    @OneToMany(type => OrderProduct, orderproduct => orderproduct.order)
    public orderproducts!: OrderProduct[];
}

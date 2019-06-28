import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { User } from "./user";
import { Supplier } from "./supplier";
import { Order } from "./order";
import { OrderProduct } from "./orderproduct";


@Entity()
export class Product {
    @PrimaryGeneratedColumn()
    public id!: number;
    @Column()
    public name!: string;
    @Column()
    public unit!: string;
    @Column({default: false})
    public deleted!: boolean; 
    @ManyToOne(type => Supplier, supplier => supplier.products)
    public supplier!: Supplier;
    @ManyToOne(type => User, user => user.products)
    public user!: User;
    @OneToMany(type => OrderProduct, orderproduct => orderproduct.product)
    public orderproducts!: OrderProduct[];
}

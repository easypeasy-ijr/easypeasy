import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Supplier } from "../entities/supplier";
import { Product } from "../entities/product";
import { Order } from "./order";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public email!: string;

    @Column()
    public password!: string;

    @Column()
    public contactName!: string;

    @Column()
    public companyName!: string;

    @OneToMany(type => Supplier, supplier => supplier.user) 
    public suppliers!: Supplier[];

    @OneToMany(type => Product, product => product.user) 
    public products!: Product[];

    @OneToMany(type => Order, order => order.user) 
    public orders!: Order[];


}

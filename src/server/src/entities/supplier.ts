import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, ManyToOne, OneToMany, JoinTable} from "typeorm";
import { Product } from "./product";
import { User } from "./user";
import { Order } from "./order";
import { OrderSupplier } from "./ordersupplier";



@Entity()
export class Supplier {
    @PrimaryGeneratedColumn()
    public id!: number;

    @Column()
    public email!: string;

    @Column()
    public companyName!: string;

    @Column()
    public phoneNumber!: string;

    @Column()
    public contactName!: string;

    @Column({default: false})
    public deleted!: boolean; 

    @OneToMany(type => Product, product => product.supplier) 
    public products!: Product[];

    @ManyToOne(type => User, user => user.suppliers)
    public user!: User;
    
    @OneToMany(type => OrderSupplier, ordersupplier => ordersupplier.supplier)
    public ordersuppliers!: OrderSupplier[];
}

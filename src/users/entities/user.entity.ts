import { Order } from "../../orders/entities/order.entity";
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { ROLES } from "../../common/enums/roles.enum";

@Entity("customers")
export class Customer {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100})
    email: string;

    @Column()
    password: string;

    @Column({ unique: true, length: 255 })
    profile_image_url: string;

    @Column({ length: 255 })
    address: string;

    // ADD Relation: One Customer has Many Orders
    @OneToMany(() => Order, (order) => order.customer)
    orders: Order[]

    @Column({
        type: 'enum',
        enum: ROLES,
        default: ROLES.CUSTOMER
    })
    role: ROLES;    

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
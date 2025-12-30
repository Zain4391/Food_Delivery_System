import { MenuItem } from "./menu-item.entity";
import { Order } from "../../orders/entities/order.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";


@Entity("restaurants")
export class Restaurant {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 150 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ length: 50 })
    cusine_type: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ length: 20 })
    phone: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column({ nullable: true, length: 255 })
    logo_url: string;

    @Column({ nullable: true, length: 255 })
    banner_url: string;

    @Column('decimal', { precision: 3, scale: 2, default: 0 })
    rating: number;

    @Column({ default: true })
    is_active: boolean;

    // ADD Relationship: One restaurant can have Many Orders
    @OneToMany(() => Order, (order) => order.restauarant)
    orders: Order[];
    
    // ADD Relationship: One Restaurant can have many Menu Items
    @OneToMany(() => MenuItem, (menuItem) => menuItem.restauarant)
    menuItems: MenuItem[]

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
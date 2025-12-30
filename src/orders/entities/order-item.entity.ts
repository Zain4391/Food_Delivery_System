import { MenuItem } from "../../resturants/entities/menu-item.entity";
import { Order } from "./order.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("order_items")
export class OrderItem {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
    order: Order;

    @Column()
    order_id: string;

    @ManyToOne(() => MenuItem, (menuItem) => menuItem.orderItems)
    menuItem: MenuItem;

    @Column()
    menu_item_id: string;

    @Column()
    quantity: number;

    @Column('decimal', { precision: 10, scale: 2 })
    unit_price: number;

    @Column('decimal', { precision: 10, scale: 2 })
    subtotal: number;

    @CreateDateColumn()
    created_at: Date;
}
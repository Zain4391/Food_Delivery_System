import { DeliveryDriver } from "../../drivers/entities/driver.entity";
import { Restaurant } from "../../resturants/entities/restaurant.entity";
import { Customer } from "../../users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OrderItem } from "./order-item.entity";
import { Delivery } from "../../delivery/entities/delivery.entity";


export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  PICKED_UP = 'picked_up',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

@Entity("orders")
export class Order {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING
    })
    status: OrderStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    total_amount: number;

    @Column({ type: 'text' })
    delivery_address: string;

    @Column({ type: 'text', nullable: true })
    special_instructions: string;

    @Column({ type: 'timestamp', nullable: true })
    estimated_delivery_time: Date;

    // Relationship: Many Orders can be from a customer
    @ManyToOne(() => Customer, (customer) => customer.orders, { onDelete: 'CASCADE'})
    customer: Customer;

    @Column()
    customer_id: string;

    // Relationship Many Orders can be from One Restaurant
    @ManyToOne(() => Restaurant, (restauarant) => restauarant.orders, { onDelete: 'CASCADE'})
    restauarant: Restaurant;

    @Column()
    restaurant_id: string;

    // Relationship: Many Orders may be delivered by one Driver
    @ManyToOne(() => DeliveryDriver, (driver) => driver.orders, { nullable: true })
    driver: DeliveryDriver;

    @Column({ nullable: true })
    driver_id: string;

    // Relationship: One order can have many Items
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
    orderItems: OrderItem[];

    // Relationship: One order has one delivery
    @OneToOne(() => Delivery, (delivery) => delivery.order, { nullable: true })
    delivery: Delivery;

    @CreateDateColumn()
    order_date: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
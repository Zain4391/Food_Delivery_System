import { OrderItem } from "../../orders/entities/order-item.entity";
import { Restaurant } from "./restaurant.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum CATEGORY {
    APPETIZER = "appetizer",
    MAIN = "main",
    DESSERT = "dessert",
    BEVERAGE = "beverage"
}

@Entity("manu_items")
export class MenuItem {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 50 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column('decimal', { precision: 10, scale: 2 })
    price: number;

    @Column({
        type: 'enum',
        enum: CATEGORY,
        default: CATEGORY.APPETIZER
    })
    category: CATEGORY

    @Column({ nullable: true, length: 255 })
    image_url: string;

    @Column({ default: true })
    is_available: boolean;

    @Column({ default: 15 })
    preparation_time: number;

    // Relationship: Many Items belong to One Restaurant
    @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, {onDelete: 'CASCADE'})
    restauarant: Restaurant;

    @Column()
    restaurant_id: string;

    // ADD Relationship: One menu item can belong to Many OrderItems
    @OneToMany(() => OrderItem, (orderItem) => orderItem.menuItem)
    orderItems: OrderItem[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

}
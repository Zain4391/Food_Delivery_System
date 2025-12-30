import { Order } from "../../orders/entities/order.entity";
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

// Vehicle enum
export enum VEHICLE_TYPE {
    CAR = "car",
    BIKE = "bike"
}

@Entity("delivery_drivers")
export class DeliveryDriver {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true, length: 100 })
    email: string;

    @Column()
    password: string; // will be assigned by admin, can be changed

    @Column({ length: 11 })
    phone: string;

    @Column({
        type: 'enum',
        enum: VEHICLE_TYPE,
        default: VEHICLE_TYPE.BIKE
    })
    vehicle_type: VEHICLE_TYPE

    @Column({ nullable: true, length: 255 })
    profile_image_url: string;

    @Column({ default: true })
    is_available: true;

    // ADD Relation: One Rider can Have many Orders
    @OneToMany(() => Order, (order) => order.driver)
    orders: Order[];
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
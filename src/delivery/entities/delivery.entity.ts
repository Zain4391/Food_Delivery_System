import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

@Entity('deliveries')
export class Delivery {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Order, (order) => order.delivery, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' }) // for ownership (ONLY )
  order: Order;

  @Column()
  order_id: string;

  @Column({ type: 'timestamp', nullable: true })
  picked_up_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
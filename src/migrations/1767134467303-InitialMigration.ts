import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1767134467303 implements MigrationInterface {
    name = 'InitialMigration1767134467303'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."delivery_drivers_vehicle_type_enum" AS ENUM('car', 'bike')`);
        await queryRunner.query(`CREATE TABLE "delivery_drivers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "phone" character varying(11) NOT NULL, "vehicle_type" "public"."delivery_drivers_vehicle_type_enum" NOT NULL DEFAULT 'bike', "profile_image_url" character varying(255), "is_available" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e668a9cf33275e556d7fe46b725" UNIQUE ("email"), CONSTRAINT "PK_4dd4af220a2bc6d27785662bbde" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" character varying NOT NULL, "menu_item_id" character varying NOT NULL, "quantity" integer NOT NULL, "unit_price" numeric(10,2) NOT NULL, "subtotal" numeric(10,2) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "orderId" uuid, "menuItemId" uuid, CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."manu_items_category_enum" AS ENUM('appetizer', 'main', 'dessert', 'beverage')`);
        await queryRunner.query(`CREATE TABLE "manu_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "category" "public"."manu_items_category_enum" NOT NULL DEFAULT 'appetizer', "image_url" character varying(255), "is_available" boolean NOT NULL DEFAULT true, "preparation_time" integer NOT NULL DEFAULT '15', "restaurant_id" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "restauarantId" uuid, CONSTRAINT "PK_a1639267f28e89885339a961fe7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "restaurants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "cusine_type" character varying(50) NOT NULL, "address" text NOT NULL, "phone" character varying(20) NOT NULL, "email" character varying(100) NOT NULL, "logo_url" character varying(255), "banner_url" character varying(255), "rating" numeric(3,2) NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c356f465f786a3ae9ff48ab18ef" UNIQUE ("email"), CONSTRAINT "PK_e2133a72eb1cc8f588f7b503e68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "deliveries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "picked_up_at" TIMESTAMP, "delivered_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_789dba7900f6d25550280ad3b9" UNIQUE ("order_id"), CONSTRAINT "PK_a6ef225c5c5f0974e503bfb731f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."orders_status_enum" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "status" "public"."orders_status_enum" NOT NULL DEFAULT 'pending', "total_amount" numeric(10,2) NOT NULL, "delivery_address" text NOT NULL, "special_instructions" text, "estimated_delivery_time" TIMESTAMP, "customer_id" character varying NOT NULL, "restaurant_id" character varying NOT NULL, "driver_id" character varying, "order_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "customerId" uuid, "restauarantId" uuid, "driverId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(100) NOT NULL, "password" character varying NOT NULL, "profile_image_url" character varying(255) NOT NULL, "address" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8536b8b85c06969f84f0c098b03" UNIQUE ("email"), CONSTRAINT "UQ_2d1b37dba81c12c6d2ee56fdc12" UNIQUE ("profile_image_url"), CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8" FOREIGN KEY ("menuItemId") REFERENCES "manu_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "manu_items" ADD CONSTRAINT "FK_c516bc84e2a342f8b88bb50ea11" FOREIGN KEY ("restauarantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "deliveries" ADD CONSTRAINT "FK_789dba7900f6d25550280ad3b93" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_855d0bcdcd29cc41fe8960cd322" FOREIGN KEY ("restauarantId") REFERENCES "restaurants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_18dc786cf29d6ef99980ba6ae63" FOREIGN KEY ("driverId") REFERENCES "delivery_drivers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_18dc786cf29d6ef99980ba6ae63"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_855d0bcdcd29cc41fe8960cd322"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_e5de51ca888d8b1f5ac25799dd1"`);
        await queryRunner.query(`ALTER TABLE "deliveries" DROP CONSTRAINT "FK_789dba7900f6d25550280ad3b93"`);
        await queryRunner.query(`ALTER TABLE "manu_items" DROP CONSTRAINT "FK_c516bc84e2a342f8b88bb50ea11"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_d8453d5a71e525d9b406c35aab8"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
        await queryRunner.query(`DROP TABLE "deliveries"`);
        await queryRunner.query(`DROP TABLE "restaurants"`);
        await queryRunner.query(`DROP TABLE "manu_items"`);
        await queryRunner.query(`DROP TYPE "public"."manu_items_category_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "delivery_drivers"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_drivers_vehicle_type_enum"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class RoleMigration1767213597169 implements MigrationInterface {
    name = 'RoleMigration1767213597169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."delivery_drivers_role_enum" AS ENUM('admin', 'customer', 'driver')`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" ADD "role" "public"."delivery_drivers_role_enum" NOT NULL DEFAULT 'driver'`);
        await queryRunner.query(`CREATE TYPE "public"."customers_role_enum" AS ENUM('admin', 'customer', 'driver')`);
        await queryRunner.query(`ALTER TABLE "customers" ADD "role" "public"."customers_role_enum" NOT NULL DEFAULT 'customer'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."customers_role_enum"`);
        await queryRunner.query(`ALTER TABLE "delivery_drivers" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."delivery_drivers_role_enum"`);
    }

}

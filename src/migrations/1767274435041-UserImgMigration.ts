import { MigrationInterface, QueryRunner } from "typeorm";

export class UserImgMigration1767274435041 implements MigrationInterface {
    name = 'UserImgMigration1767274435041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "profile_image_url" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "customers" ALTER COLUMN "profile_image_url" SET NOT NULL`);
    }

}

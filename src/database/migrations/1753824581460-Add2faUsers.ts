import { MigrationInterface, QueryRunner } from "typeorm";

export class Add2faUsers1753824581460 implements MigrationInterface {
    name = 'Add2faUsers1753824581460'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mnt_users" ADD "use_two_factor_auth" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "mnt_users" ADD "two_factor_secret" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mnt_users" DROP COLUMN "two_factor_secret"`);
        await queryRunner.query(`ALTER TABLE "mnt_users" DROP COLUMN "use_two_factor_auth"`);
    }

}

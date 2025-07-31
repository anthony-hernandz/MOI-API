import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeColumnSpecialAssigneeForTypePermissionInMntPermissionsUsers1752684516480 implements MigrationInterface {
    name = 'ChangeColumnSpecialAssigneeForTypePermissionInMntPermissionsUsers1752684516480'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" RENAME COLUMN "special_assignee" TO "type_permission"`);
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" DROP COLUMN "type_permission"`);
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" ADD "type_permission" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`COMMENT ON COLUMN "mnt_permissions_user"."type_permission" IS '0: declined, 1: assigned'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`COMMENT ON COLUMN "mnt_permissions_user"."type_permission" IS '0: declined, 1: assigned'`);
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" DROP COLUMN "type_permission"`);
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" ADD "type_permission" boolean DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "mnt_permissions_user" RENAME COLUMN "type_permission" TO "special_assignee"`);
    }

}

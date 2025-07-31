import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitTables1752503022543 implements MigrationInterface {
  name = 'InitTables1752503022543';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "mnt_tokens" ("id" text NOT NULL, "token" text NOT NULL, "expiration_time" TIMESTAMP WITH TIME ZONE NOT NULL, "refresh_token" text, "refresh_expiration_time" TIMESTAMP WITH TIME ZONE, "active" boolean, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_user" text NOT NULL, CONSTRAINT "PK_1c5a962297ae4167f7e4c0f18b1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_modules" ("id" text NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(500), "type" integer NOT NULL DEFAULT '0', "icon" character varying(100), "visible" boolean DEFAULT true, "active" boolean, "rute_ui" character varying(100), "super_admin" boolean DEFAULT false, "priority" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_parent" text, CONSTRAINT "PK_84ffb8aebdb402d144f29bee0f9" PRIMARY KEY ("id")); COMMENT ON COLUMN "mnt_modules"."type" IS '0: Menu, 1: Submenu, 2: Action'; COMMENT ON COLUMN "mnt_modules"."super_admin" IS 'only super admin access'`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_permissions_modules" ("id_module" text NOT NULL, "id_permission" text NOT NULL, CONSTRAINT "PK_c8f292332845215ed5e2d2f4aa5" PRIMARY KEY ("id_module", "id_permission"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_permissions" ("id" text NOT NULL, "name" character varying(100) NOT NULL, "description" character varying(500), "active" boolean NOT NULL DEFAULT true, "endpoint" character varying(100) NOT NULL, "method" character varying(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_3bd45abddbb211c465af11078ba" PRIMARY KEY ("id")); COMMENT ON COLUMN "mnt_permissions"."method" IS 'HTTP method (GET, POST, PUT, DELETE)'`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_permissions_user" ("id" text NOT NULL, "special_assignee" boolean DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id_permission" text NOT NULL, "id_user" text, CONSTRAINT "PK_25ee5fb5d294613e21ec41e90b6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_restore_account" ("id" text NOT NULL, "date_time_expiration" TIMESTAMP WITH TIME ZONE NOT NULL, "ip" character varying(100) NOT NULL, "link_restore" text NOT NULL, "token_restore" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_user" text NOT NULL, CONSTRAINT "PK_dab33f1a540accb6a6637c30d1a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_permissions_rol" ("id" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id_permission" text NOT NULL, "id_rol" text NOT NULL, CONSTRAINT "PK_39075ce60e26d05ec676428d89f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_rol_user" ("id" text NOT NULL, "name" character varying(50) NOT NULL, "description" character varying(250), "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_f952cfe5caa9d3fd0a71e61010c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "mnt_users" ("id" text NOT NULL, "email" character varying(100), "password" text NOT NULL, "active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_rol" text NOT NULL, CONSTRAINT "UQ_1e617ed0ca179d432721034ef1a" UNIQUE ("email"), CONSTRAINT "PK_1472534d7931b53554745135d16" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bit_log_errores" ("id" text NOT NULL, "error" text NOT NULL, "url" text NOT NULL, "params" text, "body" text, "query" text, "method" character varying(20), "ip" character varying(100) NOT NULL, "fecha_hora" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "id_usuario" text, CONSTRAINT "PK_c3830ca3a1e6514a575bd50f9ef" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_tokens" ADD CONSTRAINT "FK_16ccb8b7566562f8f81cd337bdd" FOREIGN KEY ("id_user") REFERENCES "mnt_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_modules" ADD CONSTRAINT "FK_276ed7092e795bf4f53c486407a" FOREIGN KEY ("id_parent") REFERENCES "mnt_modules"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_modules" ADD CONSTRAINT "FK_e52ca8f07418c1848c2eaf216bc" FOREIGN KEY ("id_module") REFERENCES "mnt_modules"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_modules" ADD CONSTRAINT "FK_ea8d74fba50caec8f1abe84ccc3" FOREIGN KEY ("id_permission") REFERENCES "mnt_permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_user" ADD CONSTRAINT "FK_703a290fda1db3099992161845e" FOREIGN KEY ("id_permission") REFERENCES "mnt_permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_user" ADD CONSTRAINT "FK_25f7952f756de55f5c5bef4799f" FOREIGN KEY ("id_user") REFERENCES "mnt_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_restore_account" ADD CONSTRAINT "FK_00833dd4d7063d17a176a3c6794" FOREIGN KEY ("id_user") REFERENCES "mnt_users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_rol" ADD CONSTRAINT "FK_c9cacaa42cd8d39f1b3b3821e2a" FOREIGN KEY ("id_permission") REFERENCES "mnt_permissions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_rol" ADD CONSTRAINT "FK_e6b827d61992d6ad988740de9a5" FOREIGN KEY ("id_rol") REFERENCES "mnt_rol_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_users" ADD CONSTRAINT "FK_95bc1a7a99093904000df5fae03" FOREIGN KEY ("id_rol") REFERENCES "mnt_rol_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "mnt_users" DROP CONSTRAINT "FK_95bc1a7a99093904000df5fae03"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_rol" DROP CONSTRAINT "FK_e6b827d61992d6ad988740de9a5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_rol" DROP CONSTRAINT "FK_c9cacaa42cd8d39f1b3b3821e2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_restore_account" DROP CONSTRAINT "FK_00833dd4d7063d17a176a3c6794"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_user" DROP CONSTRAINT "FK_25f7952f756de55f5c5bef4799f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_user" DROP CONSTRAINT "FK_703a290fda1db3099992161845e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_modules" DROP CONSTRAINT "FK_ea8d74fba50caec8f1abe84ccc3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_permissions_modules" DROP CONSTRAINT "FK_e52ca8f07418c1848c2eaf216bc"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_modules" DROP CONSTRAINT "FK_276ed7092e795bf4f53c486407a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mnt_tokens" DROP CONSTRAINT "FK_16ccb8b7566562f8f81cd337bdd"`,
    );
    await queryRunner.query(`DROP TABLE "bit_log_errores"`);
    await queryRunner.query(`DROP TABLE "mnt_users"`);
    await queryRunner.query(`DROP TABLE "mnt_rol_user"`);
    await queryRunner.query(`DROP TABLE "mnt_permissions_rol"`);
    await queryRunner.query(`DROP TABLE "mnt_restore_account"`);
    await queryRunner.query(`DROP TABLE "mnt_permissions_user"`);
    await queryRunner.query(`DROP TABLE "mnt_permissions"`);
    await queryRunner.query(`DROP TABLE "mnt_permissions_modules"`);
    await queryRunner.query(`DROP TABLE "mnt_modules"`);
    await queryRunner.query(`DROP TABLE "mnt_tokens"`);
  }
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntPermissionModules } from '@modules/entities/mnt-permissions-modules.entity';
import { MntPermissionsUser } from '@modules/entities/mnt-permissions-user.entity';
import { MntPermissionsRol } from '@modules/entities/mnt-permissions-rol.entity';

@Entity('mnt_permissions')
export class MntPermissions {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'name', nullable: false })
  name: string;

  @Column({ type: 'varchar', length: 500, name: 'description', nullable: true })
  description: string;

  @Column({ type: 'boolean', name: 'active', default: true })
  active: boolean;

  @Column({ type: 'varchar', length: 100, name: 'endpoint', nullable: false })
  endpoint: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'method',
    nullable: false,
    comment: 'HTTP method (GET, POST, PUT, DELETE)',
  })
  method: string;

  @Exclude()
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createAt: Date;

  @Exclude()
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updateAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;

  @OneToMany(() => MntPermissionModules, (PM) => PM.permission)
  permissionsModules: MntPermissionModules[];

  @OneToMany(() => MntPermissionsUser, (PU) => PU.permission, {})
  permissionsUser: MntPermissionsUser[];

  @OneToMany(() => MntPermissionsRol, (PR) => PR.permission, {})
  permissionsRol: MntPermissionsRol[];
}

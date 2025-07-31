import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntUsers } from './mntUsers.entity';
import { MntPermissionsRol } from '@modules/entities/mnt-permissions-rol.entity';

@Entity('mnt_rol_user')
export class MntRolUser {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 250, nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

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
    name: 'updated_at',
  })
  updateAt: Date;

  @Exclude()
  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;

  @OneToMany(() => MntUsers, (user: MntUsers) => user.rol)
  users: MntUsers[];

  @OneToMany(() => MntPermissionsRol, (permissionRol) => permissionRol.rol)
  permissions: MntPermissionsRol[];
}

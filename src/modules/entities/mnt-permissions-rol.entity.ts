import {
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntRolUser } from '@users/entities';
import { MntPermissions } from '@modules/entities/mnt-permissions.entity';

@Entity('mnt_permissions_rol')
export class MntPermissionsRol {
  @PrimaryColumn('text')
  id: string;

  @ManyToOne(() => MntPermissions, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_permission' })
  permission: MntPermissions;

  @ManyToOne(() => MntRolUser, (rol) => rol.permissions, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_rol' })
  rol: MntRolUser;

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
}

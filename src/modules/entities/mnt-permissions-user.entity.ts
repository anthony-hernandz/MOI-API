import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntUsers } from '@users/entities';
import { MntPermissions } from '@modules/entities/mnt-permissions.entity';

@Entity('mnt_permissions_user')
export class MntPermissionsUser {
  @PrimaryColumn('text')
  id: string;

  @Column({
    type: 'int4',
    nullable: false,
    name: 'type_permission',
    default: 0,
    comment: '0: declined, 1: assigned',
  })
  typePermission: number;

  @ManyToOne(() => MntPermissions, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_permission' })
  permission: MntPermissions;

  @ManyToOne(() => MntUsers, (user) => user.permissions)
  @JoinColumn({ name: 'id_user' })
  user: MntUsers;

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

import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { MntTokens } from '@auth/entities/MntTokens.entity';
import { MntPermissionsUser } from '@modules/entities/mnt-permissions-user.entity';
import { MntRestoreAccount } from './mntRestoreAccount.entity';
import { MntRolUser } from './mntRolUser.entity';

@Entity('mnt_users')
export class MntUsers {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'varchar', length: 100, nullable: true, unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'text' })
  password: string; // Encriptado

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

  @ManyToOne(() => MntRolUser, (rol) => rol.users, { nullable: false })
  @JoinColumn({ name: 'id_rol' })
  rol: MntRolUser;

  @OneToMany(() => MntPermissionsUser, (permission) => permission.user)
  permissions: MntPermissionsUser[];

  @OneToMany(() => MntTokens, (tokens) => tokens.user)
  tokens: MntTokens[];

  @OneToMany(() => MntRestoreAccount, (restore) => restore.user)
  restoreAccount: MntRestoreAccount[];

  @Column({ type: 'boolean', default: true, name: 'use_two_factor_auth' })
  twoFactorEnabled: boolean;

  @Column({
    type: 'text',
    nullable: true,
    name: 'two_factor_secret',
  })
  twoFactorAuthentionSecret: string;
}

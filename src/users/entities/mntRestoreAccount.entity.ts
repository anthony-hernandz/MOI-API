import { Exclude } from 'class-transformer';
import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  PrimaryColumn,
  JoinColumn,
} from 'typeorm';
import { MntUsers } from './mntUsers.entity';

@Entity('mnt_restore_account')
export class MntRestoreAccount {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'timestamptz', name: 'date_time_expiration' })
  dataTimeExpiration: Date;

  @Exclude()
  @Column({ type: 'varchar', length: 100 })
  ip: string;

  @Exclude()
  @Column({ type: 'text', name: 'link_restore' })
  linkRestore: string;

  @Column({ type: 'text', name: 'token_restore' })
  tokenRestore: string;

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

  @ManyToOne(() => MntUsers, (user) => user.restoreAccount, {
    nullable: false,
  })
  @JoinColumn({ name: 'id_user' })
  user: MntUsers;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MntUsers } from '@users/entities';

@Entity('mnt_tokens')
export class MntTokens {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'timestamptz', name: 'expiration_time' })
  expirationTime: Date;

  @Column({ type: 'text', name: 'refresh_token', nullable: true })
  refreshToken: string;

  @Column({
    type: 'timestamptz',
    name: 'refresh_expiration_time',
    nullable: true,
  })
  refreshExpirationTime: Date;

  @Column({ type: 'boolean', nullable: true })
  active: boolean;

  @ManyToOne(() => MntUsers, (user) => user.tokens, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user: MntUsers;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'updated_at',
    nullable: true,
  })
  updateAt: Date;

  @DeleteDateColumn({
    type: 'timestamptz',
    name: 'deleted_at',
  })
  deletedAt: Date;
}

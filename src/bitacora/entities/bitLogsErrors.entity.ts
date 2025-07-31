import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

//@Entity('bit_log_errores')
export class BitLogErrores {
  @PrimaryColumn('text')
  id: string;

  @Column({ type: 'text' })
  error: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'text', nullable: true })
  params: string;

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'text', nullable: true })
  query: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  method: string;

  @Column({ type: 'varchar', length: 100 })
  ip: string;

  @Column({ type: 'timestamptz', name: 'fecha_hora' })
  fechaHora: Date;

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

  @Column({ type: 'text', nullable: true, name: 'id_usuario' })
  user: string;
}

import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { MntPermissionModules } from '@modules/entities/mnt-permissions-modules.entity';

@Entity('mnt_modules')
export class MntModules {
  @PrimaryColumn('text')
  id: string;

  @Column({ nullable: true })
  id_parent: string;

  @ManyToOne(() => MntModules, (parents) => parents.children, {
    nullable: true,
  })
  @JoinColumn({ name: 'id_parent' })
  parent: MntModules;

  @OneToMany(() => MntModules, (child) => child.parent)
  children: MntModules[];

  @Column({ type: 'varchar', length: 100, nullable: false, name: 'name' })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'description' })
  description: string;

  @Column({
    type: 'int4',
    nullable: false,
    default: 0,
    name: 'type',
    comment: '0: Menu, 1: Submenu, 2: Action',
  })
  type: number;

  @Column({ type: 'varchar', length: 100, name: 'icon', nullable: true })
  icon: string;

  @Column({ type: 'boolean', nullable: true, default: true })
  visible: boolean;

  @Column({ type: 'boolean', nullable: true, name: 'active' })
  active: boolean;

  @Column({ type: 'varchar', length: 100, name: 'rute_ui', nullable: true })
  ruteUi: string;

  @Column({
    type: 'boolean',
    nullable: true,
    name: 'super_admin',
    comment: 'only super admin access',
    default: false,
  })
  superAdmin: boolean;

  @Column({ type: 'int4', name: 'priority', default: 0 })
  priority: number;

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

  /*@ManyToMany(() => MntPermissions)
  @JoinTable({
    name: 'mnt_permissions_modules',
    joinColumn: { name: 'id_module', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'id_permission', referencedColumnName: 'id' },
  })
  permissions: MntPermissions[];*/

  @OneToMany(() => MntPermissionModules, (PM) => PM.module)
  permissionsModules: MntPermissionModules[];
}

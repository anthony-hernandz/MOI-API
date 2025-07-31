import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { MntModules } from './mnt-modules.entity';
import { MntPermissions } from './mnt-permissions.entity';

@Entity('mnt_permissions_modules')
export class MntPermissionModules {
  @PrimaryColumn({ type: 'text', name: 'id_module' })
  @ManyToOne(() => MntModules, (module) => module.permissionsModules, {
    nullable: false,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'id_module' })
  module: MntModules;

  @PrimaryColumn({ type: 'text', name: 'id_permission' })
  @ManyToOne(
    () => MntPermissions,
    (permission) => permission.permissionsModules,
    { nullable: false, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
  )
  @JoinColumn({ name: 'id_permission' })
  permission: MntPermissions;
}

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Role } from '@/shared/types';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Index({ unique: true })
  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @Column({ name: 'google_id', nullable: true, unique: true })
  googleId?: string;

  @Column({ name: 'refresh_token', nullable: true, select: false })
  refreshToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('password-reset')
export class PasswordResetEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ nullable: true,unique:true })
  @Index()
  token: string;
  @Column({ nullable: true})
  userId: string;
  @Column({ nullable: true})
  employeerId: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  phoneNumber: string;
  @Column({ nullable: true,default:"Started" })
  status: string;
  @Column({type:'date', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;
}

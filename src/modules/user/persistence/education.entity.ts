/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import {
  Entity,
  Column,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
import { UserEntity } from './users.entity';

@Entity({ name: 'educations' })
export class EducationEntity extends CommonEntity {
  @Column()
  institutionName: string;
  @Column()
  userId: string;
  @Column({ nullable: true })
  typeOfDegree: string;
  @Column()
  fieldOfStudy: string;
  @Column({type:'date'})
  startDate: Date;
  @Column({type:'date'})
  endDate: Date;
  @Column({ nullable: true, type: 'decimal' })
  gpa: number;
  @Column({ nullable: true, type: 'jsonb' })
  Attachment : FileDto;
  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.educations,
  )
  @JoinColumn({name:'userId'})
  user: UserEntity;


  
}

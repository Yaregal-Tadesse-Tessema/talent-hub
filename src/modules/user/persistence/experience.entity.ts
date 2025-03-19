/* eslint-disable prettier/prettier */
import { CommonEntity } from 'src/libs/Common/common-entity';
import { Entity, Column } from 'typeorm';
import { FileDto } from 'src/libs/Common/dtos/file.dto';
@Entity({ name: 'experiences' })
export class ExperienceEntity extends CommonEntity {
  @Column()
  companyName: string;
  @Column()
  jobTitle: string;
  @Column({ nullable: true })
  userId: string;
  @Column({ nullable: true })
  Industry: string;
  @Column()
  employmentType: string;
  @Column({ type: 'date' })
  startDate: Date;
  @Column({ type: 'date' })
  endDate: Date;
  @Column({ nullable: true, type: 'jsonb' })
  Attachment: FileDto;
  // @ManyToOne(
  //   () => UserEntity,
  //   (userEntity) => userEntity.experiences,
  // )
  // @JoinColumn({name:'userId'})
  // user: UserEntity;
}


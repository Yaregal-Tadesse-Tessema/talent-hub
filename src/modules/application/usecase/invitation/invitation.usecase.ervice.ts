/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { DataResponseFormat } from 'src/libs/response-format/data-response-format';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';
import { InvitationRepository } from '../../persistences/invitation.repository';
import { CreateInvitationCommand } from './invitation.command';
import { InvitationResponse } from './invitation.response';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
@Injectable()
export class InvitationService {
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly emailService: EmailService,
    private readonly userRepository: UserRepository,
  ) {}
  async create(command: CreateInvitationCommand): Promise<InvitationResponse> {
    const invitation = await this.invitationRepository.getOneByCriteria({
      userId: command.userId,
      jobPostId: command.jobPostId,
    });
    if (invitation) throw new BadRequestException(`invitation already sent`);
    const item = CreateInvitationCommand.fromDto(command);
    const res = await this.invitationRepository.create(item);
    console.log(res);
    if (res) {
      const user = await this.userRepository.findOne(command.userId);
      if (user.email) {
        const subject = 'New Job Invitation – Please Check Your Application';
        const html = `Dear ${user.firstName} ${user.middleName},
                      You have received an invitation to apply for a new job opportunity through our application system.
                      Kindly log in to your profile to view the details and submit your application if you're interested click the 
                      <a href='http://138.197.105.31:3000/login'>link</a>.
                      If you have any questions, feel free to contact us.
                      Best regards,`;
        const result = await this.emailService.sendGridEmail(
          user.email,
          subject,
          html
        );
      }
    }
    return InvitationResponse.toResponse(item);
  }
  async findAll(
    query: CollectionQuery,
  ): Promise<DataResponseFormat<InvitationResponse>> {
    const response = await this.invitationRepository.findAllPublic(query);
    const d = new DataResponseFormat<InvitationResponse>();
    d.items = response?.items?.map((item) =>
      InvitationResponse.toResponse(item),
    );
    d.total = response?.total;
    return d;
  }
  async findOne(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<InvitationResponse> {
    const response = await this.invitationRepository.findOne(
      id,
      relations,
      withDeleted,
    );
    return InvitationResponse.toResponse(response);
  }
  async update(id: string, itemData: any): Promise<InvitationResponse> {
    await this.findOneOrFail(id);
    await this.invitationRepository.update(id, itemData);
    const res = await this.findOne(id);
    return res;
  }
  async softDelete(id: string): Promise<any> {
    const item = await this.findOneOrFail(id);
    await this.invitationRepository.softDelete(item.id);
    return true;
  }
  async restore(id: string): Promise<boolean> {
    await this.findOneOrFailWithDeleted(id);
    await this.invitationRepository.restore(id);
    return true;
  }
  async findAllArchived(query: CollectionQuery) {
    if (!query.where) {
      query.where = [];
    }
    query.where.push([
      { column: 'deletedAt', value: '', operator: 'IsNotNull' },
    ]);
    const response = await this.invitationRepository.findAllArchived(query);
    return response;
  }
  private async findOneOrFail(
    id: any,
    relations = [],
    withDeleted = false,
  ): Promise<InvitationResponse> {
    const item = await this.findOne(id, relations, withDeleted);
    if (!item) {
      throw new NotFoundException(`not_found`);
    }
    return item;
  }
  private async findOneOrFailWithDeleted(id: any): Promise<InvitationResponse> {
    const item = await this.invitationRepository.findOne(id, [], true);
    return InvitationResponse.toResponse(item);
  }
  async getOneByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<InvitationResponse> {
    const response = await this.invitationRepository.getOneByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return InvitationResponse.toResponse(response);
  }
  async getManyByCriteria(
    criteria: object,
    relations = [],
    withDeleted = false,
  ): Promise<InvitationResponse[]> {
    const response = await this.invitationRepository.getManyByCriteria(
      criteria,
      relations,
      withDeleted,
    );
    return response.map((item) => InvitationResponse.toResponse(item));
  }
}

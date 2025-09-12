/* eslint-disable prettier/prettier */
// my-cron.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CollectionQuery } from 'src/libs/Common/collection-query/query';
import { console } from 'inspector';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { UserEntity } from '../persistence/users.entity';
import { EmailService } from 'src/modules/notification/usecase/email.usecase.command';

@Injectable()
export class UserCronJobService implements OnModuleInit {
    private readonly logger = new Logger(UserCronJobService.name);
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly emailService: EmailService,

    ) { }
    onModuleInit() {
        this.logger.log('MyCronService initialized');
    }
    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    async handleCron() {
        const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7));
        const users = await this.userRepository.find({ where: { reciveNotification: true, lastLoginDate: MoreThan(lastWeek) } });
        if (users.length > 0) {
            for (const user of users) {
                if (user.email) {
                    const message = `Dear ${user.firstName} ${user.middleName} ${user.lastName},

                     We noticed you haven’t logged in for a while — and you might be missing out! 🚀  
                     In the past week, new job opportunities and career growth chances have been posted that could match your profile.  

                     Top employers are actively searching, and your next big career move might already be waiting for you. Don’t let it slip by.  

                     👉 Log in today to explore fresh opportunities, stay ahead of the competition, and keep your career journey moving forward.  

                     If you need help, our support team is always here for you at support@yourcompany.com.

                     Your future career may just be one login away ✨
                     `;
                    const subject = `Your next career move might be waiting — don’t miss it!`
                    const result = await this.emailService.sendEmail(user.email, subject, message, null);
                    console.log(result);
                }
            }
        }
    }
}

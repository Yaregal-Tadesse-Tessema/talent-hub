/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { Telegraf } from 'telegraf';
import { Markup } from 'telegraf';
import axios from 'axios';
import { ProfessionEnums } from 'src/modules/job-posting/constants';
@Injectable()
export class TelegramBotService {
  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly user: UserService,
  ) {
    this.setupListeners();
  }
  private setupListeners() {
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id;
      const result = await this.user.getOneByCriteria({
        telegramUserId: userId,
      });

      if (!result) {
        ctx.reply(
          'In order to get job posts Regularly please click the button below',
          {
            ...Markup.keyboard([
              Markup.button.contactRequest('Send Contact'),
            ]).resize(),
          },
        );
      } else {
        ctx.reply(
          `Here is the menu please select One`,
          Markup.inlineKeyboard([
            [Markup.button.callback('📄 Complete Your Profile', 'profile')],
            [Markup.button.callback('📤 Upload Resume', 'upload_resume')],
            [Markup.button.callback('🔄 select Profession', 'profession')],
          ]),
        );
      }
    });
    this.bot.action('upload_resume', (ctx) => {
      ctx.reply('📤 Please attach a file in PDF or DOCX format (Max: 2MB).');
    });
    this.bot.on('contact', async (ctx) => {
      const userId = ctx.from.id;
      const contact = ctx.message.contact; // Contact object
      const phoneNumber = contact.phone_number;
      const firstName = contact.first_name;
      const lastName = contact.last_name;

      const result = await this.user.getOneByCriteria({ phone: phoneNumber });
      if (!result) {
        const user = new UserEntity();
        user.phone = phoneNumber;
        user.telegramUserId = userId.toString();
        user.firstName = firstName;
        user.lastName = lastName;
        const res = await this.user.create(user);
      } else {
        result.telegramUserId = userId.toString();
        const res = await this.user.update(result.id, result);
      }
      ctx.reply(
        `Thanks for sharing your phone number, ${firstName}! Here's what you can do next`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📄 Complete Your Profile', 'profile')],
          [Markup.button.callback('📤 Upload Resume', 'upload_resume')],
          [Markup.button.callback('🔄 select Profession', 'profession')],
        ]),
      );

      // Optionally, store the phone number in your database with the userId
    });
    this.bot.on('document', async (ctx) => {
      console.log('📂 Received a document!'); // Debugging
      const file = ctx.message.document;
      const userId = ctx.from.id;
      if (!file) {
        console.log('❌ No file received!');
        return ctx.reply('❌ No file detected. Please upload a valid resume.');
      }

      const fileId = file.file_id;
      const fileName = file.file_name;
      const fileLink = await ctx.telegram.getFileLink(fileId);
      console.log('Download resume from:', fileLink);

      // Download the file using axios
      const response = await axios.get(fileLink.toString(), {
        responseType: 'arraybuffer',
      });
      const multerFile: Express.Multer.File = {
        fieldname: 'resume',
        originalname: fileName,
        encoding: '7bit',
        mimetype:
          file.file_size > 0 ? file.mime_type : 'application/octet-stream',
        buffer: Buffer.from(response.data),
        size: response.data.length,
        destination: '',
        filename: fileName,
        path: '',
        stream: null,
      };
      const res = await this.user.uploadResume(multerFile, userId.toString());
      // const fileId = file.file_id;
      // const fileName = file.file_name;
      // console.log(`📄 File Name: ${fileName}`);

      // Check if the file is a valid resume (PDF or DOCX)
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        return ctx.reply('❌ Please upload a valid resume (PDF or DOCX only).');
      }

      ctx.reply(`✅ Resume received: \n you do not need to upload file  every time you apply we will send this resume for you 
        \n if you want to change upload a new One!`);

      // Get the file link (for downloading)
      // const fileLink = await ctx.telegram.getFileLink(fileId);
      console.log('Download resume from:', fileLink);
    });
    this.bot.action('profession', (ctx) => {
      ctx.reply(
        `Select one of the professions below`,
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              ProfessionEnums.CreativeAndMedia,
              ProfessionEnums.CreativeAndMedia,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.EducationAndResearch,
              ProfessionEnums.CreativeAndMedia,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.EngineeringConstruction,
              ProfessionEnums.EngineeringConstruction,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.FinanceAndBusiness,
              ProfessionEnums.FinanceAndBusiness,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.HealthcareAndMedicine,
              ProfessionEnums.HealthcareAndMedicine,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.HospitalityAndTourism,
              ProfessionEnums.HospitalityAndTourism,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.LawAndGovernment,
              ProfessionEnums.LawAndGovernment,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.ScienceAndEnvironment,
              ProfessionEnums.ScienceAndEnvironment,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.SkilledTrades,
              ProfessionEnums.SkilledTrades,
            ),
          ],
          [
            Markup.button.callback(
              ProfessionEnums.TechnologyAndIT,
              ProfessionEnums.TechnologyAndIT,
            ),
          ],
        ]),
      );
    });
    this.bot.action(ProfessionEnums.CreativeAndMedia, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Graphic Designer
        Content Writer
        Video Editor
        Photographer
        Musician
        Filmmaker
        Fashion Designer
        Animator
        UX/UI Designer`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.EducationAndResearch, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Teacher (Primary, Secondary, Special Education)
        Professor
        Lecturer
        Research Scientist
        Instructional Designer
        Education Administrator
        Librarian
        Tutor
        Academic Advisor`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.EngineeringConstruction, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Civil Engineer
        Mechanical Engineer
        Electrical Engineer
        Structural Engineer
        Architect
        Surveyor
        Urban Planner
        Construction Manager
        HVAC Technician
        Environmental Engineer`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.FinanceAndBusiness, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Accountant
        Financial Analyst
        Investment Banker
        Actuary
        Tax Consultant
        Auditor
        Business Consultant
        Project Manager
        Supply Chain Manager
        Human Resources Manager`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.HealthcareAndMedicine, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Doctor (General Practitioner, Surgeon, Specialist)
        Nurse
        Pharmacist
        Dentist
        Physiotherapist
        Radiologist
        Medical Laboratory Technician
        Paramedic
        Psychologist
        Veterinarian`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.HospitalityAndTourism, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Hotel Manager
        Chef
        Tour Guide
        Event Planner
        Bartender
        Travel Agent`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.LawAndGovernment, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Lawyer
        Judge
        Paralegal
        Police Officer
        Diplomat
        Politician
        Military Officer
        Customs Officer
        Intelligence Analyst`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.ScienceAndEnvironment, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Biologist
        Chemist
        Environmental Scientist
        Meteorologist
        Geologist`);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    this.bot.action(ProfessionEnums.TechnologyAndIT, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Software Engineer
        Data Scientist
        Cybersecurity Analyst
        Web Developer
        Network Administrator
        IT Support Specialist
        Cloud Engineer
        DevOps Engineer
        Database Administrator
        Front End Developer,
        BackEnd Developer
        AI/ML Engineer and more`);
        ctx.reply(
          `📤 Remember You can change this any time \n`,
        );
    });
    this.bot.action(ProfessionEnums.SkilledTrades, (ctx) => {
      ctx.reply(
        `📤 Congratulation we will send you jobs in the Following felids`,
      );
      ctx.reply(`
        Mechanic
        Electrician
        Plumber
        Carpenter
        Welder and more
        `);
        ctx.reply(
          `📤 Remember You can change this any time`,
        );
    });
    
    
    this.bot.action('profile', (ctx) => {
      ctx.reply('📤 Please attach a file in PDF or DOCX format (Max: 2MB).',
      )
    });
    console.log('🤖 Telegram bot is running...');
  }
}

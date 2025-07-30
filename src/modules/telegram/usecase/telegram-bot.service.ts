import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Message, CallbackQuery } from 'node-telegram-bot-api';
const TelegramBot = require('node-telegram-bot-api');

import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { ApplicationService } from 'src/modules/application/usecase/application.usecase.service';
import { JobPostingRepository } from 'src/modules/job-posting/job/persistencies/job-post.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/modules/user/persistence/users.entity';
import { JobPostingEntity } from 'src/modules/job-posting/job/persistencies/job-posting.entity';
import { ApplicationEntity } from 'src/modules/application/persistences/application.entity';
import { FileService } from 'src/modules/file/services/file.service';
import axios from 'axios';

@Injectable()
export class TelegramBotService implements OnModuleInit {
  private bot: InstanceType<typeof TelegramBot>;
  private readonly token = '7866828235:AAFr1Ib56FDsB5KY1QC98eCNK6a7XqdO-o0';

  constructor(

    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,

    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private fileService: FileService,
  ) {
    // console.log('🚨 Constructor userService:', userRepository);
  }

  async onModuleInit() {
    if (this.bot) {
      try {
        await this.bot.stopPolling(); // ✅ Stop any previous polling
      } catch (err) {
        console.warn('⚠️ Failed to stop previous polling:', err.message);
      }
    }

    this.bot = new TelegramBot("7866828235:AAFr1Ib56FDsB5KY1QC98eCNK6a7XqdO-o0", { polling: true });

    this.bot.on('polling_error', (error) => {
      console.error('Telegram polling error:', error.message);
    });

    // Defer the listener attachment to the next tick of the event loop
    process.nextTick(() => {
      this.attachListeners();
    });

    console.log('✅ Telegram bot initialized');
  }

  private attachListeners() {
    this.bot.onText(/\/start/, async (msg: Message) => {
      await this.handleStart(msg);
    });

    this.bot.on('contact', async (msg: Message) => {
      await this.handleContact(msg);
    });

    this.bot.on('document', async (msg: Message) => {
      await this.handleResume(msg);
    });

    this.bot.on('callback_query', async (query: CallbackQuery) => {
      await this.handleCallback(query);
    });

    console.log('📥 Telegram bot listeners attached.');
  }

  private async handleStart(msg: Message) {
    try {
      const chatId = msg.chat.id;
      console.log(`🔔 /start by ${chatId}`);
      if (!this.userRepository) {
        console.error('❌ userService is undefined');
        return;
      }
      if (!this.userRepository) {
        console.error('❌ userService is undefined');
        return;
      }
      if (!this.jobPostingRepository) {
        console.error('❌ jobPostingRepository is undefined');
        return;
      }
      if (!this.applicationRepository) {
        console.error('❌ applicationService is undefined');
        return;
      }
      const user = await this.userRepository.findOne({
        where: {
          telegramUserId: chatId.toString(),
        },
      });
      console.log('🚨 user:', user);
      if (!user) {
        await this.bot.sendMessage(chatId, '👋 Please share your contact info:', {
          reply_markup: {
            keyboard: [[{ text: '📱 Share Contact', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      } else {
        await this.bot.sendMessage(chatId, '👋 Welcome back!');
      }
    } catch (error) {
      console.error('❌ Error in handleStart:', error);
    }
  }

  private async handleContact(msg: Message) {
    const chatId = msg.chat.id;
    const contact = msg.contact;
    if (!contact) return;

    const { first_name, phone_number } = contact;
    let cleanedPhoneNumber = phone_number;
    if (cleanedPhoneNumber.startsWith('+251')) {
      cleanedPhoneNumber = cleanedPhoneNumber.replace('+251', '0');
      // Remove any leading zeros after country code removal
      cleanedPhoneNumber = cleanedPhoneNumber.replace(/^0+/, '0');
    }
    let user = await this.userRepository.findOne({
      where: [{
        phone: phone_number,
      }, {
        phone: cleanedPhoneNumber,
      }],
    });
    if (!user || !user.telegramUserId) {
      if (user) {
        await this.userRepository.update(user.id, {
          telegramUserId: chatId.toString(),
        });
      } else {
        user = await this.userRepository.save({
          firstName: first_name,
          phone: phone_number,
          telegramUserId: chatId.toString(),
        });
      }
    }
    await this.bot.sendMessage(chatId, '✅ Contact saved! Now upload your resume (PDF/Doc).');
  }

  private async handleResume(msg: Message) {
    const chatId = msg.chat.id;
    if (!msg.document) return;

    const fileId = msg.document.file_id;
    const fileLink = await this.bot.getFileLink(fileId);
    // To get the file using the file link, you can use a HTTP client like axios or node-fetch.
    // Example using axios (make sure axios is installed and imported at the top of your file):
    // const axios = require('axios');
    // const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    // const fileBufferFromLink = Buffer.from(response.data);
    // Now, fileBufferFromLink contains the file data downloaded from the file link.
    const user = await this.userRepository.findOne({
      where: {
        telegramUserId: chatId.toString(),
      },
    });
    if (!user) {
      await this.bot.sendMessage(chatId, '❌ You need to start with /start first.');
      return;
    }
    if (!msg.document.mime_type?.includes('pdf') && !msg.document.mime_type?.includes('word')) {
      await this.bot.sendMessage(chatId, '❌ Please upload a valid PDF or Word resume.');
      return;
    }
    // const tt=await this.bot.downloadFile(fileId)
    // const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
    // const fileBufferw = Buffer.from(response.data);
    // Check if the file size is more than 2MB (2 * 1024 * 1024 bytes)
    if (msg.document.file_size && msg.document.file_size > 2 * 1024 * 1024) {
      await this.bot.sendMessage(chatId, '❌ The file size is larger than 2MB. Please upload a smaller file.');
      return;
    }

    // Download the file from Telegram
    const file = await this.bot.downloadFile(fileId, '/tmp');
    // Prepare a file object similar to Express.Multer.File
    const fs = require('fs');
    const path = require('path');
    const fileBuffer = fs.readFileSync(file);
    const fileName = path.basename(file);
    const mimetype = msg.document.mime_type;
    const multerFile:Express.Multer.File = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: mimetype,
      buffer: fileBuffer,
      size: fileBuffer.length,
      destination:'',
      filename:fileName,
      path:'',
      stream:null 
    };
    // Upload to Minio via FileService
    const fileIdForMinio = `${user.id}/resume/${Date.now()}_${fileName}`;
    if(user.resume){
      await this.fileService.deleteBucketFile(user.resume.path);
    }
    const uploadedFile = await this.fileService.uploadAttachment(fileIdForMinio, multerFile);
    user.resume=uploadedFile;
    const updatedUser = await this.userRepository.save(user);
    // Clean up the temp file
    fs.unlinkSync(file);

    console.log('🚨 file:', file);
    await this.bot.sendMessage(chatId, `✅ Resume saved: ${fileLink}`);
  }

  private async handleCallback(query: CallbackQuery) {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (!data?.startsWith('apply_')) return;

    const jobId = data.split('_')[1];
    const user = await this.userRepository.findOne({
      where: {
        telegramUserId: chatId.toString(),
      },
    });

    if (!user) {
      await this.bot.sendMessage(chatId, '❌ Please register first using /start');
      return;
    }

    await this.bot.sendMessage(chatId, '✍ Please enter a short description for your application:');

    this.bot.once('message', async (msg: Message) => {
      const description = msg.text;

      await this.applicationRepository.create({
        userId: user.id,
        JobPostId: jobId,
        remark: description,
      });

      await this.bot.sendMessage(chatId, '✅ Application submitted successfully!');
    });
  }
}

import { forwardRef, Inject, Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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

// Global instance tracking
let globalBotInstance: TelegramBotService | null = null;

@Injectable()
export class TelegramBotService implements OnModuleInit, OnModuleDestroy {
  private bot: InstanceType<typeof TelegramBot>;
  private readonly token = '7866828235:AAFr1Ib56FDsB5KY1QC98eCNK6a7XqdO-o0';
  private isRestarting = false;
  private restartAttempts = 0;
  private readonly maxRestartAttempts = 5;
  private isPolling = false;
  private restartTimeout: NodeJS.Timeout | null = null;
  private isInitialized = false;

  constructor(
    @InjectRepository(JobPostingEntity)
    private jobPostingRepository: Repository<JobPostingEntity>,

    @InjectRepository(ApplicationEntity)
    private applicationRepository: Repository<ApplicationEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private fileService: FileService,
  ) {
    // Check if another instance is already running
    if (globalBotInstance) {
      console.warn('⚠️ Another Telegram bot instance detected. Skipping initialization.');
      return;
    }
    globalBotInstance = this;
    console.log('🔧 Telegram bot service instance created');
  }

  async onModuleInit() {
    // Only initialize if this is the first instance
    if (globalBotInstance !== this) {
      console.log('⚠️ Skipping initialization - another instance is active');
      return;
    }
    
    if (this.isInitialized) {
      console.log('⚠️ Bot already initialized, skipping');
      return;
    }
    
    // Add a delay to ensure the application is fully loaded
    console.log('⏳ Waiting for application to fully load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    await this.initializeBot();
  }

  private async initializeBot() {
    try {
      console.log('🚀 Starting Telegram bot initialization...');
      
      // Ensure any existing bot is properly stopped
      if (this.bot) {
        await this.stopBot();
      }

      // Add a longer delay to ensure previous instance is fully closed
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Create new bot instance with improved polling options
      this.bot = new TelegramBot(this.token, { 
        polling: false, // Start polling manually
        polling_options: {
          timeout: 30,
          limit: 50,
          allowed_updates: ['message', 'callback_query'],
          retry_timeout: 5000,
        }
      });

      // Set up error handling before starting polling
      this.setupErrorHandling();

      // Start polling manually
      await this.startPolling();

      // Attach listeners
      this.attachListeners();

      // Reset restart attempts on successful initialization
      this.restartAttempts = 0;
      this.isRestarting = false;
      this.isInitialized = true;
      console.log('✅ Telegram bot initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize bot:', error.message);
      // Retry initialization after delay
      setTimeout(() => this.initializeBot(), 5000);
    }
  }

  private setupErrorHandling() {
    this.bot.on('polling_error', async (error) => {
      console.error('Telegram polling error:', error.message);
      
      // Handle rate limiting (429)
      if (error.message.includes('429')) {
        const retryAfter = this.extractRetryAfter(error.message);
        console.log(`⏳ Rate limited. Waiting ${retryAfter} seconds before retry...`);
        
        await this.handleRateLimit(retryAfter);
        return;
      }
      
      // Handle conflict (409) - another instance is polling
      if (error.message.includes('409')) {
        console.log('⚠️ Conflict detected - another bot instance may be running');
        await this.handleConflict();
        return;
      }
      
      // Handle other errors
      if (!this.isRestarting && this.restartAttempts < this.maxRestartAttempts) {
        await this.handleGeneralError();
      } else if (this.restartAttempts >= this.maxRestartAttempts) {
        console.error('❌ Max restart attempts reached. Stopping bot to prevent infinite loop.');
        await this.stopBot();
      }
    });

    this.bot.on('error', (error) => {
      console.error('Telegram bot error:', error.message);
    });
  }

  private extractRetryAfter(errorMessage: string): number {
    const match = errorMessage.match(/retry after (\d+)/);
    return match ? parseInt(match[1]) : 60; // Default to 60 seconds
  }

  private async handleRateLimit(retryAfter: number) {
    if (this.isPolling) {
      await this.bot.stopPolling();
      this.isPolling = false;
    }
    
    // Wait for the specified time plus some buffer
    const waitTime = (retryAfter + 5) * 1000;
    console.log(`⏳ Waiting ${waitTime / 1000} seconds before retrying...`);
    
    setTimeout(async () => {
      try {
        await this.startPolling();
        console.log('✅ Polling resumed after rate limit');
      } catch (error) {
        console.error('❌ Failed to resume polling after rate limit:', error.message);
      }
    }, waitTime);
  }

  private async handleConflict() {
    if (this.isPolling) {
      await this.bot.stopPolling();
      this.isPolling = false;
    }
    
    // Wait much longer for conflicts to resolve and check if we're still the active instance
    const waitTime = 15000; // 15 seconds
    console.log(`⏳ Waiting ${waitTime / 1000} seconds for conflict resolution...`);
    
    setTimeout(async () => {
      // Check if we're still the active instance
      if (globalBotInstance !== this) {
        console.log('⚠️ Another instance is now active, stopping this instance');
        await this.stopBot();
        return;
      }
      
      try {
        await this.startPolling();
        console.log('✅ Polling resumed after conflict resolution');
      } catch (error) {
        console.error('❌ Failed to resume polling after conflict:', error.message);
      }
    }, waitTime);
  }

  private async handleGeneralError() {
    this.isRestarting = true;
    this.restartAttempts++;
    
    console.log(`🔄 Attempting to restart polling... (Attempt ${this.restartAttempts}/${this.maxRestartAttempts})`);
    
    if (this.isPolling) {
      await this.bot.stopPolling();
      this.isPolling = false;
    }
    
    // Exponential backoff: 2^attempt * 1000ms
    const backoffTime = Math.min(Math.pow(2, this.restartAttempts) * 1000, 30000);
    
    setTimeout(async () => {
      // Check if we're still the active instance
      if (globalBotInstance !== this) {
        console.log('⚠️ Another instance is now active, stopping this instance');
        await this.stopBot();
        return;
      }
      
      try {
        await this.startPolling();
        console.log('✅ Polling restarted successfully');
        this.isRestarting = false;
      } catch (restartError) {
        console.error('❌ Failed to restart polling:', restartError.message);
        this.isRestarting = false;
      }
    }, backoffTime);
  }

  private async startPolling() {
    if (this.isPolling) {
      console.log('⚠️ Polling already active');
      return;
    }
    
    // Check if we're still the active instance
    if (globalBotInstance !== this) {
      // console.log('⚠️ Not the active instance, skipping polling start');
      return;
    }
    
    try {
      await this.bot.startPolling();
      this.isPolling = true;
      // console.log('✅ Polling started successfully');
    } catch (error) {
      // console.error('❌ Failed to start polling:', error.message);
      throw error;
    }
  }

  private async stopBot() {
    if (this.bot) {
      try {
        if (this.isPolling) {
          await this.bot.stopPolling();
          this.isPolling = false;
        }
        await this.bot.close();
        // console.log('🛑 Bot stopped successfully');
      } catch (error) {
        // console.error('❌ Error stopping bot:', error.message);
      }
    }
    
    // Clear any pending restart timeouts
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
  }

  async onModuleDestroy() {
    await this.stopBot();
    
    // Clear global instance reference if this is the active instance
    if (globalBotInstance === this) {
      globalBotInstance = null;
    }
    
    // console.log('✅ Telegram bot destroyed and cleaned up');
  }

  private attachListeners() {
    this.bot.onText(/\/start/, async (msg: Message) => {
      if (!this.isBotReady()) return;
      await this.handleStart(msg);
    });

    this.bot.on('contact', async (msg: Message) => {
      if (!this.isBotReady()) return;
      await this.handleContact(msg);
    });

    this.bot.on('document', async (msg: Message) => {
      if (!this.isBotReady()) return;
      await this.handleResume(msg);
    });

    this.bot.on('callback_query', async (query: CallbackQuery) => {
      if (!this.isBotReady()) return;
      await this.handleCallback(query);
    });

    // Add connection health monitoring
    this.bot.on('polling_error', (error) => {
      // console.error('🔴 Polling error detected:', error.message);
    });

    this.bot.on('webhook_error', (error) => {
      // console.error('🔴 Webhook error detected:', error.message);
    });

    // console.log('📥 Telegram bot listeners attached successfully.');
  }

  private isBotReady(): boolean {
    if (!this.bot) {
      console.warn('⚠️ Bot not initialized yet');
      return false;
    }
    
    if (!this.isInitialized) {
      console.warn('⚠️ Bot not fully initialized yet');
      return false;
    }
    
    if (globalBotInstance !== this) {
      console.warn('⚠️ Not the active bot instance');
      return false;
    }
    
    return true;
  }

  private async handleStart(msg: Message) {
    try {
      const chatId = msg.chat.id;
      // console.log(`🔔 /start command received from chat ID: ${chatId}`);
      
      // Validate dependencies
      if (!this.userRepository) {
        // console.error('❌ userRepository is undefined');
        await this.bot.sendMessage(chatId, '❌ Service temporarily unavailable. Please try again later.');
        return;
      }
      if (!this.jobPostingRepository) {
        // console.error('❌ jobPostingRepository is undefined');
        await this.bot.sendMessage(chatId, '❌ Service temporarily unavailable. Please try again later.');
        return;
      }
      if (!this.applicationRepository) {
        // console.error('❌ applicationRepository is undefined');
        await this.bot.sendMessage(chatId, '❌ Service temporarily unavailable. Please try again later.');
        return;
      }

      const user = await this.userRepository.findOne({
        where: {
          telegramUserId: chatId.toString(),
        },
      });
      
      // console.log('🔍 User lookup result:', user ? `Found user ID: ${user.id}` : 'No existing user found');
      
      if (!user) {
        // console.log('📱 Requesting contact from new user');
        await this.bot.sendMessage(chatId, '👋 Welcome! Please share your contact info to get started:', {
          reply_markup: {
            keyboard: [[{ text: '📱 Share Contact', request_contact: true }]],
            resize_keyboard: true,
            one_time_keyboard: true,
          },
        });
      } else {
        //  console.log('👋 Welcoming back existing user');
        await this.bot.sendMessage(chatId, '👋 Welcome back! You can upload your resume or browse available jobs.');
      }
    } catch (error) {
      // console.error('❌ Error in handleStart:', error);
      try {
        await this.bot.sendMessage(msg.chat.id, '❌ An error occurred. Please try again later.');
      } catch (sendError) {
        // console.error('❌ Failed to send error message:', sendError);
      }
    }
  }

  private async handleContact(msg: Message) {
    try {
      const chatId = msg.chat.id;
      const contact = msg.contact;
      
      if (!contact) {
        // console.log('⚠️ Contact message received but no contact data found');
        return;
      }

      // console.log(`📱 Contact received from ${contact.first_name} (${contact.phone_number})`);

      const { first_name, phone_number } = contact;
      let cleanedPhoneNumber = phone_number;
      
      // Clean phone number format
      if (cleanedPhoneNumber.startsWith('+251')) {
        cleanedPhoneNumber = cleanedPhoneNumber.replace('+251', '0');
        cleanedPhoneNumber = cleanedPhoneNumber.replace(/^0+/, '0');
      }
      
      // console.log(`🔍 Searching for user with phone: ${phone_number} or ${cleanedPhoneNumber}`);
      
      let user = await this.userRepository.findOne({
        where: [{
          phone: phone_number,
        }, {
          phone: cleanedPhoneNumber,
        }],
      });

      if (!user || !user.telegramUserId) {
        if (user) {
          // console.log(`🔄 Updating existing user ${user.id} with Telegram ID`);
          await this.userRepository.update(user.id, {
            telegramUserId: chatId.toString(),
          });
        } else {
          // console.log(`🆕 Creating new user for Telegram ID ${chatId}`);
          user = await this.userRepository.save({
            firstName: first_name,
            phone: phone_number,
            telegramUserId: chatId.toString(),
          });
        }
      } else {
        // console.log(`✅ User ${user.id} already has Telegram ID configured`);
      }
      
      // console.log(`✅ Contact saved successfully for user ${user.id}`);
      await this.bot.sendMessage(chatId, '✅ Contact saved! Now upload your resume (PDF/Doc).');
    } catch (error) {
      // console.error('❌ Error in handleContact:', error);
      try {
        await this.bot.sendMessage(msg.chat.id, '❌ Failed to save contact. Please try again.');
      } catch (sendError) {
        // console.error('❌ Failed to send error message:', sendError);
      }
    }
  }

  private async handleResume(msg: Message) {
    try {
      const chatId = msg.chat.id;
      
      if (!msg.document) {
        //        console.log('⚠️ Document message received but no document data found');
        return;
      }

      // console.log(`📄 Document received: ${msg.document.file_name} (${msg.document.mime_type})`);

      const user = await this.userRepository.findOne({
        where: {
          telegramUserId: chatId.toString(),
        },
      });
      
      if (!user) {
        // console.log('❌ User not found for resume upload');
        await this.bot.sendMessage(chatId, '❌ You need to start with /start first.');
        return;
      }

      // Validate file type
      if (!msg.document.mime_type?.includes('pdf') && !msg.document.mime_type?.includes('word')) {
        // console.log('❌ Invalid file type uploaded');
        await this.bot.sendMessage(chatId, '❌ Please upload a valid PDF or Word resume.');
        return;
      }

      // Check file size (2MB limit)
      if (msg.document.file_size && msg.document.file_size > 2 * 1024 * 1024) {
        // console.log('❌ File too large:', msg.document.file_size);
        await this.bot.sendMessage(chatId, '❌ The file size is larger than 2MB. Please upload a smaller file.');
        return;
      }

      // console.log(`📥 Downloading file: ${msg.document.file_name}`);
      const fileId = msg.document.file_id;
      const file = await this.bot.downloadFile(fileId, '/tmp');
      
      // Prepare file object for upload
      const fs = require('fs');
      const path = require('path');
      const fileBuffer = fs.readFileSync(file);
      const fileName = path.basename(file);
      const mimetype = msg.document.mime_type;
      
      const multerFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: fileName,
        encoding: '7bit',
        mimetype: mimetype,
        buffer: fileBuffer,
        size: fileBuffer.length,
        destination: '',
        filename: fileName,
        path: '',
        stream: null
      };

      // Upload to Minio
      const fileIdForMinio = `${user.id}/resume/${Date.now()}_${fileName}`;
      
      if (user.resume) {
        // console.log('🗑️ Deleting previous resume');
        await this.fileService.deleteBucketFile(user.resume.path);
      }
      
      // console.log('📤 Uploading resume to storage');
      const uploadedFile = await this.fileService.uploadAttachment(fileIdForMinio, multerFile);
      
      // Update user with new resume
      user.resume = uploadedFile;
      const updatedUser = await this.userRepository.save(user);
      
      // Clean up temp file
      fs.unlinkSync(file);

      // console.log(`✅ Resume saved successfully for user ${user.id}`);
      await this.bot.sendMessage(chatId, `✅ Resume saved successfully! You can now apply for jobs.`);
    } catch (error) {
      // console.error('❌ Error in handleResume:', error);
      try {
        await this.bot.sendMessage(msg.chat.id, '❌ Failed to save resume. Please try again.');
      } catch (sendError) {
        // console.error('❌ Failed to send error message:', sendError);
      }
    }
  }

  private async handleCallback(query: CallbackQuery) {
    try {
      const chatId = query.message.chat.id;
      const data = query.data;

      // console.log(`🔘 Callback received: ${data}`);

      if (!data?.startsWith('apply_')) {
        // console.log('⚠️ Unknown callback data:', data);
        return;
      }

      const jobId = data.split('_')[1];
      //    console.log(`📝 Application requested for job ID: ${jobId}`);

      const user = await this.userRepository.findOne({
        where: {
          telegramUserId: chatId.toString(),
        },
      });

      if (!user) {
        // console.log('❌ User not found for job application');
        await this.bot.sendMessage(chatId, '❌ Please register first using /start');
        return;
      }
      // console.log('📝 Requesting application description');
      await this.bot.sendMessage(chatId, '✍ Please enter a short description for your application:');

      this.bot.once('message', async (msg: Message) => {
        try {
          const description = msg.text;
          // console.log(`📝 Creating application for user ${user.id} to job ${jobId}`);

          await this.applicationRepository.create({
            userId: user.id,
            JobPostId: jobId,
            remark: description,
          });

          // console.log(`✅ Application submitted successfully for user ${user.id}`);
          await this.bot.sendMessage(chatId, '✅ Application submitted successfully!');
        } catch (error) {
          // console.error('❌ Error creating application:', error);
          await this.bot.sendMessage(chatId, '❌ Failed to submit application. Please try again.');
        }
      });
    } catch (error) {
      // console.error('❌ Error in handleCallback:', error);
      try {
        await this.bot.sendMessage(query.message.chat.id, '❌ An error occurred. Please try again.');
      } catch (sendError) {
        // console.error('❌ Failed to send error message:', sendError);
      }
    }
  }
}

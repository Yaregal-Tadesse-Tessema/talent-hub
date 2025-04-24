/* eslint-disable prettier/prettier */
import {
  Injectable,
  Inject,
  forwardRef,
  Logger,
  OnApplicationShutdown,
} from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Markup } from 'telegraf';
import axios from 'axios';
import type { Express } from 'express';

import { UserService } from 'src/modules/user/usecase/user.usecase.service';
import { JobPostingService } from 'src/modules/job-posting/job/usecase/job-posting.usecase.service';
import { ApplicationService } from 'src/modules/application/usecase/application.usecase.service';
import { ProfessionEnums } from 'src/modules/job-posting/constants';

@Injectable()
export class TelegramBotService implements OnApplicationShutdown {
  private readonly log = new Logger(TelegramBotService.name);
  private listenersAttached = false;

  constructor(
    @InjectBot() private readonly bot: Telegraf,
    private readonly user: UserService,
    @Inject(forwardRef(() => JobPostingService))
    private readonly jobPosting: JobPostingService,
    private readonly application: ApplicationService,
  ) {
    if (!this.listenersAttached) {
      this.setupListeners();
      this.listenersAttached = true;
      this.log.log('Telegram listeners attached ✅');
    }
  }

  /* graceful shutdown – frees Telegram polling lock */
  onApplicationShutdown(signal?: string) {
    this.log.log(`Stopping Telegram polling (${signal ?? 'shutdown'})`);
    return this.bot.stop(signal ?? 'SIGTERM');
  }

  /* ------------------------------------------------------------------ */
  /*                     LISTENER DEFINITIONS                           */
  /* ------------------------------------------------------------------ */
  private setupListeners() {
    /* 1 ▪ any text = show menu / ask contact ------------------------ */
    this.bot.on('text', async (ctx) => {
      const tgId = ctx.from.id.toString();
      const u = await this.user.getOneByCriteria({ telegramUserId: tgId });

      if (!u) {
        await ctx.reply(
          '👋 To receive job posts, please share your contact:',
          Markup.keyboard([
            Markup.button.contactRequest('Send Contact'),
          ]).resize(),
        );
      } else {
        await this.showMainMenu(ctx);
      }
    });

    /* 2 ▪ contact share -------------------------------------------- */
    this.bot.on('contact', async (ctx) => {
      const tgId = ctx.from.id.toString();
      const { phone_number, first_name, last_name } = ctx.message.contact;

      const existing = await this.user.getOneByCriteria({
        phone: phone_number,
      });
      if (!existing) {
        await this.user.create({
          phone: phone_number,
          telegramUserId: tgId,
          firstName: first_name,
          lastName: last_name,
        } as any);
      } else if (!existing.telegramUserId) {
        existing.telegramUserId = tgId;
        await this.user.update(existing.id, existing);
      }

      await ctx.reply(
        `Thanks, ${first_name}!`,
        Markup.inlineKeyboard([
          [Markup.button.callback('📄 Complete Profile', 'profile')],
          [Markup.button.callback('📤 Upload Resume', 'upload_resume')],
          [Markup.button.callback('🔄 Select Profession', 'profession')],
        ]),
      );
    });

    /* 3 ▪ ask for résumé upload ------------------------------------ */
    this.bot.action('upload_resume', (ctx) =>
      ctx.reply('📤 Please attach a PDF/DOCX résumé (≤ 2 MB).'),
    );

    /* 4 ▪ résumé file handler -------------------------------------- */
    this.bot.on('document', async (ctx) => {
      const doc = ctx.message.document;
      const fileName = doc.file_name ?? 'resume';
      if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx')) {
        return ctx.reply('❌ Only PDF or DOCX, please.');
      }

      const fileUrl = await ctx.telegram.getFileLink(doc.file_id);
      const data = await axios.get(fileUrl.toString(), {
        responseType: 'arraybuffer',
      });

      const multerFile: Express.Multer.File = {
        fieldname: 'resume',
        originalname: fileName,
        encoding: '7bit',
        mimetype: doc.mime_type ?? 'application/octet-stream',
        buffer: Buffer.from(data.data),
        size: data.data.length,
        destination: '',
        filename: fileName,
        path: '',
        stream: null as any,
      };
      await this.user.uploadResume(multerFile, ctx.from.id.toString());
      await ctx.reply('✅ Résumé received! You can now apply to jobs.');
    });

    /* 5 ▪ profession menu ------------------------------------------ */
    this.bot.action('profession', (ctx) => this.showProfessionMenu(ctx));

    /* 6 ▪ profession chosen (every enum value) ---------------------- */
    Object.values(ProfessionEnums).forEach((p) =>
      this.bot.action(p, async (ctx) => {
        await ctx.answerCbQuery();
        await ctx.reply(`👍 Got it! We’ll send you *${p}* jobs.`, {
          parse_mode: 'Markdown',
        });
      }),
    );

    /* 7 ▪ APPLY button handler ------------------------------------- */
    this.bot.action(/^apply_(.+)$/, async (ctx) => {
      try {
        await ctx.answerCbQuery('Processing…');
        const jobId = ctx.match[1];
        const tgId = ctx.from.id.toString();

        const user = await this.user.getOneByCriteria({ telegramUserId: tgId });
        if (!user) {
          return ctx.reply('🔑 Please /start first so we can identify you.');
        }
        if (!user.resume) {
          return ctx.reply(
            '❌ We don’t have your résumé yet.',
            Markup.inlineKeyboard([
              [Markup.button.callback('📤 Upload Resume', 'upload_resume')],
            ]),
          );
        }

        /* duplicate check */
        const dup = await this.application.getOneByCriteria({
          JobPostId: jobId,
          userId: user.id,
        });
        if (dup) return ctx.reply('✅ You already applied for this job.');

        const job = await this.jobPosting.getOneByCriteria({ id: jobId });
        if (!job) return ctx.reply('❌ Job not found or closed.');

        await this.application.create({
          JobPostId: job.id,
          userId: user.id,
          applicationInformation: { description: '' },
          coverLetter: '',
        });

        await ctx.reply(
          `🎉 Application submitted for *${job.position}*. Good luck!`,
          { parse_mode: 'Markdown' },
        );
      } catch (e) {
        this.log.error('apply action failed', e);
        await ctx.answerCbQuery('Error – try again later.', { show_alert: true });
      }
    });

    this.log.log('All bot actions & events wired.');
  }

  /* ----------------- helper menus ---------------------------------- */
  private async showMainMenu(ctx: any) {
    await ctx.reply(
      'Choose an option:',
      Markup.inlineKeyboard([
        [Markup.button.callback('📄 Complete Profile', 'profile')],
        [Markup.button.callback('📤 Upload Resume', 'upload_resume')],
        [Markup.button.callback('🔄 Select Profession', 'profession')],
      ]),
    );
  }

  private async showProfessionMenu(ctx: any) {
    await ctx.reply(
      'Select a profession:',
      Markup.inlineKeyboard(
        Object.values(ProfessionEnums).map((p) => [
          Markup.button.callback(p, p),
        ]),
      ),
    );
  }

  /* ----------------- public helper to broadcast a job -------------- */
  async sendMessage(chatId: string, markdown: string, jobId: string) {
    /* guarantee callback_data ≤ 64 bytes */
    let cb = `apply_${jobId}`;
    if (Buffer.byteLength(cb, 'utf8') > 64) {
      cb = `apply_${jobId.slice(-58)}`; // keep last part (64-6 = 58)
    }

    await this.bot.telegram.sendMessage(chatId, markdown, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '📝 Apply Now', callback_data: cb }]],
      },
    });
  }
}

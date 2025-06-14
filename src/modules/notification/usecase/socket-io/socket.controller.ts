/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { ChatGateway } from './socket.usecase.command';
import { NotificationService } from '../notificatoin/notification.usecase.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly gateway: ChatGateway,
    private readonly notificationService: NotificationService,
  ) {}

//   @Post('send-to-one')
//   async sendToOne(@Body() body: { toUsername: string; fromUsername: string; message: string }) {
//     const socketId = this.notificationService.getSocketId(body.toUsername);
//     const timestamp = new Date().toISOString();

//     this.notificationService.saveNotification({
//       id: crypto.randomUUID(),
//       toUsername: body.toUsername,
//       fromUsername: body.fromUsername,
//       message: body.message,
//       timestamp,
//     });

//     if (socketId) {
//       this.gateway.server.to(socketId).emit('message', {
//         from: body.fromUsername,
//         message: body.message,
//         timestamp,
//       });
//     }

//     return { status: 'sent' };
//   }

//   @Post('send-to-many')
//   async sendToMany(@Body() body: { toUsernames: string[]; fromUsername: string; message: string }) {
//     const timestamp = new Date().toISOString();

//     body.toUsernames.forEach((username) => {
//       this.notificationService.saveNotification({
//         id: crypto.randomUUID(),
//         toUsername: username,
//         fromUsername: body.fromUsername,
//         message: body.message,
//         timestamp,
//       });

//       const socketId = this.notificationService.getSocketId(username);
//       if (socketId) {
//         this.gateway.server.to(socketId).emit('message', {
//           from: body.fromUsername,
//           message: body.message,
//           timestamp,
//         });
//       }
//     });

//     return { status: 'sent-to-many' };
//   }

//   @Post('broadcast')
//   async broadcast(@Body() body: { fromUsername: string; message: string }) {
//     const timestamp = new Date().toISOString();

//     this.notificationService.getAllSocketIds().forEach((socketId) => {
//       this.gateway.server.to(socketId).emit('message', {
//         from: body.fromUsername,
//         message: body.message,
//         timestamp,
//       });
//     });

//     return { status: 'broadcasted' };
//   }
}

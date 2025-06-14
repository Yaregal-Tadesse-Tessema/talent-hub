/* eslint-disable prettier/prettier */
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  CreateNotificationCommand,
  SocketNotificationCommand,
} from '../notificatoin/notification.command';
import { NotificationRepository } from '../../persistencies/notification.repository';
import { UserRepository } from 'src/modules/user/persistence/user.repository';
import {
  DeliveryTypeEnums,
  NotificationStatusEnums,
  NotificationTypeEnums,
} from '../email.command';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;
  private clients = new Map<string, string>(); // socketId -> username

  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userRepository: UserRepository,
  ) {}
  afterInit(server: Server) {
    console.log('WebSocket Server Initialized');
  }
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const username = this.clients.get(client.id);
    this.clients.delete(client.id);
    this.server.emit('user-left', { username });
  }
  @SubscribeMessage('join')
  handleJoin(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket,
  ) {
    this.clients.set(client.id, data.username);
    this.server.emit('user-joined', { username: data.username });
  }
  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: SocketNotificationCommand,
    @ConnectedSocket() client: Socket,
  ) {
    const reciver = await this.userRepository.findOne(data.receiverId);
    const cmmand: CreateNotificationCommand = {
      message: data.message,
      senderId: data.senderId,
      userId: data.receiverId,
      status: NotificationStatusEnums.NEW,
      type: NotificationTypeEnums.NOTIFICATION,
      notificationType: DeliveryTypeEnums.INDIVIDUAL,
    };
    const result = await this.notificationRepository.create(cmmand);
    const res = await this.notificationRepository.getManyByCriteria({
      status: NotificationStatusEnums.NEW,
    });
    const count = res.length;
    this.server.emit('count', {
      count,
    });
  }
}

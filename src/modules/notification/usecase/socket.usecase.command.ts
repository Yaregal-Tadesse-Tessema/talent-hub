// /* eslint-disable prettier/prettier */
// import {
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
//   MessageBody,
//   ConnectedSocket,
//   OnGatewayInit,
//   OnGatewayConnection,
//   OnGatewayDisconnect
// } from '@nestjs/websockets';
// import { Server, Socket } from 'socket.io';

// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
//   @WebSocketServer()
//   server: Server;

//   private clients = new Map<string, string>(); // socketId -> username

//   afterInit(server: Server) {
//     console.log('WebSocket Server Initialized');
//   }

//   handleConnection(client: Socket) {
//     console.log(`Client connected: ${client.id}`);
//   }

//   handleDisconnect(client: Socket) {
//     console.log(`Client disconnected: ${client.id}`);
//     const username = this.clients.get(client.id);
//     this.clients.delete(client.id);
//     this.server.emit('user-left', { username });
//   }

//   @SubscribeMessage('join')
//   handleJoin(
//     @MessageBody() data: { username: string },
//     @ConnectedSocket() client: Socket
//   ) {
//     this.clients.set(client.id, data.username);
//     this.server.emit('user-joined', { username: data.username });
//   }

//   @SubscribeMessage('message')
//   handleMessage(
//     @MessageBody() data: { username: string; message: string },
//     @ConnectedSocket() client: Socket
//   ) {
//     this.server.emit('message', {
//       username: data.username,
//       message: data.message,
//       timestamp: new Date().toISOString(),
//     });
//   }
// }

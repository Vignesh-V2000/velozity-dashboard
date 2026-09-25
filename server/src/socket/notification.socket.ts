import { Server, Socket } from 'socket.io';

export function registerNotificationHandlers(_io: Server, socket: Socket) {
  // User is already in their personal room `user:${user.id}` from the main handler
  // This module can be extended with additional notification socket events if needed

  socket.on('notification:ping', () => {
    socket.emit('notification:pong');
  });
}

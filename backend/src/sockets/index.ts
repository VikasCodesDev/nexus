import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from '../config/env';
import { User } from '../models/User';
import { Message } from '../models/Message';

const onlineUsers = new Map<string, string>();

export const initSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.auth.userId as string | undefined;
    if (!userId) {
      socket.disconnect();
      return;
    }

    onlineUsers.set(userId, socket.id);
    User.findByIdAndUpdate(userId, { online: true }).catch(() => undefined);
    io.emit('presence:update', { userId, online: true });

    socket.on('chat:send', async (payload: { to: string; content: string }) => {
      const trimmedContent = payload.content?.trim();
      if (!payload.to || !trimmedContent) {
        return;
      }

      const msg = await Message.create({ from: userId, to: payload.to, content: trimmedContent });
      const recipientSocketId = onlineUsers.get(payload.to);

      const packet = {
        id: msg.id,
        from: userId,
        to: payload.to,
        content: trimmedContent,
        createdAt: msg.createdAt
      };

      socket.emit('chat:message', packet);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('chat:message', packet);
      }
    });

    socket.on('disconnect', async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeen: new Date() });
      io.emit('presence:update', { userId, online: false });
    });
  });

  return io;
};

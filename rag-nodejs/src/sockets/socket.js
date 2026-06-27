// Socket.IO setup.
// Initializes real-time communication for streaming responses and ingestion notifications.

const { Server } = require("socket.io");
const config = require("../../config");
const { info } = require("../utils/logger");

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: config.cors.origin, methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    info(`Socket connected: ${socket.id}`);

    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      info(`Socket ${socket.id} joined user:${userId}`);
    });

    socket.on("disconnect", () => {
      info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

const emitToUser = (userId, event, data) => {
  getIO().to(`user:${userId}`).emit(event, data);
};

module.exports = { initSocket, getIO, emitToUser };

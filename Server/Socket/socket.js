import jwt from "jsonwebtoken";

const onlineUsers = new Map();
const userSockets = new Map();

const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id;
    socket.name = `${decoded?.FirstName ?? "unknown user"} ${
      decoded?.LastName ?? ""
    }`.trim();
    socket.profileImage = decoded.profileImage || null;

    next();
  } catch (err) {
    console.log("Socket authentication error:", err.message);
    next(new Error("Authentication error"));
  }
};

const initializeSocket = (io) => {
  io.use(authenticateSocket);

  const broadcastOnlineList = () => {
    const users = Array.from(onlineUsers.entries()).map(
      ([userId, socketId]) => {
        const user = userSockets.get(socketId) || {};
        return {
          id: userId,
          name: user.name || "Unknown",
          profileImage: user.profileImage || null,
        };
      }
    );
    io.emit("online_users_updated", users);
  };

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.name} (${socket.userId})`);

    onlineUsers.set(socket.userId, socket.id);
    userSockets.set(socket.id, {
      userId: socket.userId,
      name: socket.name,
      profileImage: socket.profileImage,
    });

    broadcastOnlineList();

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.name}`);

      onlineUsers.delete(socket.userId);
      userSockets.delete(socket.id);
      broadcastOnlineList();
    });
  });

  console.log("Socket.IO initialized successfully");
};

export { initializeSocket, onlineUsers, userSockets };

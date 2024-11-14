const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const cors = require('cors');
const socketIO = require('socket.io');
const http = require('http');
const Message = require('./models/Message');

// Load environment variables
dotenv.config();

// Initialize Express app and create HTTP server
const app = express();
const server = http.createServer(app);

// Configure CORS for both Express and Socket.IO
const corsOptions = {
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));

// Initialize Socket.IO with proper configuration
const io = socketIO(server, {
  cors: corsOptions,
  pingTimeout: 60000,
  connectTimeout: 60000
});

// Connect to MongoDB
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  process.exit(1);
});

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/resumes', resumeRoutes);

// Store online users with their socket IDs
const onlineUsers = new Map();

// Helper function to generate consistent conversation ID
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join', ({ userId }) => {
    if (!userId) {
      console.error('Join event received without userId');
      return;
    }
    
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);
    io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    console.log('User joined:', userId);
  });

  socket.on('disconnect', () => {
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log('User disconnected:', socket.userId);
    }
  });

  socket.on('joinConversation', ({ conversationId }) => {
    if (!conversationId) {
      console.error('Join conversation event received without conversationId');
      return;
    }
    
    socket.join(conversationId);
    console.log(`Socket ${socket.id} joined conversation: ${conversationId}`);
  });

  socket.on('sendMessage', async (messageData) => {
    try {
      if (!messageData || !messageData.senderId || !messageData.receiverId) {
        console.error('Invalid message data received');
        return;
      }

      // Ensure consistent conversation ID
      const conversationId = getConversationId(messageData.senderId, messageData.receiverId);
      messageData.conversationId = conversationId;

      const message = new Message(messageData);
      await message.save();
      
      // Emit to all sockets in the conversation
      io.to(conversationId).emit('message', message);

      // Also emit directly to sender and receiver sockets
      const receiverSocketId = onlineUsers.get(messageData.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('message', message);
      }
      
      console.log('Message sent in conversation:', conversationId);
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('fetchMessages', async ({ conversationId }) => {
    try {
      if (!conversationId) {
        console.error('Fetch messages event received without conversationId');
        return;
      }

      const messages = await Message.find({ conversationId })
        .sort({ timestamp: 1 })
        .limit(50);
      
      socket.emit('previousMessages', { conversationId, messages });
      console.log(`Fetched ${messages.length} messages for conversation:`, conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('fetchError', { error: 'Failed to fetch messages' });
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server configured with CORS origin: ${corsOptions.origin}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing HTTP server...');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

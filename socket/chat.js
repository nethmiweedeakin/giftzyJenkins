// socket/chat.js
const Chat = require('../models/chat');
const Gift = require('../models/gift');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

function setupSocket(io, session) {
  io.use((socket, next) => {
    // Pull token and sessionId from cookies
    const cookieHeader = socket.request.headers.cookie || '';
    const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
    
    const token = cookies.token;
    const sessionId = cookies.sessionId;

    // Attach decoded user to socket.request if token is valid
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        socket.request.user = decoded;
        socket.request.sessionId = null; // It's a logged-in user
      } catch (err) {
        console.error('Invalid JWT:', err.message);
        socket.request.user = null;
        socket.request.sessionId = sessionId || null;
      }
    } else {
      // Guest user with session ID
      socket.request.user = null;
      socket.request.sessionId = sessionId || null;
    }

    session(socket.request, {}, next);
  });

io.on('connection', (socket) => {
  console.log('⚡ A user connected with session:', socket.request.session);
    const req = socket.request;

    const user = req.user || { _id: req.session.user, isGuest: true }

   socket.on('joinRoom', ({ giftId }) => {  
  console.log(`📦 User joined room for gift ${giftId}`);
      const roomName = `gift_${giftId}`;
      socket.join(roomName);
      socket.room = roomName;
    });
    
    
  // Inside socket/chat.js
socket.on('chatMessage', async ({ message, giftId, imageUrl }) => {
  const roomName = `gift_${giftId}`;
const user = socket.request.user;
const sessionId = socket.request.sessionId;

let userId = user?.id || user?._id || null; // handle both cases
let isGuest = !userId;

  console.log('[chatMessage] User:', sessionId);
  console.log('[chatMessage] Message:', message);

  const newMsg = new Chat({
   sender: userId || undefined,
  guestSessionId: isGuest ? sessionId : undefined,
  isGuest,
  gift: giftId,
  imageUrl: imageUrl || null,
  message: message || null,
  timestamp: new Date()
  });

  try {
    await newMsg.save();
    console.log('Message saved:', newMsg);
  } catch (err) {
    console.error('Error saving message:', err);
  }

  let senderName = 'Guest';
  let senderRole = 'Guest-Buyer';
  let senderId = null;

  const currentUserId = user?.id || user?._id;

if (currentUserId) {
  const userData = await User.findById(currentUserId);
  const gift = await Gift.findById(giftId);
  senderName = userData?.name || 'User' ;
  senderRole = user?.buyer && gift?.sellerID.toString() === currentUserId.toString() ? 'Seller' : 'Buyer';
  senderId = currentUserId.toString() || '0';
}  else if (sessionId) {
    // Guest user, show Guest-xxxxx
    const suffix = sessionId.slice(-5); // last 5 characters
    senderName = `Guest-${suffix}`;
    senderId = sessionId;
  }

  io.to(roomName).emit('message', {
    senderName,
    senderId,
    senderRole,
    message: message || null,
    imageUrl: imageUrl || null,
    timestamp: newMsg.timestamp,
  });
});

    socket.on('disconnect', () => {
      if (socket.room) socket.leave(socket.room);
    });
  });
}

module.exports = { setupSocket };

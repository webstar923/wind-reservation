const express = require('express');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const sequelize = require('./config');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const userRoutes = require('./routes/userRoutes');
const logRoutes = require('./routes/logRoutes');
const alertRoutes = require('./routes/alertRoutes');
const chatRoutes = require('./routes/chatRoutes');
const settingRoutes = require('./routes/settingRoutes');
const companyRoutes = require('./routes/companyRoutes');
const { authenticate } = require('./middleware/authMiddleware');
const { processExcel } = require('./excelService');

// Create app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: 'http://localhost:3000' },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// Socket.io setup
const users = {};
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register', (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  socket.on('sendNotificationToUser', ({ userId, message }) => {
    const socketId = users[userId];
    if (socketId) {
      io.to(socketId).emit('notification', { message });
    }
  });

  socket.on('sendNotificationToAll', (message) => {
    io.emit('notification', { message });
  });

  socket.on('disconnect', () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) delete users[userId];
    console.log(`User ${userId} disconnected`);
  });
});

// Create uploads folder if missing
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(uploadDir)); // Serve uploads statically

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const baseName = path.basename(file.originalname, path.extname(file.originalname)); // without extension
    const extension = path.extname(file.originalname); // .pdf, etc.
    
    const date = new Date().toISOString().split('T')[0].replace(/-/g, ''); // e.g., 20250618
    const finalName = `${baseName}_${date}${extension}`;
    
    cb(null, finalName);
  }
});
const upload = multer({ storage });

// Excel upload route
app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    const data = await processExcel(req.file.path);
    res.json({ message: 'File processed successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error });
  }
});

// ✅ PDF upload route
app.post('/uploadPdf', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

  const ext = path.extname(req.file.originalname).toLowerCase();
  if (ext !== '.pdf') {
    return res.status(400).json({ message: 'Only PDF files are allowed' });
  }

  try {
    const pdfUrl = `weing.ai-reserve.jp/uploads/${req.file.filename}`;
    res.json({
      message: 'PDF uploaded successfully',
      pdfUrl: pdfUrl,
      ok:true
    });
  } catch (error) {
    res.status(500).json({ message: 'Error processing PDF', error });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservation', reservationRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/log', authenticate, logRoutes);
app.use('/api/alert', authenticate, alertRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/setting', settingRoutes);
app.use('/api/company', authenticate, companyRoutes);

// Start server
sequelize.sync()
  .then(() => {
    console.log('Database connected');
    server.listen(process.env.PORT || 5001, () => {
      console.log(`Server running on port ${process.env.PORT || 5001}`);
    });
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

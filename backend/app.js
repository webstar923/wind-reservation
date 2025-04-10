const express = require('express');
const sequelize = require('./config');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const flatRoutes = require('./routes/flatRoutes');
const workRoutes = require('./routes/workRoutes');
const userRoutes = require('./routes/userRoutes');
const logRoutes = require('./routes/logRoutes');
const alertRoutes = require('./routes/alertRoutes');
const chatRoutes = require('./routes/chatRoutes');
require('dotenv').config();

const PORT = process.env.PORT || 5001;
const { authenticate, authorizeRole } = require('./middleware/authMiddleware'); // Correct import
const { v4: uuidv4 } = require('uuid');

const http = require("http");
const { Server } = require("socket.io");


const cors = require('cors');
const multer = require('multer');
const path = require('path');
const { processExcel } = require('./excelService');
const app = express();



const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:3000" }, // Next.jsと通信
});

app.use(cors());
app.use(express.json());
const users = {}; // { userId: socketId }
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // ユーザーを登録（ユーザーIDとSocket IDを紐付け）
  socket.on("register", (userId) => {
    users[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // 個別のユーザーに通知
  socket.on("sendNotificationToUser", ({ userId, message }) => {
    const socketId = users[userId];
    if (socketId) {
      io.to(socketId).emit("notification", { message });
    }
  });

  // 全員に通知
  socket.on("sendNotificationToAll", (message) => {
    io.emit("notification", { message });
  });

  // 切断時にユーザー情報を削除
  socket.on("disconnect", () => {
    const userId = Object.keys(users).find((key) => users[key] === socket.id);
    if (userId) delete users[userId];
    console.log(`User ${userId} disconnected`);
  });
});
// Multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage });
app.post('/upload', upload.single('file'), async (req, res) => {  
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const data = await processExcel(req.file.path);
    return res.json({ message: 'File processed successfully', data });
  } catch (error) {
    res.status(500).json({ message: 'Error processing file', error });
  }
});

app.use((req, res, next) => {
  req.id = uuidv4(); // Generate a unique request ID
  next();
});
 
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/reservation',reservationRoutes);
app.use('/api/flat',flatRoutes);
app.use('/api/work',workRoutes);
app.use('/api/user', authenticate, userRoutes);
app.use('/api/log',  authenticate, logRoutes);
app.use('/api/alert',authenticate, alertRoutes);
app.use('/api/chat', chatRoutes);

sequelize.sync()
  .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => {
      console.log('Server running on port '+PORT);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });

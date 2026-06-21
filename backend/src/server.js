const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = require('./app');
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});

app.set('io', io);

const prisma = require('./config/prisma');

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

// ─── Daily Midnight Reset: Reset all "Hết hàng" menu items to "Còn hàng" ─────
const scheduleMidnightReset = () => {
    const now = new Date();
    // Calculate ms until next midnight (00:00:00 local time)
    const nextMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // tomorrow
        0, 0, 0, 0
    );
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    console.log(`⏰ Đặt lịch reset thực đơn lúc nửa đêm (sau ${Math.round(msUntilMidnight / 60000)} phút)`);

    setTimeout(async () => {
        // Run once at midnight, then repeat every 24h
        const runDailyReset = async () => {
            try {
                const result = await prisma.menuItem.updateMany({
                    where: { isActive: false },
                    data: { isActive: true }
                });
                console.log(`🌅 [Midnight Reset] Đã reset ${result.count} món "Hết hàng" → "Còn hàng"`);

                // Broadcast to all KDS / Kiosk clients
                io.emit('menuDailyReset', {
                    message: 'Sang ngày mới! Tất cả món ăn đã được reset về Còn hàng.',
                    count: result.count,
                    time: new Date().toISOString()
                });
            } catch (err) {
                console.error('❌ [Midnight Reset] Lỗi khi reset thực đơn:', err);
            }
        };

        await runDailyReset();

        // Repeat every 24 hours from this point
        setInterval(runDailyReset, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);
};

const startServer = async () => {
    try {
        await prisma.$connect();
        console.log("✅ Database MySQL kết nối thành công");
        
        server.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            scheduleMidnightReset(); // Start the daily reset scheduler
        });
    } catch (error) {
        console.error("❌ Kết nối Database thất bại:", error);
        process.exit(1);
    }
};

startServer();

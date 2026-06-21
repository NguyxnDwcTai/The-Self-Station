const { PrismaClient } = require('@prisma/client');

// Khởi tạo Singleton để tránh vượt quá connection pool giới hạn của DB khi có hot-reload hoặc nhiều call liên tục.
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;

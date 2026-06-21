const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Cleaning existing database...");
  await prisma.orderDetail.deleteMany({});
  await prisma.promoItem.deleteMany({});
  await prisma.orders.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.voucher.deleteMany({});
  await prisma.promotion.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.diningTable.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log("Seeding Categories...");
  await prisma.category.create({ data: { categoryID: 'CAT_FOOD', categoryName: 'Món chính', description: 'Các món ăn chính', sortOrder: 1 } });
  await prisma.category.create({ data: { categoryID: 'CAT_SIDE', categoryName: 'Món ăn kèm', description: 'Các món ăn kèm', sortOrder: 2 } });
  await prisma.category.create({ data: { categoryID: 'CAT_CAFE', categoryName: 'Cà phê', description: 'Cà phê các loại', sortOrder: 3 } });
  await prisma.category.create({ data: { categoryID: 'CAT_TRA', categoryName: 'Trà', description: 'Trà truyền thống', sortOrder: 4 } });
  await prisma.category.create({ data: { categoryID: 'CAT_NUOCEP', categoryName: 'Nước ép', description: 'Nước giải khát và ép trái cây', sortOrder: 5 } });
  await prisma.category.create({ data: { categoryID: 'CAT_BANH', categoryName: 'Bánh ngọt', description: 'Bánh ngọt', sortOrder: 6 } });
  await prisma.category.create({ data: { categoryID: 'CAT_TRANGMIENG', categoryName: 'Tráng miệng', description: 'Tráng miệng khác', sortOrder: 7 } });

  console.log("Seeding Menu Items...");
  await prisma.menuItem.createMany({
    data: [
      // Cà phê
      { itemID: 'M01', categoryID: 'CAT_CAFE', itemName: 'Cà phê muối đặc trưng', price: 45000, isActive: true, imageURL: '/img/CaPheMuoi.png' },
      { itemID: 'M02', categoryID: 'CAT_CAFE', itemName: 'Bạc xỉu cốt dừa', price: 50000, isActive: true, imageURL: '/img/BacXiuCotDua.png' },
      { itemID: 'M03', categoryID: 'CAT_CAFE', itemName: 'Bạc xỉu', price: 45000, isActive: true, imageURL: '/img/BacXiu.png' },
      { itemID: 'M04', categoryID: 'CAT_CAFE', itemName: 'Cà phê đen đá', price: 35000, isActive: true, imageURL: '/img/CafeDenDa.png' },
      { itemID: 'M05', categoryID: 'CAT_CAFE', itemName: 'Cà phê sữa đá', price: 40000, isActive: true, imageURL: '/img/CafeSuaDa.png' },
      { itemID: 'M06', categoryID: 'CAT_CAFE', itemName: 'Capuccino', price: 55000, isActive: true, imageURL: '/img/Capuccino.png' },

      // Trà & Nước ép
      { itemID: 'M07', categoryID: 'CAT_TRA', itemName: 'Trà sen vàng macchiato', price: 55000, isActive: true, imageURL: '/img/TraSenVangMacchiato.png' },
      { itemID: 'M08', categoryID: 'CAT_TRA', itemName: 'Trà lài lá dứa', price: 45000, isActive: true, imageURL: '/img/TraLaiLaDua.png' },
      { itemID: 'M09', categoryID: 'CAT_TRA', itemName: 'Trà chanh sả', price: 40000, isActive: true, imageURL: '/img/TraChanhSa.png' },
      { itemID: 'M10', categoryID: 'CAT_NUOCEP', itemName: 'Nước cam ép', price: 50000, isActive: true, imageURL: '/img/NuocCamEp.png' },
      { itemID: 'M11', categoryID: 'CAT_NUOCEP', itemName: 'Coca Cola', price: 20000, isActive: true, imageURL: '/img/CocaCola.png' },
      { itemID: 'M12', categoryID: 'CAT_NUOCEP', itemName: 'Pepsi', price: 20000, isActive: true, imageURL: '/img/Pepsi.png' },
      { itemID: 'M13', categoryID: 'CAT_NUOCEP', itemName: 'Nước suối Aquafina', price: 15000, isActive: true, imageURL: '/img/NuocSuoiAquafina.png' },

      // Bánh ngọt & Tráng miệng
      { itemID: 'M14', categoryID: 'CAT_BANH', itemName: 'Tiramisu truyền thống', price: 65000, isActive: true, imageURL: '/img/Tiramisu.png' },
      { itemID: 'M15', categoryID: 'CAT_BANH', itemName: 'Bánh Flan', price: 30000, isActive: true, imageURL: '/img/BanhFlan.png' },
      { itemID: 'M16', categoryID: 'CAT_BANH', itemName: 'Bánh Red Velvet', price: 60000, isActive: true, imageURL: '/img/BanhRedVelvet.png' },
      { itemID: 'M17', categoryID: 'CAT_BANH', itemName: 'Bánh Sừng bò', price: 40000, isActive: true, imageURL: '/img/BanhSungBo.png' },
      { itemID: 'M18', categoryID: 'CAT_BANH', itemName: 'Cheesecake Chanh dây', price: 65000, isActive: true, imageURL: '/img/ChesecakeChanhDay.png' },
      { itemID: 'M19', categoryID: 'CAT_BANH', itemName: 'Muffin Socola', price: 45000, isActive: true, imageURL: '/img/MuffinSocola.png' },
      { itemID: 'M20', categoryID: 'CAT_TRANGMIENG', itemName: 'Chè dưỡng nhan', price: 45000, isActive: true, imageURL: '/img/CheDuongNhan.png' },
      { itemID: 'M21', categoryID: 'CAT_TRANGMIENG', itemName: 'Sữa chua nếp cẩm', price: 35000, isActive: true, imageURL: '/img/SuaChuaNepCam.png' },
      { itemID: 'M22', categoryID: 'CAT_TRANGMIENG', itemName: 'Rau câu dừa', price: 25000, isActive: true, imageURL: '/img/RauCauDua.png' },
      { itemID: 'M23', categoryID: 'CAT_TRANGMIENG', itemName: 'Trái cây dĩa', price: 50000, isActive: true, imageURL: '/img/TraiCayDia.png' },

      // Món chính
      { itemID: 'M24', categoryID: 'CAT_FOOD', itemName: 'Bún bò Huế', price: 65000, isActive: true, imageURL: '/img/BunBoHue.png' },
      { itemID: 'M25', categoryID: 'CAT_FOOD', itemName: 'Bò kho bánh mì', price: 70000, isActive: true, imageURL: '/img/BoKhoBanhMi.png' },
      { itemID: 'M26', categoryID: 'CAT_FOOD', itemName: 'Cơm chiên hải sản', price: 80000, isActive: true, imageURL: '/img/ComChienHaiSan.png' },
      { itemID: 'M27', categoryID: 'CAT_FOOD', itemName: 'Cá kho tộ', price: 75000, isActive: true, imageURL: '/img/CaKhoTo.png' },
      { itemID: 'M28', categoryID: 'CAT_FOOD', itemName: 'Gà kho sả ớt', price: 65000, isActive: true, imageURL: '/img/GaKhoXaOt.png' },
      { itemID: 'M29', categoryID: 'CAT_FOOD', itemName: 'Salad Ức gà', price: 60000, isActive: true, imageURL: '/img/SaladUcGa.png' },
      { itemID: 'M30', categoryID: 'CAT_FOOD', itemName: 'Súp măng tây cua', price: 55000, isActive: true, imageURL: '/img/SupMangTayCua.png' },

      // Món ăn kèm
      { itemID: 'M31', categoryID: 'CAT_SIDE', itemName: 'Đậu chiên sả ớt', price: 35000, isActive: true, imageURL: '/img/DauChienXaOt.png' },
      { itemID: 'M32', categoryID: 'CAT_SIDE', itemName: 'Rau muống xào tỏi', price: 40000, isActive: true, imageURL: '/img/RauMuongXaoToi.png' },
      { itemID: 'M33', categoryID: 'CAT_SIDE', itemName: 'Trứng ốp la', price: 15000, isActive: true, imageURL: '/img/TrungOpLa.png' },
      { itemID: 'M34', categoryID: 'CAT_SIDE', itemName: 'Dưa góp chua ngọt', price: 20000, isActive: true, imageURL: '/img/DuaGopChuaNgot.png' },
      { itemID: 'M35', categoryID: 'CAT_SIDE', itemName: 'Kim chi Hàn Quốc', price: 25000, isActive: true, imageURL: '/img/KimChiHanQuoc.png' },
      { itemID: 'M36', categoryID: 'CAT_SIDE', itemName: 'Nộm hoa chuối', price: 45000, isActive: true, imageURL: '/img/NomHoaChuoi.png' }
    ]
  });

  console.log("Seeding Accounts...");
  await prisma.account.createMany({
    data: [
      { accountID: 'ACC_01', username: 'NguyenDucTai', passwordHash: '123456', role: 1, isActive: true },
      { accountID: 'ACC_02', username: 'TranThiB_ThuNgan', passwordHash: '******', role: 2, isActive: true },
      { accountID: 'ACC_03', username: 'LeVanC_PhucVu', passwordHash: '******', role: 3, isActive: true },
      { accountID: 'ACC_04', username: 'PhamThiD_PhucVu', passwordHash: '******', role: 3, isActive: true },
      { accountID: 'ACC_05', username: 'NgoVanE_NghiViec', passwordHash: '******', role: 3, isActive: false },
      { accountID: 'ACC_06', username: 'HoangThiF_PhaChe', passwordHash: '******', role: 3, isActive: true }
    ]
  });

  console.log("Seeding Vouchers...");
  await prisma.voucher.createMany({
    data: [
      { voucherID: 'VOU_01', voucherCode: 'WELCOME20', discountType: 1, discountValue: 20, minTotalRequired: 100000, usageLimit: 100, usedCount: 15, startDate: new Date(), expiryDate: new Date(Date.now() + 86400000 * 30), isActive: true }, // %
      { voucherID: 'VOU_02', voucherCode: 'FREEDRINK', discountType: 2, discountValue: 50000, minTotalRequired: 200000, usageLimit: 50, usedCount: 50, startDate: new Date(Date.now() - 86400000 * 10), expiryDate: new Date(Date.now() - 86400000 * 2), isActive: false }, // VNĐ - đã hết hạn
      { voucherID: 'VOU_03', voucherCode: 'MEGA50', discountType: 1, discountValue: 50, minTotalRequired: 500000, usageLimit: 10, usedCount: 2, startDate: new Date(), expiryDate: new Date(Date.now() + 86400000 * 60), isActive: true },
      { voucherID: 'VOU_04', voucherCode: 'HAPPYHOUR', discountType: 1, discountValue: 15, minTotalRequired: 150000, usageLimit: 500, usedCount: 450, startDate: new Date(), expiryDate: new Date(Date.now() + 86400000 * 5), isActive: true }
    ]
  });

  console.log("Seeding Promotions...");
  await prisma.promotion.create({
    data: {
      promoID: 'PRM_01',
      promoName: 'Khai Trương Mùa Hè',
      discountType: 1, // %
      discountValue: 10,
      startDate: new Date(Date.now() - 86400000 * 5), // started 5 days ago
      endDate: new Date(Date.now() + 86400000 * 15), // ends in 15 days
    }
  });
  await prisma.promotion.create({
    data: {
      promoID: 'PRM_02',
      promoName: 'Tuần Lễ Cà Phê',
      discountType: 2, // VNĐ
      discountValue: 20000,
      startDate: new Date(Date.now() + 86400000 * 10), // starts in 10 days
      endDate: new Date(Date.now() + 86400000 * 20),
    }
  });

  console.log("Seeding Tables...");
  await prisma.diningTable.createMany({
    data: [
      { tableID: 'TB_01', tableName: 'Bàn 01', status: 0 },
      { tableID: 'TB_02', tableName: 'Bàn 02', status: 1 }, // in-use
      { tableID: 'TB_03', tableName: 'Bàn 03', status: 0 },
      { tableID: 'TB_VIP', tableName: 'Phòng VIP', status: 1 } // in-use
    ]
  });

  console.log("Seeding Orders...");
  await prisma.orders.create({
    data: {
      orderID: 'ORD_001',
      tableID: 'TB_02',
      cashierID: 'ACC_02',
      status: 2, // 2 = completed
      totalAmount: 145000,
      orderDate: new Date(Date.now() - 3600000), // 1 hour ago
      orderDetails: {
        create: [
          { itemID: 'M01', quantity: 2, unitPrice: 45000, status: 'DONE' },
          { itemID: 'M02', quantity: 1, unitPrice: 55000, status: 'DONE' }
        ]
      }
    }
  });

  await prisma.orders.create({
    data: {
      orderID: 'ORD_002',
      tableID: 'TB_VIP',
      cashierID: 'ACC_02',
      status: 1, // 1 = in progress (processing)
      totalAmount: 230000,
      orderDate: new Date(Date.now() - 600000), // 10 mins ago
      orderDetails: {
        create: [
          { itemID: 'M03', quantity: 2, unitPrice: 65000, status: 'COOKING' },
          { itemID: 'M04', quantity: 2, unitPrice: 50000, status: 'WAITING' }
        ]
      }
    }
  });
  
  await prisma.orders.create({
    data: {
      orderID: 'ORD_003',
      tableID: 'TB_01',
      cashierID: 'ACC_02',
      status: 2, // 2 = completed
      totalAmount: 45000,
      orderDate: new Date(Date.now() - 86400000), // Yesterday
      orderDetails: {
        create: [
          { itemID: 'M01', quantity: 1, unitPrice: 45000, status: 'DONE' }
        ]
      }
    }
  });

  await prisma.orders.create({
    data: {
      orderID: 'ORD_004',
      tableID: 'TB_03',
      cashierID: 'ACC_02',
      status: 2, 
      totalAmount: 120000,
      orderDate: new Date(), 
      orderDetails: {
        create: [
          { itemID: 'M04', quantity: 1, unitPrice: 50000, status: 'DONE' },
          { itemID: 'M02', quantity: 1, unitPrice: 55000, status: 'DONE' },
          { itemID: 'M05', quantity: 1, unitPrice: 45000, status: 'DONE' } // Trà lài
        ]
      }
    }
  });

  console.log("✅ Seeding finished successfully.");
}

main()
  .catch(e => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

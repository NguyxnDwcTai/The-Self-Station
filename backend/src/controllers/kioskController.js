const prisma = require('../config/prisma');

// GET: Lấy danh sách món ăn đang bán để hiển thị lên Kiosk
exports.getMenu = async (req, res) => {
  try {
    const menuItems = await prisma.menuItem.findMany({
      where: { isActive: true },
      include: {
        category: true
      }
    });
    res.json(menuItems);
  } catch (error) {
    console.error("Kiosk getMenu Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST: Tạo đơn hàng mới từ Kiosk
exports.createOrder = async (req, res) => {
  try {
    const { tableID, totalAmount, items } = req.body;
    
    // items [{ itemID, quantity, unitPrice }]
    if (!tableID || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields or empty cart' });
    }

    const orderID = "K_" + Date.now().toString().slice(-6);

    const order = await prisma.orders.create({
      data: {
        orderID,
        tableID,
        status: 0, // 0 = New / Waiting
        totalAmount,
        orderDetails: {
          create: items.map(i => ({
            itemID: i.itemID,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            status: "WAITING"
          }))
        }
      },
      include: {
        orderDetails: {
          include: { menuItem: true }
        },
        table: true
      }
    });

    // Emit event to KDS and other clients
    const io = req.app.get('io');
    if (io) {
      io.emit('newKioskOrder', order);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error("Kiosk createOrder Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST: Thêm món mới vào đơn đã có
exports.addNewItem = async (req, res) => {
  try {
    const { orderID } = req.params;
    const { itemID, quantity, unitPrice } = req.body;

    // Kiểm tra xem đã có món này ở trạng thái WAITING chưa
    const existing = await prisma.orderDetail.findFirst({
      where: { orderID, itemID, status: 'WAITING' }
    });

    let newDetail;
    if (existing) {
      newDetail = await prisma.orderDetail.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
        include: { menuItem: true }
      });
      const io = req.app.get('io');
      if (io) io.emit('orderQuantityUpdated', { orderID, detailId: existing.id, itemID, quantity: existing.quantity + quantity });
    } else {
      newDetail = await prisma.orderDetail.create({
        data: {
          orderID,
          itemID,
          quantity,
          unitPrice,
          status: 'WAITING'
        },
        include: { menuItem: true }
      });
      const io = req.app.get('io');
      if (io) io.emit('newOrderItem', { orderID, detail: newDetail });
    }

    res.status(201).json(newDetail);
  } catch (error) {
    console.error("Kiosk addNewItem Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// PUT: Cập nhật số lượng / Hủy món chi tiết
exports.updateOrderDetail = async (req, res) => {
  try {
    const { orderID, detailId } = req.params;
    const { delta } = req.body; // +1 or -1

    const existingItem = await prisma.orderDetail.findUnique({
      where: { id: detailId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: 'Not found' });
    }

    if (delta < 0) {
      // Giảm số lượng
      if (existingItem.status !== 'WAITING') {
        return res.status(409).json({ error: 'Món ăn đang được chế biến, vui lòng liên hệ nhân viên để thay đổi' });
      }

      if (existingItem.quantity <= 1) {
        // Hủy món - Chuyển status thành CANCELLED để KDS biết
        const updated = await prisma.orderDetail.updateMany({
          where: { id: detailId, status: 'WAITING' },
          data: { status: 'CANCELLED' }
        });
        
        if (updated.count === 0) return res.status(409).json({ error: 'Món ăn đã thay đổi trạng thái bởi bếp' });

        const io = req.app.get('io');
        if (io) io.emit('orderStatusUpdated', { orderID, detailId, itemID: existingItem.itemID, status: 'CANCELLED' });
        
        return res.json({ message: 'Đã hủy món', status: 'CANCELLED', id: detailId });
      } else {
        // Giảm số lượng
        const updated = await prisma.orderDetail.updateMany({
          where: { id: detailId, status: 'WAITING' },
          data: { quantity: existingItem.quantity - 1 }
        });

        if (updated.count === 0) return res.status(409).json({ error: 'Món ăn đã thay đổi trạng thái bởi bếp' });

        const io = req.app.get('io');
        if (io) io.emit('orderQuantityUpdated', { orderID, detailId, itemID: existingItem.itemID, quantity: existingItem.quantity - 1 });
        
        return res.json({ quantity: existingItem.quantity - 1, id: detailId });
      }
    } else if (delta > 0) {
      // Tăng số lượng
      if (existingItem.status !== 'WAITING') {
        // Kiểm tra xem đã có món WAITING cùng itemID chưa
        const existingWaiting = await prisma.orderDetail.findFirst({
          where: { orderID, itemID: existingItem.itemID, status: 'WAITING' }
        });

        if (existingWaiting) {
           const mergedDetail = await prisma.orderDetail.update({
             where: { id: existingWaiting.id },
             data: { quantity: existingWaiting.quantity + 1 },
             include: { menuItem: true }
           });
           const io = req.app.get('io');
           if (io) io.emit('orderQuantityUpdated', { orderID, detailId: existingWaiting.id, itemID: existingItem.itemID, quantity: existingWaiting.quantity + 1 });
           return res.json({ mergedDetail, isSplit: true });
        } else {
           // Không cộng dồn vào món đang nấu, sinh ra 1 detail mới (phiếu mới)
           const newDetail = await prisma.orderDetail.create({
             data: {
               orderID,
               itemID: existingItem.itemID,
               quantity: 1,
               unitPrice: existingItem.unitPrice,
               status: 'WAITING'
             },
             include: { menuItem: true }
           });

           const io = req.app.get('io');
           if (io) io.emit('newOrderItem', { orderID, detail: newDetail });
           return res.json({ newDetail, isSplit: true });
        }
      } else {
        // Đang WAITING thì cộng dồn
        const updated = await prisma.orderDetail.updateMany({
          where: { id: detailId, status: 'WAITING' },
          data: { quantity: existingItem.quantity + 1 }
        });

        if (updated.count === 0) return res.status(409).json({ error: 'Món ăn đã thay đổi trạng thái bởi bếp' });

        const io = req.app.get('io');
        if (io) io.emit('orderQuantityUpdated', { orderID, detailId, itemID: existingItem.itemID, quantity: existingItem.quantity + 1 });
        
        return res.json({ quantity: existingItem.quantity + 1, id: detailId });
      }
    } else {
      return res.status(400).json({ error: 'Invalid delta' });
    }

  } catch (error) {
    console.error("Kiosk updateOrderDetail Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST: API Quẹt thẻ quét mã điểm thưởng
exports.scanCard = async (req, res) => {
   try {
      const { cardID, currentBillTotal } = req.body;
      const card = await prisma.customerCard.findUnique({
         where: { cardID }
      });

      if (!card) {
         // Create anonymously if not exists
         const newCard = await prisma.customerCard.create({
            data: { cardID, rewardPoints: Math.floor(currentBillTotal / 1000) }
         });
         return res.json({ message: 'Thẻ mới', pointsAdded: Math.floor(currentBillTotal / 1000), totalPoints: newCard.rewardPoints });
      }

      const pointsToAdd = Math.floor(currentBillTotal / 1000);
      const updatedCard = await prisma.customerCard.update({
         where: { cardID },
         data: { rewardPoints: { increment: pointsToAdd } }
      });

      res.json({ message: 'Tích điểm thành công', pointsAdded: pointsToAdd, totalPoints: updatedCard.rewardPoints });

   } catch (error) {
     console.error("Kiosk scanCard Error:", error);
     res.status(500).json({ error: 'Server error parsing card' });
   }
};

// GET: Lấy trạng thái Order hiện tại (mini dashboard tracking ticket)
exports.getOrderTracking = async (req, res) => {
   try {
     const { id } = req.params;
     const order = await prisma.orders.findUnique({
       where: { orderID: id },
       include: {
         orderDetails: {
            include: { menuItem: true }
         }
       }
     });
     if(!order) return res.status(404).json({ error: 'Not found' });
     res.json(order);
   } catch (error) {
     res.status(500).json({ error: 'Server error' });
   }
};

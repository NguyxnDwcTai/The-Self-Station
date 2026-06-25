const prisma = require('../config/prisma');

// ─────────────────────────────────────────────
// Module 1: Member & Reward
// ─────────────────────────────────────────────

/**
 * GET /api/pos/customer?phone=xxx  OR  ?cardId=xxx
 * Tìm khách hàng theo SĐT hoặc mã thẻ QR
 */
exports.findCustomer = async (req, res) => {
    const { phone, cardId } = req.query;

    if (!phone && !cardId) {
        return res.status(400).json({ error: 'MISSING_PARAM', message: 'Cần cung cấp phone hoặc cardId' });
    }

    try {
        let customer = null;

        if (phone) {
            customer = await prisma.customer.findUnique({ where: { phone } });
        } else {
            // Tìm qua CustomerCard nếu có bảng đó
            const card = await prisma.customerCard.findUnique({ where: { cardID: cardId } });
            if (card && card.customerID) {
                customer = await prisma.customer.findUnique({ where: { customerID: card.customerID } });
            }
        }

        if (!customer) {
            return res.status(404).json({ error: 'NOT_FOUND', message: 'Không tìm thấy thành viên với thông tin đã cung cấp' });
        }

        res.json({
            customerID: customer.customerID,
            fullName: customer.fullName,
            phone: customer.phone,
            rewardPoints: customer.rewardPoints || 0,
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

/**
 * POST /api/pos/customer/link-order
 * Gắn tài khoản thành viên vào đơn hàng đang mở của bàn
 */
exports.linkCustomerToOrder = async (req, res) => {
    const { tableID, customerID } = req.body;
    if (!tableID || !customerID) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Cần tableID và customerID' });
    }

    try {
        const order = await prisma.orders.findFirst({
            where: { tableID, status: 0 }
        });

        if (!order) {
            return res.status(404).json({ error: 'NO_ACTIVE_ORDER', message: 'Bàn này chưa có đơn hàng đang hoạt động' });
        }

        const updated = await prisma.orders.update({
            where: { orderID: order.orderID },
            data: { customerID }
        });

        res.json({ success: true, orderID: updated.orderID });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

/**
 * POST /api/pos/customer/register
 * Đăng ký khách hàng mới và (tùy chọn) gắn vào đơn hàng
 */
exports.registerCustomer = async (req, res) => {
    const { phone, fullName, tableID } = req.body;
    if (!phone || !fullName) {
        return res.status(400).json({ error: 'MISSING_FIELDS', message: 'Cần số điện thoại và họ tên' });
    }

    try {
        // Kiểm tra xem số điện thoại đã tồn tại chưa
        const existing = await prisma.customer.findUnique({ where: { phone } });
        if (existing) {
            return res.status(400).json({ error: 'CUSTOMER_EXISTS', message: 'Số điện thoại này đã được đăng ký' });
        }

        const customerID = `CUST-${Date.now()}`;
        const newCustomer = await prisma.customer.create({
            data: {
                customerID,
                phone,
                fullName,
                rewardPoints: 0
            }
        });

        // Nếu có tableID, gắn customer vào đơn hàng đang mở
        if (tableID) {
            const order = await prisma.orders.findFirst({
                where: { tableID, status: 0 }
            });
            if (order) {
                await prisma.orders.update({
                    where: { orderID: order.orderID },
                    data: { customerID }
                });
            }
        }

        res.json({
            success: true,
            customer: {
                customerID: newCustomer.customerID,
                fullName: newCustomer.fullName,
                phone: newCustomer.phone,
                rewardPoints: newCustomer.rewardPoints
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

// ─────────────────────────────────────────────
// Module 2: Payment & Checkout
// ─────────────────────────────────────────────

/**
 * GET /api/pos/bill?tableID=TABLE-01
 * Lấy hóa đơn chưa thanh toán của bàn
 */
exports.getBill = async (req, res) => {
    const { tableID } = req.query;
    if (!tableID) {
        return res.status(400).json({ error: 'MISSING_TABLE', message: 'Cần cung cấp tableID' });
    }

    try {
        const table = await prisma.diningTable.findUnique({ where: { tableID } });
        if (!table) {
            return res.status(404).json({ error: 'TABLE_NOT_FOUND', message: 'Mã bàn không tồn tại' });
        }

        const order = await prisma.orders.findFirst({
            where: { tableID, status: 0 },
            include: {
                orderDetails: {
                    include: { menuItem: true }
                },
                customer: true,
            }
        });

        if (!order) {
            return res.status(404).json({ error: 'NO_ACTIVE_ORDER', message: 'Bàn này hiện không có hóa đơn' });
        }

        const items = order.orderDetails.map(d => ({
            itemID: d.itemID,
            itemName: d.menuItem?.itemName || 'Unknown',
            quantity: d.quantity,
            unitPrice: parseFloat(d.unitPrice),
            subtotal: parseFloat(d.unitPrice) * d.quantity,
            status: d.status
        }));

        const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

        res.json({
            orderID: order.orderID,
            tableID: order.tableID,
            tableName: table.tableName,
            customer: order.customer ? {
                customerID: order.customer.customerID,
                fullName: order.customer.fullName,
                rewardPoints: order.customer.rewardPoints || 0
            } : null,
            items,
            subtotal: parseFloat(subtotal.toFixed(2)),
            discount: 0,
            total: parseFloat(subtotal.toFixed(2)),
            voucherCode: null,
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

/**
 * POST /api/pos/voucher/validate
 * Xác thực mã voucher và tính lại tổng tiền
 */
exports.validateVoucher = async (req, res) => {
    const { orderID, voucherCode } = req.body;
    if (!orderID || !voucherCode) {
        return res.status(400).json({ error: 'MISSING_FIELDS' });
    }

    try {
        const order = await prisma.orders.findUnique({
            where: { orderID },
            include: { orderDetails: true }
        });
        if (!order) return res.status(404).json({ error: 'ORDER_NOT_FOUND' });

        const subtotal = order.orderDetails.reduce(
            (sum, d) => sum + parseFloat(d.unitPrice) * d.quantity, 0
        );

        const voucher = await prisma.voucher.findUnique({ where: { voucherCode } });
        const now = new Date();

        if (!voucher) return res.status(400).json({ error: 'INVALID_VOUCHER', message: 'Mã giảm giá không tồn tại' });
        if (!voucher.isActive) return res.status(400).json({ error: 'INVALID_VOUCHER', message: 'Mã giảm giá đã bị vô hiệu hóa' });
        if (voucher.expiryDate && voucher.expiryDate < now) return res.status(400).json({ error: 'INVALID_VOUCHER', message: 'Mã giảm giá đã hết hạn' });
        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) return res.status(400).json({ error: 'INVALID_VOUCHER', message: 'Mã giảm giá đã hết lượt sử dụng' });
        if (voucher.minTotalRequired && subtotal < parseFloat(voucher.minTotalRequired)) {
            return res.status(400).json({ error: 'INVALID_VOUCHER', message: `Hóa đơn cần tối thiểu ${voucher.minTotalRequired} để áp dụng mã này` });
        }

        let discountAmount = 0;
        if (voucher.discountType === 1) { // Percentage
            discountAmount = subtotal * (parseFloat(voucher.discountValue) / 100);
        } else { // Fixed amount
            discountAmount = parseFloat(voucher.discountValue);
        }
        discountAmount = Math.min(discountAmount, subtotal);
        const newTotal = parseFloat((subtotal - discountAmount).toFixed(2));

        res.json({
            valid: true,
            voucherID: voucher.voucherID,
            discountType: voucher.discountType,
            discountValue: parseFloat(voucher.discountValue),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            newTotal,
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

/**
 * POST /api/pos/checkout
 * Xử lý thanh toán — Transaction duy nhất
 */
exports.processCheckout = async (req, res) => {
    const { orderID, paymentMethod = 'CASH', cashReceived, voucherCode } = req.body;
    if (!orderID) return res.status(400).json({ error: 'MISSING_FIELDS' });

    try {
        const order = await prisma.orders.findUnique({
            where: { orderID },
            include: { orderDetails: true, customer: true }
        });

        if (!order || order.status !== 0) {
            return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Không tìm thấy đơn hàng hoặc đã được thanh toán' });
        }

        const subtotal = order.orderDetails.reduce(
            (sum, d) => sum + parseFloat(d.unitPrice) * d.quantity, 0
        );

        // Validate voucher nếu có
        let discountAmount = 0;
        let voucherID = null;
        if (voucherCode) {
            const voucher = await prisma.voucher.findUnique({ where: { voucherCode } });
            if (voucher && voucher.isActive) {
                if (voucher.discountType === 1) {
                    discountAmount = subtotal * (parseFloat(voucher.discountValue) / 100);
                } else {
                    discountAmount = parseFloat(voucher.discountValue);
                }
                discountAmount = Math.min(discountAmount, subtotal);
                voucherID = voucher.voucherID;
            }
        }

        const finalTotal = parseFloat((subtotal - discountAmount).toFixed(2));
        const received = parseFloat(cashReceived || 0);

        if (paymentMethod === 'CASH' && received < finalTotal) {
            return res.status(400).json({
                error: 'INSUFFICIENT_PAYMENT',
                message: `Số tiền khách đưa không đủ. Cần thêm $${(finalTotal - received).toFixed(2)}`
            });
        }

        const changeAmount = paymentMethod === 'CASH' ? parseFloat((received - finalTotal).toFixed(2)) : 0;
        const pointsEarned = Math.floor(finalTotal / 50000);

        // === TRANSACTION ===
        await prisma.$transaction(async (tx) => {
            // 1. Cập nhật đơn hàng → status 2 = Đã thanh toán
            await tx.orders.update({
                where: { orderID },
                data: {
                    status: 2,
                    totalAmount: finalTotal,
                    voucherID,
                }
            });

            // 2. Bàn về trạng thái trống
            await tx.diningTable.update({
                where: { tableID: order.tableID },
                data: { status: 0 }
            });

            // 3. Tăng usedCount của voucher
            if (voucherID) {
                await tx.voucher.update({
                    where: { voucherID },
                    data: { usedCount: { increment: 1 } }
                });
            }

            // 4. Cộng điểm thưởng cho thành viên
            if (order.customerID) {
                await tx.customer.update({
                    where: { customerID: order.customerID },
                    data: { rewardPoints: { increment: pointsEarned } }
                });
            }
        });

        // Emit socket event cho KDS/Kiosk biết đơn đã thanh toán
        const io = req.app.get('io');
        if (io) {
            io.emit('orderPaid', { orderID, tableID: order.tableID });
        }

        const newRewardPoints = order.customer
            ? (order.customer.rewardPoints || 0) + pointsEarned
            : null;

        res.json({
            success: true,
            orderID,
            finalTotal,
            cashReceived: received,
            change: changeAmount,
            pointsEarned: order.customerID ? pointsEarned : 0,
            newRewardPoints,
            paidAt: new Date().toISOString(),
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

// ─────────────────────────────────────────────
// Module 3: Reporting
// ─────────────────────────────────────────────

/**
 * GET /api/pos/report/daily-summary?date=2026-04-26
 * Báo cáo tổng kết ca theo ngày
 */
exports.getDailySummary = async (req, res) => {
    try {
        const { date } = req.query;
        const targetDate = date ? new Date(date) : new Date();

        // Lấy khoảng thời gian đầu ngày → cuối ngày
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const paidOrders = await prisma.orders.findMany({
            where: {
                status: 2,
                orderDate: { gte: startOfDay, lte: endOfDay }
            },
            include: {
                orderDetails: {
                    include: { menuItem: true }
                }
            }
        });

        // Nếu không có đơn nào — vẫn trả về thành công với data rỗng
        if (paidOrders.length === 0) {
            return res.json({
                date: targetDate.toISOString().split('T')[0],
                totalRevenue: 0,
                totalOrders: 0,
                items: []
            });
        }

        // Tính tổng doanh thu
        const totalRevenue = paidOrders.reduce(
            (sum, o) => sum + parseFloat(o.totalAmount || 0), 0
        );

        // Gom nhóm món ăn
        const itemMap = {};
        for (const order of paidOrders) {
            for (const detail of order.orderDetails) {
                const key = detail.itemID;
                if (!itemMap[key]) {
                    itemMap[key] = {
                        itemID: key,
                        itemName: detail.menuItem?.itemName || 'Unknown',
                        soldQty: 0,
                        revenue: 0,
                    };
                }
                itemMap[key].soldQty += detail.quantity;
                itemMap[key].revenue += parseFloat(detail.unitPrice) * detail.quantity;
            }
        }

        const items = Object.values(itemMap)
            .map(i => ({ ...i, revenue: parseFloat(i.revenue.toFixed(2)) }))
            .sort((a, b) => b.soldQty - a.soldQty);

        res.json({
            date: targetDate.toISOString().split('T')[0],
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders: paidOrders.length,
            items,
        });
    } catch (error) {
        res.status(500).json({ error: 'SERVER_ERROR', message: error.message });
    }
};

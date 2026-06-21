const prisma = require('../config/prisma');

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.orders.findMany({
            include: {
                orderDetails: {
                    include: {
                        menuItem: true
                    }
                },
                table: true,
                cashier: true
            }
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { orderID, tableID, cashierID, status, orderDetails } = req.body;
        // Basic creation assuming body has the right structure
        const newOrder = await prisma.orders.create({
            data: {
                orderID,
                tableID,
                cashierID,
                status,
                orderDetails: {
                    create: orderDetails // array of { itemID, quantity, unitPrice }
                }
            },
            include: { orderDetails: true }
        });
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrderItemStatus = async (req, res) => {
    try {
        const { orderId, detailId } = req.params;
        const { status } = req.body; // e.g., "DONE", "OUT_OF_STOCK"

        if (!status) {
            return res.status(400).json({ error: "Status is required" });
        }

        const updatedDetail = await prisma.orderDetail.update({
            where: {
                id: detailId
            },
            data: {
                status: status
            }
        });

        // Emit socket event to notify KDS, Kiosk, and Website
        const io = req.app.get('io');
        if (io) {
            io.emit('orderStatusUpdated', {
                orderID: orderId,
                detailId: detailId,
                itemID: updatedDetail.itemID,
                status: status,
                updatedAt: new Date()
            });
        }

        res.json(updatedDetail);
    } catch (error) {
        console.error("Error updating order item status:", error);
        res.status(500).json({ error: error.message });
    }
};

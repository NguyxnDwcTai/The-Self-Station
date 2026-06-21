const prisma = require('../config/prisma');

exports.getAllPromotions = async (req, res) => {
    try {
        const promos = await prisma.promotion.findMany();
        res.json(promos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPromotion = async (req, res) => {
    try {
        const newPromo = await prisma.promotion.create({
            data: req.body
        });
        res.status(201).json(newPromo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const safeParseDateOrNull = (value) => {
    if (!value) return null;
    const d = new Date(value);
    // Bắt lỗi "zero date" (0000-00-00) và invalid date
    if (isNaN(d.getTime()) || d.getFullYear() < 1970) return null;
    return d.toISOString();
};

exports.getAllVouchers = async (req, res) => {
    try {
        const vouchers = await prisma.voucher.findMany({
            orderBy: { expiryDate: 'asc' }
        });
        res.json(vouchers);
    } catch (error) {
        console.error("Lỗi getAllVouchers:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.createVoucher = async (req, res) => {
    try {
        // Validate ngày trước khi tạo
        const startDate = safeParseDateOrNull(req.body.startDate);
        const expiryDate = safeParseDateOrNull(req.body.expiryDate);
 
        if (!startDate || !expiryDate) {
            return res.status(400).json({
                error: "startDate và expiryDate không hợp lệ. Vui lòng nhập đúng định dạng ngày (VD: 2025-06-01)."
            });
        }
 
        if (new Date(startDate) > new Date(expiryDate)) {
            return res.status(400).json({
                error: "startDate không thể lớn hơn expiryDate."
            });
        }
 
        const payload = {
            voucherID: req.body.voucherID,
            voucherCode: req.body.voucherCode,
            discountType: parseInt(req.body.discountType),
            discountValue: parseFloat(req.body.discountValue),
            minTotalRequired: parseFloat(req.body.minTotalRequired || 0),
            usageLimit: parseInt(req.body.usageLimit || 1),
            startDate: startDate,
            expiryDate: expiryDate,
            isActive: Boolean(req.body.isActive)
        };
 
        const newVoucher = await prisma.voucher.create({
            data: payload
        });
        res.status(201).json(newVoucher);
    } catch (error) {
        console.error("Lỗi tạo Voucher:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.toggleVoucherStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const updatedVoucher = await prisma.voucher.update({
            where: { voucherID: id },
            data: { isActive: isActive }
        });

        res.json(updatedVoucher);
    } catch (error) {
        console.error("Lỗi cập nhật trạng thái:", error);
        res.status(500).json({ error: "Không thể cập nhật trạng thái Voucher" });
    }
};
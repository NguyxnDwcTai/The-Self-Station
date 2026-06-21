const prisma = require('../config/prisma');

exports.getAllMenuItems = async (req, res) => {
    try {
        const items = await prisma.menuItem.findMany({
            include: { category: true }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createMenuItem = async (req, res) => {
    try {
        const { itemID, itemName, categoryID, price } = req.body;
        if (!itemID || !itemName || !categoryID || price === undefined) {
             return res.status(400).json({ error: "Thiếu trường bắt buộc (itemID, itemName, categoryID, price)." });
        }
        
        const newItem = await prisma.menuItem.create({
            data: req.body
        });
        res.status(201).json(newItem);
    } catch (error) {
        if (error.code === 'P2002') {
             return res.status(400).json({ error: "Mã món ăn đã tồn tại." });
        }
        res.status(500).json({ error: "Lỗi máy chủ nội bộ", details: error.message });
    }
};

exports.updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updated = await prisma.menuItem.update({
            where: { itemID: id },
            data: req.body
        });
        
        // Emit socket event for Kiosk and KDS sync
        const io = req.app.get('io');
        if (io) {
            io.emit('menuItemChanged', {
                itemID: updated.itemID,
                itemName: updated.itemName,
                isActive: updated.isActive,
                action: updated.isActive ? 'Bật bán lại' : 'Hết hàng'
            });
        }
        
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const cat = await prisma.category.findMany({
            orderBy: { sortOrder: 'asc' }
        });
        res.json(cat);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
}

exports.createCategory = async (req, res) => {
    try {
        const { categoryID, categoryName, description, sortOrder } = req.body;
        if (!categoryID || !categoryName) {
            return res.status(400).json({ error: "Thiếu mã danh mục hoặc tên danh mục." });
        }
        const newCat = await prisma.category.create({
            data: {
                categoryID,
                categoryName,
                description,
                sortOrder: parseInt(sortOrder) || 0
            }
        });
        res.status(201).json(newCat);
    } catch (error) {
        if (error.code === 'P2002') {
             return res.status(400).json({ error: "Mã danh mục đã tồn tại." });
        }
        res.status(500).json({ error: error.message });
    }
}

exports.deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.menuItem.delete({
            where: { itemID: id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

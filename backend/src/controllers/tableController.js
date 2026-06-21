const prisma = require('../config/prisma');

exports.getAllTables = async (req, res) => {
    try {
        const tables = await prisma.diningTable.findMany();
        res.json(tables);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createTable = async (req, res) => {
    try {
        const newTable = await prisma.diningTable.create({
            data: req.body
        });
        res.status(201).json(newTable);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateTableStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await prisma.diningTable.update({
            where: { tableID: id },
            data: { status: parseInt(status) }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const prisma = require('../config/prisma');

exports.getKPIs = async (req, res) => {
    try {
        // Logic to get Total Revenue, Completed Orders, Average Order Value
        const currentOrders = await prisma.orders.findMany({
            where: { status: 2 } // Assuming 2 means completed
        });

        if (currentOrders.length === 0) {
            return res.json({ status: 'none', totalRevenue: 0, completedOrders: 0, averageOrderValue: 0 });
        }

        let totalRevenue = 0;
        currentOrders.forEach(order => {
            totalRevenue += Number(order.totalAmount || 0);
        });

        const completedOrders = currentOrders.length;
        const averageOrderValue = Math.round(totalRevenue / completedOrders);

        res.json({
            status: 'success',
            totalRevenue,
            completedOrders,
            averageOrderValue
        });
    } catch (error) {
        console.error("Error in getKPIs:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.getTopItems = async (req, res) => {
    try {
        // We want all sold items, group by itemID
        const soldItems = await prisma.orderDetail.groupBy({
            by: ['itemID'],
            _sum: {
                quantity: true,
                unitPrice: true
            },
            // We should only count for completed orders actually, but let's count all valid orders
            where: {
                order: {
                    status: 2
                }
            }
        });

        if (soldItems.length === 0) {
            return res.json({ status: 'none', data: [] });
        }

        // Fetch details
        const itemIds = soldItems.map(si => si.itemID);
        const menuDetails = await prisma.menuItem.findMany({
            where: { itemID: { in: itemIds } },
            include: { category: true }
        });

        const data = soldItems.map(si => {
            const detail = menuDetails.find(md => md.itemID === si.itemID);
            const totalRevenue = detail ? Number(detail.price) * si._sum.quantity : 0;
            return {
                itemID: si.itemID,
                itemName: detail ? detail.itemName : 'Unknown',
                categoryName: detail && detail.category ? detail.category.categoryName : 'KHÁC',
                imageURL: detail ? detail.imageURL : '',
                soldCount: si._sum.quantity,
                revenue: totalRevenue,
                catClass: detail && detail.category && detail.category.categoryName.toLowerCase().includes('trà') ? '#4f6f52' : 
                          detail && detail.category && detail.category.categoryName.toLowerCase().includes('bánh') ? '#895a66' : '#37563b'
            };
        });

        // Sort by soldCount descending
        data.sort((a, b) => b.soldCount - a.soldCount);

        res.json({ status: 'success', data });
    } catch (error) {
        console.error("Error in getTopItems:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.getRevenueChart = async (req, res) => {
    try {
        const { period } = req.query; // '30days', '6months', '1year'
        
        // Ensure accurate filtering limit
        let dateLimit = new Date();
        if (period === '30days') {
            dateLimit.setDate(dateLimit.getDate() - 30);
        } else if (period === '6months') {
            dateLimit.setMonth(dateLimit.getMonth() - 6);
        } else if (period === '1year') {
            dateLimit.setFullYear(dateLimit.getFullYear() - 1);
        } else {
            dateLimit.setDate(dateLimit.getDate() - 30); // Default
        }

        const orders = await prisma.orders.findMany({
            where: {
                status: 2,
                orderDate: { gte: dateLimit }
            },
            select: { totalAmount: true, orderDate: true },
            orderBy: { orderDate: 'asc' }
        });

        if (orders.length === 0) {
            return res.json({ status: 'none', labels: [], data: [] });
        }

        // Grouping logic
        let labels = [];
        let dataSeries = [];

        if (period === '30days' || !period) {
            // Group by day for the last 30 days
            const dayMap = {};
            // initialize 30 days
            for(let i=29; i>=0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                dayMap[d.toISOString().slice(0,10)] = 0;
            }
            orders.forEach(o => {
                if(!o.orderDate) return;
                const dKey = o.orderDate.toISOString().slice(0,10);
                if (dayMap[dKey] !== undefined) {
                    dayMap[dKey] += Number(o.totalAmount || 0);
                }
            });
            labels = Object.keys(dayMap).map(d => d.slice(5)); // e.g. '04-15'
            dataSeries = Object.values(dayMap);
        } else if (period === '6months' || period === '1year') {
            // Group by Month
            const numMonths = period === '1year' ? 12 : 6;
            const monthMap = {};
            for(let i=numMonths-1; i>=0; i--) {
                const d = new Date();
                d.setMonth(d.getMonth() - i);
                const mKey = d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2, '0');
                monthMap[mKey] = 0;
            }
            orders.forEach(o => {
                if(!o.orderDate) return;
                const mKey = o.orderDate.getFullYear() + '-' + String(o.orderDate.getMonth()+1).padStart(2, '0');
                if (monthMap[mKey] !== undefined) {
                    monthMap[mKey] += Number(o.totalAmount || 0);
                }
            });
            labels = Object.keys(monthMap).map(m => m.split('-')[1]); // e.g. '04'
            dataSeries = Object.values(monthMap);
        }

        res.json({ status: 'success', labels, data: dataSeries });
    } catch (error) {
        console.error("Error in getRevenueChart:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

exports.getCategoryShare = async (req, res) => {
    try {
        const soldItems = await prisma.orderDetail.findMany({
            where: { order: { status: 2 } },
            include: { menuItem: { include: { category: true } } }
        });

        if (soldItems.length === 0) {
            return res.json({ status: 'none', data: [] });
        }

        const categoryTotals = {};
        let grandTotal = 0;

        soldItems.forEach(item => {
            const catName = item.menuItem && item.menuItem.category ? item.menuItem.category.categoryName : 'Khác';
            const revenue = item.quantity * Number(item.unitPrice || 0);
            
            if(!categoryTotals[catName]) categoryTotals[catName] = 0;
            categoryTotals[catName] += revenue;
            grandTotal += revenue;
        });

        const result = Object.keys(categoryTotals).map(catName => {
            const color = catName.toLowerCase().includes('trà') ? '#4f6f52' : catName.toLowerCase().includes('bánh') ? '#895a66' : '#37563b';
            return {
                name: catName,
                percentage: grandTotal > 0 ? Math.round((categoryTotals[catName] / grandTotal) * 100) : 0,
                color
            };
        });

        res.json({ status: 'success', data: result, grandTotal });
    } catch (error) {
        console.error("Error in getCategoryShare:", error);
        res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
};

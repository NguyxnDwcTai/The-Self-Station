const prisma = require('../config/prisma');

exports.getMe = async (req, res) => {
    try {
        const adminAccount = await prisma.account.findFirst({
            where: { role: 1, isActive: true } // Giả định role 1 là Manager/Admin
        });
        
        if (adminAccount) {
            res.json({ 
                accountID: adminAccount.accountID, 
                username: adminAccount.username, 
                role: adminAccount.role,
                branchID: adminAccount.branchID 
            });
        } else {
            res.json({ accountID: 'A00', username: 'Quản trị viên', role: 1, branchID: 'BR_DEFAULT' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAccounts = async (req, res) => {
    try {
        const { branchID } = req.query;
        const whereClause = branchID ? { branchID: branchID } : {};

        const accounts = await prisma.account.findMany({
            where: whereClause
        });
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const { accountID, branchID, username, passwordHash, role } = req.body;
        
        // 1. Kiểm tra xem Quản lý có branchID không
        if (!branchID) {
            return res.status(400).json({ error: "Hệ thống không nhận diện được chi nhánh của Quản lý đang đăng nhập." });
        }

        // 2. Ràng buộc: Kiểm tra xem branchID này có thực sự tồn tại trong bảng Branch không
        const branchExists = await prisma.branch.findUnique({
            where: { branchID: branchID }
        });

        if (!branchExists) {
            return res.status(400).json({ error: `Chi nhánh có mã '${branchID}' chưa tồn tại trong bảng Branch. Bạn cần thêm chi nhánh này vào DB trước!` });
        }

        // 3. Tạo tài khoản và GẮN CHẶT vào branchID của Quản lý
        const newAccount = await prisma.account.create({
            data: {
                accountID,
                branchID, 
                username,
                passwordHash,
                role: parseInt(role),
                isActive: true
            }
        });
        res.status(201).json(newAccount);
    } catch (error) {
        console.error("Lỗi tạo Account Prisma:", error);
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Mã ID hoặc Username này đã tồn tại trong hệ thống. Vui lòng chọn mã khác." });
        }
        res.status(500).json({ error: "Lỗi máy chủ: " + error.message });
    }
};

exports.updateAccount = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, passwordHash, role } = req.body;
        
        // LƯU Ý: Tuyệt đối không update trường branchID ở đây để giữ nhân viên luôn ở chi nhánh cũ
        const updateData = { username, role: parseInt(role) };
        
        // Chỉ cập nhật mật khẩu nếu quản lý có nhập mật khẩu mới
        if (passwordHash && passwordHash.trim() !== '') {
            updateData.passwordHash = passwordHash; 
        }

        const updated = await prisma.account.update({
            where: { accountID: id },
            data: updateData
        });
        res.json(updated);
    } catch (error) {
        console.error("Lỗi cập nhật Account Prisma:", error);
        res.status(500).json({ error: "Lỗi máy chủ: " + error.message });
    }
};

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const updated = await prisma.account.update({
            where: { accountID: id },
            data: { role: parseInt(role) }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.toggleLock = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const toggled = await prisma.account.update({
            where: { accountID: id },
            data: { isActive }
        });
        res.json(toggled);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
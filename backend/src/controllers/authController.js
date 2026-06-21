const prisma = require('../config/prisma');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Vui lòng nhập tên đăng nhập và mật khẩu." });
        }

        const account = await prisma.account.findFirst({
            where: { username: username }
        });

        if (!account) {
            return res.status(401).json({ error: "Tài khoản không tồn tại." });
        }

        if (!account.isActive) {
            return res.status(403).json({ error: "Tài khoản của bạn đã bị vô hiệu hóa." });
        }

        // Thực tế nên dùng bcrypt để so sánh chuỗi băm, ở đây so sánh chuỗi trực tiếp theo logic hiện tại của bạn
        if (account.passwordHash !== password) {
            return res.status(401).json({ error: "Sai mật khẩu." });
        }

        res.json({
            message: "Đăng nhập thành công",
            user: {
                accountID: account.accountID,
                username: account.username,
                role: account.role,
                branchID: account.branchID
            }
        });
    } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        res.status(500).json({ error: "Lỗi hệ thống nội bộ." });
    }
};
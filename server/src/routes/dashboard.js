const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/summary", async (req, res) => {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: req.userId,
      date: { gte: monthStart, lt: monthEnd },
    },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  for (const t of transactions) {
    const amount = Number(t.amount);
    if (t.type === "income") totalIncome += amount;
    else totalExpense += amount;
  }

  res.json({
    balance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
  });
});

module.exports = router;

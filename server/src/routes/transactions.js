const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const { date_from, date_to, type, category_id } = req.query;

  const where = { userId: req.userId };
  if (type) where.type = type;
  if (category_id) where.categoryId = Number(category_id);
  if (date_from || date_to) {
    where.date = {};
    if (date_from) where.date.gte = new Date(date_from);
    if (date_to) where.date.lte = new Date(date_to);
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { category: true },
    orderBy: { date: "desc" },
  });
  res.json(transactions);
});

router.post("/", async (req, res) => {
  const { title, amount, date, type, categoryId } = req.body;
  if (!title || amount === undefined || !date || !type || !categoryId) {
    return res.status(400).json({ error: "title, amount, date, type and categoryId are required" });
  }
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "type must be 'income' or 'expense'" });
  }

  const category = await prisma.category.findFirst({
    where: { id: Number(categoryId), userId: req.userId },
  });
  if (!category) {
    return res.status(400).json({ error: "categoryId does not belong to this user" });
  }

  const transaction = await prisma.transaction.create({
    data: {
      userId: req.userId,
      categoryId: Number(categoryId),
      title,
      amount,
      date: new Date(date),
      type,
    },
  });
  res.status(201).json(transaction);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  const { title, amount, date, type, categoryId } = req.body;
  const updated = await prisma.transaction.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(amount !== undefined ? { amount } : {}),
      ...(date !== undefined ? { date: new Date(date) } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(categoryId !== undefined ? { categoryId: Number(categoryId) } : {}),
    },
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.transaction.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Transaction not found" });
  }

  await prisma.transaction.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;

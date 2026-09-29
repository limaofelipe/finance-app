const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.userId },
    orderBy: { name: "asc" },
  });
  res.json(categories);
});

router.post("/", async (req, res) => {
  const { name, type, color } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: "name and type are required" });
  }
  if (type !== "income" && type !== "expense") {
    return res.status(400).json({ error: "type must be 'income' or 'expense'" });
  }

  const category = await prisma.category.create({
    data: { userId: req.userId, name, type, color: color || "#d4af37" },
  });
  res.status(201).json(category);
});

router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  const { name, type, color } = req.body;
  const updated = await prisma.category.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(type !== undefined ? { type } : {}),
      ...(color !== undefined ? { color } : {}),
    },
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.category.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    return res.status(404).json({ error: "Category not found" });
  }

  await prisma.category.delete({ where: { id } });
  res.status(204).send();
});

module.exports = router;

require("dotenv").config();
require("express-async-errors");
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const transactionsRoutes = require("./routes/transactions");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

function isPrismaKnownError(err) {
  return err && typeof err.code === "string" && err.code.startsWith("P");
}

app.use((err, req, res, next) => {
  if (isPrismaKnownError(err)) {
    if (err.code === "P2002") {
      return res.status(409).json({ error: "A record with that value already exists" });
    }
    if (err.code === "P2003") {
      return res.status(409).json({ error: "This record is referenced by other data and cannot be modified" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));

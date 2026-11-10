const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const testRoutes = require("./routes/testRoutes");

const categoryRoutes = require("./routes/categoryRoutes");

const productRoutes = require("./routes/productRoutes")

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/products",productRoutes);

connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "FarmConnect API is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
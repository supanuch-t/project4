console.log("เริ่มโปรแกรม");

const express = require("express");
const cors = require("cors");

console.log("โหลด Express สำเร็จ");

const db = require("./db");
const authRoute = require("./routes/auth");

console.log("โหลด db สำเร็จ");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", authRoute);

app.get("/", (req, res) => {
    res.send("Expense Tracker API");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
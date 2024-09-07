// server.js
const express = require("express");
const authRoutes = require("./routes/authRoutes");

const app = express();
app.use(express.json());

app.use("/auth", authRoutes);
app.get("/", (_, res) => {
  res.send("Mastering Authentication System using NodeJs and JWT!");
});
const PORT = 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

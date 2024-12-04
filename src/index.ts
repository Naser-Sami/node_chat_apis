import express, { Request, Response } from "express";
import { json } from "body-parser";
import authRoutes from "./routes/authRoutes";
import conversationRoutes from "./routes/conversationRoutes";

const app = express();
app.use(json());

app.use("/auth", authRoutes);
app.use("/conversations", conversationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

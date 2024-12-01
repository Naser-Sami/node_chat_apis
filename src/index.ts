import express, { Request, Response } from "express";
import { json } from "body-parser";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(json());

app.use("/auth", authRoutes);
// app.get("/", (req: Request, res: Response) => {
//   console.log("Hello World");
//   res.send("Yes its working");
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

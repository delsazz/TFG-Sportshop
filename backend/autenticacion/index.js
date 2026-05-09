import express from "express";
import dotenv from "dotenv";
import authRouter from "./auth.js";
import { authMiddleware, roleMiddleware } from "./middleware.js";
import path from "path";
dotenv.config({ path: "./config.env" });
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use("/api/auth", authRouter);

// Solo admin
app.get("/api/admin", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json({ message: "Bienvenido admin" });
});

// Alumno y admin
app.get("/api/alumnos", authMiddleware, roleMiddleware(["alumno", "admin"]), (req, res) => {
  res.json({ message: "Zona alumnos" });
});

app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
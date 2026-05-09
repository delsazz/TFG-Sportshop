import express from "express";
import pool from "./db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

async function autenticarUsuario(req, res, opciones = {}) {
  const { email, password } = req.body;

  try {
    const resultado = await pool.query("SELECT * FROM Usuario WHERE email = $1", [email]);
    const usuario = resultado.rows[0];

    if (!usuario) {
      return res.status(404).json({ error: "Usuario no existe" });
    }

    const contrasenaCorrecta = bcrypt.compareSync(password, usuario.password);
    if (!contrasenaCorrecta) {
      return res.status(401).json({ error: "Contrasena incorrecta" });
    }

    if (opciones.soloAdmin && usuario.role !== "admin") {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    const token = jwt.sign(
      { id: usuario.id_usuario, role: usuario.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id_usuario,
        email: usuario.email,
        role: usuario.role,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

router.post("/login", (req, res) => autenticarUsuario(req, res));
router.post("/admin/login", (req, res) => autenticarUsuario(req, res, { soloAdmin: true }));

export default router;

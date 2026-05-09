import bcrypt from "bcryptjs";
import pool from "./db.js";
async function anadirUsuarios() {
  const users = [
    { nombre: "Juan", apellidos: "Perez", email: "juan@dotex.com", password: "1234", telefono: "600111111", direccion: "Madrid", role: "alumno" },
    { nombre: "Ana", apellidos: "Gomez", email: "ana@dotex.com", password: "1234", telefono: "600222222", direccion: "Barcelona", role: "alumno" },
    { nombre: "Carlos", apellidos: "Lopez", email: "carlos@dotex.com", password: "1234", telefono: "600333333", direccion: "Valencia", role: "alumno" },
    { nombre: "Admin", apellidos: "Super", email: "admin@dotex.com", password: "admin1234", telefono: "600000000", direccion: "Madrid", role: "admin" }
  ];
  for(const usuario of users) {
    const hashed = bcrypt.hashSync(usuario.password, 10);
    await pool.query(
      "INSERT INTO Usuario(nombre, apellidos, email, password, telefono, direccion, role) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [usuario.nombre, usuario.apellidos, usuario.email, hashed, usuario.telefono, usuario.direccion, usuario.role]
    );
  }
  console.log("Usuarios insertados correctamente");
}
anadirUsuarios();
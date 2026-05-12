export default function RegistroUsuario() {
    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h2 className="card-title text-center mb-4">Registro de Usuario</h2>
                            <form action="/registro" method="POST">
                                <div className="mb-3">
                                    <label htmlFor="nombre" className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="nombre"
                                        name="nombre"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="apellidos" className="form-label">Apellidos</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="apellidos"
                                        name="apellidos"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        id="telefono"
                                        name="telefono"
                                        pattern="[0-9]{7,15}"
                                        placeholder="Solo números"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="direccion" className="form-label">Dirección</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="direccion"
                                        name="direccion"
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Correo electrónico</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Contraseña</label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        id="password"
                                        name="password"
                                        required
                                    />
                                    <div className="form-text">Mínimo 6 caracteres</div>
                                </div>

                                <button type="submit" className="btn btn-primary w-100">Registrarse</button>
                            </form>
                        </div>
                    </div>

                    <p className="text-center mt-3">
                        ¿Ya tienes cuenta? <a href="/login_usuario.html">Inicia sesión aquí</a>
                    </p>
                </div>
            </div>

            <footer className="text-center mt-5 mb-3">
                <p>&copy; 2026 Dotes. Todos los derechos reservados.</p>
            </footer>
        </div>
    );
}
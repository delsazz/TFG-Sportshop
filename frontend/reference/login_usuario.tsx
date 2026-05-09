import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica de validación y envío, basada en login.js
    // Por simplicidad, solo reseteo errores
    setEmailError('');
    setPasswordError('');
    setLoginError('');
    // Validación básica
    if (!email) {
      setEmailError('Email es requerido');
    }
    if (!password) {
      setPasswordError('Contraseña es requerida');
    }
    // Si no hay errores, proceder con login
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesion</h2>
      <form id="loginForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="error-message" id="emailError">{emailError}</span>
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <span className="error-message" id="passwordError">{passwordError}</span>
        </div>
        <button type="submit">Ingresar</button>
        <div className="error-message" id="loginError">{loginError}</div>
      </form>
    </div>
  );
};

export default Login;
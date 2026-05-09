document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    const loginError = document.getElementById('loginError');

    // Reset errors
    emailError.textContent = '';
    passwordError.textContent = '';
    loginError.textContent = '';

    let hasError = false;

    // Basic validation
    if (!email) {
      emailError.textContent = 'Email es requerido';
      hasError = true;
    }
    if (!password) {
      passwordError.textContent = 'Contraseña es requerida';
      hasError = true;
    }

    if (!hasError) {
        console.log('Logging in with:', { email, password });
        // Logic to connect with API would go here
    }
});

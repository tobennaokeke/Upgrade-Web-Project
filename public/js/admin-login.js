// admin-login.js - Strictly Login Mode

document.addEventListener('DOMContentLoaded', () => {
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const submitBtn = document.getElementById('submitBtn');
    const authMessage = document.getElementById('authMessage');
    
    // Get the input elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    // Ensure the title is correct and the button is labeled for login
    authTitle.textContent = 'Admin Login';
    submitBtn.textContent = 'Login';

    // 🚨 SECURITY FIX: Remove all toggle/signup elements from the page
    // This enforces login-only mode by clearing/removing any toggle elements
    const toggleButton = document.getElementById('toggleButton');
    if (toggleButton) {
        toggleButton.remove();
    }
    const toggleTextElement = document.getElementById('toggleText');
    if (toggleTextElement) {
        toggleTextElement.innerHTML = ''; 
    }

    authForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        const endpoint = '/api/admin/login'; // Hardcoded to login mode
        
        authMessage.textContent = 'Processing...';
        authMessage.className = 'message-area loading';
        
        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            // Check for successful response (status 200) and server-side success flag
            if (response.ok && result.success) { 
                authMessage.textContent = `${result.message} Redirecting...`;
                authMessage.className = 'message-area success';
                
                // --- AGGRESSIVE SECURITY FIX: Clear fields and prevent autofill ---
                
                // 1. Force the fields to blank using form.reset()
                authForm.reset(); 
                
                // 2. Trick the browser by changing the input type (forces autofill memory to clear)
                setTimeout(() => {
                    usernameInput.type = 'text'; 
                    passwordInput.type = 'text'; 
                }, 100); 

                // 3. Restore the password input type after another small delay
                setTimeout(() => {
                    passwordInput.type = 'password';
                }, 200);
                
                // -----------------------------------------------------------------
                
                // Redirect to the protected upload page
                setTimeout(() => {
                    window.location.href = 'upload.html'; 
                }, 1500);

            } else {
                // Display error message from the server (e.g., 'Invalid credentials.')
                authMessage.textContent = result.message || 'Login failed due to an unknown error.'; 
                authMessage.className = 'message-area error';
            }

        } catch (error) {
            authMessage.textContent = 'Network Error. Could not connect to the server.';
            authMessage.className = 'message-area error';
            console.error('Auth Failed:', error);
        }
    });
});

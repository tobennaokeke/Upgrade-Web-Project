// upload.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("upload.js loaded successfully!");
    const form = document.getElementById('imageUploadForm');
    const messageEl = document.getElementById('uploadMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Use the FormData API to easily capture all form fields, including the file
        const formData = new FormData(this);

        // --- 1. Indicate Loading State ---
        messageEl.textContent = 'Uploading image... Please wait.';
        messageEl.className = 'message-area loading';
        
        try {
            // --- 2. Send Data to the Node.js Endpoint ---
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                // CRITICAL FIX: Add credentials: 'include' to send the session cookie
                credentials: 'include', 
                // IMPORTANT: Do NOT set Content-Type header when using FormData, 
                // the browser sets it automatically (multipart/form-data)
                body: formData 
            });

            // Get the JSON result from the server
            const result = await response.json();

            // --- 3. Handle Response ---
            if (response.ok) {
                messageEl.textContent = 'Success! Image uploaded to the gallery.';
                messageEl.className = 'message-area success';
                
                // Reset the form fields for the next upload
                form.reset(); 

                // Optional: Automatically redirect the user to the gallery after a delay
                setTimeout(() => {
                    window.location.href = 'gallery.html'; 
                }, 2000);

            } else {
                // Handle server-side errors (e.g., database error, 401 Unauthorized)
                const errorMessage = result.message || 'An unknown error occurred during upload.';
                messageEl.textContent = `Error: ${errorMessage}`;
                messageEl.className = 'message-area error';
                console.error("Server responded with error:", result);
            }

        } catch (error) {
            // Handle network or connection errors
            messageEl.textContent = 'Network Error. Ensure the Node.js server is running.';
            messageEl.className = 'message-area error';
            console.error('Upload Failed:', error);
        }
    });
});
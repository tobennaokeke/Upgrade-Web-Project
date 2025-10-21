// 1. Get the form element and button
const registrationForm = document.querySelector('.registration-form');
const submitBtn = document.getElementById('submit-btn'); // Fetching the submit button
const formMessage = document.createElement('p'); // Create an element for messages
formMessage.id = 'registration-message';
formMessage.className = 'message-area';

// CRITICAL FIX: Ensure both form and button exist before proceeding
if (!registrationForm || !submitBtn) {
    console.error("Initialization Error: Could not find the registration form (.registration-form) or the submit button (#submit-btn).");
    // Stop script execution if key elements are missing
    throw new Error("Registration form elements not found."); 
}

// Insert the dynamic message element right after the form
registrationForm.parentNode.insertBefore(formMessage, registrationForm.nextSibling);

// 2. Define the URL for your server-side script (API Endpoint)
const API_ENDPOINT = 'http://localhost:3000/api/register'; 

// Function to update the message area
function updateMessage(text, type = 'info') {
    formMessage.textContent = text;
    formMessage.className = `message-area ${type}`;
}


// 3. Add an event listener for the form submission
registrationForm.addEventListener('submit', function(event) {
    // Prevent the default form submission (which is currently a GET request)
    event.preventDefault();
    
    // Disable button and show loading state
    submitBtn.textContent = 'Processing...';
    submitBtn.disabled = true;
    updateMessage('Sending registration data...', 'loading');

    // 4. Collect all form data
    const formData = {
        fullName: document.getElementById('full-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phoneNumber: document.getElementById('phone').value.trim(),
        contactMethod: document.getElementById('contact-method').value,
        age: document.getElementById('age').value.trim(),
        skillCategory: document.getElementById('skill-category').value,
        experience: document.getElementById('experience').value,
        employmentStatus: document.getElementById('e-status').value,
        lectureTime: document.getElementById('lecture-time').value,
        learningMethod: document.getElementById('lecture-method').value,
        motivation: document.getElementById('motivation').value.trim(),
    };

    // 5. Basic Client-Side Validation (Highly recommended to add more robust validation)
    if (!formData.fullName || !formData.email || !formData.phoneNumber) {
        updateMessage('Please fill out all required fields (Full Name, Email, Phone Number).', 'error');
        submitBtn.textContent = 'Complete Registration';
        submitBtn.disabled = false;
        return; // Stop submission
    }

    // 6. Call the registration function
    submitRegistration(formData);
});

// 7. Function to handle the actual fetch request
async function submitRegistration(data) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST', // Use POST method to send data securely
            headers: {
                'Content-Type': 'application/json', // Tell the server the content type is JSON
            },
            body: JSON.stringify(data), // Convert the JavaScript object into a JSON string
        });

        // 8. Handle the response from the server
        if (response.ok) {
            // Success response (HTTP status 200-299)
            const result = await response.json(); // If your server sends a JSON response
            
            // FIX: Using updateMessage instead of alert()
            updateMessage(`✅ ${result.message}`, 'success'); 
            registrationForm.reset(); // Clear the form fields

        } else {
            // Error response (HTTP status 4xx or 5xx)
            let errorText;
            try {
                const result = await response.json();
                errorText = result.message;
            } catch (e) {
                // Catches server returning HTML (like a 404), which can't be parsed as JSON
                errorText = await response.text();
                console.error('Server error (Non-JSON Response):', errorText);
                errorText = `Server responded with ${response.status}. Check console for details.`;
            }

            // FIX: Using updateMessage instead of alert()
            updateMessage(`❌ Registration failed. ${errorText}`, 'error');
        }
    } catch (error) {
        // Network error (e.g., cannot reach the server)
        console.error('Network error during registration:', error);
        // FIX: Using updateMessage instead of alert()
        updateMessage('❌ A network error occurred. Please check your connection and try again.', 'error');
    } finally {
        // Reset the button text and state regardless of success or failure
        submitBtn.textContent = 'Complete Registration';
        submitBtn.disabled = false;
    }
}

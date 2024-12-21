// Add an event listener to the login form
document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    // Fetch username and password from the form
    const username = document.getElementById("username").value.trim(); // Trim to avoid unnecessary spaces
    const password = document.getElementById("password").value.trim();

    // Perform a fetch request to the login endpoint
    fetch('https://task-management-1-ki3h.onrender.com/login', {
        method: 'POST', // HTTP POST method for sending login credentials
        headers: {
            'Content-Type': 'application/json', // Send the data in JSON format
        },
        body: JSON.stringify({ username, password }), // Convert login data to JSON
    })
    .then(response => {
        // Check if the response is OK
        if (response.ok) {
            const contentType = response.headers.get('Content-Type');
            if (contentType && contentType.includes('application/json')) {
                return response.json(); // Parse the JSON response
            } else {
                throw new Error('Expected JSON response, but received something else.');
            }
        } else {
            // If login fails, fetch the error message from the response JSON
            return response.json().then(data => {
                throw new Error(data.message || 'Login failed');
            });
        }
    })
    .then(data => {
        // If login is successful, redirect based on the role
        if (data.role === 1) {
            window.location.href = '/admin-dashboard.html'; // Admin dashboard
        } else if (data.role === 0) {
            window.location.href = '/employee-dashboard.html'; // Employee dashboard
        } else {
            throw new Error('Unauthorized role');
        }
    })
    .catch(error => {
        // Handle errors (e.g., login failure or network issues)
        console.error('Error:', error);

        // Display the error message in the designated error message element
        const errorMessageElement = document.getElementById('error-message');
        if (errorMessageElement) {
            errorMessageElement.textContent = error.message || 'An error occurred. Please try again.';
        }
    });
});

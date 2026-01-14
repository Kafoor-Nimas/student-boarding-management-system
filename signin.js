document.addEventListener('DOMContentLoaded', function() {
    
    // User type selection
    const roleBoxes = document.querySelectorAll('.role-box');
    const userTypeInput = document.getElementById('userType');
    
    // Handle role selection - ONLY ONE EVENT LISTENER
    roleBoxes.forEach(box => {
        box.addEventListener('click', function() {
            console.log('Role box clicked!', this.getAttribute('data-role'));
            
            // Remove active class from all boxes
            roleBoxes.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked box
            this.classList.add('active');
            
            // Update hidden input value
            const role = this.getAttribute('data-role');
            if (userTypeInput) {
                userTypeInput.value = role;
                console.log('User type updated to:', role);
            }
            
            // Show visual feedback (optional)
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // REMOVED THE DUPLICATE DEBUG CLICK LISTENERS
    // They were causing conflicts with the main click handler
    
    // Password toggle visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('loginPassword');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            // Toggle eye icon
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    }
    
    // Form submission
    const loginForm = document.getElementById('loginForm');
    const signInBtn = document.getElementById('signInBtn');
    const rememberMe = document.getElementById('rememberMe');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            if (signInBtn) {
                signInBtn.classList.add('loading');
                signInBtn.disabled = true;
            }
            
            // Get form values
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const userType = document.getElementById('userType').value;
            
            // Validate fields
            if (!email || !password) {
                showAlert('Please fill in all required fields', 'error');
                resetButton();
                return;
            }
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showAlert('Please enter a valid email address', 'error');
                resetButton();
                return;
            }
            
            const loginFormData = new FormData(loginForm);
fetch("backend/auth/signin.php", {
    method: "POST",
    body: loginFormData
})
.then(res => res.text())
.then(data => {
    if (data === "success") {
        // Save user session (optional, if you want frontend session too)
        sessionStorage.setItem('stuNestCurrentUser', JSON.stringify({
            email: email,
            userType: userType,
        }));

        showAlert('Login successful! Redirecting...', 'success');

        setTimeout(() => {
            if (userType === 'student') {
                window.location.href = 'student-dashboard.html';
            } else {
                window.location.href = 'owner-dashboard.html';
            }
        }, 1500);

    } else {
        showAlert(data, 'error'); // show PHP errors (invalid password, user not found)
        resetButton();
    }
})
.catch(err => {
    console.error(err);
    showAlert('Something went wrong. Please try again.', 'error');
    resetButton();
});
 // Simulate network delay
        });
    }
    
    // Reset button state
    function resetButton() {
        if (signInBtn) {
            signInBtn.classList.remove('loading');
            signInBtn.disabled = false;
        }
    }
    
    // Check if user is already logged in
    function checkExistingSession() {
        const userData = JSON.parse(localStorage.getItem('stuNestCurrentUser') || sessionStorage.getItem('stuNestCurrentUser') || 'null');
        
        if (userData) {
            // Check if session is expired
            if (userData.expiry) {
                const expiryDate = new Date(userData.expiry);
                if (new Date() > expiryDate) {
                    localStorage.removeItem('stuNestCurrentUser');
                    return;
                }
            }
            
            // Auto-fill email and set user type
            document.getElementById('loginEmail').value = userData.email;
            if (userTypeInput) {
                userTypeInput.value = userData.userType;
            }
            
            // Set active role box
            roleBoxes.forEach(box => {
                if (box.getAttribute('data-role') === userData.userType) {
                    box.classList.add('active');
                } else {
                    box.classList.remove('active');
                }
            });
            
            // Check remember me if stored in localStorage
            if (localStorage.getItem('stuNestCurrentUser')) {
                document.getElementById('rememberMe').checked = true;
            }
            
            showAlert('Welcome back! Your details have been auto-filled.', 'info');
        }
    }
    
    // Auto-fill demo credentials for testing
    function fillDemoCredentials() {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('demo')) {
            document.getElementById('loginEmail').value = 'student@example.com';
            document.getElementById('loginPassword').value = 'Demo@123';
            if (userTypeInput) {
                userTypeInput.value = 'student';
            }
            
            // Set active role box
            roleBoxes.forEach(box => {
                if (box.getAttribute('data-role') === 'student') {
                    box.classList.add('active');
                } else {
                    box.classList.remove('active');
                }
            });
            
            showAlert('Demo credentials loaded. Click Sign In to continue.', 'info');
        }
    }
    
    // Initialize
    checkExistingSession();
    fillDemoCredentials();
    
    // Alert function
    function showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.textContent = message;
        
        // Add to page
        document.body.appendChild(alertDiv);
        
        // Remove after 5 seconds (3 for info messages)
        const removeTime = type === 'info' ? 3000 : 5000;
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, removeTime);
    }
    
    // Add CSS for custom alerts if not already added
    if (!document.querySelector('#alert-styles')) {
        const style = document.createElement('style');
        style.id = 'alert-styles';
        style.textContent = `
            .custom-alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 1000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            
            .custom-alert.success {
                background-color: #4CAF50;
            }
            
            .custom-alert.error {
                background-color: #f44336;
            }
            
            .custom-alert.info {
                background-color: #2196F3;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
});
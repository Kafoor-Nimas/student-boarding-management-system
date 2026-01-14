document.addEventListener('DOMContentLoaded', function() {
    // User type selection
    const roleBoxes = document.querySelectorAll('.role-box');
    const userTypeInput = document.getElementById('userType');
    const universityField = document.getElementById('universityField');
    
    roleBoxes.forEach(box => {
        box.addEventListener('click', function() {
            roleBoxes.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const role = this.getAttribute('data-role');
            userTypeInput.value = role;

            if (universityField) {
                const universityInput = document.getElementById('university');
                if (role === 'student') {
                    universityField.style.display = 'block';
                    if (universityInput) universityInput.required = true;
                } else {
                    universityField.style.display = 'none';
                    if (universityInput) universityInput.required = false;
                }
            }
        });
    });

    // Password validation code here (unchanged)...
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordRules = document.querySelectorAll('.password-rules li');

    function validatePassword() {
        if (!passwordInput) return;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';
        const hasMinLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (passwordRules.length >= 4) {
            passwordRules[0].classList.toggle('valid', hasMinLength);
            passwordRules[0].classList.toggle('invalid', !hasMinLength && password.length > 0);
            passwordRules[1].classList.toggle('valid', hasUppercase);
            passwordRules[1].classList.toggle('invalid', !hasUppercase && password.length > 0);
            passwordRules[2].classList.toggle('valid', hasLowercase);
            passwordRules[2].classList.toggle('invalid', !hasLowercase && password.length > 0);
            passwordRules[3].classList.toggle('valid', hasNumber);
            passwordRules[3].classList.toggle('invalid', !hasNumber && password.length > 0);
        }

        if (confirmPasswordInput) {
            if (password && confirmPassword) {
                if (password === confirmPassword) {
                    confirmPasswordInput.style.borderColor = '#4CAF50';
                    confirmPasswordInput.setCustomValidity('');
                } else {
                    confirmPasswordInput.style.borderColor = '#f44336';
                    confirmPasswordInput.setCustomValidity('Passwords do not match');
                }
            } else {
                confirmPasswordInput.style.borderColor = '';
                confirmPasswordInput.setCustomValidity('');
            }
        }
    }

    if (passwordInput) passwordInput.addEventListener('input', validatePassword);
    if (confirmPasswordInput) confirmPasswordInput.addEventListener('input', validatePassword);

    // Phone number formatting (unchanged)...
    const phoneInput = document.getElementById('phoneNo');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.startsWith('94')) value = '+' + value;
            else if (value.length > 0 && !value.startsWith('+94')) value = '+94 ' + value;
            if (value.length > 4) value = value.replace(/(\+\d{2})(\d{2})(\d{3})(\d{4})/, '$1 $2 $3 $4');
            e.target.value = value;
        });
    }

    // === FORM SUBMISSION ===
    const form = document.querySelector('form');
    form.addEventListener('submit', function (e) {
    e.preventDefault();
});
    const termsCheckbox = document.getElementById('termsCheckbox');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault(); // Prevent page reload

            // TERMS validation
            if (termsCheckbox && !termsCheckbox.checked) {
                showAlert('Please agree to the Terms of Service and Privacy Policy', 'error');
                termsCheckbox.focus();
                return;
            }

            // REQUIRED fields validation
            const requiredFields = ['fullName', 'phoneNo', 'emailAddress', 'password', 'confirmPassword'];
            let isValid = true;
            let firstInvalidField = null;
            requiredFields.forEach(id => {
                const field = document.getElementById(id);
                if (field && !field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#f44336';
                    if (!firstInvalidField) firstInvalidField = field;
                }
            });

            if (userTypeInput.value === 'student') {
                const uni = document.getElementById('university');
                if (uni && !uni.value.trim()) {
                    isValid = false;
                    uni.style.borderColor = '#f44336';
                    if (!firstInvalidField) firstInvalidField = uni;
                }
            }

            if (!isValid) {
                showAlert('Please fill in all required fields', 'error');
                if (firstInvalidField) firstInvalidField.focus();
                return;
            }

            // Password match validation
            if (passwordInput.value !== confirmPasswordInput.value) {
                showAlert('Passwords do not match', 'error');
                confirmPasswordInput.focus();
                return;
            }

            // Password strength validation
            const password = passwordInput.value;
            if (!(password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password))) {
                showAlert('Please ensure your password meets all requirements', 'error');
                passwordInput.focus();
                return;
            }

            // Email format validation
            const emailInput = document.getElementById('emailAddress');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailInput.value)) {
                showAlert('Please enter a valid email address', 'error');
                emailInput.focus();
                return;
            }

            // === FETCH INSIDE SUBMIT ===
            const formData = new FormData(form);

            fetch("backend/auth/signup.php", {
                method: "POST",
                body: formData
            })
            .then(res => res.text())
            .then(data => {
                if (data === "success") {
                    showAlert('Account created successfully! Redirecting to login...', 'success');
                    setTimeout(() => window.location.href = 'signin.html', 2000);
                } else {
                    showAlert(data, 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showAlert('Something went wrong. Please try again.', 'error');
            });

        });
    }

    // ALERT function and CSS (unchanged)...
    function showAlert(message, type = 'info') {
        const existing = document.querySelector('.custom-alert');
        if (existing) existing.remove();
        const div = document.createElement('div');
        div.className = `custom-alert ${type}`;
        div.textContent = message;
        document.body.appendChild(div);
        setTimeout(() => { if(div.parentNode) div.remove(); }, type==='info'?3000:5000);
    }

    const style = document.createElement('style');
    style.textContent = `
        .custom-alert{position:fixed;top:20px;right:20px;padding:15px 25px;border-radius:8px;color:white;font-weight:500;z-index:1000;animation:slideIn 0.3s ease;box-shadow:0 4px 12px rgba(0,0,0,0.15);}
        .custom-alert.success{background-color:#4CAF50;}
        .custom-alert.error{background-color:#f44336;}
        .custom-alert.info{background-color:#2196F3;}
        @keyframes slideIn{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}
    `;
    document.head.appendChild(style);

});

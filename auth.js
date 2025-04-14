document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const heroSignupBtn = document.getElementById('hero-signup-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const closeBtns = document.querySelectorAll('.close-btn');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginMessage = document.getElementById('login-message');
    const signupMessage = document.getElementById('signup-message');
    const successCloseBtn = document.getElementById('success-close-btn');
    const errorCloseBtn = document.getElementById('error-close-btn');
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');

    // Show modals
    function showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Hide modals
    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Show success modal
    function showSuccessModal(message = 'Your account has been created successfully.') {
        document.getElementById('success-message').textContent = message;
        showModal(successModal);
    }

    // Show error modal
    function showErrorModal(message = 'There was an error processing your request.') {
        document.getElementById('error-message').textContent = message;
        showModal(errorModal);
    }

    // Toggle auth/user menu based on login state
    function toggleAuthUI(user) {
        if (user) {
            // User is logged in
            authButtons.style.display = 'none';
            userMenu.style.display = 'block';
        } else {
            // User is logged out
            authButtons.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }

    // Event listeners for buttons
    if (loginBtn) loginBtn.addEventListener('click', () => showModal(loginModal));
    if (signupBtn) signupBtn.addEventListener('click', () => showModal(signupModal));
    if (heroSignupBtn) heroSignupBtn.addEventListener('click', () => showModal(signupModal));
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    // Close modals when clicking X
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            hideModal(modal);
        });
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Switch between login and signup
    if (switchToSignup) switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(loginModal);
        showModal(signupModal);
    });

    if (switchToLogin) switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        hideModal(signupModal);
        showModal(loginModal);
    });

    // Close success/error modals
    if (successCloseBtn) successCloseBtn.addEventListener('click', () => hideModal(successModal));
    if (errorCloseBtn) errorCloseBtn.addEventListener('click', () => hideModal(errorModal));

    // Login form submission
    if (loginForm) loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                loginMessage.textContent = "Login successful! Redirecting...";
                loginMessage.style.color = "green";
                
                // Create default subscription if none exists
                createDefaultSubscription(user.uid);
                
                // Redirect to plans page after successful login
                setTimeout(() => {
                    window.location.href = "plans.html";
                }, 1000);
            })
            .catch((error) => {
                handleAuthError(error, loginMessage);
            });
    });

    // Signup form submission
    if (signupForm) signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        // Validate passwords match
        if (password !== confirm) {
            signupMessage.textContent = "Passwords don't match!";
            signupMessage.style.color = "red";
            return;
        }
        
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Save additional user data to database
                return database.ref('users/' + user.uid).set({
                    name: name,
                    email: email,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                }).then(() => {
                    // Create default subscription
                    return createDefaultSubscription(user.uid);
                }).then(() => {
                    // Show success and clear form
                    signupMessage.textContent = "";
                    signupForm.reset();
                    hideModal(signupModal);
                    showSuccessModal();
                    
                    // Redirect to plans page after delay
                    setTimeout(() => {
                        window.location.href = "plans.html";
                    }, 2000);
                });
            })
            .catch((error) => {
                handleAuthError(error, signupMessage);
            });
    });

    // Create default subscription for new users
    function createDefaultSubscription(userId) {
        const defaultSubscription = {
            basic: {
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }
        };
        
        return database.ref('users/' + userId + '/subscriptions').update(defaultSubscription);
    }

    // Handle logout
    function handleLogout() {
        auth.signOut().then(() => {
            // Redirect to home page after logout
            window.location.href = "index.html";
        }).catch((error) => {
            console.error("Logout error:", error);
            showErrorModal("Failed to logout. Please try again.");
        });
    }

    // Handle auth errors
    function handleAuthError(error, messageElement = null) {
        let errorMessage = 'Authentication failed. Please try again.';
        
        switch(error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password should be at least 6 characters.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Invalid email or password.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage = 'Email/password accounts are not enabled.';
                break;
            default:
                console.error("Auth error:", error);
        }
        
        if (messageElement) {
            messageElement.textContent = errorMessage;
            messageElement.style.color = "red";
        } else {
            showErrorModal(errorMessage);
        }
    }

    // Check auth state
    auth.onAuthStateChanged((user) => {
        toggleAuthUI(user);
        
        if (user) {
            // User is signed in
            console.log("User is logged in:", user.email);
        } else {
            // User is signed out
            console.log("User is logged out");
        }
    });
});
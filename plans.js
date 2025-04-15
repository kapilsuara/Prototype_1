document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const logoutBtn = document.getElementById('logout-btn');
    const userFlows = document.getElementById('user-flows');
    const planButtons = document.querySelectorAll('.plan-card .btn');
    const confirmationModal = document.getElementById('confirmation-modal');
    const successModal = document.getElementById('success-modal');
    const cancelChangeBtn = document.getElementById('cancel-change');
    const confirmChangeBtn = document.getElementById('confirm-change');
    const closeBtns = document.querySelectorAll('.close-btn');
    const addFlowBtn = document.getElementById('add-flow-btn');
    const refreshFlowsBtn = document.getElementById('refresh-flows-btn');
    const flowForm = document.getElementById('flow-form');
    const newFlowIdInput = document.getElementById('new-flow-id');
    const saveFlowBtn = document.getElementById('save-flow-btn');
    const cancelFlowBtn = document.getElementById('cancel-flow-btn');
    const successCloseBtn = document.getElementById('success-close-btn');
    
    let selectedPlan = null;
    let currentUser = null;
    let currentUserEmail = null;

    // Initialize the page
    initPage();

    function initPage() {
        // Check auth state
        auth.onAuthStateChanged((user) => {
            if (user) {
                // User is signed in
                currentUser = user;
                currentUserEmail = user.email;
                loadUserFlows(user.email);
                setupEventListeners();
            } else {
                // User is signed out, redirect to login
                window.location.href = 'index.html';
            }
        });
    }

    function setupEventListeners() {
        // Logout button
        logoutBtn.addEventListener('click', handleLogout);

        // Plan selection buttons
        planButtons.forEach(button => {
            button.addEventListener('click', handlePlanSelection);
        });

        // Confirm plan change
        confirmChangeBtn.addEventListener('click', confirmPlanChange);

        // Cancel plan change
        cancelChangeBtn.addEventListener('click', cancelPlanChange);

        // Add Flow ID button
        addFlowBtn.addEventListener('click', showFlowForm);

        // Cancel adding new Flow ID
        cancelFlowBtn.addEventListener('click', hideFlowForm);

        // Save new Flow ID
        saveFlowBtn.addEventListener('click', saveNewFlowId);

        // Refresh Flow IDs
        refreshFlowsBtn.addEventListener('click', refreshFlows);

        // Close success modal
        successCloseBtn.addEventListener('click', () => hideModal(successModal));

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
    }

    function handleLogout() {
        auth.signOut().then(() => {
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error("Logout error:", error);
            showError("Failed to logout. Please try again.");
        });
    }

    function handlePlanSelection() {
        selectedPlan = this.getAttribute('data-plan');
        document.getElementById('confirmation-title').textContent = `Upgrade to ${capitalizeFirstLetter(selectedPlan)} Plan`;
        document.getElementById('confirmation-message').textContent = 
            `Are you sure you want to upgrade to the ${capitalizeFirstLetter(selectedPlan)} plan?`;
        showModal(confirmationModal);
    }

    function confirmPlanChange() {
        if (selectedPlan) {
            updateUserPlan(selectedPlan);
        }
        hideModal(confirmationModal);
    }

    function cancelPlanChange() {
        hideModal(confirmationModal);
        selectedPlan = null;
    }

    function showFlowForm() {
        flowForm.style.display = 'block';
        addFlowBtn.style.display = 'none';
        newFlowIdInput.focus();
    }

    function hideFlowForm() {
        flowForm.style.display = 'none';
        addFlowBtn.style.display = 'block';
        newFlowIdInput.value = '';
    }

    function saveNewFlowId() {
        const newFlowId = newFlowIdInput.value.trim();
        if (newFlowId) {
            saveFlowId(currentUserEmail, newFlowId)
                .then(() => {
                    hideFlowForm();
                    showSuccess('Flow ID added successfully!');
                })
                .catch((error) => {
                    console.error("Error saving flow:", error);
                    showError('Failed to save Flow ID. Please try again.');
                });
        } else {
            showError('Please enter a valid Flow ID');
        }
    }

    function refreshFlows() {
        if (currentUserEmail) {
            loadUserFlows(currentUserEmail);
            showSuccess('Flow IDs refreshed');
        }
    }

    // Load user flows from Firebase
    function loadUserFlows(userEmail) {
        userFlows.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading your Flow IDs...</p>
            </div>
        `;
        
        // Clean the email to use as a key (remove special characters)
        const cleanEmail = userEmail.replace(/[.#$[\]]/g, '-');
        
        database.ref('Mail_ID/' + cleanEmail).once('value')
            .then((snapshot) => {
                const flowsData = snapshot.val();
                displayUserFlows(flowsData);
            })
            .catch((error) => {
                console.error("Error loading flows:", error);
                showDefaultFlowMessage();
            });
    }

    // Display user flows in the UI
    function displayUserFlows(flowsData) {
        if (!flowsData) {
            showDefaultFlowMessage();
            return;
        }

        let html = '<div class="flows-grid">';
        let flowCount = 0;
        
        // Convert flowsData object to array
        const flowsArray = Object.values(flowsData);
        
        flowsArray.forEach((flowId, index) => {
            if (flowId) {
                flowCount++;
                html += `
                    <div class="flow-card">
                        <h3>Flow ID #${flowCount}</h3>
                        <p><strong>ID:</strong> 
                            <a href="twilio.html?flowId=${encodeURIComponent(flowId)}" class="flow-link">${flowId}</a>
                        </p>
                        <div class="flow-actions">
                            <button class="btn btn-small" data-flow-index="${index}" onclick="editFlowId(this)">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-small btn-outline" data-flow-index="${index}" onclick="deleteFlowId(this)">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        userFlows.innerHTML = html;
    }

    function showDefaultFlowMessage() {
        userFlows.innerHTML = `
            <p class="flow-message">
                <a href="twilio.html" class="flow-link">Your AI Agent Flow ID</a>
            </p>
        `;
    }

    // Save new Flow ID to Firebase
    function saveFlowId(userEmail, flowId) {
        return new Promise((resolve, reject) => {
            const cleanEmail = userEmail.replace(/[.#$[\]]/g, '-');
            
            // Get current flows to determine the next index
            database.ref('Mail_ID/' + cleanEmail).once('value')
                .then((snapshot) => {
                    const currentFlows = snapshot.val() || {};
                    const nextIndex = Object.keys(currentFlows).length + 1;
                    
                    // Save the new flow ID
                    return database.ref('Mail_ID/' + cleanEmail + '/' + nextIndex).set(flowId);
                })
                .then(() => {
                    loadUserFlows(userEmail);
                    resolve();
                })
                .catch((error) => {
                    console.error("Error saving flow ID:", error);
                    reject(error);
                });
        });
    }

    // Update user's plan in Firebase
    function updateUserPlan(planId) {
        if (!currentUser) return;

        const planData = {
            [planId]: {
                status: 'active',
                startDate: new Date().toISOString(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString()
            }
        };

        database.ref('users/' + currentUser.uid + '/subscriptions').update(planData)
            .then(() => {
                showSuccess('Plan updated successfully!');
                // You could reload the page here if needed
                // window.location.reload();
            })
            .catch((error) => {
                console.error("Error updating plan:", error);
                showError("There was an error updating your plan. Please try again.");
            });
    }

    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Show modal
    function showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Hide modal
    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Show success message
    function showSuccess(message) {
        document.getElementById('success-message').textContent = message;
        showModal(successModal);
    }

    // Show error message
    function showError(message) {
        alert(message); // In a real app, you'd want a prettier error display
    }

    // Global functions for flow actions
    window.editFlowId = function(button) {
        const flowIndex = button.getAttribute('data-flow-index');
        const flowCards = document.querySelectorAll('.flow-card');
        const flowCard = flowCards[flowIndex];
        const currentFlowId = flowCard.querySelector('p').textContent.replace('ID: ', '').trim();
        
        const newId = prompt("Edit Flow ID", currentFlowId);
        if (newId && newId !== currentFlowId) {
            updateFlowId(currentUserEmail, flowIndex, newId)
                .then(() => {
                    showSuccess('Flow ID updated successfully!');
                })
                .catch((error) => {
                    console.error("Error updating flow:", error);
                    showError('Failed to update Flow ID. Please try again.');
                });
        }
    };

    window.deleteFlowId = function(button) {
        if (confirm("Are you sure you want to delete this Flow ID?")) {
            const flowIndex = button.getAttribute('data-flow-index');
            deleteFlow(currentUserEmail, flowIndex)
                .then(() => {
                    showSuccess('Flow ID deleted successfully!');
                })
                .catch((error) => {
                    console.error("Error deleting flow:", error);
                    showError('Failed to delete Flow ID. Please try again.');
                });
        }
    };

    function updateFlowId(userEmail, index, newId) {
        return new Promise((resolve, reject) => {
            const cleanEmail = userEmail.replace(/[.#$[\]]/g, '-');
            
            database.ref('Mail_ID/' + cleanEmail + '/' + index).set(newId)
                .then(() => {
                    loadUserFlows(userEmail);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    function deleteFlow(userEmail, index) {
        return new Promise((resolve, reject) => {
            const cleanEmail = userEmail.replace(/[.#$[\]]/g, '-');
            
            database.ref('Mail_ID/' + cleanEmail + '/' + index).remove()
                .then(() => {
                    loadUserFlows(userEmail);
                    resolve();
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
});
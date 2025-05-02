// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBp3URYWEW1AQgPC734BqN1zLQj7HaQ2yo",
    authDomain: "moneychoicewebsite.firebaseapp.com",
    databaseURL: "https://moneychoicewebsite-default-rtdb.firebaseio.com",
    projectId: "moneychoicewebsite",
    storageBucket: "moneychoicewebsite.appspot.com",
    messagingSenderId: "395104519801",
    appId: "1:395104519801:web:b918492f3faa603f9676a8"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener('DOMContentLoaded', function() {
    // Image upload functionality
    const uploadTrigger = document.getElementById('upload-trigger');
    const imageUpload = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const imageOptions = document.querySelectorAll('.image-option');
    let selectedImage = '';
    
    uploadTrigger.addEventListener('click', function() {
        imageUpload.click();
    });
    
    imageUpload.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                imagePreview.src = event.target.result;
                imagePreview.style.display = 'block';
                selectedImage = event.target.result;
                
                // Remove selection from suggested images
                imageOptions.forEach(option => {
                    option.classList.remove('selected');
                });
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Suggested image selection
    imageOptions.forEach(option => {
        option.addEventListener('click', function() {
            imageOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            selectedImage = this.getAttribute('data-image');
            imagePreview.src = selectedImage;
            imagePreview.style.display = 'block';
            imageUpload.value = ''; // Clear file input
        });
    });
    
    // Rich text editor functionality
    const editorButtons = document.querySelectorAll('.editor-btn');
    const blogContent = document.getElementById('blog-content');
    
    editorButtons.forEach(button => {
        button.addEventListener('click', function() {
            const command = this.getAttribute('data-command');
            const value = this.getAttribute('data-value');
            
            if (command === 'createLink') {
                const url = prompt('Enter the URL:');
                if (url) document.execCommand(command, false, url);
            } else if (command === 'insertImage') {
                const url = prompt('Enter the image URL:');
                if (url) document.execCommand(command, false, url);
            } else if (value) {
                document.execCommand(command, false, value);
            } else {
                document.execCommand(command, false, null);
            }
            
            // Toggle active state for formatting buttons
            if (['bold', 'italic', 'underline'].includes(command)) {
                this.classList.toggle('active');
            }
            
            blogContent.focus();
        });
    });
    
    // Form submission
    const blogForm = document.getElementById('blog-form');
    const successModal = document.getElementById('success-modal');
    const errorModal = document.getElementById('error-modal');
    const publishBtn = document.getElementById('publish-btn');
    const saveDraftBtn = document.getElementById('save-draft-btn');
    
    blogForm.addEventListener('submit', function(e) {
        e.preventDefault();
        publishBlog();
    });
    
    function publishBlog() {
        // Get form values
        const title = document.getElementById('blog-title').value;
        const author = document.getElementById('blog-author').value;
        const excerpt = document.getElementById('blog-excerpt').value;
        const content = blogContent.innerHTML;
        const tags = document.getElementById('blog-tags').value;
        
        // Validate required fields
        if (!title || !author || !excerpt || !content) {
            showErrorModal('Please fill in all required fields');
            return;
        }
        
        // Use selected image or default financial image
        const imageUrl = selectedImage || 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1511&q=80';
        
        // Create blog data object
        const blogData = {
            title,
            author,
            excerpt,
            content,
            tags: tags.split(',').map(tag => tag.trim()),
            imageUrl,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            updatedAt: firebase.database.ServerValue.TIMESTAMP,
            status: 'published',
            views: 0,
            likes: 0
        };
        
        // Show loading state
        publishBtn.disabled = true;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
        
        // Save to Firebase
        const newBlogRef = database.ref('blogs').push();
        newBlogRef.set(blogData)
            .then(() => {
                showSuccessModal('Your blog post has been published successfully!');
                // Clear the form
                blogForm.reset();
                blogContent.innerHTML = '';
                imagePreview.style.display = 'none';
                selectedImage = '';
                
                // Remove selection from suggested images
                imageOptions.forEach(option => {
                    option.classList.remove('selected');
                });
                
                // Remove draft from localStorage if it exists
                localStorage.removeItem('blogDraft');
            })
            .catch(error => {
                showErrorModal('Error publishing blog: ' + error.message);
            })
            .finally(() => {
                publishBtn.disabled = false;
                publishBtn.textContent = 'Publish Blog';
            });
    }
    
    // Save draft functionality
    saveDraftBtn.addEventListener('click', function() {
        // Get form values
        const title = document.getElementById('blog-title').value;
        const author = document.getElementById('blog-author').value;
        const excerpt = document.getElementById('blog-excerpt').value;
        const content = blogContent.innerHTML;
        const tags = document.getElementById('blog-tags').value;
        const imageUrl = selectedImage || '';
        
        // Save to localStorage
        const draft = {
            title,
            author,
            excerpt,
            content,
            tags,
            imageUrl,
            savedAt: new Date().toISOString()
        };
        
        localStorage.setItem('blogDraft', JSON.stringify(draft));
        
        // Show success message
        const statusMessage = document.createElement('div');
        statusMessage.className = 'status-message success';
        statusMessage.textContent = 'Draft saved successfully!';
        
        const formActions = document.querySelector('.form-actions');
        formActions.insertBefore(statusMessage, saveDraftBtn);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            statusMessage.remove();
        }, 3000);
    });
    
    // Check for saved draft on page load
    const savedDraft = localStorage.getItem('blogDraft');
    if (savedDraft) {
        const draft = JSON.parse(savedDraft);
        document.getElementById('blog-title').value = draft.title || '';
        document.getElementById('blog-author').value = draft.author || '';
        document.getElementById('blog-excerpt').value = draft.excerpt || '';
        blogContent.innerHTML = draft.content || '';
        document.getElementById('blog-tags').value = draft.tags || '';
        
        if (draft.imageUrl) {
            selectedImage = draft.imageUrl;
            imagePreview.src = draft.imageUrl;
            imagePreview.style.display = 'block';
        }
    }
    
    // Modal functions
    function showSuccessModal(message) {
        document.getElementById('success-message').textContent = message;
        successModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    function showErrorModal(message) {
        document.getElementById('error-message').textContent = message;
        errorModal.style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    // Close modals
    document.querySelectorAll('.close-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
            document.body.classList.remove('modal-open');
        });
    });
    
    document.getElementById('success-close-btn').addEventListener('click', function() {
        successModal.style.display = 'none';
        document.body.classList.remove('modal-open');
        window.location.href = 'blog.html';
    });
    
    document.getElementById('error-close-btn').addEventListener('click', function() {
        errorModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    });
});
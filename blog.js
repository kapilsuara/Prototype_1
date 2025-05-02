document.addEventListener('DOMContentLoaded', function() {
    // Firebase configuration
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

    // Configuration
    const POSTS_PER_PAGE = 6;
    let currentPage = 1;
    let currentCategory = 'all';
    let currentSearchTerm = '';
    let totalPosts = 0;
    let allPosts = [];

    // DOM Elements
    const blogGrid = document.getElementById('blog-grid');
    const pagination = document.getElementById('pagination');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const searchForm = document.getElementById('blog-search-form');
    const searchInput = document.getElementById('blog-search-input');

    // Initialize
    fetchBlogPosts();

    // Event Listeners
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentCategory = btn.dataset.category;
            currentPage = 1;
            fetchBlogPosts();
        });
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1;
        fetchBlogPosts();
    });

    // Fetch blog posts from Firebase
    function fetchBlogPosts() {
        showLoadingState();
        
        const postsRef = database.ref('blogs');
        
        postsRef.once('value')
            .then((snapshot) => {
                const postsData = snapshot.val();
                
                // Convert Firebase object to array and filter only published posts
                allPosts = postsData ? Object.entries(postsData).map(([key, value]) => ({
                    id: key,
                    ...value,
                    // Ensure status is 'published' if not specified
                    status: value.status || 'published'
                })).filter(post => post.status === 'published') : [];
                
                totalPosts = allPosts.length;
                
                // Process and filter posts
                const filteredPosts = filterPosts(allPosts);
                
                if (filteredPosts.length === 0) {
                    showNoResults();
                } else {
                    const paginatedPosts = paginatePosts(filteredPosts);
                    renderBlogPosts(paginatedPosts);
                    setupPagination(filteredPosts.length);
                }
            })
            .catch((error) => {
                console.error('Error fetching blog posts:', error);
                showErrorState(error);
            });
    }

    // Filter posts based on category and search term
    function filterPosts(posts) {
        return posts.filter(post => {
            // Filter by category (using tags since category field doesn't exist)
            const categoryMatch = currentCategory === 'all' || 
                                (post.tags && post.tags.includes(currentCategory));
            
            // Filter by search term
            const searchMatch = !currentSearchTerm || 
                              (post.title && post.title.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
                              (post.content && post.content.toLowerCase().includes(currentSearchTerm.toLowerCase())) ||
                              (post.excerpt && post.excerpt.toLowerCase().includes(currentSearchTerm.toLowerCase()));
            
            return categoryMatch && searchMatch;
        });
    }

    // Paginate the filtered posts
    function paginatePosts(posts) {
        // Sort posts by date (newest first)
        posts.sort((a, b) => {
            const dateA = a.createdAt || 0;
            const dateB = b.createdAt || 0;
            return dateB - dateA; // Sort descending
        });
        
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        return posts.slice(startIndex, startIndex + POSTS_PER_PAGE);
    }

    // Render blog posts to the grid
    function renderBlogPosts(posts) {
        // Clear existing content
        blogGrid.innerHTML = '';

        // Create regular posts
        posts.forEach(post => {
            blogGrid.appendChild(createBlogCard(post));
        });
    }

    // Create a blog card element
    function createBlogCard(post) {
        const card = document.createElement('article');
        card.className = `blog-card animate__animated animate__fadeIn`;
        
        // Use first tag as category if exists
        const category = post.tags && post.tags.length > 0 ? post.tags[0] : 'uncategorized';
        
        const cardContent = `
            <div class="blog-card-image">
                <img src="${post.imageUrl || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}" alt="${post.title || 'Blog post'}">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                    <span><i class="far fa-eye"></i> ${post.views ? post.views.toLocaleString() : '0'}</span>
                    <span class="category-tag" style="background: ${getCategoryColor(category)}">
                        ${getCategoryName(category)}
                    </span>
                </div>
                <h3>${post.title || 'Untitled Post'}</h3>
                <p>${post.excerpt || 'Read this insightful article'}</p>
                <a href="/blog/${post.id}" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        card.innerHTML = cardContent;
        return card;
    }

    // Set up pagination controls
    function setupPagination(filteredPostCount) {
        const totalPages = Math.ceil(filteredPostCount / POSTS_PER_PAGE);
        
        // Clear existing pagination
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevBtn = createPaginationButton(
            '<i class="fas fa-chevron-left"></i>',
            currentPage > 1 ? currentPage - 1 : null,
            currentPage === 1
        );
        pagination.appendChild(prevBtn);
        
        // Page number buttons
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        // Adjust if we're at the end
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            pagination.appendChild(createPaginationButton(1, 1));
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
        }
        
        // Page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = createPaginationButton(
                i,
                i,
                i === currentPage
            );
            pagination.appendChild(pageBtn);
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                pagination.appendChild(ellipsis);
            }
            pagination.appendChild(createPaginationButton(totalPages, totalPages));
        }
        
        // Next button
        const nextBtn = createPaginationButton(
            '<i class="fas fa-chevron-right"></i>',
            currentPage < totalPages ? currentPage + 1 : null,
            currentPage === totalPages
        );
        pagination.appendChild(nextBtn);
    }

    // Helper functions
    function formatDate(timestamp) {
        if (!timestamp) return 'No date';
        
        // Convert Firebase timestamp (milliseconds) to Date
        const date = new Date(Number(timestamp));
        
        if (isNaN(date.getTime())) return 'Invalid date';
        
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    function getCategoryName(category) {
        const categories = {
            'business': 'Business',
            'finance': 'Finance',
            'investing': 'Investing',
            'market': 'Market',
            'success': 'Success'
        };
        return categories[category?.toLowerCase()] || 'Uncategorized';
    }

    function getCategoryColor(category) {
        const colors = {
            'business': 'rgba(67, 97, 238, 0.1)',
            'finance': 'rgba(46, 204, 113, 0.1)',
            'investing': 'rgba(241, 196, 15, 0.1)',
            'market': 'rgba(155, 89, 182, 0.1)',
            'success': 'rgba(231, 76, 60, 0.1)'
        };
        return colors[category?.toLowerCase()] || 'rgba(149, 165, 166, 0.1)';
    }

    // Show loading state
    function showLoadingState() {
        blogGrid.innerHTML = `
            <div class="loading-posts">
                <div class="loading-spinner"></div>
                <p>Loading articles...</p>
            </div>
        `;
        pagination.innerHTML = '';
    }

    // Show no results state
    function showNoResults() {
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Articles Found</h3>
                <p>Try a different search or category.</p>
                <button class="btn btn-primary" onclick="resetFilters()">Show All</button>
            </div>
        `;
        pagination.innerHTML = '';
    }

    // Show error state with details
    function showErrorState(error = null) {
        const errorDetails = error ? `
            <div class="error-details">
                <p><small>${error.message || 'Unknown error'}</small></p>
            </div>
        ` : '';
        
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>We're having trouble loading the blog posts.</p>
                ${errorDetails}
                <button class="btn btn-primary" onclick="fetchBlogPosts()">Retry</button>
            </div>
        `;
        pagination.innerHTML = '';
    }

    // Global reset function
    window.resetFilters = function() {
        currentCategory = 'all';
        currentSearchTerm = '';
        searchInput.value = '';
        currentPage = 1;
        
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        
        fetchBlogPosts();
    };
});
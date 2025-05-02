document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] DOM fully loaded and parsed');
    
    // ======================
    // 1. INITIALIZATION DEBUG
    // ======================
    if (typeof firebase === 'undefined') {
        console.error('[FIREBASE ERROR] Firebase SDK not loaded');
        showErrorState({
            message: 'Critical Error: Firebase not loaded',
            details: 'Please check your internet connection and try refreshing the page.'
        });
        return;
    }

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

    // Initialize Firebase with error handling
    let database;
    try {
        console.log('[DEBUG] Initializing Firebase...');
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        console.log('[DEBUG] Firebase initialized successfully');
    } catch (error) {
        console.error('[FIREBASE ERROR] Initialization failed:', error);
        showErrorState({
            message: 'Failed to initialize database',
            details: error.message
        });
        return;
    }

    // ======================
    // 2. CONFIGURATION
    // ======================
    const POSTS_PER_PAGE = 6;
    let currentPage = 1;
    let currentCategory = 'all';
    let currentSearchTerm = '';
    let totalPosts = 0;
    let allPosts = [];

    // ======================
    // 3. DOM ELEMENTS DEBUG
    // ======================
    const blogGrid = document.getElementById('blog-grid');
    const pagination = document.getElementById('pagination');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const searchForm = document.getElementById('blog-search-form');
    const searchInput = document.getElementById('blog-search-input');

    // Debug DOM elements
    if (!blogGrid) {
        console.error('[DOM ERROR] blog-grid element not found');
        showErrorState({ message: 'Page configuration error' });
        return;
    }
    if (!pagination) console.warn('[DOM WARNING] pagination element not found');
    if (!searchForm) console.warn('[DOM WARNING] blog-search-form not found');
    if (!searchInput) console.warn('[DOM WARNING] blog-search-input not found');

    // ======================
    // 4. MAIN FUNCTIONALITY
    // ======================
    fetchBlogPosts();

    // ======================
    // 5. EVENT LISTENERS
    // ======================
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            console.log(`[UI EVENT] Category button clicked: ${btn.dataset.category}`);
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.category;
            currentPage = 1;
            fetchBlogPosts();
        });
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearchTerm = searchInput.value.trim();
        console.log(`[UI EVENT] Search submitted: "${currentSearchTerm}"`);
        currentPage = 1;
        fetchBlogPosts();
    });

    // ======================
    // 6. CORE FUNCTIONS
    // ======================
    function fetchBlogPosts() {
        console.log('[DATA] Starting fetchBlogPosts');
        showLoadingState();
        
        const postsRef = database.ref('blogs');
        
        postsRef.once('value')
            .then((snapshot) => {
                if (!snapshot.exists()) {
                    console.warn('[DATA WARNING] No data exists at the blogs reference');
                    showNoResults();
                    return;
                }
                
                const postsData = snapshot.val();
                console.log('[DATA] Raw Firebase data received:', postsData);
                
                // Process posts data with validation
                allPosts = Object.entries(postsData).map(([key, value]) => {
                    // Validate required fields
                    if (!value.title) {
                        console.warn(`[DATA WARNING] Post ${key} missing title`);
                    }
                    if (!value.content) {
                        console.warn(`[DATA WARNING] Post ${key} missing content`);
                    }
                    
                    return {
                        id: key,
                        title: value.title || 'Untitled Post',
                        excerpt: value.excerpt || '',
                        content: value.content || '<p>No content available for this post.</p>',
                        tags: Array.isArray(value.tags) ? value.tags : [],
                        status: value.status || 'published',
                        createdAt: typeof value.createdAt === 'number' ? value.createdAt : Date.now(),
                        views: typeof value.views === 'number' ? value.views : 0,
                        imageUrl: typeof value.imageUrl === 'string' ? value.imageUrl : 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80'
                    };
                }).filter(post => {
                    if (post.status !== 'published') {
                        console.log(`[DATA FILTER] Skipping unpublished post: ${post.id}`);
                        return false;
                    }
                    return true;
                });
                
                totalPosts = allPosts.length;
                console.log(`[DATA] Filtered ${totalPosts} published posts`);
                
                if (totalPosts === 0) {
                    console.warn('[DATA WARNING] No published posts found');
                    showNoResults();
                    return;
                }
                
                // Filter and paginate
                const filteredPosts = filterPosts(allPosts);
                console.log(`[DATA] ${filteredPosts.length} posts after filtering`);
                
                if (filteredPosts.length === 0) {
                    showNoResults();
                } else {
                    const paginatedPosts = paginatePosts(filteredPosts);
                    renderBlogPosts(paginatedPosts);
                    setupPagination(filteredPosts.length);
                }
            })
            .catch((error) => {
                console.error('[DATA ERROR] Fetching posts failed:', error);
                showErrorState({
                    message: 'Failed to load blog posts',
                    details: error.message
                });
            });
    }

    function filterPosts(posts) {
        return posts.filter(post => {
            const categoryMatch = currentCategory === 'all' || 
                                post.tags.includes(currentCategory);
            
            const searchTerm = currentSearchTerm.toLowerCase();
            const searchMatch = !currentSearchTerm || 
                              post.title.toLowerCase().includes(searchTerm) ||
                              post.content.toLowerCase().includes(searchTerm) ||
                              post.excerpt.toLowerCase().includes(searchTerm);
            
            return categoryMatch && searchMatch;
        });
    }

    function paginatePosts(posts) {
        posts.sort((a, b) => b.createdAt - a.createdAt);
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        return posts.slice(startIndex, endIndex);
    }

    function renderBlogPosts(posts) {
        console.log(`[RENDER] Displaying ${posts.length} posts`);
        blogGrid.innerHTML = '';

        if (posts.length === 0) {
            console.warn('[RENDER WARNING] No posts to render');
            return;
        }

        posts.forEach(post => {
            try {
                const card = createBlogCard(post);
                blogGrid.appendChild(card);
            } catch (error) {
                console.error(`[RENDER ERROR] Failed to render post ${post.id}:`, error);
                const errorCard = document.createElement('div');
                errorCard.className = 'blog-card-error';
                errorCard.innerHTML = `
                    <h3>Error Loading Post</h3>
                    <p>Could not display this blog post.</p>
                `;
                blogGrid.appendChild(errorCard);
            }
        });
    }

    function createBlogCard(post) {
        const card = document.createElement('article');
        card.className = 'blog-card animate__animated animate__fadeIn';
        
        const category = post.tags.length > 0 ? post.tags[0] : 'uncategorized';
        
        card.innerHTML = `
            <div class="blog-card-image">
                <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                    <span><i class="far fa-eye"></i> ${post.views.toLocaleString()}</span>
                    <span class="category-tag" style="background: ${getCategoryColor(category)}">
                        ${getCategoryName(category)}
                    </span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="#${post.id}" class="blog-card-link view-post-btn" data-post-id="${post.id}">
                    Read More <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        
        return card;
    }

    // ======================
    // 7. POST VIEWING SYSTEM
    // ======================
    function handlePostViewing() {
        const postId = window.location.hash.substring(1);
        console.log(`[POST VIEW] Handling post view for ID: ${postId}`);
        
        if (!postId) {
            console.log('[POST VIEW] No post ID in hash');
            return;
        }
        
        if (!allPosts || allPosts.length === 0) {
            console.warn('[POST VIEW ERROR] Posts not loaded yet');
            return;
        }
        
        const post = allPosts.find(p => p.id === postId);
        
        if (post) {
            console.log(`[POST VIEW] Found post: ${post.title}`);
            showPostModal(post);
        } else {
            console.warn(`[POST VIEW ERROR] Post not found with ID: ${postId}`);
            window.location.hash = '';
        }
    }

    function showPostModal(post) {
        console.log(`[MODAL] Showing modal for post: ${post.title}`);
        
        // Close any existing modal
        const existingModal = document.querySelector('.blog-post-modal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        
        const modal = document.createElement('div');
        modal.className = 'blog-post-modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">&times;</button>
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.createdAt)}</span>
                    <span><i class="far fa-eye"></i> ${post.views.toLocaleString()}</span>
                    ${post.tags.length > 0 ? `
                    <span class="category-tag" style="background: ${getCategoryColor(post.tags[0])}">
                        ${getCategoryName(post.tags[0])}
                    </span>
                    ` : ''}
                </div>
                <h2>${post.title}</h2>
                <div class="blog-post-image">
                    <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
                </div>
                <div class="post-content">
                    ${post.content}
                </div>
            </div>
        `;
        
        modal.querySelector('.close-modal').addEventListener('click', () => {
            console.log('[MODAL] Close button clicked');
            closeModal(modal);
        });
        
        // Close when clicking outside content
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
        
        document.body.appendChild(modal);
        
        // Trigger animation
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
    }

    function closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
            window.location.hash = '';
        }, 300);
    }

    // ======================
    // 8. PAGINATION
    // ======================
    function setupPagination(totalFilteredPosts) {
        const totalPages = Math.ceil(totalFilteredPosts / POSTS_PER_PAGE);
        console.log(`[PAGINATION] Setting up for ${totalPages} pages`);
        
        pagination.innerHTML = '';
        
        if (totalPages <= 1) {
            console.log('[PAGINATION] Only one page - hiding controls');
            return;
        }
        
        // Previous button
        const prevBtn = createPaginationButton(
            '<i class="fas fa-chevron-left"></i>',
            currentPage > 1 ? currentPage - 1 : null,
            currentPage === 1
        );
        pagination.appendChild(prevBtn);
        
        // Page numbers with smart truncation
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
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
            pagination.appendChild(createPaginationButton(i, i, i === currentPage));
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

    function createPaginationButton(text, pageNumber, isDisabled = false) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.innerHTML = text;
        
        if (isDisabled) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.addEventListener('click', () => {
                console.log(`[PAGINATION] Page ${pageNumber} clicked`);
                currentPage = pageNumber;
                fetchBlogPosts();
                blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
        
        return button;
    }

    // ======================
    // 9. HELPER FUNCTIONS
    // ======================
    function formatDate(timestamp) {
        try {
            const date = new Date(Number(timestamp));
            if (isNaN(date.getTime())) {
                console.warn(`[DATE WARNING] Invalid timestamp: ${timestamp}`);
                return 'No date';
            }
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            console.error('[DATE ERROR] Formatting failed:', error);
            return 'Invalid date';
        }
    }

    function getCategoryName(category) {
        const categories = {
            'business': 'Business',
            'finance': 'Finance',
            'investing': 'Investing',
            'market': 'Market',
            'success': 'Success'
        };
        return categories[category.toLowerCase()] || 'Uncategorized';
    }

    function getCategoryColor(category) {
        const colors = {
            'business': 'rgba(67, 97, 238, 0.1)',
            'finance': 'rgba(46, 204, 113, 0.1)',
            'investing': 'rgba(241, 196, 15, 0.1)',
            'market': 'rgba(155, 89, 182, 0.1)',
            'success': 'rgba(231, 76, 60, 0.1)'
        };
        return colors[category.toLowerCase()] || 'rgba(149, 165, 166, 0.1)';
    }

    // ======================
    // 10. UI STATE FUNCTIONS
    // ======================
    function showLoadingState() {
        console.log('[UI] Showing loading state');
        blogGrid.innerHTML = `
            <div class="loading-posts">
                <div class="loading-spinner"></div>
                <p>Loading articles...</p>
            </div>
        `;
        pagination.innerHTML = '';
    }

    function showNoResults() {
        console.log('[UI] Showing no results state');
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Articles Found</h3>
                <p>Try a different search or category.</p>
                <button class="btn btn-primary" id="reset-filters-btn">Show All</button>
            </div>
        `;
        document.getElementById('reset-filters-btn')?.addEventListener('click', resetFilters);
        pagination.innerHTML = '';
    }

    function showErrorState(error = {}) {
        console.error('[UI] Showing error state:', error.message || 'Unknown error');
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>${error.message || 'We encountered an error'}</p>
                ${error.details ? `<p class="error-detail">${error.details}</p>` : ''}
                <button class="btn btn-primary" id="retry-btn">Retry</button>
            </div>
        `;
        document.getElementById('retry-btn')?.addEventListener('click', fetchBlogPosts);
        pagination.innerHTML = '';
    }

    function resetFilters() {
        console.log('[UI] Resetting filters');
        currentCategory = 'all';
        currentSearchTerm = '';
        searchInput.value = '';
        currentPage = 1;
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') btn.classList.add('active');
        });
        fetchBlogPosts();
    }

    // ======================
    // 11. EVENT INITIALIZATION
    // ======================
    // Handle clicks on "Read More" links
    document.addEventListener('click', (e) => {
        if (e.target.closest('.view-post-btn')) {
            e.preventDefault();
            const postId = e.target.closest('.view-post-btn').getAttribute('data-post-id') || 
                          e.target.closest('.view-post-btn').hash.substring(1);
            console.log(`[UI EVENT] Read More clicked for post: ${postId}`);
            window.location.hash = postId;
            handlePostViewing(); // Add this line
        }
    });
    
    // Handle hash changes (both initial load and subsequent changes)
    window.addEventListener('hashchange', handlePostViewing);
    
    // Check for initial hash on page load
    window.addEventListener('load', function() {
        console.log('[INIT] Page fully loaded');
        setTimeout(() => {
            if (window.location.hash) {
                console.log('[INIT] Initial hash found:', window.location.hash);
                handlePostViewing();
            }
        }, 500);
    });

    // ======================
    // 12. GLOBAL EXPORTS
    // ======================
    window.fetchBlogPosts = fetchBlogPosts;
    window.resetFilters = resetFilters;
    console.log('[INIT] Blog script initialized successfully');
});
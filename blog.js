document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
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
    try {
        console.log('Initializing Firebase...');
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        showErrorState({
            message: 'Failed to initialize Firebase',
            details: error.message
        });
        return;
    }

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

    // Debug DOM elements
    if (!blogGrid) console.error('blog-grid element not found');
    if (!pagination) console.error('pagination element not found');
    if (!searchForm) console.error('blog-search-form not found');
    if (!searchInput) console.error('blog-search-input not found');

    // Initialize
    fetchBlogPosts();

    // Event Listeners
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');
            
            currentCategory = btn.dataset.category;
            currentPage = 1;
            console.log(`Category changed to: ${currentCategory}`);
            fetchBlogPosts();
        });
    });

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        currentSearchTerm = searchInput.value.trim();
        currentPage = 1;
        console.log(`Searching for: ${currentSearchTerm}`);
        fetchBlogPosts();
    });

    // Main function to fetch blog posts from Firebase
    function fetchBlogPosts() {
        console.log('Starting fetchBlogPosts');
        showLoadingState();
        
        const postsRef = database.ref('blogs');
        console.log('Firebase reference created');
        
        postsRef.once('value')
            .then((snapshot) => {
                console.log('Firebase data received');
                
                if (!snapshot.exists()) {
                    console.warn('No data exists at the blogs reference');
                    showNoResults();
                    return;
                }
                
                const postsData = snapshot.val();
                console.log('Raw Firebase data:', postsData);
                
                // Convert Firebase object to array and filter only published posts
                allPosts = Object.entries(postsData).map(([key, value]) => {
                    return {
                        id: key,
                        ...value,
                        // Ensure required fields exist
                        title: value.title || 'Untitled Post',
                        excerpt: value.excerpt || '',
                        tags: value.tags || [],
                        status: value.status || 'published',
                        createdAt: value.createdAt || Date.now(),
                        views: value.views || 0
                    };
                }).filter(post => post.status === 'published');
                
                console.log('Filtered published posts:', allPosts);
                totalPosts = allPosts.length;
                
                if (totalPosts === 0) {
                    console.warn('No published posts found');
                    showNoResults();
                    return;
                }
                
                // Process and filter posts
                const filteredPosts = filterPosts(allPosts);
                console.log('Posts after filtering:', filteredPosts);
                
                if (filteredPosts.length === 0) {
                    showNoResults();
                } else {
                    const paginatedPosts = paginatePosts(filteredPosts);
                    renderBlogPosts(paginatedPosts);
                    setupPagination(filteredPosts.length);
                }
            })
            .catch((error) => {
                console.error('Error fetching posts:', error);
                showErrorState({
                    message: 'Failed to load blog posts',
                    details: error.message
                });
            });
    }

    // Filter posts based on category and search term
    function filterPosts(posts) {
        return posts.filter(post => {
            // Filter by category (using tags)
            const categoryMatch = currentCategory === 'all' || 
                                post.tags.includes(currentCategory);
            
            // Filter by search term (search in title, content, and excerpt)
            const searchTerm = currentSearchTerm.toLowerCase();
            const searchMatch = !currentSearchTerm || 
                              post.title.toLowerCase().includes(searchTerm) ||
                              (post.content && post.content.toLowerCase().includes(searchTerm)) ||
                              post.excerpt.toLowerCase().includes(searchTerm);
            
            return categoryMatch && searchMatch;
        });
    }

    // Paginate the filtered posts
    function paginatePosts(posts) {
        // Sort posts by date (newest first)
        posts.sort((a, b) => b.createdAt - a.createdAt);
        
        const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
        const endIndex = startIndex + POSTS_PER_PAGE;
        
        return posts.slice(startIndex, endIndex);
    }

    // Render blog posts to the grid
    function renderBlogPosts(posts) {
        blogGrid.innerHTML = '';

        posts.forEach(post => {
            try {
                const card = createBlogCard(post);
                blogGrid.appendChild(card);
            } catch (error) {
                console.error('Error rendering post:', error);
                // Render error card instead
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

    // Create a blog card element
    function createBlogCard(post) {
        const card = document.createElement('article');
        card.className = 'blog-card animate__animated animate__fadeIn';
        
        // Use first tag as category if exists
        const category = post.tags.length > 0 ? post.tags[0] : 'uncategorized';
        
        // Validate image URL
        let imageUrl = post.imageUrl;
        if (!imageUrl || typeof imageUrl !== 'string') {
            imageUrl = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80';
        }
        
        const cardContent = `
            <div class="blog-card-image">
                <img src="${imageUrl}" alt="${post.title}" loading="lazy">
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
                <a href="/blog/${post.id}" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        card.innerHTML = cardContent;
        return card;
    }

    // Set up pagination controls
    function setupPagination(filteredPostCount) {
        const totalPages = Math.ceil(filteredPostCount / POSTS_PER_PAGE);
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
            pagination.appendChild(createPaginationButton(
                i,
                i,
                i === currentPage
            ));
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

    // Helper function to create pagination buttons
    function createPaginationButton(text, pageNumber, isDisabled = false) {
        const button = document.createElement('button');
        button.className = 'pagination-btn';
        button.innerHTML = text;
        
        if (isDisabled) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.addEventListener('click', () => {
                currentPage = pageNumber;
                fetchBlogPosts();
                // Scroll to top of blog grid
                blogGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        }
        
        return button;
    }

    // Helper functions
    function formatDate(timestamp) {
        try {
            const date = new Date(Number(timestamp));
            if (isNaN(date.getTime())) return 'No date';
            
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } catch {
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

    // UI State Functions
    function showLoadingState() {
        blogGrid.innerHTML = `
            <div class="loading-posts">
                <div class="loading-spinner"></div>
                <p>Loading articles...</p>
            </div>
        `;
        pagination.innerHTML = '';
    }

    function showNoResults() {
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No Articles Found</h3>
                <p>Try a different search or category.</p>
                <button class="btn btn-primary" id="reset-filters-btn">Show All</button>
            </div>
        `;
        
        // Add event listener to the reset button
        document.getElementById('reset-filters-btn')?.addEventListener('click', resetFilters);
        pagination.innerHTML = '';
    }

    function showErrorState(error = {}) {
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>${error.message || 'We\'re having trouble loading the blog posts.'}</p>
                ${error.details ? `<p class="error-detail">${error.details}</p>` : ''}
                <button class="btn btn-primary" id="retry-btn">Retry</button>
            </div>
        `;
        
        // Add event listener to the retry button
        document.getElementById('retry-btn')?.addEventListener('click', fetchBlogPosts);
        pagination.innerHTML = '';
    }

    // Reset filters function
    function resetFilters() {
        currentCategory = 'all';
        currentSearchTerm = '';
        searchInput.value = '';
        currentPage = 1;
        
        // Reset active category button
        categoryBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.category === 'all') {
                btn.classList.add('active');
            }
        });
        
        fetchBlogPosts();
    }

    // Expose necessary functions to global scope
    window.fetchBlogPosts = fetchBlogPosts;
    window.resetFilters = resetFilters;
});
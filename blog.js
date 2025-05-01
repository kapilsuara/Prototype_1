document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_URL = '/api/blog/posts';
    const POSTS_PER_PAGE = 6;
    let currentPage = 1;
    let currentCategory = 'all';
    let currentSearchTerm = '';
    let totalPosts = 0;

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

    // Fetch blog posts from API
    async function fetchBlogPosts() {
        showLoadingState();
        
        try {
            const response = await fetch(`${API_URL}?page=${currentPage}&limit=${POSTS_PER_PAGE}&category=${currentCategory}&search=${encodeURIComponent(currentSearchTerm)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            totalPosts = data.totalPosts;
            
            if (data.posts.length === 0) {
                showNoResults();
            } else {
                renderBlogPosts(data.posts);
                setupPagination();
            }
        } catch (error) {
            console.error('Error fetching blog posts:', error);
            showErrorState();
        }
    }

    // Render blog posts to the grid
    function renderBlogPosts(posts) {
        // Clear existing content
        blogGrid.innerHTML = '';

        // Sort posts by date (newest first)
        posts.sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));

        // Create featured post if exists
        const featuredPost = posts.find(post => post.is_featured);
        if (featuredPost) {
            blogGrid.appendChild(createBlogCard(featuredPost, true));
            // Remove featured post from regular posts
            posts = posts.filter(post => post.id !== featuredPost.id);
        }

        // Create regular posts
        posts.forEach(post => {
            blogGrid.appendChild(createBlogCard(post));
        });
    }

    // Create a blog card element
    function createBlogCard(post, isFeatured = false) {
        const card = document.createElement('article');
        card.className = `blog-card animate__animated animate__fadeIn ${isFeatured ? 'featured-post' : ''}`;
        
        const cardContent = `
            <div class="blog-card-image">
                <img src="${post.image_url || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'}" alt="${post.title}">
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.publish_date)}</span>
                    <span><i class="far fa-eye"></i> ${post.views?.toLocaleString() || '0'}</span>
                    <span class="category-tag" style="background: ${getCategoryColor(post.category)}">
                        ${getCategoryName(post.category)}
                    </span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt || 'Read this insightful article about ' + post.title}</p>
                <a href="/blog/${post.slug}" class="blog-card-link">Read More <i class="fas fa-arrow-right"></i></a>
            </div>
        `;
        
        card.innerHTML = cardContent;
        return card;
    }

    // Set up pagination controls
    function setupPagination() {
        const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
        
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
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = createPaginationButton(
                i,
                i,
                i === currentPage
            );
            pagination.appendChild(pageBtn);
        }
        
        // Next button
        const nextBtn = createPaginationButton(
            '<i class="fas fa-chevron-right"></i>',
            currentPage < totalPages ? currentPage + 1 : null,
            currentPage === totalPages
        );
        pagination.appendChild(nextBtn);
    }

    // Create a pagination button
    function createPaginationButton(content, page, isActive = false, isDisabled = false) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;
        btn.innerHTML = content;
        
        if (page && !isActive && !isDisabled) {
            btn.addEventListener('click', () => {
                currentPage = page;
                fetchBlogPosts();
                window.scrollTo({ top: blogGrid.offsetTop - 100, behavior: 'smooth' });
            });
        }
        
        return btn;
    }

    // Show loading state
    function showLoadingState() {
        blogGrid.innerHTML = `
            <div class="loading-posts">
                <div class="loading-spinner"></div>
                <p>Loading articles from our knowledge base...</p>
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
                <p>We couldn't find any articles matching your criteria. Try a different search or category.</p>
                <button class="btn btn-primary" onclick="resetFilters()">Show All Articles</button>
            </div>
        `;
        pagination.innerHTML = '';
    }

    // Show error state
    function showErrorState() {
        blogGrid.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Content</h3>
                <p>We're having trouble loading the blog posts. Please try again later.</p>
                <button class="btn btn-primary" onclick="fetchBlogPosts()">Retry</button>
            </div>
        `;
        pagination.innerHTML = '';
    }

    // Helper functions
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    function getCategoryName(category) {
        const categories = {
            'investing': 'Investing',
            'business': 'Business Growth',
            'market': 'Market Trends',
            'finance': 'Financial Tips',
            'success': 'Success Stories'
        };
        return categories[category] || 'Uncategorized';
    }

    function getCategoryColor(category) {
        const colors = {
            'investing': 'rgba(67, 97, 238, 0.1)',
            'business': 'rgba(46, 204, 113, 0.1)',
            'market': 'rgba(241, 196, 15, 0.1)',
            'finance': 'rgba(155, 89, 182, 0.1)',
            'success': 'rgba(231, 76, 60, 0.1)'
        };
        return colors[category] || 'rgba(149, 165, 166, 0.1)';
    }

    // Global reset function
    window.resetFilters = function() {
        currentCategory = 'all';
        currentSearchTerm = '';
        searchInput.value = '';
        currentPage = 1;
        
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === 'all');
        });
        
        fetchBlogPosts();
    };
});
document.addEventListener('DOMContentLoaded', function() {
    // Update cart count
    function updateCartCount() {
        fetch('/api/cart/count')
            .then(response => response.json())
            .then(data => {
                const cartCount = document.getElementById('cart-count');
                if (cartCount) {
                    cartCount.textContent = `(${data.count})`;
                    // Add animation when count changes
                    if (data.count > 0) {
                        cartCount.classList.add('animate');
                        setTimeout(() => {
                            cartCount.classList.remove('animate');
                        }, 500);
                    }
                }
            });
    }

    // Initialize cart count
    updateCartCount();

    // Product quantity validation
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', function() {
            if (this.value < 1) this.value = 1;
            const max = this.getAttribute('max');
            if (max && this.value > max) this.value = max;
        });
    });

    // Check stock before adding to cart
    document.querySelectorAll('.add-to-cart').forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                category: formData.get('category'),
                brand: formData.get('brand'),
                model: formData.get('model')
            };
            
            fetch('/api/product/stock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                    return;
                }
                
                const quantity = parseInt(formData.get('quantity'));
                if (quantity > data.stock) {
                    alert(`Only ${data.stock} units available.`);
                } else {
                    this.submit();
                    updateCartCount();
                }
            });
        });
    });

    // Flash messages auto-close
    const flashMessages = document.querySelectorAll('.flash');
    flashMessages.forEach(msg => {
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        }, 5000);
        
        // Add close button functionality
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'flash-close';
        closeBtn.addEventListener('click', () => {
            msg.style.opacity = '0';
            setTimeout(() => msg.remove(), 500);
        });
        msg.appendChild(closeBtn);
    });

    // Dropdown menu functionality
    document.querySelectorAll('.dropdown').forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const content = dropdown.querySelector('.dropdown-content');
        
        link.addEventListener('click', function(e) {
            e.preventDefault();
            content.style.display = content.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(e) {
            if (!dropdown.contains(e.target)) {
                content.style.display = 'none';
            }
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add animation for cart count update
    const style = document.createElement('style');
    style.textContent = `
        #cart-count.animate {
            animation: bounce 0.5s;
        }
        
        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
        }
        
        .flash {
            position: relative;
            padding-right: 40px;
        }
        
        .flash-close {
            position: absolute;
            right: 10px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 1.2rem;
            cursor: pointer;
            color: inherit;
        }
    `;
    document.head.appendChild(style);
});
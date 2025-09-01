// ============================================
// STATE MANAGEMENT
// ============================================
let currentUser = { id: 'demo-user' }; // Mock user for demo
let currentEditingItem = null;
let selectedImages = [];

// Sample demo items for testing
const sampleItems = [
    {
        id: '1',
        title: 'Vintage Camera',
        price: 200,
        description: 'Beautiful vintage camera in excellent condition. Perfect for photography enthusiasts.',
        images: ['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400'],
        is_sold: false,
        created_at: new Date()
    },
    {
        id: '2',
        title: 'MacBook Pro',
        price: 1300,
        description: '13-inch MacBook Pro with M1 chip. Lightly used, comes with original charger.',
        images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
        is_sold: false,
        created_at: new Date()
    },
    {
        id: '3',
        title: 'Designer Chair',
        price: 450,
        description: 'Modern ergonomic chair perfect for home office. Excellent condition.',
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'],
        is_sold: true,
        created_at: new Date()
    }
];

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('[id$="Page"]').forEach(page => {
        page.classList.add('hidden');
    });
    
    // Show selected page
    document.getElementById(pageId).classList.remove('hidden');
}

// ============================================
// NAVIGATION EVENT LISTENERS
// ============================================
document.getElementById('backToHome').addEventListener('click', () => {
    showPage('homePage');
});

// ============================================
// ITEMS MANAGEMENT
// ============================================

// Load user's items (using sample data for demo)
async function loadUserItems() {
    // TODO: Replace with your Supabase query when authentication is added:
    // const { data: items, error } = await supabase
    //     .from('items')
    //     .select('*')
    //     .eq('user_id', currentUser.id)
    //     .order('created_at', { ascending: false });
    
    // For demo, use sample items
    displayItems(sampleItems);
}

// Display items in separate sections (available vs sold)
function displayItems(items) {
    const availableItems = items.filter(item => !item.is_sold);
    const soldItems = items.filter(item => item.is_sold);
    
    // Display available items
    displayItemsInContainer(availableItems, 'availableItemsContainer', 'availableEmptyState', 'No items yet', 'Click "Add Item" to create your first listing');
    
    // Display sold items
    displayItemsInContainer(soldItems, 'soldItemsContainer', 'soldEmptyState', 'No sold items yet', 'Items you mark as sold will appear here');
}

// Display items in the grid
function displayItemsInContainer(items, containerId, emptyStateId, emptyTitle, emptyMessage) {
    const container = document.getElementById(containerId);
    const emptyState = document.getElementById(emptyStateId);
    
    if (!items || items.length === 0) {
        emptyState.classList.remove('hidden');
        const existingGrid = container.querySelector('.items-grid');
        if (existingGrid) existingGrid.remove();
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Remove existing grid
    const existingGrid = container.querySelector('.items-grid');
    if (existingGrid) existingGrid.remove();
    
    // Create new grid
    const grid = document.createElement('div');
    grid.className = 'items-grid';
    
    items.forEach(item => {
        const itemCard = createItemCard(item);
        grid.appendChild(itemCard);
    });
    
    container.appendChild(grid);
}

// Create item card element
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.onclick = () => showItemDetails(item);
    
    const firstImage = item.images && item.images.length > 0 
        ? `<div class="item-image-container">
            <img src="${item.images[0]}" alt="${item.title}" class="item-image">
            ${item.is_sold ? '<div class="sold-tag">SOLD</div>' : ''}
           </div>`
        : '<div class="item-image" style="display: flex; align-items: center; justify-content: center; color: #6b7280;">No Image</div>';
    
    card.innerHTML = `
        ${firstImage}
        <div class="item-content">
            <div class="item-title">${item.title}</div>
            <div class="item-price">$${Math.round(item.price)}</div>
        </div>
    `;
    
    return card;
}

// Show item details
function showItemDetails(item) {
    const content = document.getElementById('itemDetailsContent');
    
    const imagesHtml = item.images && item.images.length > 0
        ? item.images.map(img => `<img src="${img}" alt="${item.title}" class="item-detail-image">`).join('')
        : '<div style="color: #6b7280;">No images</div>';
    
    content.innerHTML = `
        <div class="item-details">
            <h1>${item.title}</h1>
            <div class="item-price" style="font-size: 1.5rem; margin: 1rem 0;">$${Math.round(item.price)}</div>
            <div class="item-images">${imagesHtml}</div>
            <div style="margin: 1.5rem 0;">
                <h3 style="margin-bottom: 0.5rem;">Description</h3>
                <p>${item.description || 'No description provided.'}</p>
            </div>
            <div class="item-actions">
                <button class="btn btn-secondary" onclick="deleteItem('${item.id}')">Delete</button>
                <button class="btn btn-secondary" onclick="toggleSoldStatus('${item.id}', ${!item.is_sold})">
                    ${item.is_sold ? 'Mark as Available' : 'Mark as Sold'}
                </button>
                <button class="btn btn-primary" onclick="editItem('${item.id}')">Edit</button>
            </div>
        </div>
    `;
    
    showPage('itemDetailsPage');
}

// ============================================
// ITEM MODAL AND FORM HANDLING
// ============================================

// Add item button
document.getElementById('addItemBtn').addEventListener('click', () => {
    currentEditingItem = null;
    document.getElementById('modalTitle').textContent = 'Add Item';
    document.getElementById('itemForm').reset();
    clearImagePreview();
    document.getElementById('itemModal').classList.add('show');
});

// Edit item function
window.editItem = (itemId) => {
    const item = sampleItems.find(i => i.id === itemId);
    if (!item) return;
    
    currentEditingItem = item;
    document.getElementById('modalTitle').textContent = 'Edit Item';
    document.getElementById('itemTitle').value = item.title;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description || '';
    
    // Show existing images
    if (item.images && item.images.length > 0) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = item.images.map(url => `<img src="${url}" alt="Current image">`).join('');
    }
    
    document.getElementById('itemModal').classList.add('show');
};

// Delete item function
window.deleteItem = (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    // TODO: Replace with your Supabase delete when authentication is added:
    // const { error } = await supabase
    //     .from('items')
    //     .delete()
    //     .eq('id', itemId);
    
    // For demo, remove from sample items array
    const index = sampleItems.findIndex(item => item.id === itemId);
    if (index > -1) {
        sampleItems.splice(index, 1);
    }
    
    showPage('homePage');
    loadUserItems();
};

// Toggle sold status function
window.toggleSoldStatus = (itemId, isSold) => {
    // TODO: Replace with your Supabase update when authentication is added:
    // const { error } = await supabase
    //     .from('items')
    //     .update({ is_sold: isSold })
    //     .eq('id', itemId);
    
    // For demo, update in sample items array
    const item = sampleItems.find(i => i.id === itemId);
    if (item) {
        item.is_sold = isSold;
        showPage('homePage');
        loadUserItems();
    }
};

// Image upload handling
document.getElementById('imageInput').addEventListener('change', (e) => {
    const newFiles = Array.from(e.target.files);
    if (selectedImages.length + newFiles.length > 5) {
        alert('Maximum 5 images allowed. You can select ' + (5 - selectedImages.length) + ' more images.');
        e.target.value = '';
        return;
    }
    
    // Add new files to existing selection
    selectedImages = [...selectedImages, ...newFiles];
    displayImagePreview(selectedImages);
});

// Update displayImagePreview to handle File objects and existing image URLs
function displayImagePreview(files) {
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = '';
    
    files.forEach((file, index) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'image-preview-container';
        
        // Create remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-image-btn';
        removeBtn.innerHTML = '×';
        removeBtn.onclick = (e) => {
            e.preventDefault(); // Prevent form submission
            selectedImages = selectedImages.filter((_, i) => i !== index);
            displayImagePreview(selectedImages);
        };
        
        const img = document.createElement('img');
        if (file instanceof File) {
            // Handle File objects
            const reader = new FileReader();
            reader.onload = (e) => {
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            // Handle existing image URLs (for edit mode)
            img.src = file;
        }
        
        imgContainer.appendChild(img);
        imgContainer.appendChild(removeBtn);
        preview.appendChild(imgContainer);
    });
}

// Update clearImagePreview to reset everything
function clearImagePreview() {
    selectedImages = [];
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imageInput').value = '';
}

// Modal controls
document.getElementById('cancelModal').addEventListener('click', () => {
    document.getElementById('itemModal').classList.remove('show');
});

// Close modal when clicking outside
document.getElementById('itemModal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('itemModal')) {
        document.getElementById('itemModal').classList.remove('show');
    }
});

// Update form submission to validate images
document.getElementById('itemForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Check for minimum 1 image requirement
    if (selectedImages.length === 0) {
        const errorElement = document.getElementById('itemError');
        errorElement.textContent = 'Please upload at least 1 image';
        errorElement.classList.remove('hidden');
        return;
    }
    
    const title = document.getElementById('itemTitle').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value;
    
    // TODO: Replace with your Supabase image upload when authentication is added:
    // Upload images to Supabase storage and get URLs
    
    // For demo, create mock URLs for uploaded images
    let imageUrls = [];
    if (selectedImages.length > 0) {
        imageUrls = selectedImages.map((file, index) => {
            if (file instanceof File) {
                // Mock URL for new uploads
                return `https://images.unsplash.com/photo-${Date.now()}-${index}?w=400`;
            } else {
                // Keep existing URLs
                return file;
            }
        });
    }
    
    const itemData = {
        title,
        price,
        description,
        images: imageUrls,
        is_sold: false,
        created_at: new Date()
    };
    
    // TODO: Replace with your Supabase insert/update when authentication is added:
    // if (currentEditingItem) {
    //     await supabase.from('items').update(itemData).eq('id', currentEditingItem.id);
    // } else {
    //     await supabase.from('items').insert([{...itemData, user_id: currentUser.id}]);
    // }
    
    if (currentEditingItem) {
        // Update existing item
        const index = sampleItems.findIndex(item => item.id === currentEditingItem.id);
        if (index > -1) {
            sampleItems[index] = { ...sampleItems[index], ...itemData };
        }
    } else {
        // Create new item
        itemData.id = Date.now().toString();
        sampleItems.unshift(itemData);
    }
    
    // Success - close modal and refresh items
    document.getElementById('itemModal').classList.remove('show');
    document.getElementById('itemError').classList.add('hidden');
    loadUserItems();
});

// ============================================
// INITIALIZATION
// ============================================

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', () => {
    showPage('homePage');
    loadUserItems();
});
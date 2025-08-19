// App state
let currentUser = null;
let currentPage = 'login';
let currentEditingItem = null;
let listings = [
    {
        id: 1,
        title: 'Full Metal Bed Frame, Black',
        price: 70,
        description: 'The metal bed frame is sturdy and stable, reinforced 9 legs support, ensuring low profile bed frame does not squeak or shift during use.\n\nThe low bed frame encloses the mattress to prevent slipping, making the low profile bed frame more silent and ensuring a comfortable sleep.',
        images: [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2Y4ZjlmYSIvPjx0ZXh0IHg9IjEyNSIgeT0iNzUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzY2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkJlZCBGcmFtZSBJbWFnZTwvdGV4dD48L3N2Zz4='
        ]
    }
];

// Add sample mug listings
for (let i = 2; i <= 8; i++) {
    listings.push({
        id: i,
        title: 'Handmade Ceramic Mug',
        price: 20,
        description: 'Beautiful handmade ceramic mug, perfect for your morning coffee.',
        images: [
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iIzk5OTk5OSIvPjxjaXJjbGUgY3g9IjEyNSIgY3k9Ijc1IiByPSIzMCIgZmlsbD0iI2VlZWVlZSIvPjx0ZXh0IHg9IjEyNSIgeT0iMTMwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNlcmFtaWMgTXVnPC90ZXh0Pjwvc3ZnPg=='
        ]
    });
}

// Add these functions for session management
function saveUserSession(user) {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
        localStorage.removeItem('currentUser');
    }
}

function loadUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        document.getElementById('profileName').textContent = currentUser.username;
        updateAuthButtons();
        showPage('profile');
    } else {
        showPage('login');
    }
}

// DOM elements
const pages = {
    login: document.getElementById('loginPage'),
    addItem: document.getElementById('addItemPage'),
    profile: document.getElementById('profilePage'),
    itemDetail: document.getElementById('itemDetailPage')
};

const modals = {
    editProfile: document.getElementById('editProfileModal'),
    editItem: document.getElementById('editItemModal')
};

const buttons = {
    signup: document.getElementById('signupBtn'),
    login: document.getElementById('loginBtn'),
    logout: document.getElementById('logoutBtn'),
    addItem: document.getElementById('addItemBtn'),
    cancel: document.getElementById('cancelBtn'),
    back: document.getElementById('backBtn'),
    editProfile: document.getElementById('editProfileBtn'),
    editItem: document.getElementById('editItemBtn'),
    deleteItem: document.getElementById('deleteItemBtn'),
    markSold: document.getElementById('markSoldBtn')
};

// Navigation functions
function showPage(pageName) {
    Object.values(pages).forEach(page => page.classList.add('hidden'));
    pages[pageName].classList.remove('hidden');
    currentPage = pageName;
    
    if (pageName === 'profile') {
        renderListings();
    }
}

function updateAuthButtons() {
    if (currentUser) {
        buttons.signup.classList.add('hidden');
        buttons.login.classList.add('hidden');
        buttons.logout.classList.remove('hidden');
    } else {
        buttons.signup.classList.remove('hidden');
        buttons.login.classList.remove('hidden');
        buttons.logout.classList.add('hidden');
    }
}

// Add this at the top with other app state
let users = JSON.parse(localStorage.getItem('users')) || [];

// Add function to check username uniqueness
function isUsernameUnique(username) {
    return !users.some(user => user.username.toLowerCase() === username.toLowerCase());
}

// Update login form handler
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check if user exists
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (existingUser) {
        // Login case
        if (existingUser.password === password) {
            currentUser = existingUser;
            saveUserSession(currentUser);
            document.getElementById('profileName').textContent = username;
            updateAuthButtons();
            showPage('profile');
        } else {
            alert('Incorrect password');
        }
    } else {
        // New user case
        if (confirm('Username not found. Would you like to create a new account?')) {
            const newUser = {
                username: username,
                password: password
            };
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            currentUser = newUser;
            saveUserSession(currentUser);
            document.getElementById('profileName').textContent = username;
            updateAuthButtons();
            showPage('profile');
        }
    }
});

// Add item functionality
document.getElementById('addItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (uploadedImages.length === 0) {
        alert('Please upload at least one image');
        return;
    }
    
    const newItem = {
        id: listings.length + 1,
        title: document.getElementById('itemTitle').value,
        price: parseInt(document.getElementById('itemPrice').value),
        description: document.getElementById('itemDescription').value,
        images: [...uploadedImages] // Use the uploaded images
    };
    
    listings.push(newItem);
    document.getElementById('addItemForm').reset();
    uploadedImages = []; // Reset uploaded images
    imagesContainer.innerHTML = ''; // Clear image previews
    showPage('profile');
});

// Render listings with separate active and sold items
function renderListings() {
    const activeGrid = document.getElementById('listingsGrid');
    const soldGrid = document.getElementById('soldListingsGrid');
    const soldSection = document.querySelector('.sold-listings-section');
    
    activeGrid.innerHTML = '';
    soldGrid.innerHTML = '';
    
    // Filter listings into active and sold
    const activeListings = listings.filter(listing => !listing.sold);
    const soldListings = listings.filter(listing => listing.sold);
    
    // Only show sold section if there are sold items
    if (soldListings.length > 0) {
        soldSection.style.display = 'block';
    } else {
        soldSection.style.display = 'none';
    }
    
    // Render active listings
    activeListings.forEach(listing => {
        const item = createListingCard(listing);
        activeGrid.appendChild(item);
    });
    
    // Render sold listings
    soldListings.forEach(listing => {
        const item = createListingCard(listing, true);
        soldGrid.appendChild(item);
    });
}

// Create a listing card
function createListingCard(listing, isSold = false) {
    const item = document.createElement('div');
    item.className = `listing-item${isSold ? ' sold' : ''}`;
    item.innerHTML = `
        <div class="listing-image" style="background-image: url('${listing.images[0]}')"></div>
        <div class="listing-info">
            <div class="listing-title">${listing.title}</div>
            <div class="listing-price">$${listing.price}</div>
        </div>
    `;
    
    // Add click event listener
    item.addEventListener('click', () => showItemDetail(listing));
    
    return item;
}

// Show item detail
function showItemDetail(item) {
    currentEditingItem = item;
    document.getElementById('itemDetailTitle').textContent = item.title;
    document.getElementById('itemDetailPrice').textContent = `$${item.price}`;

    document.getElementById('itemDetailDescription').innerHTML = item.description.split('\n').map(p => `<p>${p}</p>`).join('');
    
    const imagesContainer = document.getElementById('itemDetailImages');
    imagesContainer.innerHTML = '';
    item.images.forEach(imageUrl => {
        const img = document.createElement('div');
        img.className = 'item-image';
        img.style.backgroundImage = `url('${imageUrl}')`;
        imagesContainer.appendChild(img);
    });
    
    // Update mark sold button visibility and text
    const markSoldBtn = document.getElementById('markSoldBtn');
    if (item.sold) {
        markSoldBtn.textContent = 'Sold';
        markSoldBtn.disabled = true;
        markSoldBtn.classList.add('btn-secondary');
        markSoldBtn.classList.remove('btn-outline');
    } else {
        markSoldBtn.textContent = 'Mark Sold';
        markSoldBtn.disabled = false;
        markSoldBtn.classList.remove('btn-secondary');
        markSoldBtn.classList.add('btn-outline');
    }
    
    showPage('itemDetail');
}

// Modal functions
function showModal(modalName) {
    modals[modalName].classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function hideModal(modalName) {
    modals[modalName].classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Edit Profile functionality
function openEditProfile() {
    document.getElementById('editUsername').value = currentUser.username;
    document.getElementById('editPassword').value = currentUser.password;
    showModal('editProfile');
}

document.getElementById('editProfileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newUsername = document.getElementById('editUsername').value;
    const newPassword = document.getElementById('editPassword').value;
    
    // Find and update the user in the users array
    const userIndex = users.findIndex(u => u.username.toLowerCase() === currentUser.username.toLowerCase());
    if (userIndex !== -1) {
        users[userIndex].username = newUsername;
        users[userIndex].password = newPassword;
        
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current user
        currentUser.username = newUsername;
        currentUser.password = newPassword;
        
        // Update session storage
        saveUserSession(currentUser);
        
        // Update display
        document.getElementById('profileName').textContent = newUsername;
        hideModal('editProfile');
    } else {
        alert('Error updating profile. Please try again.');
    }
});

// Edit Item functionality
function openEditItem() {
    document.getElementById('editItemTitle').value = currentEditingItem.title;
    document.getElementById('editItemPrice').value = currentEditingItem.price;
    document.getElementById('editItemDescription').value = currentEditingItem.description;
    
    // Display existing images
    const editImagesContainer = document.getElementById('editImagesContainer');
    editImagesContainer.innerHTML = '';
    currentEditingItem.images.forEach((imageUrl, index) => {
        createImagePreview(imageUrl, editImagesContainer, () => {
            currentEditingItem.images.splice(index, 1);
        });
    });
    
    showModal('editItem');
}

// Handle edit page file upload
const editFileInput = document.getElementById('editFileInput');
const editUploadBtn = document.getElementById('editUploadBtn');
const editImagesContainer = document.getElementById('editImagesContainer');

editUploadBtn.addEventListener('click', function() {
    editFileInput.click();
});

editFileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    const currentImageCount = currentEditingItem.images.length;
    
    if (files.length === 0) return;
    
    if (currentImageCount + files.length > 5) {
        alert('Maximum 5 images allowed. Please remove some images first.');
        this.value = '';
        return;
    }
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            currentEditingItem.images.push(imageUrl);
            
            createImagePreview(imageUrl, editImagesContainer, () => {
                const index = currentEditingItem.images.indexOf(imageUrl);
                if (index > -1) {
                    currentEditingItem.images.splice(index, 1);
                }
            });
        };
        
        reader.readAsDataURL(file);
    });
    
    // Clear the input to allow selecting the same file again
    this.value = '';
});

document.getElementById('editItemForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    currentEditingItem.title = document.getElementById('editItemTitle').value;
    currentEditingItem.price = parseInt(document.getElementById('editItemPrice').value);
    currentEditingItem.description = document.getElementById('editItemDescription').value;
    
    // Update the detail view
    showItemDetail(currentEditingItem);
    hideModal('editItem');
});

// Delete Item functionality
function deleteItem() {
    if (confirm('Are you sure you want to delete this item?')) {
        const index = listings.findIndex(item => item.id === currentEditingItem.id);
        if (index > -1) {
            listings.splice(index, 1);
            showPage('profile');
        }
    }
}

// Mark as Sold functionality
function markAsSold() {
    if (confirm('Mark this item as sold?')) {
        currentEditingItem.sold = true;
        showPage('profile');
        renderListings(); // Re-render to move item to sold section
    }
}

// Shared image handling functionality
function createImagePreview(imageUrl, container, onRemove) {
    const previewDiv = document.createElement('div');
    previewDiv.className = 'image-preview';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    
    const removeButton = document.createElement('button');
    removeButton.className = 'remove-image';
    removeButton.innerHTML = '×';
    removeButton.onclick = function() {
        previewDiv.remove();
        if (onRemove) onRemove();
    };
    
    previewDiv.appendChild(img);
    previewDiv.appendChild(removeButton);
    container.appendChild(previewDiv);
    
    return previewDiv;
}

// File upload and preview functionality for Add Item page
const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const imagesContainer = document.getElementById('addImagesContainer');
let uploadedImages = []; // Store uploaded images

// Handle file selection
fileInput.addEventListener('change', function(e) {
    const files = e.target.files;
    const currentImageCount = uploadedImages.length;
    
    if (files.length === 0) return;
    
    if (currentImageCount + files.length > 5) {
        alert('Maximum 5 images allowed. Please remove some images first.');
        this.value = '';
        return;
    }
    
    // Create preview for each image
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            uploadedImages.push(imageUrl);
            
            createImagePreview(imageUrl, imagesContainer, () => {
                // Remove the image from uploadedImages array when removed
                const index = uploadedImages.indexOf(imageUrl);
                if (index > -1) {
                    uploadedImages.splice(index, 1);
                }
            });
        };
        
        reader.readAsDataURL(file);
    });
    
    // Clear the input to allow selecting the same file again
    this.value = '';
});

// Removed drag and drop functionality

uploadArea.addEventListener('click', function() {
    fileInput.click();
});

// Event listeners
buttons.login.addEventListener('click', () => showPage('login'));
buttons.logout.addEventListener('click', () => {
    currentUser = null;
    saveUserSession(null); // Clear user session
    updateAuthButtons();
    showPage('login');
});
buttons.addItem.addEventListener('click', () => showPage('addItem'));
buttons.cancel.addEventListener('click', () => showPage('profile'));
buttons.back.addEventListener('click', () => showPage('profile'));
buttons.editProfile.addEventListener('click', openEditProfile);
buttons.editItem.addEventListener('click', openEditItem);
buttons.deleteItem.addEventListener('click', deleteItem);
buttons.markSold.addEventListener('click', markAsSold);

// Modal event listeners
document.getElementById('closeProfileModal').addEventListener('click', () => hideModal('editProfile'));
document.getElementById('cancelProfileEdit').addEventListener('click', () => hideModal('editProfile'));
document.getElementById('closeItemModal').addEventListener('click', () => hideModal('editItem'));
document.getElementById('cancelItemEdit').addEventListener('click', () => hideModal('editItem'));

// Close modals when clicking overlay
modals.editProfile.addEventListener('click', function(e) {
    if (e.target === this) {
        hideModal('editProfile');
    }
});

modals.editItem.addEventListener('click', function(e) {
    if (e.target === this) {
        hideModal('editItem');
    }
});

document.getElementById('signupLink').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Sign up functionality would be implemented here');
});

document.getElementById('logo').addEventListener('click', () => {
    if (currentUser) {
        showPage('profile');
    } else {
        showPage('login');
    }
});

// Initialize app
function initializeApp() {
    updateAuthButtons();
    loadUserSession(); // Load user session if exists
}

// Call initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);
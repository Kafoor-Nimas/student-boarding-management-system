document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const addListingForm = document.getElementById('addListingForm');
    const cancelButton = document.querySelector('.btn-secondary');
    const listingsTableBody = document.getElementById('listingsTableBody');
    
    // Load existing listings from localStorage
    loadListings();
    
    // Form submission handling
    if (addListingForm) {
        addListingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const listingTitle = document.getElementById('listingTitle').value.trim();
            const universitySelect = document.getElementById('university');
            const university = universitySelect.options[universitySelect.selectedIndex].text;
            const location = document.getElementById('location').value.trim();
            const distance = document.getElementById('distance').value.trim();
            const price = document.getElementById('price').value.trim();
            const roomTypeSelect = document.getElementById('roomType');
            const roomType = roomTypeSelect.options[roomTypeSelect.selectedIndex].text;
            const genderPreferenceSelect = document.getElementById('genderPreference');
            const genderPreference = genderPreferenceSelect.options[genderPreferenceSelect.selectedIndex].text;
            const description = document.getElementById('description').value.trim();
            
            // Validate required fields
            if (!listingTitle || !university || !location || !distance || !price || !roomType || !genderPreference || !description) {
                showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            // Validate price
            if (isNaN(price) || parseFloat(price) <= 0) {
                showAlert('Please enter a valid price.', 'error');
                return;
            }
            
            // Create new listing object
            const newListing = {
                id: Date.now(),
                title: listingTitle,
                university: university,
                location: location,
                distance: distance,
                price: 'LKR ' + parseInt(price).toLocaleString(),
                roomType: roomType,
                genderPreference: genderPreference,
                description: description,
                status: 'Available',
                rating: '4.5 (0)',
                views: 0,
                reviews: 0,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage
            saveListing(newListing);
            
            // Add to table
            addListingToTable(newListing);
            
            // Update stats
            updateStats();
            
            // Show success message
            showAlert('Listing created successfully!', 'success');
            
            // Reset form
            addListingForm.reset();
            
            // Reset dropdowns to first option
            universitySelect.selectedIndex = 0;
            roomTypeSelect.selectedIndex = 0;
            genderPreferenceSelect.selectedIndex = 0;
        });
    }
    
    // Cancel button functionality
    if (cancelButton) {
        cancelButton.addEventListener('click', function() {
            if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
                document.getElementById('addListingForm').reset();
                
                // Reset dropdowns to first option
                document.getElementById('university').selectedIndex = 0;
                document.getElementById('roomType').selectedIndex = 0;
                document.getElementById('genderPreference').selectedIndex = 0;
            }
        });
    }
    
    // Save listing to localStorage
    function saveListing(listing) {
        let listings = JSON.parse(localStorage.getItem('ownerListings') || '[]');
        listings.push(listing);
        localStorage.setItem('ownerListings', JSON.stringify(listings));
    }
    
    // Load listings from localStorage
    function loadListings() {
        let listings = JSON.parse(localStorage.getItem('ownerListings') || '[]');
        
        // If no listings in localStorage, add the default one
        if (listings.length === 0) {
            const defaultListing = {
                id: 1,
                title: 'Comfortable Single Room Near University Wellawatte',
                university: 'University of Colombo',
                location: 'Wellawatte, Colombo 06',
                distance: '1.5 km',
                price: 'LKR 15,000',
                roomType: 'Single Room',
                genderPreference: 'Any Gender',
                description: 'A comfortable single room near University of Colombo with all facilities.',
                status: 'Available',
                rating: '4.5 (12)',
                views: 245,
                reviews: 12,
                createdAt: '2025-01-01'
            };
            listings.push(defaultListing);
            localStorage.setItem('ownerListings', JSON.stringify(listings));
        }
        
        // Clear existing table rows (except the default one)
        const defaultRow = listingsTableBody.querySelector('tr');
        if (defaultRow && listings.length > 1) {
            defaultRow.remove();
        } else if (defaultRow && listings.length === 1) {
            // Update the default row with data from localStorage
            const listing = listings[0];
            defaultRow.querySelector('.listing-title').textContent = listing.title;
            defaultRow.children[1].textContent = listing.university;
            defaultRow.children[2].textContent = listing.price;
            defaultRow.querySelector('.rating').textContent = listing.rating;
        }
        
        // Add all listings to table
        listings.forEach((listing, index) => {
            // Skip the first listing if we already have it in the table
            if (index === 0 && defaultRow && listings.length === 1) {
                return;
            }
            addListingToTable(listing);
        });
        
        // Update stats
        updateStats();
    }
    
    // Add listing to table
    function addListingToTable(listing) {
        const row = document.createElement('tr');
        
        // Format status badge
        let statusBadge = '';
        if (listing.status === 'Available') {
            statusBadge = '<span class="status-badge status-available">Available</span>';
        } else if (listing.status === 'Rented') {
            statusBadge = '<span class="status-badge status-rented">Rented</span>';
        } else {
            statusBadge = `<span class="status-badge">${listing.status}</span>`;
        }
        
        row.innerHTML = `
            <td>
                <div class="listing-title">${listing.title}</div>
            </td>
            <td>${listing.university}</td>
            <td>${listing.price}</td>
            <td>${statusBadge}</td>
            <td>
                <span class="rating">${listing.rating}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn" title="View Details" data-id="${listing.id}">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button class="action-btn" title="View on Map" data-id="${listing.id}">
                        <i class="fas fa-map-marker-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        listingsTableBody.appendChild(row);
        
        // Add event listeners to new action buttons
        const actionButtons = row.querySelectorAll('.action-btn');
        actionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const listingId = this.getAttribute('data-id');
                const listingTitle = this.closest('tr').querySelector('.listing-title').textContent;
                
                if (this.querySelector('.fa-file-alt')) {
                    viewListingDetails(listingId, listingTitle);
                } else if (this.querySelector('.fa-map-marker-alt')) {
                    viewOnMap(listingId, listingTitle);
                }
            });
        });
    }
    
    // Update stats
    function updateStats() {
        let listings = JSON.parse(localStorage.getItem('ownerListings') || '[]');
        
        // Calculate stats
        const totalListings = listings.length;
        const availableListings = listings.filter(listing => listing.status === 'Available').length;
        const totalViews = listings.reduce((sum, listing) => sum + (listing.views || 0), 0);
        
        // Calculate average rating
        let totalRating = 0;
        let totalReviews = 0;
        
        listings.forEach(listing => {
            // Extract rating from string like "4.5 (12)"
            const match = listing.rating.match(/(\d+\.?\d*)/);
            if (match) {
                const rating = parseFloat(match[1]);
                const reviewMatch = listing.rating.match(/\((\d+)\)/);
                const reviews = reviewMatch ? parseInt(reviewMatch[1]) : 0;
                
                totalRating += rating * reviews;
                totalReviews += reviews;
            }
        });
        
        const avgRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(1) : '0.0';
        
        // Update DOM
        document.querySelectorAll('.stat-value')[0].textContent = totalListings;
        document.querySelectorAll('.stat-value')[1].textContent = availableListings;
        document.querySelectorAll('.stat-value')[2].textContent = totalViews;
        document.querySelectorAll('.stat-value')[3].textContent = avgRating;
    }
    
    // View listing details
    function viewListingDetails(listingId, listingTitle) {
        let listings = JSON.parse(localStorage.getItem('ownerListings') || '[]');
        const listing = listings.find(l => l.id == listingId);
        
        if (listing) {
            // Create modal with listing details
            const modalHTML = `
                <div class="modal-overlay">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>${listing.title}</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            <div class="detail-row">
                                <strong>University:</strong> ${listing.university}
                            </div>
                            <div class="detail-row">
                                <strong>Location:</strong> ${listing.location}
                            </div>
                            <div class="detail-row">
                                <strong>Distance:</strong> ${listing.distance}
                            </div>
                            <div class="detail-row">
                                <strong>Price:</strong> ${listing.price}
                            </div>
                            <div class="detail-row">
                                <strong>Room Type:</strong> ${listing.roomType}
                            </div>
                            <div class="detail-row">
                                <strong>Gender Preference:</strong> ${listing.genderPreference}
                            </div>
                            <div class="detail-row">
                                <strong>Status:</strong> ${listing.status}
                            </div>
                            <div class="detail-row">
                                <strong>Rating:</strong> ${listing.rating}
                            </div>
                            <div class="detail-row">
                                <strong>Description:</strong>
                                <p>${listing.description}</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button class="btn-primary" id="editListingBtn">Edit</button>
                            <button class="btn-secondary modal-close-btn">Close</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Add modal styles if not already present
            addModalStyles();
            
            // Add event listeners to modal
            const modalOverlay = document.querySelector('.modal-overlay');
            const closeButtons = document.querySelectorAll('.modal-close, .modal-close-btn');
            
            closeButtons.forEach(button => {
                button.addEventListener('click', () => {
                    modalOverlay.remove();
                });
            });
            
            // Close modal when clicking outside
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    modalOverlay.remove();
                }
            });
            
            // Edit button functionality
            document.getElementById('editListingBtn').addEventListener('click', () => {
                alert('Edit functionality would be implemented here.');
                modalOverlay.remove();
            });
            
            // Increment views when viewing details
            incrementViews(listingId);
        }
    }
    
    // View on map
    function viewOnMap(listingId, listingTitle) {
        alert(`Opening map for: ${listingTitle}\n\nThis would show the location on a map in a real application.`);
        
        // Increment views
        incrementViews(listingId);
    }
    
    // Increment views for a listing
    function incrementViews(listingId) {
        let listings = JSON.parse(localStorage.getItem('ownerListings') || '[]');
        const listingIndex = listings.findIndex(l => l.id == listingId);
        
        if (listingIndex !== -1) {
            listings[listingIndex].views = (listings[listingIndex].views || 0) + 1;
            localStorage.setItem('ownerListings', JSON.stringify(listings));
            updateStats();
        }
    }
    
    // Show alert
    function showAlert(message, type = 'info') {
        // Remove existing alerts
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }
        
        // Create alert element
        const alertDiv = document.createElement('div');
        alertDiv.className = `custom-alert ${type}`;
        alertDiv.textContent = message;
        
        // Add to page
        document.body.appendChild(alertDiv);
        
        // Remove after appropriate time
        const removeTime = type === 'info' ? 3000 : 5000;
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, removeTime);
    }
    
    // Add modal styles
    function addModalStyles() {
        if (!document.querySelector('#modal-styles')) {
            const style = document.createElement('style');
            style.id = 'modal-styles';
            style.textContent = `
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 1000;
                    animation: fadeIn 0.3s ease;
                }
                
                .modal-content {
                    background: white;
                    border-radius: 8px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 90vh;
                    overflow-y: auto;
                    animation: slideUp 0.3s ease;
                }
                
                .modal-header {
                    padding: 20px;
                    border-bottom: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    color: #333;
                    font-size: 20px;
                }
                
                .modal-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #666;
                }
                
                .modal-body {
                    padding: 20px;
                }
                
                .detail-row {
                    margin-bottom: 15px;
                    padding-bottom: 15px;
                    border-bottom: 1px solid #f0f0f0;
                }
                
                .detail-row:last-child {
                    border-bottom: none;
                }
                
                .detail-row strong {
                    display: block;
                    margin-bottom: 5px;
                    color: #333;
                }
                
                .detail-row p {
                    margin: 10px 0 0 0;
                    color: #666;
                    line-height: 1.6;
                }
                
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .status-rented {
                    background-color: #f8d7da;
                    color: #721c24;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize with default data if needed
    initializeDefaultData();
    
    function initializeDefaultData() {
        // Check if we need to initialize default data
        const hasInitialized = localStorage.getItem('ownerDashboardInitialized');
        
        if (!hasInitialized) {
            // Initialize default listings
            const defaultListings = [
                {
                    id: 1,
                    title: 'Comfortable Single Room Near University Wellawatte',
                    university: 'University of Colombo',
                    location: 'Wellawatte, Colombo 06',
                    distance: '1.5 km',
                    price: 'LKR 15,000',
                    roomType: 'Single Room',
                    genderPreference: 'Any Gender',
                    description: 'A comfortable single room near University of Colombo. Includes WiFi, attached bathroom, and access to kitchen. Safe and secure environment with 24/7 security.',
                    status: 'Available',
                    rating: '4.5 (12)',
                    views: 245,
                    reviews: 12,
                    createdAt: '2025-01-01'
                }
            ];
            
            localStorage.setItem('ownerListings', JSON.stringify(defaultListings));
            localStorage.setItem('ownerDashboardInitialized', 'true');
        }
    }
});
document.addEventListener("DOMContentLoaded", function () {
  const listingsContainer = document.getElementById("hostelListingsContainer");

  async function loadBoardings() {
    try {
      // Fetch data from your existing backend API
      const response = await fetch("backend/hostel_api.php");
      const listings = await response.json();

      // Clear the container
      listingsContainer.innerHTML = "";

      if (listings.length === 0) {
        listingsContainer.innerHTML =
          '<p class="no-data">No boardings available at the moment.</p>';
        return;
      }

      // Loop through each hostel in the database
      listings.forEach((hostel) => {
        const card = document.createElement("article");
        card.className = "listing-card";

        // Map database values to your HTML structure
        card.innerHTML = `
                    <div class="image-wrapper">
                        <img src="https://via.placeholder.com/400x250" alt="${
                          hostel.listing_title
                        }">
                        <span class="tag type-tag">${hostel.room_type}</span>
                        <span class="tag status-tag">${
                          hostel.status || "Available"
                        }</span>
                    </div>
                    <div class="card-body">
                        <div class="title-row">
                            <h4>${hostel.listing_title}</h4>
                            <span class="rating"><i class="fas fa-star"></i> 4.5</span>
                        </div>
                        <p class="location-text">
                            <i class="fas fa-map-marker-alt"></i> ${
                              hostel.location
                            } • ${hostel.distance} from University
                        </p>
                        <div class="amenities-row">
                            <span><i class="fas fa-wifi"></i> WiFi</span>
                            <span><i class="fas fa-venus-mars"></i> ${
                              hostel.gender
                            }</span>
                            <span class="more">${hostel.university}</span>
                        </div>
                        <div class="price-footer">
                            <div class="price-info">
                                <span class="currency">LKR</span>
                                <span class="amount">${parseFloat(
                                  hostel.monthly_price
                                ).toLocaleString()}</span>
                                <span class="unit">per month</span>
                            </div>
                            <a href="view-details.html?id=${
                              hostel.id
                            }" class="view-btn">View Details</a>
                        </div>
                    </div>
                `;
        listingsContainer.appendChild(card);
      });
    } catch (error) {
      console.error("Error fetching boardings:", error);
      listingsContainer.innerHTML =
        '<p class="error">Failed to load listings. Please try again later.</p>';
    }
  }

  loadBoardings();
});

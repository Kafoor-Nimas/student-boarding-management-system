document.addEventListener("DOMContentLoaded", function () {
  // Form and UI elements
  const addListingForm = document.getElementById("addListingForm");
  const cancelButton = document.querySelector(".btn-secondary");
  const listingsTableBody =
    document.getElementById("listingsTableBody") ||
    document.getElementById("listingTable");

  // 1. Initial Load from MySQL Database
  loadListingsFromDB();

  // 2. Form submission handling (Saves to Database)
  if (addListingForm) {
    addListingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Collect form values
      const formData = {
        listing_title: document.getElementById("listingTitle").value.trim(),
        university: document.getElementById("university").value,
        location: document.getElementById("location").value.trim(),
        distance: document.getElementById("distance").value.trim(),
        monthly_price: document.getElementById("price").value.trim(),
        room_type: document.getElementById("roomType").value,
        gender: document.getElementById("genderPreference").value,
        description: document.getElementById("description").value.trim(),
      };

      // Basic Validation
      if (!formData.listing_title || !formData.monthly_price) {
        showAlert("Please fill in required fields.", "error");
        return;
      }

      try {
        const response = await fetch("backend/hostel_api.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.status === "success") {
          showAlert("Listing created successfully!", "success");
          addListingForm.reset();
          // Redirect to dashboard if on "Add" page
          if (window.location.pathname.includes("add-boarding")) {
            window.location.href = "owner-dashboard.html";
          } else {
            loadListingsFromDB();
          }
        }
      } catch (error) {
        showAlert("Could not connect to the database.", "error");
      }
    });
  }

  // 3. Fetch from Database and Render Table
  async function loadListingsFromDB() {
    if (!listingsTableBody) return;

    try {
      const response = await fetch("backend/hostel_api.php");
      const listings = await response.json();

      listingsTableBody.innerHTML = ""; // This clears your static HTML row

      listings.forEach((listing) => {
        const row = document.createElement("tr");
        row.innerHTML = `
                <td>
                    <div class="listing-title"><strong>${
                      listing.listing_title
                    }</strong></div>
                    <small>${listing.location}</small>
                </td>
                <td>${listing.university}</td>
                <td>LKR ${parseFloat(
                  listing.monthly_price
                ).toLocaleString()}</td>
                <td><span class="status-badge status-available">${
                  listing.status || "Active"
                }</span></td>
                <td><span class="rating">New</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn view" title="View" onclick="viewListing(${
                          listing.id
                        })">
                            <i class="fa-solid fa-eye"></i>
                        </button>

                        <button class="icon-btn edit" title="Edit" onclick="editListing(${
                          listing.id
                        })">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>

                        <button class="icon-btn delete" title="Delete" onclick="deleteListing(${
                          listing.id
                        })" style="color:red">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
        listingsTableBody.appendChild(row);
      });

      updateStats(listings);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  // 4. Update Stats (With Fix for textContent Error)
  function updateStats(listings) {
    const totalVal = document.getElementById("totalListings");
    const availVal = document.getElementById("availableCount");
    const viewsVal = document.getElementById("totalViews");

    // These 'if' checks prevent the "undefined textContent" error
    if (totalVal) totalVal.textContent = listings.length;
    if (availVal) availVal.textContent = listings.length;
    if (viewsVal) viewsVal.textContent = "0";
  }

  // 5. Delete Functionality
  window.deleteListing = async (id) => {
    if (confirm("Delete this listing permanently?")) {
      await fetch("backend/hostel_api.php", {
        method: "DELETE",
        body: JSON.stringify({ id: id }),
      });
      loadListingsFromDB();
    }
  };

  function showAlert(message, type) {
    alert(message); // You can replace this with your custom alert HTML
  }
});

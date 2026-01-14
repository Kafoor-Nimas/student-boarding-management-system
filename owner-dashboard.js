// 1. KEEP THESE AT THE TOP (OUTSIDE THE LISTENER)
window.editListing = function (id) {
  window.location.href = `add-boarding.html?edit=${id}`;
};

window.deleteListing = async (id) => {
  if (confirm("Delete this listing permanently?")) {
    try {
      // We send the ID in the URL to make it compatible with your PHP fallback
      const response = await fetch(`backend/hostel_api.php?id=${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (result.status === "success") {
        // If we are on the dashboard, refresh the table
        const table =
          document.getElementById("listingsTableBody") ||
          document.getElementById("listingTable");
        if (table) {
          location.reload(); // Simplest way to ensure stats and table refresh
        }
      } else {
        alert("Server Error: " + (result.message || "Could not delete"));
      }
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Network error. Check console.");
    }
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  const addListingForm = document.getElementById("addListingForm");
  const listingsTableBody =
    document.getElementById("listingsTableBody") ||
    document.getElementById("listingTable");

  // --- PART A: DASHBOARD LOGIC ---
  if (listingsTableBody) {
    loadListingsFromDB();
  }

  // --- PART B: EDIT MODE LOGIC ---
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  if (editId && addListingForm) {
    const submitBtn = addListingForm.querySelector(".btn-primary");
    if (submitBtn) submitBtn.textContent = "Update Listing";

    try {
      const response = await fetch(`backend/hostel_api.php?id=${editId}`);
      const data = await response.json();

      document.getElementById("listingTitle").value = data.listing_title;
      document.getElementById("university").value = data.university;
      document.getElementById("location").value = data.location;
      document.getElementById("distance").value = data.distance;
      document.getElementById("price").value = data.monthly_price;
      document.getElementById("roomType").value = data.room_type;
      document.getElementById("genderPreference").value = data.gender;
      document.getElementById("description").value = data.description;
    } catch (error) {
      console.error("Error loading listing for edit:", error);
    }
  }

  // --- PART C: FORM SUBMISSION ---
  if (addListingForm) {
    addListingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const formData = new FormData();
      formData.append(
        "listing_title",
        document.getElementById("listingTitle").value
      );
      formData.append(
        "university",
        document.getElementById("university").value
      );
      formData.append("location", document.getElementById("location").value);
      formData.append("distance", document.getElementById("distance").value);
      formData.append("monthly_price", document.getElementById("price").value);
      formData.append("room_type", document.getElementById("roomType").value);
      formData.append(
        "gender",
        document.getElementById("genderPreference").value
      );
      formData.append(
        "description",
        document.getElementById("description").value
      );

      if (editId) {
        formData.append("id", editId);
      }

      const imageInput = document.getElementById("hostelImage");
      if (imageInput && imageInput.files[0]) {
        formData.append("hostel_image", imageInput.files[0]);
      }

      try {
        const response = await fetch("backend/hostel_api.php", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        if (result.status === "success") {
          alert(editId ? "Updated successfully!" : "Created successfully!");
          window.location.href = "owner-dashboard.html";
        }
      } catch (error) {
        console.error("Error:", error);
      }
    });
  }

  // --- PART D: HELPER FUNCTIONS ---
  async function loadListingsFromDB() {
    if (!listingsTableBody) return;
    try {
      const response = await fetch("backend/hostel_api.php");
      const listings = await response.json();
      listingsTableBody.innerHTML = "";

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
                            <button class="icon-btn edit" onclick="editListing(${
                              listing.id
                            })">
                                <i class="fa-solid fa-pen-to-square"></i>
                            </button>
                            <button class="icon-btn delete" onclick="deleteListing(${
                              listing.id
                            })" style="color:red">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>`;
        listingsTableBody.appendChild(row);
      });
      updateStats(listings);
    } catch (error) {
      console.error(error);
    }
  }

  function updateStats(listings) {
    const totalVal = document.getElementById("totalListings");
    const availVal = document.getElementById("availableCount");
    if (totalVal) totalVal.textContent = listings.length;
    if (availVal) availVal.textContent = listings.length;
  }
});

// Keep this global so the buttons can find it
window.editListing = function (id) {
  window.location.href = `add-boarding.html?edit=${id}`;
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

  // --- PART B: EDIT MODE LOGIC (Run only if on Add page with ?edit=ID) ---
  const urlParams = new URLSearchParams(window.location.search);
  const editId = urlParams.get("edit");

  if (editId && addListingForm) {
    // Change button text to indicate update
    const submitBtn = addListingForm.querySelector(".btn-primary");
    if (submitBtn) submitBtn.textContent = "Update Listing";

    try {
      // Fetch the specific listing data to fill the form
      const response = await fetch(`backend/hostel_api.php?id=${editId}`);
      const data = await response.json();

      // Fill form fields with existing DB data
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

  // --- PART C: FORM SUBMISSION (Handles both POST and PUT) ---
  if (addListingForm) {
    addListingForm.addEventListener("submit", async function (e) {
      e.preventDefault();

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

      // If we are in edit mode, add the ID to data
      if (editId) formData.id = editId;

      try {
        const response = await fetch("backend/hostel_api.php", {
          // Use PUT if editId exists, otherwise POST
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const result = await response.json();
        if (result.status === "success") {
          alert(editId ? "Listing updated!" : "Listing created!");
          window.location.href = "owner-dashboard.html";
        }
      } catch (error) {
        alert("Could not save to database.");
      }
    });
  }

  // --- PART D: HELPER FUNCTIONS ---
  async function loadListingsFromDB() {
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

  window.deleteListing = async (id) => {
    if (confirm("Delete this listing?")) {
      await fetch("backend/hostel_api.php", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id }),
      });
      loadListingsFromDB();
    }
  };
});

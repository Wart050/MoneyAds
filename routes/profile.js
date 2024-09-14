document.addEventListener("DOMContentLoaded", function () {
  // References to form elements
  const profilePicUrlInput = document.getElementById("profile-pic-url");
  const nameInput = document.getElementById("name");
  const genderSelect = document.getElementById("gender");
  const ageInput = document.getElementById("age");
  const updateProfileForm = document.getElementById("update-profile-form");

  // References to tabs
  const profileTab = document.getElementById("profile-tab");
  const homeTab = document.getElementById("home-tab");
  const checkoutTab = document.getElementById("checkout-tab");

  // Event listener for updating profile
  document.getElementById("save-button").addEventListener("click", function () {
    const name = document.getElementById("name").value;
    const gender = document.getElementById("gender").value;
    const age = document.getElementById("age").value;
    const profilePic = document.getElementById("profile-pic").files[0];

    console.log("Saving profile with data:", { name, gender, age, profilePic });

    const formData = new FormData();
    formData.append("name", name);
    formData.append("gender", gender);
    formData.append("age", age);

    if (profilePic) {
      formData.append("profilePic", profilePic);
    }

    fetch("/api/update-profile", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Response from server:", data);
        if (data.message === "Profile updated successfully!") {
          // Update the displayed profile data
          document.getElementById("user-name").textContent = name;
          document.getElementById("user-age").textContent = age;
          if (data.profilePicUrl) {
            document.getElementById("profile-picture-preview").src =
              data.profilePicUrl;
          }
          document.body.className = theme;
        } else {
          alert("Error saving profile. Please try again.");
        }
      })
      .catch((error) => console.error("Error:", error));
  });

  // Event listeners for tabs navigation
  profileTab.addEventListener("click", function () {
    window.location.href = "/profile";
  });

  homeTab.addEventListener("click", function () {
    window.location.href = "/dashboard";
  });

  checkoutTab.addEventListener("click", function () {
    window.location.href = "/checkout";
  });
});

document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();

  document.getElementById("user-level").addEventListener("click", () => {
    const levelDetails = document.getElementById("level-details");
    levelDetails.style.display =
      levelDetails.style.display === "none" ? "block" : "none";
  });

  async function loadUserProfile() {
    try {
      const response = await fetch("/api/user-level");
      const levelData = await response.json();

      document.getElementById(
        "user-level"
      ).innerText = `Level ${levelData.level}`;
      document.getElementById("streak-score").innerText = levelData.streakScore;
      document.getElementById("hearts-remaining").innerText = "♥".repeat(
        levelData.heartsRemaining
      );
    } catch (error) {
      console.error("Failed to load user level data:", error);
    }
  }
});

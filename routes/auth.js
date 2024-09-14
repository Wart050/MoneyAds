const express = require("express");
const passport = require("passport");
const User = require("../models/User"); // Adjust the path if necessary

const router = express.Router();

// Route for Google authentication
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Callback route for Google to redirect to after authentication
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  async (req, res) => {
    try {
      console.log("User authenticated:", req.user); // Debug log

      // Ensure the authenticated user object is available
      if (!req.user) {
        console.log("No user data available");
        return res.redirect("/"); // Redirect to home if no user data
      }

      // Check if the user exists in the database
      let user = await User.findOne({ googleId: req.user.id });

      // If the user doesn't exist, create a new one
      if (!user) {
        user = new User({
          googleId: req.user.id,
          email: req.user.emails ? req.user.emails[0].value : "No email",
          profilePic:
            req.user.photos && req.user.photos.length > 0
              ? req.user.photos[0].value
              : "https://images.ctfassets.net/ihx0a8chifpc/gPyHKDGI0md4NkRDjs4k8/36be1e73008a0181c1980f727f29d002/avatar-placeholder-generator-500x500.jpg?w=1280&q=60&fm=webp",
        });
        await user.save();
      }

      // Store the user in the session
      req.login(user, (err) => {
        if (err) {
          console.error("Error logging in the user:", err);
          return res.redirect("/"); // Redirect to home if login fails
        }

        // Redirect the authenticated user to the dashboard or profile
        return res.redirect("/dashboard.html");
      });
    } catch (err) {
      console.error("Error during authentication:", err);
      return res.status(500).send("Server error occurred");
    }
  }
);

// Route to log out the user
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return next(err);
    }
    res.redirect("/");
  });
});

module.exports = router;

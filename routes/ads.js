const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

router.post("/watch-ad", isLoggedIn, async (req, res) => {
  try {
    // Find the user and update their ad count and balance
    const user = await User.findById(req.user._id);

    if (user.adsWatched < 120) {
      // Max 120 ads per session/day
      user.adsWatched += 1;
      user.accountBalance += 1;
      await user.save();
      return res.json({ success: true, newBalance: user.accountBalance });
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Max ads watched for the session." });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "An error occurred." });
  }
});

module.exports = router;

const express = require("express");
const User = require("../models/User");
const router = express.Router();

// Middleware to check if the user is authenticated
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/");
}

router.post("/redeem-balance", isLoggedIn, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.accountBalance > 0) {
      // Process redemption (e.g., payment, gift card)
      user.accountBalance = 0; // Reset balance after redemption
      await user.save();
      return res.json({ success: true });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Insufficient balance." });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "An error occurred." });
  }
});

module.exports = router;

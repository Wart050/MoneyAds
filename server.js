require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./models/User"); // Import the User model
const path = require("path");
const multer = require("multer"); // For handling file uploads
const app = express();

// Middleware for handling sessions
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    connectTimeoutMS: 30000, // 30 seconds timeout
    socketTimeoutMS: 30000, // 30 seconds socket timeout
    serverSelectionTimeoutMS: 30000, // 30 seconds to select a server
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Serve static files for uploaded profile pictures
app.use("/uploads", express.static("uploads"));

// Serve the index.html file for the root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({ googleId: profile.id });
        if (existingUser) {
          return done(null, existingUser);
        }
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
          accountBalance: 0, // default values
          adsWatched: 0, // default values
        });
        await newUser.save();
        done(null, newUser);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/dashboard.html");
  }
);

// Log out route
app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

// Protected route (for after login)
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/");
  }
  res.send(`Welcome ${req.user.name}, you are logged in!`);
});

// Route to fetch user data for profile page
app.get("/api/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      name: req.user.name || "No name",
      email: req.user.email || "No email",
      profilePic: req.user.profilePic || "No profile picture",
      gender: req.user.gender || "Not specified",
      age: req.user.age || "Not specified",
      balance: req.user.accountBalance || 0,
      adsWatched: req.user.adsWatched || 0,
    });
  } else {
    res.status(401).send("Unauthorized");
  }
});

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, req.user._id + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Route to update user profile
app.post(
  "/api/update-profile",
  upload.single("profilePic"),
  async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Unauthorized");
    }

    try {
      const user = await User.findById(req.user._id);

      // Update profile fields
      user.name = req.body.name || user.name;
      user.gender = req.body.gender || user.gender;
      user.age = req.body.age || user.age;
      user.theme = req.body.theme || user.theme;

      // Handle profile picture update
      if (req.file) {
        user.profilePic = `/uploads/${req.file.filename}`;
      }

      await user.save();

      // Re-login the user to update session
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ message: "Error re-logging user" });
        }
        res.json({
          message: "Profile updated successfully!",
          profilePicUrl: req.file ? `/uploads/${req.file.filename}` : null,
        });
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Error updating profile" });
    }
  }
);

// Persist the theme across all pages
app.get("/api/theme", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ theme: req.user.theme || "default" });
  } else {
    res.status(401).send("Unauthorized");
  }
});

app.post("/api/theme", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const user = await User.findById(req.user._id);
    user.theme = req.body.theme || "default";
    await user.save();

    res.json({ message: "Theme updated successfully!" });
  } catch (error) {
    console.error("Error updating theme:", error);
    res.status(500).json({ message: "Error updating theme" });
  }
});

// Listen on Port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Endpoint to handle profile updates
app.post("/update-profile", (req, res) => {
  const userId = req.session.userId; // Assume the user is logged in and their ID is stored in the session
  const { field, value } = req.body;

  if (!userId) {
    return res.status(401).send("Unauthorized");
  }

  // Update the user's profile in the database
  const updateQuery = `UPDATE users SET ${field} = ? WHERE id = ?`;
  db.query(updateQuery, [value, userId], (err, result) => {
    if (err) {
      console.error("Error updating profile:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.status(200).send("Profile updated successfully");
  });
});

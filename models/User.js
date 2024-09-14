const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: String,
  name: String,
  email: String,
  accountBalance: { type: Number, default: 0 },
  adsWatched: { type: Number, default: 0 },
  profilePic: { type: String, default: "" },
  gender: { type: String, default: "Not specified" },
  age: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streakDays: { type: Number, default: 0 },
  heartsRemaining: { type: Number, default: 3 },
  streakScore: { type: Number, default: 0 },
});

const User = mongoose.model("User", userSchema);
module.exports = User;

// New API endpoints in server.js
// app.get('/api/user-level', (req, res) => {
//     if (req.isAuthenticated()) {
//         res.json({
//             level: req.user.level,
//             streakDays: req.user.streakDays,
//             heartsRemaining: req.user.heartsRemaining,
//             streakScore: req.user.streakScore
//         });
//     } else {
//         res.status(401).send('Unauthorized');
//     }
// });

// app.post('/api/update-level', async (req, res) => {
//     if (!req.isAuthenticated()) {
//         return res.status(401).send('Unauthorized');
//     }

//     try {
//         const user = await User.findById(req.user._id);
//         user.level = req.body.level;
//         user.streakDays = req.body.streakDays;
//         user.heartsRemaining = req.body.heartsRemaining;
//         user.streakScore = req.body.streakScore;
//         await user.save();

//         res.json({ message: 'Level data updated successfully!' });
//     } catch (error) {
//         console.error('Error updating level data:', error);
//         res.status(500).json({ message: 'Error updating level data' });
//     }
// });

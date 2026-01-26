const functions = require("firebase-functions");
const express = require("express");
const admin = require("firebase-admin");
const cors = require("cors");

// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://customer-dashboard---atl-default-rtdb.firebaseio.com/",
});

const db = admin.database();
const app = express();

// ✅ Use CORS for cross-origin requests
app.use(cors({ origin: true }));
app.use(express.json());

// 🔧 Helper function
function sanitizeEmail(email) {
  return email.toLowerCase().replace(/\./g, ",");
}

// ✅ /validate-user
app.post("/validate-user", async (req, res) => {
  const { email, unitNo } = req.body;
  console.log("🔍 Validating:", { email, unitNo });

  if (!email || !unitNo) {
    return res.status(400).json({ message: "Email and Unit No are required." });
  }

  try {
    const sanitizedEmail = sanitizeEmail(email);
    const userSnapshot = await db.ref(`users/${sanitizedEmail}`).once("value");
    const user = userSnapshot.val();

    if (user && String(user.Flat_No).toLowerCase() === unitNo.toLowerCase()) {
      return res.json(user);
    } else {
      return res.status(400).json({ message: "Invalid Email or Unit No." });
    }
  } catch (error) {
    console.error("❌ Validation Error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// ✅ /signup
app.post("/signup", async (req, res) => {
  const { email, unitNo } = req.body;
  console.log("📥 Signup attempt:", { email, unitNo });

  if (!email || !unitNo) {
    return res.status(400).json({ message: "Email and Unit No are required." });
  }

  try {
    const newUserRef = db.ref("signedupUsers").push();
    await newUserRef.set({
      Email: email,
      Flat_No: unitNo,
      createdAt: new Date().toISOString(),
    });

    res.json({ message: "Signup successful!" });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Signup failed." });
  }
});

// ✅ Export as Cloud Function
exports.api = functions.https.onRequest(app);

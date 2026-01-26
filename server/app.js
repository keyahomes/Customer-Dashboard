const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://customer-dashboard---atl-default-rtdb.firebaseio.com/',
});

const db = admin.database();

app.use(cors({ origin: true }));
app.use(express.json());

/**
 * ✅ POST /validate-user
 * Validate login with unitNo + password
 */
app.post("/validate-user", async (req, res) => {
  const { unitNo, projectId, password } = req.body;
  console.log("validate-user req.body:", req.body);

  if (!unitNo || !projectId || !password) {

    return res.status(400).json({ message: "Missing required fields." });
  }

  try {
    const sanitizedUnitNo = unitNo.toString().trim().replace(/\s+/g, "_");
    const snapshot = await db.ref(`${projectId}/users/${sanitizedUnitNo}`).once("value");
    const userData = snapshot.val();

    console.log("Firebase snapshot result:", userData);

    if (!userData) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Unit check
    if ((userData.Unit_No || "").toLowerCase() !== unitNo.toLowerCase()) {
      return res.status(401).json({ message: "Unit No mismatch." });
    }

    // ✅ Password check (plain text for now — hash later in production)
    if (!userData.password || userData.password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // ✅ Success
    return res.status(200).json(userData);

  } catch (error) {
    console.error("Validation error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * ✅ POST /signup
 * Register a new user with unitNo + password
 */
app.post('/signup', async (req, res) => {
  const { email, unitNo, projectId, name, mobile, password } = req.body;
  console.log("Signup attempt:", { email, unitNo, projectId });

  if (!unitNo || !projectId || !password) {
    return res.status(400).json({ message: "Unit No, Password, and Project ID are required." });
  }

  try {
    const usersRef = db.ref(`${projectId}/users`);
    const sanitizedUnitNo = unitNo.toString().trim().replace(/\s+/g, "_");

    // 🔹 Check if already exists
    const snapshot = await usersRef.child(sanitizedUnitNo).once("value");
    if (snapshot.exists()) {
      return res.status(400).json({ message: "This Unit No is already registered for the selected project." });
    }

    // 🔹 Save under unitNo as key
    await usersRef.child(sanitizedUnitNo).set({
      email,
      Unit_No: unitNo,
      name,
      mobile,
      password,  // plain text for now
      createdAt: new Date().toISOString(),
    });

    return res.json({ message: "Signup successful!" });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "Signup failed." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}. Access it via Render public URL.`);
});

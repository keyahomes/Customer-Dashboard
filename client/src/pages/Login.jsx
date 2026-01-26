// src/pages/Login.jsx
import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../pages/firebase";
import { useNavigate } from "react-router-dom";
import { ref, get } from "firebase/database";
import keyalogo from '../assets/keyalogo.png';

function Login() {
  const [form, setForm] = useState({ email: "", unitNo: "", password: "" });
  const [message, setMessage] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const sanitizeUnit = (u) => {
    if (!u) return "";
    return u.toString().trim().replace(/\s+/g, "_");
  };

  const getProjectIdOrDefault = () => {
    const fromStorage = localStorage.getItem("projectId");
    return fromStorage;
  };

  // normalize helper for passwords and emails
  const normalizePwd = (s) =>
    (s || "")
      .toString()
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // remove zero-width/BOM
      .normalize("NFKC")
      .trim();

  const normalizeEmail = (s) => (s || "").toString().trim().toLowerCase();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const projectId = getProjectIdOrDefault();
      const unitNoRaw = (form.unitNo || "").toString().trim();
      const passwordRawInput = (form.password || "").toString();
      const emailRawInput = (form.email || "").toString().trim();

      // Require all three fields
      if (!unitNoRaw || !passwordRawInput || !emailRawInput || !projectId) {
        setMessage("Unit No, Email, and Password are required.");
        setLoading(false);
        return;
      }

      const sanitizedUnitNo = sanitizeUnit(unitNoRaw);

      // 1) Check signedinuser exists first
      const signedRef = ref(db, `${projectId}/signedinuser/${sanitizedUnitNo}`);
      const signedSnap = await get(signedRef);
      // console.log(
      //   "DEBUG: login checking signedinuser:",
      //   `${projectId}/signedinuser/${sanitizedUnitNo}`,
      //   "exists:",
      //   signedSnap.exists()
      // );

      if (!signedSnap.exists()) {
        setMessage("You are not registered. Please signup first.");
        setLoading(false);
        return;
      }

      const signedData = signedSnap.val();
      // console.log("DEBUG: signedinuser data:", signedData);

      // 2) Fetch authoritative user data from users path
      const usersRefChild = ref(db, `${projectId}/users/${sanitizedUnitNo}`);
      const usersSnap = await get(usersRefChild);
      // console.log(
      //   "DEBUG: login fetching users node:",
      //   `${projectId}/users/${sanitizedUnitNo}`,
      //   "exists:",
      //   usersSnap.exists()
      // );

      if (!usersSnap.exists()) {
        setMessage("User record missing under users/. Please contact admin.");
        setLoading(false);
        return;
      }

      const userData = usersSnap.val();
      // console.log("DEBUG: userData at users node:", userData);

      // 3) Email must match /users/{unit}.Email (case-insensitive)
      const storedEmail = normalizeEmail(userData.Email || userData.email || userData.EmailID || "");
      const enteredEmail = normalizeEmail(emailRawInput);

      // console.log("DEBUG: email compare -> stored:", storedEmail, "entered:", enteredEmail);
      if (!storedEmail || storedEmail !== enteredEmail) {
        setMessage("Email does not match records for this Unit No.");
        setLoading(false);
        return;
      }

      // 4) Password must match /signedinuser/{unit}.password
      const storedRawFromSigned = (signedData.password || "").toString();

      // normalize both
      const storedPassword = normalizePwd(storedRawFromSigned);
      const enteredPassword = normalizePwd(passwordRawInput);

      // DEBUG diagnostics
      // console.group("DEBUG: password compare (signedinuser)");
      // console.log("storedPassword (len):", storedPassword.length, "entered (len):", enteredPassword.length);
      // const charCodes = (s) => s.split("").slice(0, 12).map((c) => c.charCodeAt(0));
      // console.log("storedCodes:", charCodes(storedPassword));
      // console.log("enteredCodes:", charCodes(enteredPassword));
      // console.groupEnd();

      if (!storedPassword || storedPassword !== enteredPassword) {
        setMessage("Invalid password.");
        setLoading(false);
        return;
      }

      // Success: set local session flags
      localStorage.setItem("email", enteredEmail);
      localStorage.setItem("unitNo", unitNoRaw);
      localStorage.setItem("projectId", projectId);
      localStorage.setItem(`isLoggedIn_${projectId}`, "true");

      setMessage("Login successful.");
      setLoading(false);

      // Navigate to project home
      switch (projectId) {
        case "ATL":
          navigate("/home");
          break;
        case "SPRING":
          navigate("/springhome");
          break;
        case "TLT":
          navigate("/tlthome");
          break;
        case "LBL":
          navigate("/lblhome");
          break;
        case "TUF":
          navigate("/tufhome");
          break;
        default:
          navigate("/");
          break;
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Login failed.");
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    setMessage("");
    if (!form.email) {
      setMessage("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, form.email);
      setResetSent(true);
      // setMessage("Reset email sent — check your inbox.");
    } catch (error) {
      console.error("Reset error:", error);
      if (error.code === "auth/user-not-found") setMessage("No user found with that email.");
      else setMessage("Failed to send reset email.");
    }
  };

  return (
    <div style={wrapperStyle}>
      <header style={headerStyle}>
        <img src={keyalogo} alt="Keya Homes Logo" style={logoStyle} />
      </header>

      <main style={mainStyle}>
        <form onSubmit={handleLogin} style={formContainerStyle}>
          <h1 style={titleStyle}>Login / Register</h1>

          <input 
            style={inputStyle} 
            name="unitNo" 
            placeholder="Unit No" 
            value={form.unitNo} 
            onChange={handleChange} 
            required 
          />

          <input 
            style={inputStyle} 
            name="email" 
            placeholder="Email" 
            value={form.email} 
            onChange={handleChange} 
            required 
          />

          <input 
            style={inputStyle} 
            name="password" 
            type="password" 
            placeholder="Password" 
            value={form.password} 
            onChange={handleChange} 
            required 
          />

          <div style={{display: "flex", flexDirection:"row", gap: "10px" }}> 

            <button style={submitButtonStyle} type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <button style={loginLinkStyle} onClick={() => navigate("/signup")}>
              Sign up
            </button>

          </div>

          <div style={{ marginTop: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button type="button" onClick={handleForgot} style={forgotStyle}>
              Forgot password?
            </button>


          </div>

          {message && <p style={{ marginTop: "1rem", color: "#dc2626" }}>{message}</p>}
          {resetSent && <p style={{ marginTop: "0.5rem", color: "#16a34a" }}>Reset email sent.</p>}
        </form>
      </main>
    </div>
  );
}

/* styles same as earlier */
const wrapperStyle = {
  minHeight: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch"
};

const headerStyle = {
  width: "100%",
  backgroundColor: "#fff",
  boxShadow: "0 1px 2px rgba(0 0 0 / 0.1)"
};

const mainStyle = {
  flexGrow: 1,
  display: "flex",
  justifyContent: "center",
  padding: "6rem 1rem 3rem",
  width: "100%"
};

const logoStyle = {
  height: "60px",
  marginLeft: "1.5rem"
};

const formContainerStyle = {
  width: "100%",
  maxWidth: "400px",
  background: "white",
  padding: "1.5rem",
  borderRadius: "0.5rem",
  boxShadow: "0 8px 24px rgb(14 30 37 / 0.12)",
  // border:"1px solid red",
  maxHeight: "300px",
};

const titleStyle = {
  fontSize: "22px",
  fontWeight: 700,
  color: "#06b6d4",
  textAlign: "center",
  marginBottom: "1.5rem"
};

const inputStyle = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  fontSize: "1rem",
  borderRadius: "0.375rem",
  marginBottom: "1rem",
  boxSizing: "border-box",
  border: "1px solid grey"
};

const submitButtonStyle = {
  width: "50%",
  padding: "0.5rem",
  fontWeight: 700,
  background: "#1e40af",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

const forgotStyle = {
  color: "#1e40af",
  background: "none",
  border: "none",
  cursor: "pointer",
  fontSize: "0.9rem",
};

const loginLinkStyle = {
  width: "50%",
  padding: "0.5rem",
  fontWeight: 700,
  background: "#058a1fff",
  color: "white",
  border: "none",
  cursor: "pointer",
  fontSize: "16px",
};

export default Login;




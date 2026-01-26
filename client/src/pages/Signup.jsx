// src/pages/Signup.jsx
import { useState } from "react";
import { db } from "../pages/firebase";
import { ref, get, set } from "firebase/database";
import { useNavigate } from "react-router-dom";
import keyalogo from '../assets/keyalogo.png';

function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", unitNo: "", mobile: "", password: "" });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sanitizeUnit = (u) => {
    if (!u) return "";
    return u.toString().trim().replace(/\s+/g, "_");
  };

  const getProjectIdOrDefault = () => {
    const fromStorage = localStorage.getItem("projectId");
    return fromStorage;
  };

  const handleChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const projectId = getProjectIdOrDefault();
      const sanitizedUnitNo = sanitizeUnit(form.unitNo || "");

      if (!form.unitNo || !form.password || !form.email) {
        setMessage("Please fill required fields (Unit No, Email, Password).");
        setLoading(false);
        return;
      }

      // 1) Check signedinuser first (your requirement)
      const signedPath = `${projectId}/signedinuser/${sanitizedUnitNo}`;
      const signedRef = ref(db, signedPath);
      const signedSnap = await get(signedRef);

      // console.log("DEBUG: signup checking signedinuser path:", signedPath, "exists:", signedSnap.exists());

      if (signedSnap.exists()) {
        setMessage("You are already signed in.");
        setLoading(false);
        return;
      }

      // 2) If not signedinuser, check users path
      const usersPath = `${projectId}/users/${sanitizedUnitNo}`;
      const usersRefChild = ref(db, usersPath);
      const usersSnap = await get(usersRefChild);

      // console.log("DEBUG: signup checking users path:", usersPath, "exists:", usersSnap.exists());

      if (!usersSnap.exists()) {
        // user not present in canonical users -> do not allow signup
        setMessage("Unit not found in users. Please contact admin.");
        setLoading(false);
        return;
      }

      // 3) Create signedinuser record (only)
      const payload = {
        email: (form.email || "").toString().trim(),
        Unit_No: form.unitNo,
        unitNo: form.unitNo,
        name: form.name || "",
        mobile: form.mobile || "",
        password: (form.password || "").toString().trim(),
        createdAt: new Date().toISOString(),
      };

      // console.log("DEBUG: signup will write to signedinuser:", signedPath, "payload:", payload);
      await set(signedRef, payload);
      // console.log("DEBUG: signup write complete for signedinuser:", sanitizedUnitNo);

      // 4) Optionally inform backend - don't block success if backend fails
      try {
        const backendUrl = "https://keya-customer-dashboard-n1f8.onrender.com/signup";
        const res = await fetch(backendUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            projectId,
            unitNo: form.unitNo,
            password: payload.password,
            email: payload.email,
            name: payload.name,
            mobile: payload.mobile,
          }),
        });

        if (!res.ok) {
          // Log but don't block user
          const txt = await res.text().catch(() => "");
          // console.warn("Backend /signup returned non-ok:", res.status, txt);
        } else {
          console.log("Backend /signup responded ok.");
        }
      } catch (bkErr) {
        console.warn("Backend /signup call failed (ignored):", bkErr);
      }

      // Success
      setMessage("Signup successful — you're signed in for this unit.");
      setLoading(false);
      // set local session flags
      localStorage.setItem("projectId", projectId);
      localStorage.setItem("unitNo", form.unitNo);
      localStorage.setItem(`isLoggedIn_${projectId}`, "true");
      // navigate to login or dashboard as you prefer
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err);
      setMessage(err.message || "Signup failed.");
      setLoading(false);
    }
  };

  return (
    <div style={wrapperStyle}>
      <header style={headerStyle}>
        <img
          src={keyalogo}
          alt="Keya Homes Logo"
          style={logoStyle}
        />
      </header>

      <main style={mainStyle}>
        <form onSubmit={handleSubmit} style={formContainerStyle}>
          <h1 style={titleStyle}>Sign Up</h1>

          <input style={inputStyle} name="name" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input style={inputStyle} name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input style={inputStyle} name="unitNo" placeholder="Unit No " value={form.unitNo} onChange={handleChange} />
          <input style={inputStyle} name="mobile" placeholder="Mobile" value={form.mobile} onChange={handleChange} />
          <input style={inputStyle} name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} />

          <button style={submitButtonStyle} type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Sign up"}
          </button>

          <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
            <span style={{ fontSize: "0.9rem" }}>Already signed in? </span>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                color: "#1e40af",
                background: "none",
                border: "none",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "0.9rem",
              }}
            >
              Login
            </button>
          </div>

          {message && <p style={{ marginTop: "1rem", color: "#dc2626" }}>{message}</p>}
        </form>
      </main>
    </div>
  );
}

/* styles (same as before) */
const wrapperStyle = { 
  height: "100%", 
  display: "flex", 
  flexDirection: "column", 
  alignItems: "stretch" 
};

const headerStyle = { 
  width: "100%", 
  backgroundColor: "#fff", 
  boxShadow: "0 1px 2px rgba(0 0 0 / 0.1)" ,
};

const mainStyle = { 
  flexGrow: 1, 
  display: "flex", 
  justifyContent: "center", 
  padding: "4rem 1rem 3rem", 
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
};

const titleStyle = { 
  fontWeight: 700, 
  color: "#06b6d4", 
  textAlign: "center", 
  marginBottom: "1.5rem" ,
  fontSize: "22px",
};

const inputStyle = { 
  width: "100%", 
  padding: "0.5rem 0.75rem", 
  fontSize: "1rem", 
  borderRadius: "0.375rem", 
  marginBottom: "1rem", 
  boxSizing: "border-box" ,
  border: "1px solid grey",
};

const submitButtonStyle = { 
  width: "100%", 
  padding: "0.5rem", 
  fontWeight: 700, 
  background: "#1e40af", 
  color: "white", 
  border: "none", 
  cursor: "pointer" 
};

export default SignUp;

import { useEffect, useState, useRef } from "react";

import bgImage from "../assets/LBLbg.jpg";
import { getDatabase, ref, update, onValue } from "firebase/database";
import { getAuth } from "firebase/auth";



function LblHome() {
  if (!document.getElementById("scrollStyles")) {
    const styleTag = document.createElement("style");
    styleTag.id = "scrollStyles";
    styleTag.innerHTML = `
          @keyframes scroll-left {
            0% { transform: translateX(100%); }
            100% { transform: translateX(-100%); }
          }
          .scroll-text { animation: scroll-left 20s linear infinite; }
          .scroll-text:hover { animation-play-state: paused !important; cursor: pointer; }
        `;
    document.head.appendChild(styleTag);
  }

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); //  sidebar state
  const [activePage, setActivePage] = useState("dashboard");
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [profileImage, setProfileImage] = useState(null);


  const sectionRefs = {
    documents: useRef(null),
    summary: useRef(null),
    commondocuments: useRef(null),
    article: useRef(null),
    payments: useRef(null),
    crm: useRef(null),
  };


  const handleLogout = () => {
    // localStorage.clear();
    // window.location.href = "/";

    localStorage.removeItem("email");
    localStorage.removeItem("unitNo");
    localStorage.removeItem("projectId");
    // If you had stored profileImage locally before, also remove it
    localStorage.removeItem("profileImage");

    // Redirect to login page
    window.location.href = "/";

  };


  // Upload Profile Image
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;

      setProfileImage(base64Image);

      const db = getDatabase();
      const email = localStorage.getItem("email");
      const emailKey = email.replace(/\./g, ",");
      const userRef = ref(db, `LBL/signedinuser/${emailKey}`);

      await update(userRef, {
        profileImage: base64Image,
      });
    };
    reader.readAsDataURL(file);
  };


  // Delete Profile Image
  const handleImageDelete = async () => {
    setProfileImage(null);

    const db = getDatabase();
    const email = localStorage.getItem("email");
    const emailKey = email.replace(/\./g, ",");
    const userRef = ref(db, `LBL/signedinuser/${emailKey}`);

    await update(userRef, {
      profileImage: null,
    });
  };


  // CRM help ticket - form submit, these response will go to google sheet
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      // name: userData?.Name || "N/A",          // data taken from firebase 
      unitNo: userData?.Unit_No || "N/A",     // data taken from firebase
      subject,                                // data from the form submitted in website
      query,                                  // data from the form submitted in website
    };

    try { // It's the deployed link of google sheet - will change for each project 
      await fetch("https://script.google.com/macros/s/AKfycbwh0cS4pn6SBB4vYedGJPM7JttfCe2r5FvtMQWrxdB2_Jlc9eiDJvhDzMg-Fzi3ehA/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Form submitted successfully!");
      setSubject("");
      setQuery("");
      setShowForm(false);
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("Error submitting form");
    }
  };



  useEffect(() => {

    const email = localStorage.getItem("email");
    const unitNo = localStorage.getItem("unitNo");
    const projectId = localStorage.getItem("projectId");

    if (!email || !unitNo || !projectId) {
      // setError("User not logged in or project id missing");
      // setLoading(false);
      window.location.href = "/login";
      return;
    }

    const fetchUserData = async () => {
      try {

        // 1. Fetch main user data from backend
        const response = await fetch("https://keya-customer-dashboard-n1f8.onrender.com/validate-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, unitNo, projectId }),
        });

        if (!response.ok) throw new Error("Failed to fetch user data.");
        const data = await response.json();
        setUserData(data);

        // 2. Fetch Profile Image from Firebase
        const db = getDatabase();
        const emailKey = email.replace(/\./g, ",");
        const userRef = ref(db, `LBL/signedinuser/${emailKey}`);

        onValue(userRef, (snapshot) => {
          const val = snapshot.val();
          if (val?.profileImage) {
            setProfileImage(val.profileImage);
          } else {
            setProfileImage(null);
          }
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

      // after fetching the user data bot icon will appear
      // Code for chat bot - chatling.ai (dme)

      window.chtlConfig = { chatbotId: "6829542683" };
      // Paste the chatbotId from the chatling website widget after publishing , others remain the same

      const script = document.createElement("script");
      script.src = "https://chatling.ai/js/embed.js";
      script.async = true;
      script.setAttribute("data-id", "6829542683"); // Paste the same Id here also 
      script.setAttribute("id", "chatling-embed-script");
      script.type = "text/javascript";
      document.body.appendChild(script);

      return () => {
        document.getElementById("chatling-embed-script")?.remove();
      };

      // end of chatbot code


    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  const sidebarWidth = sidebarCollapsed ? 72 : 240;

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundColor: " #edf2f7ff",
        width: "100%",
        marginLeft: "8px",

      }}
    >
      {/* local CSS only for shell (sidebar + header). Your card styles remain below in 'styles' */}
      <style>{`
        .app-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 24px;
          border-bottom: 1px solid #ddd;
          z-index: 1100;
        }

        .app-header .logo {
          height: 70px;
          object-fit: contain;
          margin-left: 20px; 
        }

        .app-header .center-alert {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
        }

        .app-shell {
          display: flex;
          min-height: 100vh;
        }

        .hover-card {
          transition: all 0.3s cubic-bezier(0, 0, 0.5, 1);
          box-shadow: "0 2px 7px 0 rgba(220, 217, 217, 0.78)";
        }

        .hover-doccard {
          transition: all 0.3s cubic-bezier(0, 0, 0.5, 1);
          box-shadow: "0 2px 7px 0 rgba(220, 217, 217, 0.78)";
        }

        .hover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0px 2px 10px  rgba(165, 165, 165, 0.55); 
        }

        .hover-doccard:hover {
          transform: translateY(-2px);
          box-shadow: 0px 2px 10px  rgba(165, 165, 165, 0.55); 
        }

        .hover-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: #4068B0;
          text-decoration: none;
          font-size: 16px;
          //  backgroundColor: #fff;
          padding: 7px 20px;
          //  border-radius: 15px;
          gap: 10px;
          //  border: 2px solid transparent;
          transition: all 0.5s ease;
        }
 
        .sidebar {
          position: fixed;
          top: 80px;           /* sits under the header */
          left: 0;
          bottom: 0;
          width: 240px;
          background: rgba(255, 255, 255, 1);
          border-right: 1px solid #e7e7e7;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.05);
          transition: width 0.25s ease;
          z-index: 1050;
          display: flex;
          flex-direction: column;
        }

        .sidebar.collapsed { 
          width: 72px; 
        }

        .sidebar .collapse-toggle {
          border: none;
          background: transparent;
          height: 44px;
          font-size: 18px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid #eee;
        }

        .nav {
          padding: 10px 8px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          user-select: none;
          transition: background 0.2s ease, transform 0.1s ease;
          font-weight: 600;
          color: #000000ff;
        }

        .nav-item:hover { 
          background: rgba(64, 103, 176, 0.10); 
        }

        .nav-item:active { 
          transform: scale(0.99); 
        }

        .nav-item .icon {
          width: 22px;
          height: 22px;
          flex: 0 0 22px;
          filter: hue-rotate(0deg) saturate(80%);
        }

        .nav-label { 
          white-space: nowrap; 
          overflow: hidden; 
          text-overflow: ellipsis; 
          font-size: 15px; 
        }

        .sidebar.collapsed .nav-label { 
          display: none; 
        }

        .content {
          flex: 1;
          margin-top: 80px; /* header height */
          margin-left: 240px; /* sidebar width */
          transition: margin-left 0.25s ease;
        }

        .content.collapsed { 
          margin-left: 72px; 
        }

        /* Responsive tweak so the 12-col grid stacks on small screens */
        @media (max-width: 1024px) {
          .tuf-grid {
            grid-template-columns: repeat(6, minmax(0, 1fr)) !important;
          }
        }
        @media (max-width: 640px) {
          .tuf-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr)) !important;
          }
        }

      `}</style>



      {/* HEADER : left project logo, center notification, right user profile pic & name */}

      <header className="app-header">
        {/* project logo - left  */}
        <img src={"https://cdn.modlix.com/FIN/lifeByLake/LBL_KeyaHomes_Logo.webp"} alt="Project Logo" className="logo" />

        {/* header alert */}
        <div className="center-alert">
          <div style={styles.alertContainer}>
            <div className="scroll-text" style={styles.scrollText}>
              <img
                src="https://img.icons8.com/?size=100&id=8122&format=png&color=D30101"
                alt="Alert"
                style={styles.alertIcon}
              />
              {userData.Alert_Message}
            </div>
          </div>
        </div>

        {/* header user profile & name - right */}
        <div style={{ marginRight: "20px" }}>
          <div style={styles.headerAvatar}>
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
              />
            ) : (
              <div style={styles.headerAvatarFallback}>
                {userData?.Name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div style={{ fontSize: "14px", fontWeight: 600, color: "#000000ff", marginLeft: "12px" }}>
            {userData?.Name?.split(" ")[0] || "User"}
            {/*  if name in backend is "Mr/Mrs. FN MN LN then [1], else [0]"  */}
          </div>

        </div>

      </header>

      {/* sidebar + main container  */}
      <div className="app-shell">
        {/* sidebar  */}
        <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
          <button
            className="collapse-toggle"
            onClick={() => setSidebarCollapsed((v) => !v)}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? "»" : "«"}
          </button>

          <nav className="nav">
            <div
              className="nav-item"
              onClick={() => setActivePage("profile")}
              title="Profile"
            >
              <img
                className="icon"
                alt="Profile"
                src="https://img.icons8.com/ios-filled/50/000000/user.png"
              />
              <span className="nav-label">Profile</span>
            </div>

            <div
              className="nav-item"
              onClick={() => setActivePage("dashboard")}
              title="Dashboard"
            >
              <img
                className="icon"
                alt="Dashboard"
                src="https://img.icons8.com/ios-filled/50/000000/combo-chart.png"
              />
              <span className="nav-label">Dashboard</span>
            </div>

            <div
              className="nav-item"
              onClick={() => window.open("https://keyahomes.in/blog.html", "_blank")}
              title="Keya Article"
            >
              <img
                className="icon"
                alt="Articles"
                src="https://img.icons8.com/ios-filled/50/000000/book.png"
              />
              <span className="nav-label">Keya Article</span>
            </div>

            <div
              className="nav-item"
              onClick={handleLogout}
              title="Logout"
            >
              <img
                className="icon"
                alt="Logout"
                src="https://img.icons8.com/ios-filled/50/000000/logout-rounded.png"
              />
              <span className="nav-label">Logout</span>
            </div>

          </nav>
        </aside>

        {/* main cointainer  */}
        <main className={`content ${sidebarCollapsed ? "collapsed" : ""}`} style={{ padding: "0 0 40px 0" }}>
          {activePage === "dashboard" && (
            <>
              {/* Welcome Section */}
              <section style={styles.welcomeSection}>
                <h2 style={styles.welcomeText}>KEYA HOMES CUSTOMER DASHBOARD - LBL</h2>
              </section>

              {/* Top 3 cards - grid */}
              <section style={styles.grid3} className="tuf-grid">

                {/* card 1 (TOP SMALL CARD - left) */}
                <div
                  style={{ ...styles.cardT, ...styles.cardSmall, order: 0 }}
                // id=""
                // ref={}
                >
                </div>

                {/* card 2 (TOP SMALL CARD - center - CRM HELP TICKET) */}
                <div
                  style={{ ...styles.cardT, ...styles.cardSmallc, order: 1 }}
                  id="crm"
                  ref={sectionRefs.crm}
                >
                  {/* CRM help ticket */}
                  <div style={styles.cardContent}>
                    <button
                      style={styles.crmBtn}
                      onClick={() => setShowForm(true)}
                    >
                      CRM Help Ticket
                    </button>
                  </div>
                </div>

                {/* card 3 (TOP SMALL CARD - right) */}
                <div
                  style={{ ...styles.cardT, ...styles.cardSmall, order: 2 }}
                // id=""
                // ref={}
                >

                </div>

              </section>

              {/* Second row cards - Documents section  */}
              <div style={styles.parentcard}>

                {/* Documents - left */}
                <div
                  style={{ ...styles.doccard, ...styles.docWide, order: 4 }}
                  className="hover-doccard"
                  id="documents"
                  ref={sectionRefs.documents}
                >
                  <h3 style={styles.cardTitle}>DOCUMENTS</h3>
                  <div style={styles.doccardContent}>

                    <p style={{ marginTop: 0 }}>All your documents are availabe in the drive link below:</p>

                    <div style={{ width: "90%" }}>
                      <div style={styles.docGrid}>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <span>ATS</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <span>Money Receipt</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <span>Demand Note</span>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <span>Allotment Letter</span>
                        </div>

                      </div>

                      <div style={{ textAlign: "center", marginTop: "23px" }}>
                        <a
                          href={userData.Folder_Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover-button"
                        >
                          <img
                            src={"https://img.icons8.com/?size=100&id=82790&format=png&color=4068B0"}
                            alt="file"
                            width="34"
                            height="34"
                          />
                          <span>View all documents</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Documents - right */}
                <div
                  style={{ ...styles.doccard, ...styles.docWide, order: 5 }}
                  className="hover-doccard"
                  id="commondocuments"
                  ref={sectionRefs.commondocuments}
                >
                  <h3 style={styles.cardTitle}>COMMON DOCUMENTS</h3>
                  <div style={styles.doccardContent}>
                    <p style={{ marginTop: 0 }}>Below are the common documents for your flat:</p>
                    <div style={{ width: "90%", padding: "20px 0" }}>
                      <div style={styles.comdocGrid}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <a
                            href={userData.Legal_Document}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            View Legal Documents
                          </a>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=000000" alt="doc" width="24" height="24" />
                          <a
                            href={userData.TDS_Tutorial}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: "none", color: "black" }}
                          >
                            View TDS Tutorial
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* last row cards - summary & referal points */}
              <section style={styles.grid} className="tuf-grid">

                {/* summary - left */}
                <div
                  style={{ ...styles.card, ...styles.half, order: 6 }}
                  className="hover-card"
                  id="summary"
                  ref={sectionRefs.summary}
                >
                  <h3 style={styles.cardTitle}>SUMMARY</h3>
                  <div style={styles.cardContent}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>SI.No</th>
                          <th style={styles.th}>Name</th>
                          <th style={styles.th}>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summaryRow(1, "Unit No", userData?.Unit_No)}
                        {summaryRow(2, "CP", userData?.CP)}
                        {summaryRow(3, "Total Cost", userData?.Total_With_GST)}
                        {/* {summaryRow(4, "Due Amount", userData?.Due_Amount)} */}
                        {summaryRow(4, "Paid Amount", userData?.["Total_Collection_(TDS+Pay)"])}
                        {summaryRow(5, "Net Due Amount", userData?.Net_Total_Due)}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* referal points - right */}
                <div
                  style={{ ...styles.card, ...styles.half, order: 7 }}
                  className="hover-card"
                  id="points"
                  ref={sectionRefs.article}
                >
                  <h3 style={styles.cardTitle}>REFERAL POINTS</h3>
                  <div style={styles.cardContent}>
                    <p>Content of referal points </p>
                  </div>
                </div>

              </section>

            </>

          )}

          {showForm && (
            <div style={styles.modelOverlay}>
              <div style={styles.modalBox}>
                <button style={styles.closeBtn}
                  onClick={() => setShowForm(false)}>
                  X
                </button>

                <h3 style={{ textAlign: "center" }}>CRM HELP TICKET</h3>

                <form onSubmit={handleSubmit} style={styles.form}>
                  <label >Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    style={styles.input}
                  />

                  <label>Query</label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    required
                    style={styles.textarea}
                  />

                  <button type="submit" style={styles.submitBtn}>SUBMIT</button>
                </form>
              </div>
            </div>
          )}

          {activePage === "profile" && (
            <section style={styles.container}>
              {/* user name header */}
              <h2 style={styles.username}>
                {userData?.Name || "User Name"}
              </h2>

              <div style={styles.content}>
                {/* Left: profile picture placeholder */}
                <div style={styles.left}>
                  <div style={styles.avatar}>
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      userData?.Name?.charAt(0).toUpperCase() || "U"
                    )}
                  </div>


                  {/* Upload or Delete option */}
                  <div style={{ marginTop: "10px" }}>
                    {!profileImage ? (
                      <>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="avatar-upload" style={styles.uploadBtn}>
                          Upload Photo
                        </label>
                      </>
                    ) : (
                      <button onClick={handleImageDelete} style={styles.deleteBtn}>
                        Delete Photo
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: user details */}
                <div style={styles.right}>
                  <div style={{ ...styles.label, marginTop: "15px" }}>Name</div>
                  <div style={styles.box}>{userData?.Name || " "}</div>

                  <div style={styles.label}>Phone Number</div>
                  <div style={styles.box}>{userData?.Phone_Number || " "}</div>

                  <div style={styles.label}>Email Address</div>
                  <div style={styles.box}>{userData?.Email || "N/A"}</div>

                </div>
              </div>
            </section>
          )}

        </main>

      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <div>Address: Keya Homes Private Limited, Regent Court, #17, 80 Feet Road, Koramangala 4th Block, Bangalore</div>
        <div>Phone: +91 8040931141</div>
        <div>E-Mail: info@keyahomes.in</div>
        <br />
        <span>© 2026 <strong>Keya Homes Pvt Ltd</strong> | All rights reserved.</span>
      </footer>


    </div>
  );

}

const styles = {
  header: {
    // no longer used; header replaced by .app-header (kept here to avoid touching your obj)
    position: "fixed",
    top: 0,
    width: "100%",
    backgroundColor: "#fff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 40px",
    borderBottom: "1px solid #ddd",
    zIndex: 1000,
    overflow: "visible",
  },

  logo: { height: "70px" },

  alertContainer: {
    overflow: "hidden",
    width: "70%",
    border: "1px solid #4068B0",
    borderRadius: "15px",
    padding: "10px 0",
    margin: "10px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#fff",
  },

  uploadBtn: {
    display: "inline-block",
    padding: "8px 15px",
    backgroundColor: "#4068B0",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  deleteBtn: {
    padding: "8px 15px",
    backgroundColor: "#d9534f",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  },

  headerAvatar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "15px",
    marginBottom: "5px",
  },

  headerAvatarFallback: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#e0e0e0",
    color: "#4068B0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "600",
  },

  profileAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    border: "2px solid #dadadaff",
    marginBottom: "5px",
    backgroundColor: "#edededff",
    color: "#4068B0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "40px",
    fontWeight: "600",
    overflow: "hidden",
  },

  scrollText: {
    display: "inline-block",
    whiteSpace: "nowrap",
    color: "#d30101",
    fontWeight: 600,
    fontSize: "15px",
  },

  alertIcon: {
    marginRight: "10px",
    verticalAlign: "middle",
    height: "30px",

  },

  dropList: {
    padding: "10px 15px",
    textDecoration: "none",
    color: " rgb(229, 200, 131)",
    fontWeight: 550,
    cursor: "pointer",
  },

  welcomeSection: {
    display: "flex",
    flexDirection: "row",
    paddingTop: "5px", // a bit more to clear fixed header
    paddingBottom: "5px",
    justifyContent: "space-between", // push items to edges
    alignItems: "center",
  },

  welcomeText: {
    color: "rgb(0, 0, 0)",
    fontWeight: "600",
    fontSize: "20px",
    margin: "10px 20px 0px"
    // textShadow: "2px 2px 5px rgb(229, 200, 131)",
  },

  /* === LAYOUT: change to 12-column grid to position cards like your sketch === */
  grid3: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: "7px",
    padding: "20px 10px",
    boxSizing: "border-box",
    alignItems: "stretch",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: "15px",
    padding: "20px 10px",
    boxSizing: "border-box",
    alignItems: "stretch",
  },

  /* Spans & sizes (used above with ...styles.*) */
  cardSmall: { gridColumn: "span 4" },         // top two small cards
  cardSmallc: { gridColumn: "span 4" },
  docWide: { gridColumn: "span 6" }, // wide left doc area
  half: { gridColumn: "span 6" },              // summary + referral

  crmBtn: {
    height: "40px",
    width: "90%",
    borderRadius: "18px",
    border: "1px solid #4068B0",
    backgroundColor: " #d5dbe69c",
  },

  modelOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "110vw",
    height: "110vh",
    backgroundColor: " rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,

  },

  modalBox: {
    width: "500px",
    height: "350px",
    backgroundColor: " #fff",
    borderRadius: "10px",
    padding: "30px",
    paddingTop: "15px",
    position: "relative",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",

  },

  closeBtn: {
    position: "absoulute",
    // top: "10px",
    // right: "70px",
    background: "#eaecefff",
    border: "1px solid black",
    borderRadius: "2px",
    marginLeft: "490px",
    marginTop: "0px",
    fontSize: "14px",
    fontWeight: "400",
    cursor: "pointer",

  },

  form: {
    display: "flex",
    flexDirection: "column",
    marginTop: "20px",

  },

  input: {
    padding: "8px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "5px",

  },


  textarea: {
    padding: "8px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: " 5px",
    minHeight: "100px",

  },

  submitBtn: {
    padding: "10px",
    backgroundColor: " #d8e0f0ff",
    border: "none",
    color: "#4068B0",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",


  },

  cardT: {
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(7px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    boxShadow: "0px 2px 7px 0px rgba(8,78,161,0.45)",
    // border: "1px solid rgb(8,78,161)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    height: "130px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },

  parentcard: {
    display: "flex",
    gap: "10px",          // space between the two cards
    justifyContent: "space-between",
    // alignItems: "flex-start", // align top edges
    background: " #ffffffff",
    borderRadius: "20px",
    boxShadow: "0px 2px 7px 0px  rgba(8,78,161,0.45)",
    padding: "30px",
    margin: "10px",
    // height:"350px",
  },

  doccard: {
    background: "rgba(255, 255, 255, 0.7)",
    borderRadius: "20px",
    border: "1.5px solid rgba(234, 232, 232, 1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    height: "280px",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },

  doccardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "90%",
    overflowY: "auto",
    maxHeight: "300px",
    fontSize: "15px",
  },

  // Summary & referal point 
  card: {
    background: "rgba(255, 255, 255, 1)",
    border: "1.5px solid rgba(234, 232, 232, 1)",
    backdropFilter: "blur(7px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    height: "370px",
    position: "relative",
    overflow: "hidden",
    transition: "transform 0.3s ease",
  },

  cardTitle: {
    width: "100%",
    padding: "15px 0",
    fontWeight: "600",
    fontSize: "20px",
    color: " #4068B0",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    margin: "5px",
    boxShadow: "0 4px 8px rgba(236, 236, 236, 0.89)",
    borderBottom: "0.5px solid  rgb(236,236,236)",
    flexShirnk: 0,
  },

  cardContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    width: "90%",
    overflowY: "auto",
    scrollbarWidth: "thin",
    maxHeight: "300px",
    fontSize: "15px",
  },

  docGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: "3px",
    marginRight: "3px",
    marginTop: "5px",
  },

  comdocGrid: {
    display: "grid",
    gap: "18px",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: 0,

  },

  table: {
    width: "95%",
    borderCollapse: "collapse",
    marginTop: "5px",
  },

  th: {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#4068b07d",
  },

  td: {
    border: "1px solid #ccc",
    padding: "8px",
  },

  container: {
    padding: "30px",
    background: "#fff",
    borderRadius: "5px",
    boxShadow: "0px 2px 7px rgba(0,0,0,0.1)",
    margin: "20px",

  },

  username: {
    fontSize: "22px",
    fontWeight: "600",
    marginBottom: "40px",
    marginTop: "0px",
    color: "#4068B0",
  },

  content: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    gap: "60px",
  },

  left: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginLeft: "25px",
    // borderRight: "1px solid #ccc",
    // paddingRight: "40px",
  },

  avatar: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "2px solid #e3e3e3ff",
    marginTop: "15px",
    backgroundColor: "#f2f2f2",   // light background so text is visible
    color: "#4068B0",
    display: "flex",              // center the text
    alignItems: "center",         // vertically center
    justifyContent: "center",     // horizontally center
    fontSize: "48px",             // bigger letter
    fontWeight: "600",
    overflow: "hidden",
  },


  label: {
    fontWeight: "700",
    fontSize: "14px",
    marginTop: "10px",
    // marginBottom: "5px",
    color: "#444",
    marginBottom: "5px",
  },

  box: {
    height: "20px",
    width: "300px",
    border: "1px solid #d8d8d8ff",
    padding: "5px",
    marginBottom: "5px",
    textAlign: "left",
  },

  right: {
    display: "flex",
    flexDirection: "column",
    // gap: "15px",
    paddingLeft: "25px",
    borderLeft: "1px solid #d8d8d8ff",
    height: "220px",
  },

  footer: {
    backgroundColor: " rgba(255, 255, 255, 1)",
    color: "#4068B0",
    padding: "30px 10px 10px",
    textAlign: "center",
    fontSize: "14px",
    marginTop: "1.7rem",


  },




};

const summaryRow = (index, label, value) => (
  <tr key={index}>
    <td style={styles.td}>{index}</td>
    <td style={styles.td}>{label}</td>
    <td style={styles.td}>
      { typeof value === "number" || !isNaN(Number(value))
          ? Number(value).toLocaleString("en-IN")
          : value || "N/A" }
    </td>
  </tr>
);


export default LblHome;

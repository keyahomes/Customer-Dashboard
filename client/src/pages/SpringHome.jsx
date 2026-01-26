import { useEffect, useState, useRef } from "react";

import Springlogo from "../assets/SpringLogo1.png";
import { getDatabase, ref, update, onValue, get } from "firebase/database";
import { getAuth } from "firebase/auth";


function isValidUrl(str) {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}


function SpringHome() {
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
    const [activePage, setActivePage] = useState("dashboard");
    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState("");
    const [query, setQuery] = useState("");
    const [profileImage, setProfileImage] = useState(null);
    const [showLogout, setShowLogout] = useState(false);
    const [showKeyaUpdate, setShowKeyaUpdate] = useState(false);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [feedback, setFeedback] = useState("");




    const sectionRefs = {
        documents: useRef(null),
        summary: useRef(null),
        commondocuments: useRef(null),
        article: useRef(null),
        payments: useRef(null),
        crm: useRef(null),
    };


    const handleLogout = () => {
        localStorage.clear();
        window.location.href = "/";
    };

    // Suggestion Box - submitted form response will go to respective sheet
    const handleSuggestionSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            sheetName: "SPRING",
            // name: userData?.Name || "N/A",          // data taken from firebase 
            unitNo: userData?.Unit_No || "N/A",     // data taken from firebase
            suggestion,                                // data from the form submitted in website
            feedback,                                  // data from the form submitted in website
        };

        try {
            await fetch("https://script.google.com/macros/s/AKfycbzkBpNmMaOzGdIAfJHM-O0R_POxN5uB1us0TY4f_5wd9bp0R6fZiAc2St7uQyvfcCy_/exec", {
                method: "POST",
                mode: "no-cors",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            alert("Suggestion submitted successfully!");
            setSuggestion("");
            setFeedback("");
            setShowSuggestion(false);
        } catch (err) {
            console.error("Error submitting form:", err);
            alert("Error submitting form");
        }
    };

    // CRM help ticket - form submit, these response will go to google sheet
    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            sheetName: "Spring",
            // name: userData?.Name || "N/A",          // data taken from firebase 
            unitNo: userData?.Unit_No || "N/A",     // data taken from firebase
            subject,                                // data from the form submitted in website
            query,                                  // data from the form submitted in website
        };

        try { // It's the deployed link of google sheet - will change for each project 
            await fetch("https://script.google.com/macros/s/AKfycbzFxQBZLPoW4BI3IQdEuNOQDhB_Tu_-WAlxKo3_kUEgk8LhKWHH_C_pKSM3BAalDnM_/exec", {
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
                // get stored identifiers
                const email = localStorage.getItem("email");
                const unitNo = localStorage.getItem("unitNo");
                const projectId = localStorage.getItem("projectId");

                // Sanitized key for DB path
                const sanitizedUnitNo = (unitNo || "").toString().trim().replace(/\s+/g, "_");

                const db = getDatabase();
                const userRef = ref(db, `${projectId}/users/${sanitizedUnitNo}`);
                const snap = await get(userRef);

                if (!snap.exists()) {
                    throw new Error("User data not found in database.");
                }

                const data = snap.val();
                setUserData(data);

            } catch (err) {
                console.error("Error fetching user data: ", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }

            // after fetching the user data bot icon will appear
            // Code for chat bot - chatling.ai (dme)

            // window.chtlConfig = { chatbotId: "6829542683" };
            // // Paste the chatbotId from the chatling website widget after publishing , others remain the same

            // const script = document.createElement("script");
            // script.src = "https://chatling.ai/js/embed.js";
            // script.async = true;
            // script.setAttribute("data-id", "6829542683"); // Paste the same Id here also 
            // script.setAttribute("id", "chatling-embed-script");
            // script.type = "text/javascript";
            // document.body.appendChild(script);

            // return () => {
            //     document.getElementById("chatling-embed-script")?.remove();
            // };

            // end of chatbot code


        };

        fetchUserData();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;


    return (
        <div
            style={{
                // fontFamily: "sans-serif",
                backgroundSize: "cover",
                // backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundColor: " #ffffffff",
                width: "100%",
                // marginLeft: "8px",

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
                    background: linear-gradient(to right, #d6e686ff, #fff);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 24px;
                    border-bottom: 1px solid #ddd;
                    z-index: 1100;
                }

                .app-header .logo {
                    height: 150px;
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
        
                .content {
                    flex: 1;
                    margin-top: 80px; /* header height */
                    margin-left: 0; /* sidebar width */
                    padding: 20px;
                }

                .input:hover {
                    backgroundColor: #bcca77;
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
                {/* Project logo */}
                <div>
                    <img src={Springlogo} alt="Project Logo" className="logo" />
                </div>

                {/* header alert */}
                <div className="center-alert">
                    <div style={styles.alertContainer}>
                        <div className="scroll-text" style={styles.scrollText}>
                            <img
                                src="https://img.icons8.com/?size=100&id=8122&format=png&color=ffffff"
                                alt="Alert"
                                style={styles.alertIcon}
                            />
                            {userData.Alert_Message}
                        </div>
                    </div>
                </div>

                {/* header user profile & name - right */}
                <div style={styles.headerProfile}>
                    <div
                        style={styles.headerAvatar}
                        onClick={() => setShowLogout((prev) => !prev)}
                    >
                        {profileImage ? (
                            <img
                                src={profileImage}
                                alt="Profile"
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer1"
                                }}
                            />
                        ) : (
                            <div style={styles.headerAvatarFallback}>
                                {userData?.Name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#000000ff" }}>
                        Hello, {userData?.Name?.split(" ")[0] || "User"}
                    </div>

                    {/* Dropdown */}
                    {showLogout && (
                        <div style={styles.logoutDropdown}>
                            <div style={styles.logoutItem} onClick={handleLogout}>
                                LOGOUT
                            </div>
                        </div>
                    )}

                </div>

            </header>

            {/* main container */}
            <div className="app-shell">

                {/* main container */}
                <main className="content" style={{ padding: "20px" }}>
                    {activePage === "dashboard" && (
                        <>
                            {/* Welcome Section */}
                            <section style={styles.welcomeSection}>
                                <h2 style={styles.welcomeText}>YOUR DASHBOARD</h2>
                            </section>

                            {/* 2 - column layout */}
                            <div style={styles.dashboardLayout}>

                                {/* Left Column - Documents + Common Douments */}
                                <div style={styles.col}>

                                    {/* Documents */}
                                    <div style={{ ...styles.doccard, flex: 2 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>1. YOUR DOCUMENTS</h3>
                                        <div style={styles.doccardContent}>
                                            <p style={{ marginTop: "10px", color: "#4c723c" }}>
                                                All your documents are available in the drive link below:
                                            </p>

                                            <div style={styles.docRow}>
                                                <ul style={styles.docList}>
                                                    <li>SALE DEED</li>
                                                    <li>ATS</li>
                                                    <li>FINAL MONEY RECEIPT</li>
                                                    <li>NO DUE LETTER</li>
                                                    <li>E-KHATA</li>
                                                    <li>BESCOM NOC</li>
                                                    <li>OTHER DOCUMENTS</li>
                                                </ul>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "-10px",
                                                    marginBottom: "10px",
                                                    width: "100%",
                                                    display: "flex",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                <a
                                                    href={userData.Folder_Link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover-button"
                                                    style={{ display: "flex", alignItems: "center", gap: "8px", color: "#4c723c" }}
                                                >
                                                    <img
                                                        src="https://img.icons8.com/?size=100&id=82790&format=png&color=4C723C"
                                                        alt="file"
                                                        width="30"
                                                    />
                                                    <span>View all documents</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Common Document */}
                                    <div style={{ ...styles.doccard, flex: 1 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>2. COMMON DOCUMENTS</h3>
                                        <div style={styles.comdoccardContent}>
                                            <div style={styles.docList}>
                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=bcca77" width="20" />
                                                    <a href={userData.Project_Legal_Set} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#4c723c" }}>
                                                        LEGAL DOCUMENT SET - PROJECT 
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                                {/* Right column - 4 stacked cards */}
                                <div style={styles.rightCol}>

                                    {/* Suggestion Box */}
                                    <div
                                        style={styles.smallCard}
                                        onClick={() => setShowSuggestion(true)}
                                        className="hover-doccard"
                                    >
                                        3. SUGGESTION BOX
                                    </div>

                                    {/* Help Ticket */}
                                    <div
                                        style={styles.smallCard}
                                        onClick={() => setShowForm(true)}
                                        className="hover-doccard"
                                    >
                                        4. HELP DESK
                                    </div>

                                    {/* Referral */}
                                    <div style={styles.smallCard} className="hover-doccard">
                                        <a href={userData.Referal} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#4c723c", fontSize: "18px", fontWeight: "600" }}>
                                            5. REFERRAL REGISTRATION
                                        </a>
                                    </div>

                                    {/* Keya Update */}
                                    <div
                                        style={styles.smallCard}
                                        className="hover-doccard"
                                        onClick={() => {
                                            if (isValidUrl(userData?.Keya_Update)) {
                                                // open the link in a new tab directly
                                                window.open(userData.Keya_Update, "_blank", "noopener,noreferrer");
                                            } else {
                                                // show the modal for text updates
                                                setShowKeyaUpdate(true);
                                            }
                                        }}
                                    >
                                        6. KEYA UPDATE
                                    </div>

                                </div>

                            </div>

                        </>

                    )}

                    {showSuggestion && (
                        <div style={styles.modelOverlay}>
                            <div style={styles.modalBox}>
                                <button style={styles.closeBtn}
                                    onClick={() => setShowSuggestion(false)}>
                                    X
                                </button>

                                <h3 style={{ textAlign: "center", color: "#4c723c" }}>SUGGESTION BOX</h3>

                                <form onSubmit={handleSuggestionSubmit} style={styles.form}>
                                    <label>Suggestion Category</label>
                                    <select
                                        value={suggestion}
                                        onChange={(e) => setSuggestion(e.target.value)}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="">-- Select Suggestion Category --</option>
                                        <option value="1. Design">01. Design</option>
                                        <option value="2. Common Area">02. Common Area</option>
                                        <option value="3. Amenities">03. Amenities</option>
                                        <option value="4. Club House">04. Club House</option>
                                        <option value="5. Specifications">05. Specifications</option>
                                        <option value="6. Others">06. Others</option>
                                    </select>

                                    <label>Feedback</label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        required
                                        style={styles.textarea}
                                    />

                                    <button type="submit" style={styles.submitBtn}>SUBMIT</button>
                                </form>
                            </div>

                        </div>
                    )}

                    {showForm && (
                        <div style={styles.modelOverlay}>
                            <div style={styles.modalBox}>
                                <button style={styles.closeBtn}
                                    onClick={() => setShowForm(false)}>
                                    X
                                </button>

                                <h3 style={{ textAlign: " center", color: "#4c723c" }}>CRM HELP TICKET</h3>

                                <form onSubmit={handleSubmit} style={styles.form}>
                                    <label >Category</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="">-- Select Category --</option>
                                        <option value="1. Seepage Issue">01. Seepage Issue</option>
                                        <option value="2. Structure defect in Apartment">02. Structure defect in Apartment</option>
                                        <option value="3. Referral Payout">03. Referral Payout</option>
                                    </select>

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

                    {showKeyaUpdate && (
                        <div style={styles.modelOverlay}>
                            <div style={styles.updatemodalBox}>
                                <button
                                    style={styles.closeBtn}
                                    onClick={() => setShowKeyaUpdate(false)}
                                >
                                    X
                                </button>

                                <h3 style={{ textAlign: "center", color: "#4c723c" }}>KEYA UPDATE</h3>

                                <div style={{ marginTop: "20px", fontSize: "15px", lineHeight: "1.5", color: "#4c723c" }}>
                                    {userData?.Keya_Update
                                        ? userData.Keya_Update
                                        : "Next update will come shortly"}
                                </div>
                            </div>
                        </div>
                    )}



                </main>

            </div>

            {/* Footer */}
            <footer style={styles.footer}>
                <div>Address: Keya Homes Private Limited, Regent Court, #17, 80 Feet Road, Koramangala 4th Block, Bangalore</div>
                <div>Phone: +91 8040931141</div>
                <div>E-Mail: springcrm@keyahomes.in</div>
                <br />
                <span>© 2025 <strong>Keya Homes Pvt Ltd</strong> | All rights reserved.</span>
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
    width: "60%",
    border: "2px solid #aebb6dff",
    borderRadius: "30px",
    padding: "10px 0",
    margin: "10px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#bcca77",
  },

  scrollText: {
    display: "inline-block",
    whiteSpace: "nowrap",
    color: "#fff",
    fontWeight: 600,
    fontSize: "16px",
  },

  alertIcon: {
    marginRight: "10px",
    verticalAlign: "middle",
    height: "30px",

  },

  headerProfile: {
    position: "relative",
    marginRight: "20px",
    display: "flex",
    flexDirection: "row",
    border: "1px solid #bcca77",
    borderRadius: "20px",
    padding: "5px 10px",
    backgroundColor: "#fff",
    alignItems: "center",
    gap: "10px",

  },

  headerAvatar: {
    // display: "flex",
    // alignItems: "center",
    // justifyContent: "center",
    // marginLeft: "15px",
    // marginBottom: "5px",
  },

  headerAvatarFallback: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#d6e686ff",
    color: "#4c723c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "600",
    border: "1.5px solid #bcca77",
  },

  welcomeSection: {
    display: "flex",
    flexDirection: "row",
    // paddingTop: "5px", // a bit more to clear fixed header
    // paddingBottom: "5px",
    justifyContent: "space-between", // push items to edges
    alignItems: "center",
  },

  welcomeText: {
    color: "#4c723c",
    fontWeight: "600",
    fontSize: "20px",
    margin: "5px 10px 0px"
    // textShadow: "2px 2px 5px rgb(229, 200, 131)",
  },

  modelOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "110vh",
    backgroundColor: " rgba(0, 0, 0, 0.54)",
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

  updatemodalBox: {
    width: "500px",
    height: "150px",
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
    color: "#4c723c",
  },

  input: {
    padding: "8px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #bcca77",
    borderRadius: "5px",
    color: "#4c723c",

  },

  textarea: {
    padding: "8px",
    marginTop: "5px",
    marginBottom: "15px",
    border: "1px solid #bcca77",
    borderRadius: " 5px",
    minHeight: "100px",
    color: "#4c723c",

  },

  submitBtn: {
    padding: "10px",
    backgroundColor: " #bcca77",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "16px",


  },

  // all card title - left & middle
  cardTitle: {
    width: "100%",
    padding: "10px 0",
    fontWeight: "600",
    fontSize: "17px",
    color: " #4c723c",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    margin: "5px",
    boxShadow: "0 4px 8px rgba(236, 236, 236, 0.89)",
    borderBottom: "0.5px solid  rgba(236, 236, 236, 0.86)",
    flexShirnk: 0,
    // fontFamily:"poppins",
  },

  // left column
  doccard: {
    background: "rgba(255, 255, 255, 1)",
    borderRadius: "20px",
    border: "1.5px solid #bcca77",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    position: "relative",
    overflow: "hidden",
    // Height: "500px",
    maxHeight: "340px",
    minHeight: "150px",
    transition: "transform 0.3s ease",
    // ⛔ removed fixed height here

  },

  // doc content
  doccardContent: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 1)",
    justifyContent: "center",
    alignItems: "flex-start",
    width: "90%",
    overflowY: "auto",
    fontSize: "15px"
  },

  // common document content
  comdoccardContent: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 1)",
    justifyContent: "center",
    alignItems: "center",
    overflowY: "auto",
    fontSize: "14px",
    marginRight: "300px",
    padding: "5px",
    marginTop: "35px",
    // marginBottom : "-40px",

  },

  // doc & common doc list
  docList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "-2px",
    alignItems: "flex-start",
  },

  // doc & common doc row
  docRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    fontSize: "13px",
    color: "#4c723c",
    fontWeight: "500",
    wordSpacing: "0.5px",
    letterSpacing: "0.5px",
  },

  // column
  col: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    height: "100%",          // IMPORTANT: let this column stretch to grid row height
    alignItems: "stretch",
    flex: "1 0 auto",
    width: "100%",
  },

  // right column
  rightCol: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    height: "100%",
    alignItems: "stretch",

  },

  // cards inside right column
  smallCard: {
    flex: 1,
    textAlign: "center",
    fontWeight: 600,
    color: "#4c723c",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    background: "rgba(255, 255, 255, 1)",
    border: "1.5px solid #bcca77",
    borderRadius: "20px",
    transition: "transform 0.3s ease",
    fontSize: "17px",
  },

  footer: {
    backgroundColor: " #d6e686ff",
    color: "#4c723c",
    padding: "20px 10px 10px",
    textAlign: "center",
    fontSize: "14px",
    marginTop: "20px",


  },

  dashboardLayout: {
    padding: "0 100px 0 100px ",
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: "30px",
    marginTop: "25px",
    alignItems: "stretch",  // let each card take natural height
  },

  logoutDropdown: {
    position: "absolute",
    top: "60px",
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: "6px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
    zIndex: 1200,
  },

  logoutItem: {
    padding: "10px 15px",
    cursor: "pointer",
    fontWeight: "600",
    color: "#4c723c",
    whiteSpace: "nowrap",
  },

};


const summaryRow = (index, label, value, isCurrency = false) => {
  const isNumeric = typeof value === "number" || !isNaN(Number(value));
  const numValue = Number(value);

  return (
    <tr
      key={index}
    // style={{ backgroundColor: index % 2 === 0 ? "#4067b018" : "#4067b00d" }}
    >
      <td style={styles.td}>{index}</td>
      <td style={styles.td}>{label}</td>
      <td style={styles.td}>
        {isNumeric
          ? `${isCurrency ? "₹ " : ""}${Math.round(numValue).toLocaleString("en-IN")}`
          : value || "N/A"}
      </td>
    </tr>
  );
};

export default SpringHome;

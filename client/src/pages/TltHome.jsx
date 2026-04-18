import { useEffect, useState, useRef } from "react";

import TLTlogo from "../assets/TLTLogo.png";
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


function TltHome() {
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
    const [showProjectUpdate, setShowProjectUpdate] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);





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

    // CRM Help Ticket - form submit, these response will go to google sheet
    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitting(true); // start spinner

        const payload = {
            sheetName: "TLT",
            // name: userData?.Name || "N/A",          // data taken from firebase 
            unitNo: userData?.Unit_No || "N/A",     // data taken from firebase
            subject,                                // data from the form submitted in website - category
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
        } finally {
            setIsSubmitting(false); //stop spinner
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
                // get stored indentifiers
                const email = localStorage.getItem("email");
                const unitNo = localStorage.getItem("unitNo");
                const projectId = localStorage.getItem("projectId");

                // sanitized key for DB path
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
                console.error("Error fetching user data:", err);
                setError(err.message || "Failed to fetch user data.");
            } finally {
                setLoading(false);
            }

            // after fetching the user data bot icon will appear
            // code for chat bot - chatling.ai (dme)

            window.chtlConfig = { chatbotId: "1611512615" };
            // Paste the chatbotId from the chatling website widget after publishing, others remanun the same

            const script = document.createElement("script");
            script.src = "https://chatling.ai/js/embed.js";
            script.async = true;
            script.setAttribute("data-id", "1611512615"); // Paste the same Id here also 
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


    return (
        <div
            style={{
                // fontFamily: "poppins",
                backgroundSize: "100%",
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
                    background-image: linear-gradient(to right, #b0e4f3ff, #fff);
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
                    backgroundColor: #19a9cf;
                },

                @keyframes spin {
                    to {
                        transform: rotate(360deg);
                    }
                }

                button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
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
                {/* Project logo - left */}
                <div>
                    <img src={TLTlogo} alt="Project Logo" className="logo" />
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
                                    width: "45px",
                                    height: "45px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                    cursor: "pointer"
                                }}
                            />
                        ) : (
                            <div style={styles.headerAvatarFallback}>
                                {userData?.Name?.charAt(0).toUpperCase() || "U"}
                            </div>
                        )}
                    </div>
                    <div style={{ fontSize: "18px", fontWeight: 500, color: "#122f5a" }}>
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

            {/* sidebar + main container */}
            <div className="app-shell">

                {/* main container */}
                <main className="content" style={{ padding: "20px" }}>
                    {activePage === "dashboard" && (
                        <>
                            {/* Welcome Section */}
                            <section style={styles.welcomeSection}>
                                <h2 style={styles.welcomeText}>YOUR DASHBOARD</h2>
                            </section>

                            {/* 3-column layout */}
                            <div style={styles.dashboardLayout}>

                                {/* Left column - Documents + Instalment Payment + Common Documents*/}
                                <div style={styles.col}>

                                    {/* Registration and Handover Process */}
                                    <div style={{ ...styles.doccard, flex: 2 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>1. REGISTRATION AND HANDOVER PROCESS </h3>
                                        <div style={styles.comdoccardContent}>
                                            {/* <div style={styles.comdocGrid}> */}
                                            <div style={styles.docList}>
                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Stamp_Duty_Payment} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        STAMP DUTY PAYMENT COMPLETION
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.MODT_Payment} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        MODT PAYMENT COMPLETION (SBI CASES)
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Registration_Slot_Booking} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        REGISTRATION SLOT BOOKING
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Handover_Slot_Booking} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        HANDOVER SLOT BOOKING
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Reg_FAQ} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        REGISTRATION & HANDOVER FAQs
                                                    </a>
                                                </div>
                                            </div>
                                            {/* </div> */}
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    <div style={{ ...styles.doccard, flex: 3 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>2. YOUR DOCUMENTS</h3>
                                        <div style={styles.doccardContent}>
                                            <p style={{ marginTop: "1px", marginLeft: "10px", color: "#122f5a" }}>
                                                All your documents are available in the drive link below:
                                            </p>
                                            <div style={styles.docList}>

                                                <div style={styles.docRow}>
                                                    <ul style={styles.docList}>
                                                        <li>AGREEMENT</li>
                                                        <li>LATEST MONEY RECEIPT</li>
                                                        <li>LATEST DEMAND NOTE</li>
                                                        <li>OTHERS</li>
                                                    </ul>
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    marginTop: "-10px",
                                                    // marginBottom: "20px",
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
                                                    style={{ display: "flex", alignItems: "center", gap: "8px", color: "#122f5a" }}
                                                >
                                                    <img
                                                        src="https://img.icons8.com/?size=100&id=82790&format=png&color=122f5a"
                                                        alt="file"
                                                        width="30"
                                                    />
                                                    <span>View all documents</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Instalment Payment Submission */}
                                    <div style={{ ...styles.doccard2, flex: 2 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>3. INSTALMENT PAYMENT SUBMISSION </h3>
                                        <div style={styles.comdoccardContent}>
                                            {/* <div style={styles.comdocGrid}> */}
                                            <div style={styles.docList}>
                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Self_Payment_Link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        SELF PAYMENT
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Bank_Disbursement_Link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        BANK DISBURSEMENT
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.TDS_Payment_Challan_Link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        TDS PAYMENT CHALLAN
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>

                                                </div>
                                            </div>
                                            {/* </div> */}
                                        </div>
                                    </div>


                                </div>

                                {/* Middle column - Summary + TDS */}
                                <div style={styles.col}>

                                    {/* Summary */}
                                    <div style={{ ...styles.middlecard, flex: 2 }} className="hover-card">
                                        <h3 style={styles.cardTitle}>4. YOUR APARTMENT SUMMARY</h3>
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
                                                    {summaryRow(1, "Flat No", userData?.Unit_No)}
                                                    {summaryRow(2, "Car Park", userData?.CP)}
                                                    {summaryRow(3, "Car Park No", userData?.CP_Number)}
                                                    {summaryRow(4, "Total Cost", userData?.Total_Cost_with_GST, true)}
                                                    {summaryRow(5, "% Completion", userData?.Complete_Percentage + "%")}
                                                    {summaryRow(6, "Due Amount without TDS", userData?.Due_Amount, true)}
                                                    {summaryRow(7, "Paid Till Date", userData?.Paid_Amount, true)}
                                                    {summaryRow(8, "Net Due", userData?.Net_Due_Amount, true)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* TDS */}
                                    <div style={{ ...styles.middlecard, flex: 1 }} className="hover-card">
                                        <h3 style={styles.cardTitle}>5. TDS</h3>
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
                                                    {summaryRow(1, "Due Till Date", userData?.TDS_Due, true)}
                                                    {summaryRow(2, "Paid TDS", userData?.Paid_TDS, true)}
                                                    {summaryRow(3, "Net Due TDS", userData?.TDS_Net_Due, true)}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                </div>

                                {/* Right column - 4 stacked cards */}
                                <div style={styles.rightCol}>


                                    {/* Common Document */}
                                    <div style={{ ...styles.doccard3, flex: 1 }} className="hover-doccard">
                                        <h3 style={styles.cardTitle}>6. COMMON DOCUMENTS</h3>
                                        <div style={styles.comdoccardContent}>
                                            {/* <div style={styles.comdocGrid}> */}
                                            <div style={styles.docList}>
                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.Legal_Document} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        LEGAL DOCUMENT SET - PROJECT
                                                    </a>
                                                </div>

                                                <div style={styles.docRow}>
                                                    <img src="https://img.icons8.com/?size=100&id=1395&format=png&color=122f5a" width="18" />
                                                    <a href={userData.TDS_Tutorial} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a" }}>
                                                        TDS - TUTORIAL
                                                    </a>
                                                </div>

                                            </div>
                                            {/* </div> */}
                                        </div>
                                    </div>

                                    {/* Project Update Card */}
                                    <div
                                        style={styles.smallCard}
                                        className="hover-doccard"
                                        onClick={() => {
                                            if (isValidUrl(userData?.Project_Update)) {
                                                // open the link in a new tab directly
                                                window.open(userData.Project_Update, "_blank", "noopener,noreferrer");
                                            } else {
                                                // show the modal for text updates
                                                setShowProjectUpdate(true);
                                            }
                                        }}
                                    >
                                        7. PROJECT UPDATE
                                    </div>

                                    {/* Help Ticket */}
                                    <div
                                        style={styles.smallCard}
                                        onClick={() => setShowForm(true)}
                                        className="hover-doccard"
                                    >
                                        8. HELP DESK
                                    </div>

                                    {/* Referral */}
                                    <div style={styles.smallCard1} className="hover-doccard" >
                                        <a href={userData.Referal} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a", fontSize: "17px", fontWeight: "600" }}>
                                            9.1. REFERRAL REGISTRATION
                                        </a>
                                        <br />
                                        <a href={userData.Referal_Policy} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "#122f5a", fontSize: "17px", fontWeight: "600" }}>
                                            9.2. REFERRAL POLICY
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

                                        10. KEYA UPDATE
                                    </div>

                                </div>

                            </div>
                        </>
                    )}

                    {showForm && (
                        <div style={styles.modelOverlay}>
                            <div style={styles.modalBox}>
                                <button style={styles.closeBtn}
                                    onClick={() => setShowForm(false)}
                                    disabled={isSubmitting}>
                                    X
                                </button>

                                <h3 style={{ textAlign: " center", color: "#122f5a" }}>CRM HELP TICKET</h3>

                                <form onSubmit={handleSubmit} style={styles.form}>
                                    <label >Category</label>
                                    <select
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                        style={styles.input}
                                    >
                                        <option value="" >-- Select Category --</option>
                                        <option value="1. Payment Related/Instalment">01. Payment Related/Instalment</option>
                                        <option value="2. Ledger/Accounts">02. Ledger/Accounts</option>
                                        <option value="3. TDS">03. TDS</option>
                                        <option value="4. Documents, Drawing">04. Documents, Drawing</option>
                                        <option value="5. Technical Query">05. Technical Query</option>
                                        <option value="6. Modification/Customization">06. Modification/Customization</option>
                                        <option value="7. Project Completion">07. Project Completion</option>
                                        <option value="8. Project Possession">08. Project Possession</option>
                                        <option value="9. Referral Payout">09. Referral Payout</option>
                                        <option value="10. Others">10. Others</option>
                                    </select>

                                    <label>Query</label>
                                    <textarea
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        required
                                        style={styles.textarea}
                                    />

                                    <button type="submit" style={styles.submitBtn} disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span style={styles.spinner}></span>
                                                Submitting...
                                            </>
                                        ) : (
                                            "Submit"
                                        )}
                                    </button>
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

                                <h3 style={{ textAlign: "center", color: "#122f5a" }}>KEYA UPDATE</h3>

                                <div style={{ marginTop: "20px", fontSize: "15px", lineHeight: "1.5", color: "#122f5a" }}>
                                    {userData?.Keya_Update
                                        ? userData.Keya_Update
                                        : "Any update about Keya will be shown here"}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Project Update Modal */}
                    {showProjectUpdate && (
                        <div style={styles.modelOverlay}>
                            <div style={styles.updatemodalBox}>
                                <button
                                    style={styles.closeBtn}
                                    onClick={() => setShowProjectUpdate(false)}
                                >
                                    X
                                </button>

                                <h3 style={{ textAlign: "center", color: "#122f5a" }}>PROJECT UPDATE</h3>

                                <div style={{ marginTop: "20px", fontSize: "15px", lineHeight: "1.5", color: "#122f5a" }}>
                                    {userData?.Project_Update
                                        ?

                                        userData.Project_Update
                                        : "The next project update will come shortly."}
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
                <div>E-Mail: tltcrm@keyahomes.in</div>
                <br />
                <span>© 2026 <strong>Keya Homes Pvt Ltd</strong> | All rights reserved.</span>
            </footer>


        </div >
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
        border: "2px solid #19a9cf",
        borderRadius: "30px",
        padding: "10px 0",
        margin: "10px 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#47a5beff",
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
        border: "1px solid #19a9cf",
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
        backgroundColor: "#b0e4f3ff",
        color: "#122f5a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: "600",
        border: "1.5px solid #19a9cf",
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
        color: "#122f5a",
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
        color: "#122f5a",
    },

    input: {
        padding: "8px",
        marginTop: "5px",
        marginBottom: "15px",
        border: "1px solid #19a9cf",
        borderRadius: "5px",
        color: "#122f5a",

    },

    textarea: {
        padding: "8px",
        marginTop: "5px",
        marginBottom: "15px",
        border: "1px solid #19a9cf",
        borderRadius: " 5px",
        minHeight: "100px",

    },

    submitBtn: {
        padding: "10px",
        backgroundColor: " #19a9cf",
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
        color: " #122f5a",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        margin: "0 0 0 0px",
        boxShadow: "0 4px 8px rgba(236, 236, 236, 0.89)",
        borderBottom: "0.5px solid  rgb(236,236,236)",
        flexShirnk: 0,
    },

    // left column
    doccard: {
        background: "rgba(255, 255, 255, 1)",
        borderRadius: "20px",
        border: "1.5px solid #19a9cf",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "center",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        // Height: "500px",
        maxHeight: "340px",
        minHeight: "200px",
        transition: "transform 0.3s ease",
        // ⛔ removed fixed height here

    },

     doccard2: {
        background: "rgba(255, 255, 255, 1)",
        borderRadius: "20px",
        border: "1.5px solid #19a9cf",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "center",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        // Height: "500px",
        maxHeight: "340px",
        minHeight: "140px",
        transition: "transform 0.3s ease",
        // ⛔ removed fixed height here

    },

     doccard3: {
        background: "rgba(255, 255, 255, 1)",
        borderRadius: "20px",
        border: "1.5px solid #19a9cf",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        textAlign: "center",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        // Height: "500px",
        maxHeight: "340px",
        minHeight: "110px",
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
        fontSize: "15px",
        marginTop: "8px"
    },

    // common document content
    comdoccardContent: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(255, 255, 255, 1)",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto",
        fontSize: "14px",
        // marginRight: "250px",
        padding: "5px",
        marginTop: "10px",
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
        color: "#122f5a",
        fontWeight: "400",
    },

    // middle column
    col: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        height: "100%",          // IMPORTANT: let this column stretch to grid row height
        alignItems: "stretch",
        flex: "1 0 auto",
    },

    // cards inside middle column
    middlecard: {
        background: "rgba(255, 255, 255, 1)",
        borderRadius: "20px",
        border: "1.5px solid #19a9cf",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        maxHeight: "400px",
        minHeight: "200px",
        transition: "transform 0.3s ease",

        // ⛔ removed fixed height here
    },

    // whole table content - middle column
    cardContent: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px",
        width: "100%",
        overflowY: "auto",
        scrollbarWidth: "thin",
        maxHeight: "350px",
        minHeight: "100px",
        fontSize: "14px",
        fontWeight: "500",
    },

    // table - middle column
    table: {
        width: "95%",
        borderCollapse: "collapse",
        // marginTop: "0px",
        fontFamily: "lato",
    },

    // table header 
    th: {
        border: "1px solid #122f5a",
        padding: "8px",
        backgroundColor: "#b0e4f3ff",
        color: "#122f5a",

    },

    // table rows
    td: {
        border: "1px solid #122f5a",
        padding: "5px",
        color: "#122f5a",
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
        flexDirection: "column",
        textAlign: "center",
        fontWeight: 600,
        color: "#122f5a",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 1)",
        border: "1.5px solid #19a9cf",
        borderRadius: " 20px",
        transition: "transform 0.3s ease",
        fontSize: "17px",
    },

    smallCard1: {
        flex: 1,
        flexDirection: "column",
        textAlign: "center",
        fontWeight: 600,
        color: "#122f5a",
        display: "flex",
        justifyContent: "center",
        alignItems: "start",
        cursor: "pointer",
        background: "rgba(255, 255, 255, 1)",
        border: "1.5px solid #19a9cf",
        borderRadius: " 20px",
        transition: "transform 0.3s ease",
        fontSize: "17px",
        paddingLeft: "25px",
    },

    spinner: {
        width: "16px",
        height: "16px",
        border: "2px solid #fff",
        borderTop: "2px solid transparent",
        borderRadius: "50%",
        display: "inline-block",
        marginRight: "8px",
        animation: "spin 0.8s linear infinite",
    },

    footer: {
        backgroundColor: "#b0e4f3ff",
        color: "#122f5a",
        padding: "20px 10px 10px",
        textAlign: "center",
        fontSize: "14px",
        marginTop: "20px",


    },

    dashboardLayout: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr 0.8fr",
        gap: "15px",
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
        color: "#122f5a",
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


export default TltHome;

import { useNavigate } from 'react-router-dom';

import bgImage from "../assets/screenshot.png";
import atlLogo from '../assets/ATLlogo.png';
import lblLogo from '../assets/LBLlogo.jpg';
import tufLogo from '../assets/TUFlogo.png';
import springlogo from '../assets/SpringLogo.png';
import tltlogo from '../assets/TLTLogo1.png';
import keyalogo from '../assets/keyalogo.png';

const projects = [
    {
        id: 'ATL',
        // name: 'AROUND THE LIFE',
        logo: atlLogo,
        // background: atl,
    },
    {
        id: 'SPRING',
        // name: 'KEYA SPRING',
        logo: springlogo,
        // background: 'https://storage.googleapis.com/thelaketerraces/keyaspring/external/g7.webp',
    },
    {
        id: 'TLT',
        // name: 'THE LAKE TERRACE',
        logo: tltlogo,
        // background: './assets/tlt-bg.jpg',
    },
    {
        id: 'LBL',
        // name: 'LIFE BY THE LAKE',
        logo: lblLogo,
        // background: './assets/hills-bg.jpg',
    },
    {
        id: 'TUF',
        // name: 'THE URBAN FOREST',
        logo: tufLogo,
        // background: './assets/meadow-bg.jpg',
    },
];

export default function Main() {
    const navigate = useNavigate();

    const handleCardClick = (clickedProjectId) => {
        const isLoggedInForProject = localStorage.getItem(`isLoggedIn_${clickedProjectId}`) === 'true';

        // Always update the selected projectId
        localStorage.setItem('projectId', clickedProjectId);
        console.log("Stored projectId:", localStorage.getItem("projectId"));

        if (isLoggedInForProject) {
            // Navigate to respective home page
            switch (clickedProjectId) {
                case 'ATL':
                    navigate('/home');
                    break;
                case 'SPRING':
                    navigate('/springhome');
                    break;
                case 'TLT':
                    navigate('/tlthome');
                    break;
                case 'LBL':
                    navigate('/lblhome');
                    break;
                case 'TUF':
                    navigate('/tufhome');
                    break;
                default:
                    navigate('/');
            }
        } else {
            // Not logged in for this project — go to login
            navigate('/login');
        }
    };


    
    return (
        <div style={styles.mainContainer}>
            {/* Header */}
            <header style={styles.header}>
                <img
                    src={keyalogo}
                    alt="Keya Homes Logo"
                    style={styles.logo}
                />
            </header>

            {/* Cards Grid */}
            <div style={styles.cardGrid}>
                {projects.map((project) => (
                    <div
                        key={project.id}
                        style={styles.projectCard}
                        onClick={() => handleCardClick(project.id)}
                    >
                        <div
                            style={{
                                ...styles.cardBackground,
                                backgroundImage: `url(${project.background})`,
                            }}
                        />
                        <div style={styles.cardOverlay} />
                        <div style={styles.cardContent}>
                            <img src={project.logo} alt={project.id} style={styles.cardLogo} />
                            <div style={styles.cardName}>{project.name}</div>
                        </div>
                    </div>

                ))}
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
    mainContainer: {
        background: `url(${bgImage})`,
        // backgroundColor:"rgba(15, 184, 245, 0.81)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: '100vh',
        width: '100%',
        overflow: 'auto',
        paddingTop: '100px',
        fontFamily: "'Segoe UI', sans-serif",
    },

    header: {
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

    logo: {
        height: "70px",
    },

    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        padding: "20px 40px",
        boxSizing: "border-box",
        marginTop: "50px",
    },

    projectCard: {
        backgroundColor: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px',
        cursor: 'pointer',
        height: '200px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.39)',
    },

    cardBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        // filter: 'blur(0.8px) brightness(0.9)',  // dark and blur the image
        zIndex: 0,
    },

    cardOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        // backgroundColor: 'rgba(255, 255, 255, 0.03)', // semi-transparent dark layer
        zIndex: 1,
    },

    cardContent: {
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        textAlign: 'center',
    },

    cardLogo: {
        width: '300px',
        height: '180px',
        objectFit: 'contain',
        marginBottom: '20px',
    },

    // cardName: {
    //     color: 'white',
    //     fontSize: '25px',
    //     fontWeight: 'bold',
    //     whiteSpace: 'pre-line',
    //     textShadow: '1px 1px 4px rgba(0, 0, 0, 0.81)',
    // },



    footer: {
        backgroundColor: "#1e3a8a",
        color: "#fff",
        padding: "3rem 1rem",
        textAlign: "center",
        fontSize: "1rem",
        marginTop: "8.7rem",
    },
};

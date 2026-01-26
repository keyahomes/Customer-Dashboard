import { Routes, Route } from "react-router-dom";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Main from "./pages/Main";
import SpringHome from "./pages/SpringHome";
import TltHome from "./pages/TltHome";
import LblHome from "./pages/LblHome";
import TufHome from "./pages/TufHome";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/home" element={<Home />} />
      <Route path="/springhome" element={<SpringHome />}/>
      <Route path="/tlthome" element={<TltHome />} />
      <Route path="/lblhome" element={<LblHome />} />
      <Route path="/tufhome" element={<TufHome />} />
      {/* other routes */}

    </Routes>
  );
}

export default App;

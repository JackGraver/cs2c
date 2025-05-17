import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";
import Upload from "./pages/Upload";
import ToCome from "./pages/ToCome";
import Admin from "./pages/Admin";
import SideNavBar from "./component/navigation/SideNavBar";

export default function App() {
    return (
        <Router>
            <SideNavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/viewer" element={<Viewer />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/future" element={<ToCome />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </Router>
    );
}

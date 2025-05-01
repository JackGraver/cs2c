import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Viewer from "./pages/Viewer";
import Upload from "./pages/Upload";
import NavBar from "./component/NavBar";
import ToCome from "./pages/ToCome";

export default function App() {
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/viewer" element={<Viewer />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/future" element={<ToCome />} />
            </Routes>
        </Router>
    );
}

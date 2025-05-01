import { useNavigate } from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();
    return (
        <div className="fixed top-0 left-0 w-full h-12 z-50  text-white flex items-center justify-center border-b border-gray-500">
            <button
                onClick={() => navigate(`/`)}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
            >
                Home
            </button>
        </div>
    );
}

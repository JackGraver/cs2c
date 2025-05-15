import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NavBar() {
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { label: "Home", path: "/" },
        { label: "Upload", path: "/upload" },
        { label: "Admin", path: "/admin" },
        { label: "Future", path: "/future" },
    ];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuOpen]);

    return (
        <div className="fixed top-0 left-0 w-full h-12 z-50 text-white flex items-center justify-between border-b border-gray-500 px-4 ">
            {/* Left: Title */}
            <button
                onClick={() => navigate(`/`)}
                className="text-xl font-bold text-white"
            >
                CS2C
            </button>

            {/* Right: Hamburger and Menu */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={() => setMenuOpen((prev) => !prev)}
                    className="p-2 text-white hover:bg-gray-700 rounded"
                >
                    <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 6h16M4 12h16M4 18h16"
                        />
                    </svg>
                </button>

                {menuOpen && (
                    <div className="absolute right-0 mt-2 w-40 border border-gray-500 rounded shadow-lg z-50">
                        <ul className="flex flex-col">
                            {menuItems.map((item) => (
                                <li key={item.path}>
                                    <a
                                        href={item.path}
                                        className="px-4 py-2 text-sm hover:bg-gray-100 w-full text-left block"
                                        onClick={() => {
                                            // Allow normal link behavior (right-click/middle-click),
                                            // and just close the menu for regular left clicks
                                            setMenuOpen(false);
                                        }}
                                    >
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

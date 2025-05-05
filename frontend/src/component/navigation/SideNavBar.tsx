import { JSX, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Home,
    Upload,
    Shield,
    Rocket,
    Hourglass,
    ShieldCheck,
} from "lucide-react"; // Import icons
import React from "react";

const menuItems = [
    { label: "Home", path: "/", icon: <Home size={20} /> },
    { label: "Upload", path: "/upload", icon: <Upload size={20} /> },
    { label: "Admin", path: "/admin", icon: <ShieldCheck size={20} /> },
    { label: "Future", path: "/future", icon: <Hourglass size={20} /> },
];

export default function SideNavBar() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            {/* Spacer that pushes content only when collapsed */}
            {!open && <div className="w-12 shrink-0" />}

            {/* Sidebar itself */}
            <div
                className={`fixed top-0 left-0 z-50 h-1/4 text-white transition-all duration-300 ${
                    open ? "w-32" : "w-12"
                }`}
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
            >
                {/* Logo */}
                <div className={`p-4 text-lg font-bold`}>{"CS2C"}</div>

                {/* Menu items */}
                <ul className="space-y-2">
                    {menuItems.map(({ label, path, icon }) => (
                        <li
                            key={label}
                            className="group flex items-center px-4 space-x-2 cursor-pointer"
                            onClick={() => navigate(path)}
                        >
                            <span className="w-5 h-5 flex items-center justify-center">
                                {React.cloneElement(icon, { size: 20 })}
                            </span>
                            <span
                                className={`text-sm transition-all duration-300 ${
                                    open
                                        ? "opacity-100 translate-x-2 delay-100"
                                        : "opacity-0 -translate-x-2"
                                }`}
                            >
                                {label}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
}

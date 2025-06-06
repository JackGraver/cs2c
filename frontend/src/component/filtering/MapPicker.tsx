import { useState } from "react";

const maps = [
    { name: "None", map_name: "" },
    { name: "Ancient", map_name: "de_ancient", icon: "de_ancient.png" },
    { name: "Anubis", map_name: "de_anubis", icon: "de_anubis.png" },
    { name: "Dust2", map_name: "de_dust2", icon: "de_dust2.png" },
    { name: "Inferno", map_name: "de_inferno", icon: "de_inferno.png" },
    { name: "Mirage", map_name: "de_mirage", icon: "de_mirage.png" },
    { name: "Nuke", map_name: "de_nuke", icon: "de_nuke.png" },
    { name: "Train", map_name: "de_train", icon: "de_train.png" },
];

interface MapPickerProps {
    selectedMap: string | null;
    onSelectedMapChange: (map: string | null) => void;
}

export function MapPicker({
    selectedMap,
    onSelectedMapChange,
}: MapPickerProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const effectiveMap =
        maps.find((m) => m.map_name === selectedMap) || maps[0];

    const handleSelect = (mapName: string) => {
        onSelectedMapChange(mapName || null);
    };

    const handleToggleDropdown = () => {
        setDropdownOpen((prev) => !prev);
    };

    return (
        <div className="flex-1 relative w-64">
            <div
                onClick={handleToggleDropdown}
                className="w-full p-2 bg-gray-800 text-white rounded-md cursor-pointer"
            >
                <span className="inline-flex items-center gap-2">
                    {effectiveMap.icon ? (
                        <img
                            src={`map_icons/${effectiveMap.icon}`}
                            alt={effectiveMap.name}
                            className="w-6 h-6 object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6" />
                    )}
                    {effectiveMap.name}
                </span>
            </div>

            {dropdownOpen && (
                <div className="absolute z-10 w-full bg-gray-800 text-white border rounded-md mt-1 p-2">
                    <div className="max-h-72 overflow-y-auto">
                        {maps.map((map, index) => {
                            const isSelected =
                                selectedMap === map.map_name ||
                                (!selectedMap && map.map_name === "");

                            return (
                                <div
                                    key={map.name}
                                    className={`flex items-center justify-between p-2 hover:bg-gray-700 rounded-md cursor-pointer ${
                                        index % 2 === 0
                                            ? "bg-gray-700"
                                            : "bg-gray-600"
                                    }`}
                                    onClick={() => {
                                        handleSelect(map.map_name);
                                        setDropdownOpen(false);
                                    }}
                                >
                                    <div className="flex items-center space-x-3">
                                        {map.icon ? (
                                            <img
                                                src={`map_icons/${map.icon}`}
                                                alt={map.name}
                                                className="w-6 h-6 object-cover"
                                            />
                                        ) : (
                                            <div className="w-6 h-6" />
                                        )}
                                        <label>{map.name}</label>
                                    </div>
                                    {isSelected && (
                                        <span className="text-green-400 text-lg font-bold">
                                            ✓
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

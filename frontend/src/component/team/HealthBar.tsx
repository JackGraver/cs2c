export default function HealthBar({
    health,
    fillColor,
}: {
    health: number;
    fillColor: string;
}) {
    return (
        <div className="relative w-full h-4 bg-gray-700 rounded overflow-hidden">
            {/* Health bar fill */}
            <div
                className={`absolute top-0 left-0 h-full 
            ${health >= 21 ? fillColor : "bg-red-500"}
            transition-all duration-300`}
                style={{ width: `${health}%` }}
            />

            {/* Health number on top, right-aligned */}
            <span className="absolute top-0 right-1 text-xs text-white leading-4">
                {health}
            </span>
        </div>
    );
}

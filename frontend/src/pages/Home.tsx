import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setLoading(true);
        setError(null); // reset error

        try {
            const res = await fetch("http://127.0.0.1:8000/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            setLoading(false);

            if (res.ok && data.success) {
                navigate("/viewer");
            } else {
                setError(data.message || "Failed to parse demo.");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
            setError("An unexpected error occurred.");
        }
    };

    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Upload a .dem File</h1>
            <input type="file" accept=".dem" onChange={handleUpload} />
            {loading && <p className="mt-4 text-gray-400">Parsing demo...</p>}
            {error && <p className="mt-4 text-red-500">{error}</p>}
        </div>
    );
}

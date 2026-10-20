import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("code");

        if (code) {
            localStorage.setItem("session", code);
            navigate("/");
        } else {
            navigate("/");
        }
    }, [searchParams, navigate]);

    return <div className="p-4 text-center">Memproses login...</div>;
}

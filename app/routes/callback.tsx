import { useEffect } from "react";
import { useNavigate } from "react-router";

export default function Callback() {
    const navigate = useNavigate();

    useEffect(() => {
        navigate("/");
    }, [navigate]);

    return <div className="p-4 text-center">Memproses login...</div>;
}

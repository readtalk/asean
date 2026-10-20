import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const code = searchParams.get("code");
        const state = searchParams.get("state") || "/";

        if (code) {
            console.log("Keep code:", code);
            navigate(state);
        } else {
            navigate("/");
        }
    }, [searchParams, navigate]);

    return <div className="p-4 text-center">Loading login...</div>;
}

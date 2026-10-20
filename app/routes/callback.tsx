import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function Callback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCode = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state") || "/";

            if (!code) {
                navigate("/");
                return;
            }

            try {
                const response = await fetch("https://auth.soeparnocorp.workers.dev/token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: "https://asean.readtalk.workers.dev/callback",
                        client_id: "your-client-id",
                    }),
                });

                const data = await response.json();

                if (data.access_token) {
                    localStorage.setItem("session", data.access_token);
                    navigate(state);
                } else {
                    console.error("Token exchange failed:", data);
                    navigate("/");
                }
            } catch (error) {
                console.error("Error exchanging code:", error);
                navigate("/");
            }
        };

        exchangeCode();
    }, [searchParams, navigate]);

    return <div className="p-4 text-center">Memproses login...</div>;
}

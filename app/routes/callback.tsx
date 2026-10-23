import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/callback";

export function loader({ context }: Route.LoaderArgs) {
	try {
		const encodedUrl = context.cloudflare?.env?.OPENAUTH || "";
		const openAuthUrl = atob(encodedUrl).replace(/\/$/, "");
		return { openAuthUrl };
	} catch (error) {
		return { openAuthUrl: "https://openauth.readtalk.workers.dev" };
	}
}

export default function Callback({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const hasExchanged = useRef(false);

    useEffect(() => {
        if (hasExchanged.current) return;
        hasExchanged.current = true;

        const exchangeCode = async () => {
            const code = searchParams.get("code");

            if (!code) {
                navigate("/");
                return;
            }

            try {
                const verifier = localStorage.getItem("code_verifier") || "";
                const response = await fetch(`${loaderData.openAuthUrl}/token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    body: new URLSearchParams({
                        grant_type: "authorization_code",
                        code: code,
                        redirect_uri: "https://asean.readtalk.workers.dev/callback",
                        client_id: "your-client-id",
                        code_verifier: verifier,
                    }),
                });

                const data = await response.json();

                if (data.access_token) {
                    localStorage.setItem("session", data.access_token);
                    localStorage.removeItem("code_verifier");
                    navigate("/");
                } else {
                    navigate("/");
                }
            } catch (error) {
                navigate("/");
            }
        };

        exchangeCode();
    }, [searchParams, navigate, loaderData.openAuthUrl]);

    return <div className="p-4 text-center">Loading...</div>;
}

import { useState, useEffect } from "react";
import { getGravatarUrl } from "../utils/gravatar-url";

export function Welcome({ message }: { message: string }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState<string | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (session) {
			setIsLoggedIn(true);
			try {
				const base64Url = session.split(".")[1];
				const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
				const jsonPayload = decodeURIComponent(
					window.atob(base64)
						.split("")
						.map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
						.join("")
				);
				const payload = JSON.parse(jsonPayload);
				
				if (payload.properties && payload.properties.email) {
					setEmail(payload.properties.email);
					const url = getGravatarUrl(payload.properties.email);
					if (url) setAvatarUrl(url);
				}
			} catch (e) {
				console.error("Gagal decode JWT", e);
			}
		}
	}, []);

	const handleLogout = () => {
		localStorage.removeItem("session");
		localStorage.removeItem("code_verifier");
		setIsLoggedIn(false);
		setEmail(null);
		setAvatarUrl(null);
	};

	const handleLogin = async () => {
		setIsLoading(true);

		try {
			const array = new Uint32Array(56);
			window.crypto.getRandomValues(array);
			const verifier = Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');

			const hashBuffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const challenge = btoa(String.fromCharCode.apply(null, hashArray))
				.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

			localStorage.setItem("code_verifier", verifier);

			setTimeout(() => {
				window.location.href = `https://openauth.readtalk.workers.dev/authorize?response_type=code&client_id=your-client-id&redirect_uri=https://asean.readtalk.workers.dev/callback&code_challenge=${challenge}&code_challenge_method=S256`;
			}, 500);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

	return (
		<main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
			<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
				
				<div className="w-full text-center mb-8">
					<h1 className="text-3xl font-extrabold text-[#FF0000] tracking-tight">
						READTalk
					</h1>
					<p className="text-neutral-500 mt-2">
						{isLoggedIn ? "Anda sudah masuk" : "Selamat datang di ASEAN System"}
					</p>
				</div>

				{isLoggedIn ? (
					<div className="w-full flex flex-col gap-6">
						<div className="bg-neutral-100 p-6 rounded-xl border border-neutral-200 flex flex-col items-center gap-4">
							{avatarUrl ? (
								<img 
									src={avatarUrl} 
									alt="Avatar" 
									className="w-20 h-20 rounded-full object-cover border-2 border-neutral-300"
								/>
							) : (
								<div className="w-20 h-20 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500 text-2xl font-bold">
									{email ? email[0].toUpperCase() : "?"}
								</div>
							)}
							<div className="text-center">
								<p className="text-sm text-neutral-500 mb-1">Masuk sebagai:</p>
								<p className="font-semibold text-neutral-900 truncate max-w-[250px]">
									{email || "User"}
								</p>
							</div>
						</div>
						<button
							onClick={handleLogout}
							className="w-full h-12 flex items-center justify-center rounded-lg bg-neutral-900 text-white font-semibold hover:bg-neutral-800 transition-colors"
						>
							Logout
						</button>
					</div>
				) : (
					<div className="w-full flex flex-col gap-6">
						<div className="bg-neutral-100 p-6 rounded-xl border border-neutral-200 text-center">
							<p className="text-sm text-neutral-600 mb-4">
								{message}
							</p>
							<button
								onClick={handleLogin}
								disabled={isLoading}
								className="w-full h-12 flex items-center justify-center rounded-lg bg-[#FF0000] text-white font-semibold hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isLoading ? "Redirecting..." : "Login / Register"}
							</button>
						</div>
						
						<div className="flex justify-between text-sm text-neutral-500">
							<span>React Router + OpenAuth</span>
							<span>v1.0</span>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

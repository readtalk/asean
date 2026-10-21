import { useState, useEffect } from "react";
import { getGravatarUrl } from "../utils/gravatar-url";

export function Welcome({ message }: { message: string }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState<string | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	const [username, setUsername] = useState("");
	const [yourname, setYourname] = useState("");
	const [date_of_birth, setDateOfBirth] = useState("");

	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (session) {
			setIsLoggedIn(true);
			setToken(session);
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
		setToken(null);
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

	const handleSubmitSettings = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username || !yourname || !date_of_birth || !token) return;
		setIsLoading(true);

		try {
			const res = await fetch("https://openauth.readtalk.workers.dev/settings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${token}`
				},
				body: JSON.stringify({ username, yourname, date_of_birth })
			});
			const data = await res.json();
			if (data.success) {
				alert("Settings updated!");
			} else {
				alert("Failed: " + data.error);
			}
		} catch (error) {
			console.error(error);
			alert("Error updating settings");
		} finally {
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
						{isLoggedIn ? "Atur Pengaturan Anda" : "Selamat datang di ASEAN System"}
					</p>
				</div>

				{isLoggedIn ? (
					<div className="w-full flex flex-col gap-6">
						<div className="bg-neutral-100 p-4 rounded-xl border border-neutral-200 flex items-center gap-4">
							{avatarUrl ? (
								<img src={avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
							) : (
								<div className="w-12 h-12 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500 text-lg font-bold">
									{email ? email[0].toUpperCase() : "?"}
								</div>
							)}
							<div className="truncate">
								<p className="text-xs text-neutral-500">Masuk sebagai:</p>
								<p className="font-semibold text-neutral-900 truncate">{email}</p>
							</div>
						</div>

						<form onSubmit={handleSubmitSettings} className="flex flex-col gap-4">
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Username</label>
								<input
									type="text"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									required
									maxLength={14}
									pattern="[A-Za-z0-9_]+"
									className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
									placeholder="@username"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
								<input
									type="text"
									value={yourname}
									onChange={(e) => setYourname(e.target.value)}
									required
									className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
									placeholder="Nama Lengkap"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Lahir</label>
								<input
									type="date"
									value={date_of_birth}
									onChange={(e) => setDateOfBirth(e.target.value)}
									required
									className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]"
								/>
							</div>

							<button
								type="submit"
								disabled={isLoading}
								className="mt-2 w-full h-12 flex items-center justify-center rounded-lg bg-[#FF0000] text-white font-semibold hover:bg-[#CC0000] disabled:opacity-50 transition-colors"
							>
								{isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
							</button>
						</form>

						<button
							onClick={handleLogout}
							className="w-full h-10 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-100 transition-colors"
						>
							Logout
						</button>
					</div>
				) : (
					<div className="w-full flex flex-col gap-6">
						<div className="bg-neutral-100 p-6 rounded-xl border border-neutral-200 text-center">
							<p className="text-sm text-neutral-600 mb-4">{message}</p>
							<button
								onClick={handleLogin}
								disabled={isLoading}
								className="w-full h-12 flex items-center justify-center rounded-lg bg-[#FF0000] text-white font-semibold hover:bg-[#CC0000] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
							>
								{isLoading ? "Redirecting..." : "Login / Register"}
							</button>
						</div>
					</div>
				)}
			</div>
		</main>
	);
}

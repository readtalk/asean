import { useState, useEffect } from "react";
import { getGravatarUrl } from "../utils/gravatar-url";
import { Phone, LockKey, Globe, Heart, ChatText, CaretDown } from "@phosphor-icons/react";

export function Welcome({ message }: { message: string }) {
	const [showLogo, setShowLogo] = useState(true);
	
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [email, setEmail] = useState<string | null>(null);
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

	const [username, setUsername] = useState("");
	const [yourname, setYourname] = useState("");
	const [date_of_birth, setDateOfBirth] = useState("");

	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			setShowLogo(prev => !prev);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const session = localStorage.getItem("session");
		if (session) {
			setIsLoggedIn(true);
			setToken(session);
			
			let ws: WebSocket | null = null;

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

				fetch("https://openauth.readtalk.workers.dev/settings", {
					headers: { "Authorization": `Bearer ${session}` }
				})
				.then(res => res.json())
				.then(data => {
					if (data.success && data.user) {
						if (data.user.username) setUsername(data.user.username);
						if (data.user.yourname) setYourname(data.user.yourname);
						if (data.user.date_of_birth) setDateOfBirth(data.user.date_of_birth);
					}
				})
				.catch(err => console.error("Failed to fetch settings:", err));

				ws = new WebSocket(`wss://openauth.readtalk.workers.dev/ws?token=${session}`);
				ws.onopen = () => console.log("WS Connected");
				ws.onmessage = (event) => {
					const data = JSON.parse(event.data);
					console.log("WS Message:", data);
				};
				ws.onerror = (err) => console.error("WS Error:", err);

			} catch (e) {
				console.error("Gagal decode JWT", e);
			}

			return () => {
				if (ws) ws.close();
			};
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

	if (isLoggedIn) {
		return (
			<main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
				<div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
					<div className="w-full text-center mb-8">
						<h1 className="text-3xl font-extrabold text-[#FF0000] tracking-tight">READTalk</h1>
						<p className="text-neutral-500 mt-2">Atur Pengaturan Anda</p>
					</div>
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
								<input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required maxLength={14} pattern="[A-Za-z0-9_]+" className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]" placeholder="@username" />
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Nama Lengkap</label>
								<input type="text" value={yourname} onChange={(e) => setYourname(e.target.value)} required className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]" placeholder="Nama Lengkap" />
							</div>
							<div>
								<label className="block text-sm font-medium text-neutral-700 mb-1">Tanggal Lahir</label>
								<input type="date" value={date_of_birth} onChange={(e) => setDateOfBirth(e.target.value)} required className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF0000]" />
							</div>
							<button type="submit" disabled={isLoading} className="mt-2 w-full h-12 flex items-center justify-center rounded-lg bg-[#FF0000] text-white font-semibold hover:bg-[#CC0000] disabled:opacity-50 transition-colors">
								{isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
							</button>
						</form>
						<button onClick={handleLogout} className="w-full h-10 flex items-center justify-center rounded-lg border border-neutral-300 text-neutral-600 font-semibold hover:bg-neutral-100 transition-colors">
							Logout
						</button>
					</div>
				</div>
			</main>
		);
	}

	return (
		<div className="flex min-h-[100dvh] items-center justify-center bg-white dark:bg-zinc-950 px-4 py-8">
			<div className="w-full max-w-[400px] bg-white dark:bg-zinc-950">
				<div className="flex flex-col items-center gap-6">
					<div className="fade-up relative w-60 h-60 flex items-center justify-center">
						<img src="/assets/192.png" alt="READTalk Logo" className={`w-32 h-32 rounded-3xl shadow-xl absolute z-10 bg-white transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
						<div className={`absolute w-full h-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${!showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
							<ChatText size={180} weight="fill" className="absolute top-8 left-4 text-neutral-200 dark:text-neutral-800 rotate-[-8deg]" />
							<Phone size={40} weight="fill" className="absolute top-4 left-6 text-neutral-400 dark:text-neutral-500 rotate-[-15deg]" />
							<Heart size={38} weight="fill" className="absolute bottom-16 left-2 text-neutral-400 dark:text-neutral-500" />
							<Globe size={70} weight="fill" className="absolute top-2 right-2 text-neutral-300 dark:text-neutral-700" />
							<LockKey size={50} weight="fill" className="absolute bottom-4 right-6 text-neutral-400 dark:text-neutral-500" />
						</div>
					</div>

					<h1 className="fade-up fade-delay-1 mt-8 text-2xl font-bold text-neutral-900 dark:text-white text-center leading-tight">Welcome to READTalk</h1>
					<p className="fade-up fade-delay-1 text-sm text-neutral-500 dark:text-neutral-400 text-center leading-6 px-4">Read our <a href="https://readtalk.pages.dev/company/about" className="text-[#FF0000] font-medium">Privacy Policy</a>. Tap "Agree and continue" to accept the <a href="https://readtalk.pages.dev/company/contact" className="text-[#FF0000] font-medium">Terms of Service</a>.</p>
					
					<div className="fade-up fade-delay-2 flex items-center gap-2 text-sm font-medium text-neutral-800 dark:text-neutral-200">
						<Globe size={18} />
						<select className="appearance-none bg-transparent text-center focus:outline-none">
							<option value="en">English</option>
							<option value="id">Bahasa Indonesia</option>
						</select>
						<CaretDown size={14} />
					</div>

					<div className="fade-up fade-delay-3 w-full pt-4">
						<button 
							onClick={handleLogin} 
							disabled={isLoading}
							className="flex w-full h-12 items-center justify-center rounded-full bg-[#FF0000] text-base font-semibold text-white shadow-md transition active:scale-[0.98] hover:bg-[#CC0000] disabled:opacity-50"
						>
							{isLoading ? "Redirecting..." : "Agree and continue"}
						</button>
					</div>

					<p className="text-xs text-neutral-400 mt-2">{message}</p>
				</div>
			</div>

			<style>{`
				@keyframes fadeUp {
					from {
						opacity: 0;
						transform: translateY(12px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
				.fade-up {
					animation: fadeUp 0.5s ease-out both;
				}
				.fade-delay-1 { animation-delay: 0.1s; }
				.fade-delay-2 { animation-delay: 0.2s; }
				.fade-delay-3 { animation-delay: 0.3s; }
			`}</style>
		</div>
	);
}

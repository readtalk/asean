import { useState, useEffect } from "react";
import { Phone, LockKey, Globe, Heart, ChatText, CaretDown } from "@phosphor-icons/react";

export function Welcome() {
	const [showLogo, setShowLogo] = useState(true);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setShowLogo(prev => !prev);
		}, 2500);
		return () => clearInterval(interval);
	}, []);

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
				window.location.href = `https://auth.readtalk.workers.dev/authorize?response_type=code&client_id=your-client-id&redirect_uri=https://asean.readtalk.workers.dev/callback&code_challenge=${challenge}&code_challenge_method=S256`;
			}, 500);
		} catch (error) {
			console.error(error);
			setIsLoading(false);
		}
	};

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
				</div>
			</div>

			<style>{`
				@keyframes fadeUp {
					from { opacity: 0; transform: translateY(12px); }
					to { opacity: 1; transform: translateY(0); }
				}
				.fade-up { animation: fadeUp 0.5s ease-out both; }
				.fade-delay-1 { animation-delay: 0.1s; }
				.fade-delay-2 { animation-delay: 0.2s; }
				.fade-delay-3 { animation-delay: 0.3s; }
			`}</style>
		</div>
	);
}

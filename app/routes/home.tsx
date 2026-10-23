import type { Route } from "./+types/home";
import { Welcome } from "./auth/welcome";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "READTalk Messenger" },
		{ name: "description", content: "Welcome to READTalk!" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	try {
		const message = context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE;
		if (!message) {
			console.warn("VALUE_FROM_CLOUDFLARE undefinition");
			return { message: "Cloudflare (default)" };
		}
		return { message };
	} catch (error) {
		console.error("Error loader:", error);
		return { message: "Cloudflare (fallback)" };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return <Welcome message={loaderData.message} />;
}

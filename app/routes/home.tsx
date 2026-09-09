import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "New React Router App" },
		{ name: "description", content: "Welcome to React Router!" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	try {
		const message = context.cloudflare?.env?.VALUE_FROM_CLOUDFLARE;
		if (!message) {
			console.warn("VALUE_FROM_CLOUDFLARE tidak terdefinisi");
			return { message: "Hello from React Router (default)" };
		}
		return { message };
	} catch (error) {
		console.error("Error di loader:", error);
		return { message: "Hello from React Router (fallback)" };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return <Welcome message={loaderData.message} />;
}

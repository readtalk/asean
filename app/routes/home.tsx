import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
	return [
		{ title: "READTalk Messenger" },
		{ name: "description", content: "Welcome to READTalk!" },
	];
}

export function loader({ context }: Route.LoaderArgs) {
	try {
		const encodedUrl = context.cloudflare?.env?.OPENAUTH || "";
		const openAuthUrl = atob(encodedUrl).replace(/\/$/, "");
		return { openAuthUrl };
	} catch (error) {
		console.error("Error loader:", error);
		return { openAuthUrl: "https://openauth.readtalk.workers.dev" };
	}
}

export default function Home({ loaderData }: Route.ComponentProps) {
	return <Welcome openAuthUrl={loaderData.openAuthUrl} />;
}

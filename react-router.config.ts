import type { Config } from "@react-router/dev/config";

export default {
	ssr: true,
	splitRouteModules: true,
	future: {
		v8_middleware: true,
		v8_trailingSlashAwareDataRequests: true,
	},
} satisfies Config;

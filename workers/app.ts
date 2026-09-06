import { createRequestHandler, RouterContextProvider } from "react-router";
import { authContext } from "~/app/context";
import { createAuthHandler } from "./auth";

const routerHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // OpenAuth
    if (url.pathname === "/authorize" || url.pathname === "/callback") {
      const auth = createAuthHandler(env);
      return auth.fetch(request, env, ctx);
    }

    // 🔐 Ambil data user dari sesi (contoh)
    const userId = request.headers.get("x-user-id") || "anonymous";
    const email = request.headers.get("x-user-email") || "unknown";

    // 📦 Set context
    const context = new RouterContextProvider();
    context.set(authContext, { userId, email });
    context.set("cloudflare", { env, ctx });

    return routerHandler(request, context);
  },
} satisfies ExportedHandler<Env>;

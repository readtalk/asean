import { createRequestHandler, RouterContextProvider } from "react-router";
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

    // React Router
    const context = new RouterContextProvider();
    context.set("cloudflare", { env, ctx });

    return routerHandler(request, context);
  },
} satisfies ExportedHandler<Env>;

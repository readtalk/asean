import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";
import { createRequestHandler, RouterContextProvider } from "react-router";

const subjects = createSubjects({
  user: object({ id: string() }),
});

async function getOrCreateUser(env: Env, email: string): Promise<string> {
  const result = await env.AUTH_DB.prepare(
    `INSERT INTO user (email) VALUES (?) ON CONFLICT (email) DO UPDATE SET email = email RETURNING id;`
  )
    .bind(email)
    .first<{ id: string }>();
  if (!result) throw new Error(`Unable to process user: ${email}`);
  return result.id;
}

const routerHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Inisialisasi authHandler di dalam fetch, setelah env tersedia
    const authHandler = issuer({
      storage: CloudflareStorage({ namespace: env.AUTH_KV }),
      subjects,
      providers: {
        password: PasswordProvider(
          PasswordUI({
            sendCode: async (email, code) => {
              console.log(`Sending code ${code} to ${email}`);
            },
            copy: { input_code: "Code (check Worker logs)" },
          }),
        ),
      },
      theme: {
        title: "Authentication",
        primary: "#FFFFFF",
        favicon: "https://raw.githubusercontent.com/readtalk/asean/refs/heads/main/public/favicon.ico",
        logo: { dark: "https://raw.githubusercontent.com/readtalk/asean/refs/heads/main/public/brand.png", 
               light: "https://raw.githubusercontent.com/readtalk/asean/refs/heads/main/public/brand.png" },
      },
      success: async (ctx, value) => {
        const userId = await getOrCreateUser(env, value.email);
        return ctx.subject("user", { id: userId });
      },
    });

    // 1. Tangani endpoint OAuth
    if (url.pathname.startsWith("/authorize") || url.pathname.startsWith("/callback")) {
      return authHandler.fetch(request, env, ctx);
    }

    // 2. Untuk semua permintaan lain, gunakan React Router
    const context = new RouterContextProvider();
    context.set("cloudflare", { env, ctx });
    return routerHandler(request, context);
  },
} satisfies ExportedHandler<Env>;

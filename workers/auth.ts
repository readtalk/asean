import { issuer } from "@openauthjs/openauth";
import { CloudflareStorage } from "@openauthjs/openauth/storage/cloudflare";
import { PasswordProvider } from "@openauthjs/openauth/provider/password";
import { PasswordUI } from "@openauthjs/openauth/ui/password";
import { createSubjects } from "@openauthjs/openauth/subject";
import { object, string } from "valibot";
import { createContext } from "react-router";

const subjects = createSubjects({
  user: object({ id: string() }),
});

export const authContext = createContext<{
  userId: string;
  email: string;
}>();

export function createAuthHandler(env: Env) {
  return issuer({
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
      logo: { dark: "https://raw.githubusercontent.com/readtalk/asean/refs/heads/main/public/brand.png", light: "https://raw.githubusercontent.com/readtalk/asean/refs/heads/main/public/brand.png" },
    },
    success: async (ctx, value) => {
      const userId = await getOrCreateUser(env, value.email);
      return ctx.subject("user", { id: userId });
    },
  });
}

async function getOrCreateUser(env: Env, email: string): Promise<string> {
  const result = await env.AUTH_DB.prepare(
    `INSERT INTO user (email) VALUES (?) ON CONFLICT (email) DO UPDATE SET email = email RETURNING id;`
  )
    .bind(email)
    .first<{ id: string }>();
  if (!result) throw new Error(`Unable to process user: ${email}`);
  return result.id;
}

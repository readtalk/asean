import { useLoaderData } from "react-router";
import type { Route } from "./+types/profile";

export async function loader({ params }: Route.LoaderArgs) {
    const handle = params.handle;

    if (!handle?.startsWith("@")) {
        throw new Response("Not Found", { status: 404 });
    }

    const username = handle.slice(1);

    const response = await fetch(`https://openauth.readtalk.workers.dev/users`);

    if (!response.ok) {
        throw new Response("Failed to fetch data", { status: response.status });
    }

    const data = await response.json();
    const user = data.users.find((u: any) => u.username === username);

    if (!user) {
        throw new Response("User Not Found", { status: 404 });
    }

    return { user };
}

export default function Profile() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center">
                <h1 className="text-3xl font-extrabold text-[#FF0000] tracking-tight mb-8">
                    READTalk
                </h1>
                
                <div className="flex flex-col items-center gap-4">
                    {user.avatar ? (
                        <img src={user.avatar} alt={user.yourname} className="w-24 h-24 rounded-full object-cover border-4 border-neutral-200" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-neutral-300 flex items-center justify-center text-neutral-500 text-3xl font-bold">
                            {user.yourname ? user.yourname[0].toUpperCase() : "?"}
                        </div>
                    )}
                    
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-neutral-900">{user.yourname || "Anonymous"}</h2>
                        <p className="text-neutral-500">@{user.username}</p>
                    </div>

                    <div className="w-full mt-6 bg-neutral-100 p-4 rounded-xl text-center">
                        <p className="text-sm text-neutral-600">
                            Tanggal Lahir: {user.date_of_birth}
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}

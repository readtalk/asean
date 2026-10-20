import { Button } from "@/app/components/button/Button";

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-4xl font-bold">Welcome to ASEAN</h1>
            <Button
                onClick={() => {
                    window.location.href = "https://auth.soeparnocorp.workers.dev/authorize?client_id=your-client-id&redirect_uri=https://asean.readtalk.workers.dev/callback&response_type=code&state=/dashboard";
                }}
            >
                Login
            </Button>
        </div>
    );
}

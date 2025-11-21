import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="border-b bg-background">
            <div className="flex h-16 items-center px-5">
                <Link href="/" className="font-bold text-xl mr-6 tracking-tight">
                    Señales
                </Link>
                <div className="flex items-center space-x-4 lg:space-x-6 mx-6">
                    <Link
                        href="/curation"
                        className="text-sm font-medium transition-colors hover:text-primary"
                    >
                        Curation
                    </Link>
                    <Link
                        href="/trends"
                        className="text-sm font-medium transition-colors hover:text-primary"
                    >
                        Trends
                    </Link>
                    <Link
                        href="/admin"
                        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                    >
                        Admin
                    </Link>
                </div>
                <div className="ml-auto flex items-center space-x-4">
                    <Button variant="outline" asChild>
                        <Link href="/admin">Login</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}

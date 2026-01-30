import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Phone, Search, UserCircle } from "lucide-react";

export function MainNav() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                    <Home className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold tracking-tight">ImobPremium</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link href="/imoveis" className="transition-colors hover:text-primary">
                        Imóveis
                    </Link>
                    <Link href="/sobre" className="transition-colors hover:text-primary">
                        Sobre
                    </Link>
                    <Link href="/contato" className="transition-colors hover:text-primary">
                        Contato
                    </Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <Link href="/admin">
                        <Button variant="ghost" size="sm">
                            <UserCircle className="mr-2 h-4 w-4" />
                            Área do Corretor
                        </Button>
                    </Link>
                    <Button size="sm" className="hidden md:flex">
                        <Phone className="mr-2 h-4 w-4" />
                        Fale Conosco
                    </Button>
                </div>
            </div>
        </header>
    );
}

import { HeroSection } from "@/components/hero-section";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
    return (
        <div className="flex flex-col min-h-screen">
            <HeroSection />

            <section className="py-16 bg-muted/20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-bold tracking-tight">Imóveis em Destaque</h2>
                        <Link href="/imoveis">
                            <Button variant="outline">Ver Todos</Button>
                        </Link>
                    </div>

                    <div className="text-center text-muted-foreground py-10">
                        <p>Carregando imóveis...</p>
                        {/* TODO: Property Grid Component */}
                    </div>
                </div>
            </section>
        </div>
    );
}

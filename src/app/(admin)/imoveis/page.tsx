import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function AdminPropertiesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Meus Imóveis</h1>
                <Link href="/admin/imoveis/novo">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Novo Imóvel
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md p-8 text-center text-muted-foreground bg-white">
                <p>Nenhum imóvel cadastrado (Mock).</p>
            </div>
        </div>
    );
}

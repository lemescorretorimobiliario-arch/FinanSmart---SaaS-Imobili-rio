import { PropertyForm } from "@/components/admin/property-form";

export default function NewPropertyPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Cadastrar Novo Imóvel</h1>
            </div>
            <div className="bg-background border rounded-lg p-6 shadow-sm">
                <PropertyForm />
            </div>
        </div>
    );
}

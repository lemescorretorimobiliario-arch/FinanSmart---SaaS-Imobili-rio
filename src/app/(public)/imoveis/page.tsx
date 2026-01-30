import { PropertyCard } from "@/components/property-card";
import { Property } from "@/types";

// Mock data
const properties: Property[] = [
    {
        id: "1",
        title: "Prédio Comercial no Centro",
        description: "Excelente localização para escritórios.",
        price: 1500000,
        type: "sale",
        address_full: "Rua das Flores, 123, Centro",
        latitude: -23.55052,
        longitude: -46.633308,
        images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"],
        features: { bedrooms: 0, bathrooms: 4, parking: 10, area: 500 },
        status: "active",
        created_at: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Apartamento de Luxo",
        description: "Vista para o mar e acabamento premium.",
        price: 850000,
        type: "sale",
        address_full: "Av. Oceânica, 45, Praia Grande",
        latitude: -23.55052,
        longitude: -46.633308,
        images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
        features: { bedrooms: 3, bathrooms: 2, parking: 2, area: 120 },
        status: "active",
        created_at: new Date().toISOString(),
    },
    // Add more mock data as needed
];

export default function ImoveisPage() {
    return (
        <div className="container py-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Imóveis Disponíveis</h1>
                    <p className="text-muted-foreground">Confira nossa seleção exclusiva de propriedades.</p>
                </div>
                {/* Filters could go here */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                ))}
            </div>
        </div>
    );
}

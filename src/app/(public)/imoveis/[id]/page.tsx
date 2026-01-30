import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Car, Maximize, Phone } from "lucide-react";
import Image from "next/image";

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Mock data fetching
    const property = {
        id,
        title: "Prédio Comercial no Centro",
        price: 1500000,
        description: "Imóvel comercial com ampla área...",
        address: "Rua das Flores, 123",
        images: ["https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"],
    };

    return (
        <div className="container py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <div className="relative h-[400px] w-full overflow-hidden rounded-lg mb-4">
                        <Image
                            src={property.images[0]}
                            alt={property.title}
                            fill
                            className="object-cover"
                        />
                    </div>
                    {/* Gallery thumbnails could go here */}
                </div>

                <div className="space-y-6">
                    <div>
                        <Badge className="mb-2">Venda</Badge>
                        <h1 className="text-3xl font-bold">{property.title}</h1>
                        <div className="flex items-center text-muted-foreground mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            {property.address}
                        </div>
                    </div>

                    <div className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                    </div>

                    <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                        <div className="text-center">
                            <Bed className="mx-auto h-5 w-5 mb-1" />
                            <span className="text-sm font-medium">4</span>
                        </div>
                        <div className="text-center">
                            <Bath className="mx-auto h-5 w-5 mb-1" />
                            <span className="text-sm font-medium">2</span>
                        </div>
                        <div className="text-center">
                            <Car className="mx-auto h-5 w-5 mb-1" />
                            <span className="text-sm font-medium">2</span>
                        </div>
                        <div className="text-center">
                            <Maximize className="mx-auto h-5 w-5 mb-1" />
                            <span className="text-sm font-medium">120m²</span>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Descrição</h3>
                        <p className="text-muted-foreground">{property.description}</p>
                    </div>

                    <div className="h-[200px] bg-muted flex items-center justify-center rounded-lg">
                        <MapPin className="h-8 w-8 text-muted-foreground mr-2" />
                        <span className="text-muted-foreground font-medium">Mapa do Google (Integração)</span>
                    </div>

                    <Button size="lg" className="w-full">
                        <Phone className="mr-2 h-4 w-4" /> Tenho Interesse
                    </Button>
                </div>
            </div>
        </div>
    );
}

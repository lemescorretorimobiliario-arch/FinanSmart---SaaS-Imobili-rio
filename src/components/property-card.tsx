import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, Bath, Car, Maximize, MapPin } from "lucide-react";
import { Property } from "@/types";

interface PropertyCardProps {
    property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
    return (
        <Card className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative h-48 w-full overflow-hidden">
                <Image
                    src={property.images[0] || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80"}
                    alt={property.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-2 left-2 bg-primary/90">
                    {property.type === 'sale' ? 'Venda' : 'Aluguel'}
                </Badge>
                <Badge variant="secondary" className="absolute top-2 right-2">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                </Badge>
            </div>
            <CardHeader className="p-4">
                <h3 className="line-clamp-1 font-semibold text-lg">{property.title}</h3>
                <div className="flex items-center text-muted-foreground text-sm mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="line-clamp-1">{property.address_full}</span>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" /> {property.features.bedrooms}
                    </div>
                    <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" /> {property.features.bathrooms}
                    </div>
                    <div className="flex items-center">
                        <Car className="h-4 w-4 mr-1" /> {property.features.parking}
                    </div>
                    <div className="flex items-center">
                        <Maximize className="h-4 w-4 mr-1" /> {property.features.area}m²
                    </div>
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Link href={`/imoveis/${property.id}`} className="w-full">
                    <Button variant="outline" className="w-full">Ver Detalhes</Button>
                </Link>
            </CardFooter>
        </Card>
    );
}

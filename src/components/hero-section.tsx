"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
    return (
        <div className="relative h-[600px] w-full flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://images.unsplash.com/photo-1600596542815-50e840bd1663?auto=format&fit=crop&q=80"
                    alt="Luxury Home"
                    fill
                    className="object-cover brightness-50"
                    priority
                />
            </div>
            <div className="relative z-10 container mx-auto px-4">
                <h1 className="text-4xl md:text-6xl font-bold text-white text-center mb-8 drop-shadow-md">
                    Encontre o Imóvel dos Seus Sonhos
                </h1>
                <Card className="max-w-4xl mx-auto bg-white/95 backdrop-blur shadow-2xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-center md:text-left">Busca Rápida</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="location">Localização</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input id="location" placeholder="Cidade ou Bairro" className="pl-8" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="type">Tipo</Label>
                                <Select>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Qualquer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sale">Comprar</SelectItem>
                                        <SelectItem value="rent">Alugar</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="bedrooms">Quartos</Label>
                                <Select>
                                    <SelectTrigger id="bedrooms">
                                        <SelectValue placeholder="Qualquer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1+</SelectItem>
                                        <SelectItem value="2">2+</SelectItem>
                                        <SelectItem value="3">3+</SelectItem>
                                        <SelectItem value="4">4+</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-end">
                                <Button className="w-full" size="lg">
                                    <Search className="mr-2 h-4 w-4" /> Buscar
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

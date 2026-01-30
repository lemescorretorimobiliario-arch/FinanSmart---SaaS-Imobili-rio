"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { geocodeAddress } from "@/lib/google-maps";
import { Loader2, MapPin } from "lucide-react";

const propertySchema = z.object({
    title: z.string().min(5, "Título muito curto"),
    price: z.coerce.number().min(0),
    type: z.enum(["sale", "rent"]),
    address_full: z.string().min(10, "Endereço deve ser completo"),
    latitude: z.number(),
    longitude: z.number(),
    description: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertySchema>;

export function PropertyForm() {
    const [loadingGeo, setLoadingGeo] = useState(false);

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertySchema),
        defaultValues: {
            title: "",
            price: 0,
            type: "sale",
            address_full: "",
            latitude: 0,
            longitude: 0,
            description: "",
        },
    });

    async function handleAddressBlur() {
        const address = form.getValues("address_full");
        if (address && address.length > 10) {
            setLoadingGeo(true);
            const coords = await geocodeAddress(address);
            setLoadingGeo(false);

            if (coords) {
                form.setValue("latitude", coords.lat);
                form.setValue("longitude", coords.lng);
            }
        }
    }

    function onSubmit(data: PropertyFormValues) {
        console.log(data);
        // TODO: Save to Supabase
        alert("Imóvel salvo! (Simulação)");
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Título do Anúncio</FormLabel>
                            <FormControl>
                                <Input placeholder="Ex: Apartamento 3 quartos no Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Preço (R$)</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        onChange={e => field.onChange(+e.target.value)}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecione o tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="sale">Venda</SelectItem>
                                        <SelectItem value="rent">Aluguel</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4 border p-4 rounded-md bg-muted/20">
                    <h3 className="font-semibold flex items-center">
                        <MapPin className="mr-2 h-4 w-4" /> Localização
                    </h3>
                    <FormField
                        control={form.control}
                        name="address_full"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Endereço Completo</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Input
                                            placeholder="Rua, Número, Bairro, Cidade - UF"
                                            {...field}
                                            onBlur={(e) => {
                                                field.onBlur();
                                                handleAddressBlur();
                                            }}
                                        />
                                        {loadingGeo && (
                                            <div className="absolute right-3 top-2.5">
                                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                </FormControl>
                                <FormDescription>
                                    Digite o endereço para buscar as coordenadas automaticamente.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="latitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Latitude</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly className="bg-muted" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="longitude"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Longitude</FormLabel>
                                    <FormControl>
                                        <Input {...field} readOnly className="bg-muted" />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Descrição</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Descreva o imóvel..." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" size="lg" className="w-full">
                    Salvar Imóvel
                </Button>
            </form>
        </Form>
    );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BarChart3, Building2, LayoutDashboard, Users, LogOut } from "lucide-react";

export function AdminNav() {
    const pathname = usePathname();

    const links = [
        { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/imoveis", label: "Imóveis", icon: Building2 },
        { href: "/admin/leads", label: "Leads / CRM", icon: Users },
        { href: "/admin/relatorios", label: "Relatórios", icon: BarChart3 },
    ];

    return (
        <div className="flex bg-slate-100 dark:bg-slate-900 w-64 flex-col border-r min-h-screen">
            <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight">ImobAdmin</h2>
            </div>
            <nav className="flex-1 space-y-2 px-4">
                {links.map((link) => {
                    const Icon = link.icon;
                    return (
                        <Link key={link.href} href={link.href}>
                            <Button
                                variant={pathname.startsWith(link.href) ? "default" : "ghost"}
                                className={cn("w-full justify-start", pathname.startsWith(link.href) && "bg-primary text-primary-foreground")}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Button>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t">
                <Button variant="outline" className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
            </div>
        </div>
    );
}

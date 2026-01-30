import { AdminNav } from "@/components/admin-nav";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1 overflow-y-auto p-8 bg-muted/10">
                {children}
            </main>
        </div>
    );
}

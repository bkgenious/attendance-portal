import { Sidebar } from "@/components/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            {/* Desktop Sidebar */}
            <div className="hidden md:block fixed h-full z-50">
                <Sidebar />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between">
                <div className="font-bold text-lg bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">
                    Vedlinks Portal
                </div>
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-r border-white/10 bg-black/95 w-72">
                        <Sidebar />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 pt-20 md:p-8 md:pl-72 overflow-y-auto">
                <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </div>
            </main>
        </div>
    );
}

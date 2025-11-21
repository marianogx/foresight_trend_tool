import { AdminSidebar } from "@/components/AdminSidebar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="container mx-auto py-10">
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                {/* Mobile Sidebar */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon">
                                <Menu className="h-4 w-4" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[250px] sm:w-[300px]">
                            <div className="py-4">
                                <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                                    Admin
                                </h2>
                                <AdminSidebar className="px-0" />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:block lg:w-1/5">
                    <AdminSidebar />
                </aside>

                {/* Main Content */}
                <div className="flex-1 w-full">
                    <div className="space-y-0.5 mb-6">
                        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
                        <p className="text-muted-foreground">
                            Manage feeds, settings, and users.
                        </p>
                    </div>
                    <Separator className="mb-6" />
                    {children}
                </div>
            </div>
        </div>
    )
}

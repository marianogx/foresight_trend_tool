"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Rss,
    Settings,
    Users,
    Globe,
    CheckCircle2,
    TrendingUp,
    ScrollText
} from "lucide-react"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function AdminSidebar({ className }: SidebarProps) {
    const pathname = usePathname()

    const items = [
        {
            label: "Feeds",
            href: "/admin/feeds",
            icon: Rss,
        },
        {
            label: "Curation",
            href: "/admin/curation",
            icon: CheckCircle2,
        },
        {
            label: "Trends",
            href: "/admin/trends",
            icon: TrendingUp,
        },
        {
            label: "Users",
            href: "/admin/users",
            icon: Users,
        },
        {
            label: "Logs",
            href: "/admin/logs",
            icon: ScrollText,
        },
        {
            label: "Settings",
            href: "/admin/settings",
            icon: Settings,
        },
    ]

    return (
        <div className={cn("pb-12", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Admin
                    </h2>
                    <div className="space-y-1">
                        {items.map((item) => (
                            <Button
                                key={item.href}
                                variant={pathname === item.href ? "secondary" : "ghost"}
                                className="w-full justify-start"
                                asChild
                            >
                                <Link href={item.href}>
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Link>
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

"use client";

import { useEffect, useState } from "react";
import { fetchFeeds, fetchArticles, getTrendSummaries } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rss, FileText, CheckCircle2, TrendingUp, ScrollText } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        feeds: 0,
        articles: 0,
        pendingCuration: 0,
        trends: 0
    });

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const [feeds, articles, trends] = await Promise.all([
                fetchFeeds(),
                fetchArticles(),
                getTrendSummaries()
            ]);

            const pending = articles.filter((a: any) => a.signal_strength === "pending" || !a.signal_strength).length;

            setStats({
                feeds: feeds.length,
                articles: articles.length,
                pendingCuration: pending,
                trends: trends.length
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    };

    const StatCard = ({ title, value, icon: Icon, href, color }: any) => (
        <Link href={href}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer border-border/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium font-mono uppercase tracking-wider text-muted-foreground">
                        {title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${color}`} />
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{value}</div>
                </CardContent>
            </Card>
        </Link>
    );

    return (
        <div className="space-y-12">
            {/* Stats Grid */}
            <div>
                <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <StatCard
                        title="Total Feeds"
                        value={stats.feeds}
                        icon={Rss}
                        href="/admin/feeds"
                        color="text-blue-500"
                    />
                    <StatCard
                        title="Total Articles"
                        value={stats.articles}
                        icon={FileText}
                        href="/admin/curation"
                        color="text-gray-500"
                    />
                    <StatCard
                        title="Pending Curation"
                        value={stats.pendingCuration}
                        icon={CheckCircle2}
                        href="/admin/curation"
                        color="text-yellow-500"
                    />
                    <StatCard
                        title="Trend Reports"
                        value={stats.trends}
                        icon={TrendingUp}
                        href="/admin/trends"
                        color="text-green-500"
                    />
                    <StatCard
                        title="System Logs"
                        value="View"
                        icon={ScrollText}
                        href="/admin/logs"
                        color="text-purple-500"
                    />
                </div>
            </div>

            {/* Activity Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                            Activity chart placeholder
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        System initialized
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Ready to fetch signals.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchArticles } from "@/lib/api";
import { Article } from "@/types";
import CurationCarousel from "@/components/CurationCarousel";
import CurationGrid from "@/components/CurationGrid";
import { Button } from "@/components/ui/button";
import { Loader2, LayoutGrid, GalleryHorizontal, Filter, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CurationPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<"carousel" | "grid">("grid"); // Default to grid for the new layout

    // Filters
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "curated">("pending");
    const [steepvFilter, setSteepvFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");

    const loadArticles = useCallback(async () => {
        setLoading(true);
        try {
            const data = await fetchArticles();
            setArticles(data);
        } catch (error) {
            console.error("Failed to load articles", error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Filter logic
    useEffect(() => {
        let result = articles;

        // Status Filter
        if (statusFilter === "pending") {
            result = result.filter(a => !a.signal_strength || a.signal_strength === 'pending');
        } else if (statusFilter === "curated") {
            result = result.filter(a => a.signal_strength && a.signal_strength !== 'pending');
        }

        // STEEPV Filter
        if (steepvFilter !== "all") {
            result = result.filter(a => a.steepv_category === steepvFilter);
        }

        // Date Filter
        if (dateFilter !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

            if (dateFilter === "today") {
                result = result.filter(a => new Date(a.published_at) >= today);
            } else if (dateFilter === "week") {
                result = result.filter(a => new Date(a.published_at) >= weekAgo);
            }
        }

        setFilteredArticles(result);
    }, [articles, statusFilter, steepvFilter, dateFilter]);

    useEffect(() => {
        loadArticles();
    }, [loadArticles]);

    const handleArticleUpdate = (id: number, newSignal: string) => {
        // Update local state immediately to reflect changes without re-fetching/re-sorting
        setArticles(prev => prev.map(a => a.id === id ? { ...a, signal_strength: newSignal } : a));
    };

    const resetFilters = () => {
        setStatusFilter("pending");
        setSteepvFilter("all");
        setDateFilter("all");
    };

    // Group articles by STEEPV for the "numbered sections" layout
    const groupedArticles = filteredArticles.reduce((acc, article) => {
        const category = article.steepv_category || "Uncategorized";
        if (!acc[category]) acc[category] = [];
        acc[category].push(article);
        return acc;
    }, {} as Record<string, Article[]>);

    const steepvCategories = ["Social", "Technological", "Economic", "Environmental", "Political", "Values"];

    return (
        <div className="mx-auto max-w-screen-2xl px-6 py-12 min-h-screen flex flex-col">
            <div className="mb-12 border-b border-border/50 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                    <div>
                        <h1 className="text-6xl font-serif font-bold tracking-tighter mb-2">Señales</h1>
                        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
                            Research & Strategy • Internal Document • ©2025
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant={viewMode === "grid" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            title="Grid View"
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === "carousel" ? "default" : "outline"}
                            size="icon"
                            onClick={() => setViewMode("carousel")}
                            title="Carousel View"
                        >
                            <GalleryHorizontal className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="flex flex-wrap gap-4 mt-8 items-center">
                    <div className="flex items-center gap-2 text-sm font-mono uppercase text-muted-foreground mr-2">
                        <Filter className="w-4 h-4" /> Filters:
                    </div>

                    <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                        <SelectTrigger className="w-[140px] bg-background border-border/50">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="pending">Pending Only</SelectItem>
                            <SelectItem value="curated">Curated Only</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={steepvFilter} onValueChange={setSteepvFilter}>
                        <SelectTrigger className="w-[160px] bg-background border-border/50">
                            <SelectValue placeholder="STEEPV Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {steepvCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-[140px] bg-background border-border/50">
                            <SelectValue placeholder="Date" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Time</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">Past Week</SelectItem>
                        </SelectContent>
                    </Select>

                    {(statusFilter !== "pending" || steepvFilter !== "all" || dateFilter !== "all") && (
                        <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-foreground">
                            Reset
                        </Button>
                    )}

                    <div className="ml-auto text-xs font-mono text-muted-foreground">
                        {filteredArticles.length} signals found
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {filteredArticles.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                            <p className="text-lg mb-4">No signals match your filters.</p>
                            <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
                        </div>
                    ) : (
                        viewMode === "carousel" ? (
                            <CurationCarousel
                                articles={filteredArticles}
                                onUpdate={loadArticles}
                                onArticleUpdate={handleArticleUpdate}
                            />
                        ) : (
                            <div className="space-y-16">
                                {steepvCategories.map((category, index) => {
                                    const categoryArticles = groupedArticles[category];
                                    if (!categoryArticles?.length && steepvFilter !== "all") return null;
                                    if (!categoryArticles?.length) return null;

                                    return (
                                        <section key={category} className="relative border-t border-border/30 pt-8">
                                            <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-8">
                                                <div className="md:w-1/4">
                                                    <span className="text-9xl font-serif font-bold text-muted/10 absolute -top-10 left-0 select-none">
                                                        {index + 1}
                                                    </span>
                                                    <h2 className="text-4xl font-bold relative z-10 mt-4 mb-2">{category}</h2>
                                                    <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest">
                                                        Macro-Trend Category
                                                    </p>
                                                </div>
                                                <div className="md:w-3/4">
                                                    <CurationGrid
                                                        articles={categoryArticles}
                                                        onUpdate={loadArticles}
                                                        onArticleUpdate={handleArticleUpdate}
                                                    />
                                                </div>
                                            </div>
                                        </section>
                                    );
                                })}

                                {/* Handle Uncategorized or other categories if any */}
                                {Object.keys(groupedArticles).filter(k => !steepvCategories.includes(k)).map((category, index) => (
                                    <section key={category} className="relative border-t border-border/30 pt-8">
                                        <div className="flex flex-col md:flex-row gap-8 md:gap-16 mb-8">
                                            <div className="md:w-1/4">
                                                <h2 className="text-4xl font-bold relative z-10 mt-4 mb-2">{category}</h2>
                                                <p className="text-muted-foreground text-sm font-mono uppercase tracking-widest">
                                                    Other Signals
                                                </p>
                                            </div>
                                            <div className="md:w-3/4">
                                                <CurationGrid
                                                    articles={groupedArticles[category]}
                                                    onUpdate={loadArticles}
                                                    onArticleUpdate={handleArticleUpdate}
                                                />
                                            </div>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )
                    )}
                </>
            )}
        </div>
    );
}

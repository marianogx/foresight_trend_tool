"use client";

import { useEffect, useState } from "react";
import { fetchArticles, curateArticle } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Slider } from "@/components/ui/slider";
import { ExternalLink, Calendar, Building2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const SIGNAL_LEVELS = ["pending", "low", "medium", "strong"];
const SIGNAL_LABELS = {
    pending: "Pending",
    not_signal: "Not Signal",
    low: "Low",
    medium: "Medium",
    strong: "Strong"
};

const SIGNAL_COLORS = {
    pending: "bg-gray-100 text-gray-700 border-gray-300",
    not_signal: "bg-red-50 text-red-700 border-red-200",
    low: "bg-yellow-50 text-yellow-700 border-yellow-300",
    medium: "bg-orange-50 text-orange-700 border-orange-300",
    strong: "bg-green-50 text-green-700 border-green-300"
};

export default function CurationPage() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadArticles();
    }, []);

    const loadArticles = async () => {
        try {
            const data = await fetchArticles();
            setArticles(data);
        } catch (error) {
            toast.error("Failed to load articles");
        } finally {
            setLoading(false);
        }
    };

    const handleSignalChange = async (articleId: number, sliderValue: number) => {
        const signalStrength = SIGNAL_LEVELS[sliderValue];
        try {
            await curateArticle(articleId, signalStrength);
            setArticles(articles.map(a =>
                a.id === articleId ? { ...a, signal_strength: signalStrength } : a
            ));
            toast.success(`Signal strength updated to ${SIGNAL_LABELS[signalStrength as keyof typeof SIGNAL_LABELS]}`);
        } catch (error) {
            toast.error("Failed to update signal strength");
        }
    };

    const handleNotSignal = async (articleId: number, currentlyNotSignal: boolean) => {
        const newSignal = currentlyNotSignal ? "pending" : "not_signal";
        try {
            await curateArticle(articleId, newSignal);
            setArticles(articles.map(a =>
                a.id === articleId ? { ...a, signal_strength: newSignal } : a
            ));
            toast.success(currentlyNotSignal ? "Removed Not Signal status" : "Marked as Not Signal");
        } catch (error) {
            toast.error("Failed to update signal strength");
        }
    };

    const getSliderValue = (signalStrength: string) => {
        if (signalStrength === "not_signal") return 0;
        return SIGNAL_LEVELS.indexOf(signalStrength || "pending");
    };

    if (loading) {
        return <div className="flex justify-center py-10">Loading articles...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Article Curation</h2>
                <p className="text-muted-foreground">
                    Review and tag articles with signal strength
                </p>
            </div>

            <div className="space-y-4">
                {articles.map((article) => {
                    const currentSignal = article.signal_strength || "pending";
                    const isNotSignal = currentSignal === "not_signal";
                    const sliderValue = getSliderValue(currentSignal);

                    return (
                        <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex gap-6">
                                    {/* Image */}
                                    {article.image_url && (
                                        <div className="flex-shrink-0">
                                            <img
                                                src={article.image_url}
                                                alt={article.title}
                                                className="w-64 h-40 object-cover rounded-lg"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 space-y-4">
                                        {/* Title + Metadata Row */}
                                        <div>
                                            <h3 className="text-xl font-semibold leading-tight mb-2">
                                                {article.title}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                {article.industry && (
                                                    <div className="flex items-center gap-1">
                                                        <Building2 className="h-4 w-4" />
                                                        <span className="font-medium">{article.industry}</span>
                                                    </div>
                                                )}
                                                {article.steepv_category && (
                                                    <Badge variant="secondary" className="font-normal">
                                                        {article.steepv_category}
                                                    </Badge>
                                                )}
                                                {article.published_at && (
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        <span>{format(new Date(article.published_at), "MMM d, yyyy")}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Summary + Link */}
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground leading-relaxed">
                                                {article.summary}
                                            </p>
                                            <a
                                                href={article.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                <span>Read full article</span>
                                            </a>
                                        </div>

                                        {/* Signal Strength Slider */}
                                        <div className="pt-2">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-medium">Signal Strength:</span>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${SIGNAL_COLORS[currentSignal as keyof typeof SIGNAL_COLORS]} border`}
                                                        variant="outline"
                                                    >
                                                        {SIGNAL_LABELS[currentSignal as keyof typeof SIGNAL_LABELS]}
                                                    </Badge>
                                                    <Toggle
                                                        pressed={isNotSignal}
                                                        onPressedChange={() => handleNotSignal(article.id, isNotSignal)}
                                                        variant="outline"
                                                        className="gap-1 data-[state=on]:bg-red-50 data-[state=on]:text-red-700 data-[state=on]:border-red-300"
                                                    >
                                                        <X className="h-3 w-3" />
                                                        Not Signal
                                                    </Toggle>
                                                </div>
                                            </div>
                                            {!isNotSignal && (
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs text-muted-foreground w-16">Pending</span>
                                                    <Slider
                                                        value={[sliderValue]}
                                                        onValueChange={(value) => handleSignalChange(article.id, value[0])}
                                                        max={3}
                                                        step={1}
                                                        className="flex-1"
                                                    />
                                                    <span className="text-xs text-muted-foreground w-16 text-right">Strong</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {articles.length === 0 && (
                <div className="text-center py-20 border rounded-lg bg-muted/10">
                    <p className="text-muted-foreground">No articles to curate yet.</p>
                </div>
            )}
        </div>
    );
}

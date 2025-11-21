import { Article } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, Tag, Layers, Signal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { curateArticle } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";

interface CurationGridProps {
    articles: Article[];
    onUpdate: () => void;
    onArticleUpdate: (id: number, newSignal: string) => void;
}

const SIGNAL_STRENGTHS = ["not_signal", "low", "medium", "strong"];

export default function CurationGrid({ articles, onUpdate, onArticleUpdate }: CurationGridProps) {
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const updateSignalStrength = async (articleId: number, strength: string) => {
        setUpdatingId(articleId);
        // Optimistic update
        onArticleUpdate(articleId, strength);
        try {
            await curateArticle(articleId, strength);
            toast.success("Signal strength updated");
        } catch (error) {
            toast.error("Failed to update signal strength");
        } finally {
            setUpdatingId(null);
        }
    };

    const getSignalColor = (strength: string | null) => {
        switch (strength) {
            case "strong": return "bg-accent text-accent-foreground";
            case "medium": return "bg-yellow-500/20 text-yellow-500";
            case "low": return "bg-blue-500/20 text-blue-500";
            case "not_signal": return "bg-destructive/20 text-destructive";
            default: return "bg-muted text-muted-foreground";
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {articles.map((article) => (
                <article key={article.id} className="group flex flex-col h-full">
                    <div className="mb-4 relative aspect-video overflow-hidden rounded-md bg-muted">
                        {article.image_url ? (
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                <Signal className="w-12 h-12" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={`h-6 px-2 text-[10px] font-mono uppercase tracking-wider backdrop-blur-md border-0 ${getSignalColor(article.signal_strength)}`}
                                        disabled={updatingId === article.id}
                                    >
                                        {updatingId === article.id ? "..." : (article.signal_strength?.toUpperCase().replace('_', ' ') || "PENDING")}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-32 p-1 bg-background/95 backdrop-blur border-border/50">
                                    <div className="flex flex-col gap-0.5">
                                        {SIGNAL_STRENGTHS.map(s => (
                                            <Button
                                                key={s}
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => updateSignalStrength(article.id, s)}
                                                className="justify-start h-7 text-[10px] font-mono uppercase"
                                            >
                                                {s.replace('_', ' ')}
                                            </Button>
                                        ))}
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col">
                        <div className="flex items-center gap-3 mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            <span className="text-accent">{article.steepv_category || "Uncategorized"}</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(article.published_at), { addSuffix: true })}</span>
                        </div>

                        <h3 className="font-serif text-2xl font-bold leading-tight mb-3 group-hover:text-accent transition-colors">
                            <a href={article.link} target="_blank" rel="noopener noreferrer">
                                {article.title}
                            </a>
                        </h3>

                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                            {article.summary}
                        </p>

                        <div className="pt-4 border-t border-border/30 flex justify-between items-center mt-auto">
                            <span className="text-xs text-muted-foreground font-mono truncate max-w-[150px]">
                                {article.source}
                            </span>
                            <Button variant="link" size="sm" className="h-auto p-0 text-accent hover:text-accent/80 text-xs uppercase tracking-widest" asChild>
                                <a href={article.link} target="_blank" rel="noopener noreferrer">
                                    Read Article <ExternalLink className="w-3 h-3 ml-1" />
                                </a>
                            </Button>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

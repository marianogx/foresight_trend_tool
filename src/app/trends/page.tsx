"use client";

import { useEffect, useState } from "react";
import { getTrendSummaries, deleteTrendSummary, generateTrendSummary } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, FileText, Calendar, Trash2, AlertTriangle, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface TrendSummary {
    id: number;
    content: string; // Fixed from summary_text to match backend
    title: string;
    created_at: string;
}

export default function TrendsPage() {
    const [summaries, setSummaries] = useState<TrendSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadSummaries = async () => {
        setLoading(true);
        try {
            const data = await getTrendSummaries();
            setSummaries(data);
        } catch (error) {
            console.error("Failed to load summaries", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSummaries();

        // Poll for updates if any report is generating
        const interval = setInterval(() => {
            setSummaries(currentSummaries => {
                const hasGenerating = currentSummaries.some(s => s.content === "Report generation in progress...");
                if (hasGenerating) {
                    loadSummaries();
                }
                return currentSummaries;
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteTrendSummary(id);
            toast.success("Summary deleted successfully");
            setSummaries(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            toast.error("Failed to delete summary");
        } finally {
            setDeletingId(null);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await generateTrendSummary();
            toast.success("Report generation started in background");
            // Refresh list after a short delay to show the "Generating..." placeholder
            setTimeout(() => {
                loadSummaries();
            }, 1000);
        } catch (error) {
            toast.error("Failed to start report generation");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="px-5 py-12 min-h-screen flex flex-col">
            <div className="mb-12 border-b border-border/50 pb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-6xl font-bold tracking-tighter mb-2">Tendencias</h1>
                    <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">
                        Weekly Intelligence Reports
                    </p>
                </div>
                <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                >
                    {generating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                    Generate Report
                </Button>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-12">
                    {summaries.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border border-dashed border-border/50 rounded-xl">
                            <FileText className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-xl">No trend reports generated yet.</p>
                            <p className="text-sm mt-2">Reports are generated automatically every week.</p>
                        </div>
                    ) : (
                        summaries.map((summary, index) => (
                            <article key={summary.id} className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 border-t border-border/30 pt-8">
                                <div className="lg:col-span-3">
                                    <span className="text-9xl font-bold text-muted/10 absolute -top-10 left-0 select-none">
                                        {summaries.length - index}
                                    </span>
                                    <div className="relative z-10 mt-4">
                                        <div className="flex items-center gap-2 text-accent mb-2 font-mono text-sm uppercase tracking-wider">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(summary.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                        <h2 className="text-3xl font-bold mb-4">{summary.title}</h2>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -ml-2">
                                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Report
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="flex items-center gap-2">
                                                        <AlertTriangle className="w-5 h-5 text-destructive" />
                                                        Delete Trend Report?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the trend summary report from the database.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDelete(summary.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {deletingId === summary.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <div className="lg:col-span-9 prose prose-invert prose-lg max-w-none">
                                    {summary.content === "Report generation in progress..." ? (
                                        <div className="bg-card/50 backdrop-blur-sm p-12 rounded-xl border border-border/50 flex flex-col items-center justify-center text-center animate-pulse">
                                            <Loader2 className="w-12 h-12 animate-spin text-accent mb-4" />
                                            <h3 className="text-xl font-bold mb-2">Generating Intelligence Report...</h3>
                                            <p className="text-muted-foreground">AI is analyzing signals and synthesizing trends. This may take a minute.</p>
                                        </div>
                                    ) : (
                                        <div className="bg-card/50 backdrop-blur-sm p-8 rounded-xl border border-border/50">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ node, ...props }) => <h3 className="text-2xl font-bold text-primary mt-8 mb-4" {...props} />,
                                                    h2: ({ node, ...props }) => <h4 className="text-xl font-semibold text-foreground mt-6 mb-3" {...props} />,
                                                    h3: ({ node, ...props }) => <h5 className="text-lg font-medium text-accent mt-4 mb-2" {...props} />,
                                                    p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-4" {...props} />,
                                                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-6 mb-4 space-y-2 text-muted-foreground" {...props} />,
                                                    li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                                                }}
                                            >
                                                {summary.content}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </article>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

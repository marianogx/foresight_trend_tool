"use client";

import { useEffect, useState } from "react";
import { generateTrendSummary, getTrendSummaries } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function TrendsPage() {
    const [summaries, setSummaries] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        loadSummaries();
    }, []);

    const loadSummaries = async () => {
        try {
            const data = await getTrendSummaries();
            setSummaries(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            await generateTrendSummary();
            loadSummaries();
        } catch (error) {
            console.error(error);
            alert("Failed to generate summary. Make sure you have curated articles.");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Trend Summaries</h2>
                <Button onClick={handleGenerate} disabled={generating}>
                    {generating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {generating ? "Generating..." : "Generate Weekly Report"}
                </Button>
            </div>

            <div className="grid gap-6">
                {summaries.map((summary) => (
                    <Card key={summary.id}>
                        <CardHeader>
                            <CardTitle>{summary.title}</CardTitle>
                            <CardDescription>
                                Generated on {format(new Date(summary.created_at), "PPP")}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none">
                                <ReactMarkdown>{summary.content}</ReactMarkdown>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {summaries.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                        No summaries generated yet. Curate some articles and click "Generate Weekly Report".
                    </div>
                )}
            </div>
        </div>
    );
}

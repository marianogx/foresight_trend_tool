"use client";

import { useEffect, useState } from "react";
import { getTrendSummaries, fetchArticles } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowRight, Radar, Zap, Newspaper, ExternalLink } from "lucide-react";

export default function PublicPage() {
  const [latestReport, setLatestReport] = useState<any>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Social");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch latest report
      const summaries = await getTrendSummaries();
      if (summaries.length > 0) {
        setLatestReport(summaries[0]); // Assuming API returns sorted by date desc
      }

      // Fetch articles for the active STEEPV category
      // Note: getArticles currently fetches all. Ideally we'd filter by category in API.
      // For now, we'll fetch all and filter client-side or update API later.
      const allArticles = await fetchArticles();
      const filteredArticles = allArticles.filter((a: any) => a.steepv_category === activeTab);
      setArticles(filteredArticles);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const STEEPV_CATEGORIES = ["Social", "Technological", "Economic", "Environmental", "Political", "Values"];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Radar className="h-6 w-6 text-primary" />
            <span>Foresight Radar</span>
          </div>
          <nav className="flex gap-4">
            <Link href="/trends">
              <Button variant="ghost">Trends</Button>
            </Link>
            <Link href="/curation">
              <Button variant="ghost">Curation</Button>
            </Link>
            <Link href="/admin">
              <Button variant="ghost">Admin</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero / Latest Report Section */}
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="h-6 w-6 text-yellow-500" />
              <h2 className="text-3xl font-bold tracking-tight">Latest Intelligence Report</h2>
            </div>

            {latestReport ? (
              <Card className="overflow-hidden border-2 border-primary/20 shadow-lg">
                <CardHeader className="bg-card">
                  <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                      <CardTitle className="text-3xl font-serif">{latestReport.title}</CardTitle>
                      <CardDescription className="mt-2 text-lg">
                        Published on {format(new Date(latestReport.created_at), "PPP")}
                      </CardDescription>
                    </div>
                    <Link href={`/trends`}>
                      <Button>View All Reports <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h3 className="text-2xl font-bold text-primary mt-6 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h4 className="text-xl font-semibold text-foreground mt-4 mb-3" {...props} />,
                        p: ({ node, ...props }) => <p className="text-muted-foreground leading-relaxed mb-4" {...props} />,
                      }}
                    >
                      {latestReport.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-20 border rounded-lg bg-muted/10">
                <p className="text-muted-foreground">No trend reports published yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* News Feed Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex items-center gap-2 mb-8">
              <Newspaper className="h-6 w-6 text-blue-500" />
              <h2 className="text-3xl font-bold tracking-tight">Signal Feed</h2>
            </div>

            <Tabs defaultValue="Social" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start overflow-x-auto mb-8 h-auto p-1 bg-muted/50">
                {STEEPV_CATEGORIES.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    className="px-6 py-2 text-sm md:text-base data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="text-center py-12">Loading signals...</div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {articles.length > 0 ? (
                      articles.map((article) => (
                        <Card key={article.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                          {article.image_url && (
                            <div className="h-48 overflow-hidden rounded-t-xl">
                              <img src={article.image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <Badge variant="outline">{article.industry || "General"}</Badge>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(article.published_at || article.created_at), "MMM d")}
                              </span>
                            </div>
                            <CardTitle className="line-clamp-2 text-lg leading-tight">
                              <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                {article.title}
                              </a>
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="flex-1">
                            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                              {article.summary}
                            </p>
                            {article.ai_reasoning && (
                              <div className="bg-muted/50 p-3 rounded text-xs text-muted-foreground italic">
                                "{article.ai_reasoning}"
                              </div>
                            )}
                          </CardContent>
                          <div className="p-6 pt-0 mt-auto">
                            <Button variant="outline" size="sm" className="w-full" asChild>
                              <a href={article.url} target="_blank" rel="noopener noreferrer">
                                Read Source <ExternalLink className="ml-2 h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                        No signals found for {activeTab} category.
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </div>
  );
}

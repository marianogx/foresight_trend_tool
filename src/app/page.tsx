"use client";

import { useEffect, useState } from "react";
import { getTrendSummaries, fetchArticles, fetchFeeds } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { ArrowRight, Radar, Zap, Newspaper, ExternalLink, CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PublicPage() {
  const [latestReport, setLatestReport] = useState<any>(null);
  const [allArticles, setAllArticles] = useState<any[]>([]);
  const [feeds, setFeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startOfWeek(new Date()),
    to: new Date()
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch latest report
      const summaries = await getTrendSummaries();
      if (summaries.length > 0) {
        setLatestReport(summaries[0]);
      }

      // Fetch all articles and feeds
      const [articlesData, feedsData] = await Promise.all([
        fetchArticles(),
        fetchFeeds()
      ]);

      setAllArticles(articlesData);
      setFeeds(feedsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from feeds
  const categories = ["all", ...Array.from(new Set(feeds.map(f => f.category).filter(Boolean)))];

  // Filter articles
  const filteredArticles = allArticles.filter((article: any) => {
    // Category filter
    if (selectedCategory !== "all") {
      const feed = feeds.find(f => f.id === article.feed_id);
      if (!feed || feed.category !== selectedCategory) return false;
    }

    // Date filter
    if (dateRange.from && dateRange.to) {
      const articleDate = new Date(article.published_at || article.created_at);
      if (articleDate < dateRange.from || articleDate > dateRange.to) return false;
    }

    return true;
  });

  // Group articles by feed category
  const groupedArticles = filteredArticles.reduce((acc: any, article: any) => {
    const feed = feeds.find(f => f.id === article.feed_id);
    const category = feed?.category || "Uncategorized";
    if (!acc[category]) acc[category] = [];
    acc[category].push(article);
    return acc;
  }, {});

  const setDateRangePreset = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case "thisWeek":
        setDateRange({ from: startOfWeek(now), to: endOfWeek(now) });
        break;
      case "lastWeek":
        setDateRange({ from: startOfWeek(subDays(now, 7)), to: endOfWeek(subDays(now, 7)) });
        break;
      case "thisMonth":
        setDateRange({ from: startOfMonth(now), to: endOfMonth(now) });
        break;
      case "last7Days":
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case "last30Days":
        setDateRange({ from: subDays(now, 30), to: now });
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
        <div className="container mx-auto py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Radar className="h-6 w-6 text-primary" />
            <span>Señales</span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero / Latest Report Section */}
        <section className="py-12 bg-muted/30 border-b">
          <div className="container mx-auto">
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
          <div className="container mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-blue-500" />
                <h2 className="text-3xl font-bold tracking-tight">Signal Feed</h2>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === "all" ? "All Categories" : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[280px] justify-start text-left font-normal")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <div className="flex">
                      <div className="border-r p-3 space-y-2">
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDateRangePreset("thisWeek")}>
                          This Week
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDateRangePreset("lastWeek")}>
                          Last Week
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDateRangePreset("last7Days")}>
                          Last 7 Days
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDateRangePreset("last30Days")}>
                          Last 30 Days
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => setDateRangePreset("thisMonth")}>
                          This Month
                        </Button>
                      </div>
                      <Calendar
                        mode="range"
                        selected={{ from: dateRange.from, to: dateRange.to }}
                        onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                        numberOfMonths={2}
                      />
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading signals...</div>
            ) : (
              <div className="space-y-12">
                {Object.keys(groupedArticles).length > 0 ? (
                  Object.entries(groupedArticles).map(([category, articles]: [string, any]) => (
                    <div key={category} className="space-y-6">
                      <h3 className="text-2xl font-bold border-b pb-2">{category}</h3>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {articles.map((article: any) => (
                          <Card key={article.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                            {article.image_url && (
                              <div className="h-48 overflow-hidden rounded-t-xl">
                                <img src={article.image_url} alt={article.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                              </div>
                            )}
                            <CardHeader>
                              <div className="flex justify-between items-start gap-2 mb-2">
                                <Badge variant="outline">{article.steepv_category || "General"}</Badge>
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
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    No signals found for the selected filters.
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

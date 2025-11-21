"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, ExternalLink, Calendar, Tag, Layers, Signal } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { curateArticle } from "@/lib/api";
import { toast } from "sonner";

import { Article } from "@/types";

interface CurationCarouselProps {
    articles: Article[];
    onUpdate: () => void;
    onArticleUpdate: (id: number, newSignal: string) => void;
}

const SIGNAL_STRENGTHS = ["not_signal", "low", "medium", "strong"];

export default function CurationCarousel({ articles, onUpdate, onArticleUpdate }: CurationCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const currentArticle = articles[currentIndex];
    const displaySignalStrength = currentArticle?.signal_strength;

    const handleNext = useCallback(() => {
        if (currentIndex < articles.length - 1) {
            setDirection(1);
            setCurrentIndex((prev) => prev + 1);
        }
    }, [currentIndex, articles.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex((prev) => prev - 1);
        }
    }, [currentIndex]);

    const updateSignalStrength = useCallback(async (newStrength: string) => {
        if (!currentArticle) return;

        // Optimistic update via parent
        onArticleUpdate(currentArticle.id, newStrength);

        try {
            await curateArticle(currentArticle.id, newStrength);
            toast.success(`Signal set to ${newStrength.toUpperCase()}`);
        } catch (error) {
            toast.error("Failed to update signal strength");
            // Revert on error (optional, but good practice)
            // onArticleUpdate(currentArticle.id, currentArticle.signal_strength); 
        }
    }, [currentArticle, onArticleUpdate]);

    const handleSignalUp = useCallback(() => {
        if (!currentArticle) return;
        const currentStrength = displaySignalStrength || "pending";
        let nextStrength = "not_signal";

        if (currentStrength === "pending") nextStrength = "not_signal";
        else if (currentStrength === "not_signal") nextStrength = "low";
        else if (currentStrength === "low") nextStrength = "medium";
        else if (currentStrength === "medium") nextStrength = "strong";
        else if (currentStrength === "strong") return; // Maxed out

        updateSignalStrength(nextStrength);
    }, [currentArticle, displaySignalStrength, updateSignalStrength]);

    const handleSignalDown = useCallback(() => {
        if (!currentArticle) return;
        const currentStrength = displaySignalStrength || "pending";
        let nextStrength = "pending";

        if (currentStrength === "strong") nextStrength = "medium";
        else if (currentStrength === "medium") nextStrength = "low";
        else if (currentStrength === "low") nextStrength = "not_signal";
        else if (currentStrength === "not_signal") nextStrength = "pending";
        else return; // Already at bottom

        updateSignalStrength(nextStrength);
    }, [currentArticle, displaySignalStrength, updateSignalStrength]);



    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowRight":
                    handleNext();
                    break;
                case "ArrowLeft":
                    handlePrev();
                    break;
                case "ArrowUp":
                    e.preventDefault(); // Prevent scrolling
                    handleSignalUp();
                    break;
                case "ArrowDown":
                    e.preventDefault(); // Prevent scrolling
                    handleSignalDown();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleNext, handlePrev, handleSignalUp, handleSignalDown]);

    if (!articles.length) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
                <Layers className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-xl">No articles to curate.</p>
            </div>
        );
    }

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotateY: direction > 0 ? 45 : -45
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotateY: 0
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.8,
            rotateY: direction < 0 ? 45 : -45
        })
    };

    const getSignalColor = (strength: string | null) => {
        switch (strength) {
            case "strong": return "bg-green-500 shadow-green-500/50";
            case "medium": return "bg-yellow-500 shadow-yellow-500/50";
            case "low": return "bg-blue-500 shadow-blue-500/50";
            case "not_signal": return "bg-red-500 shadow-red-500/50";
            default: return "bg-gray-300 dark:bg-gray-700";
        }
    };

    return (
        <div className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-muted/20 rounded-xl border border-border/50">
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-secondary/5 rounded-full blur-3xl" />
            </div>

            {/* Navigation Buttons (Visual) */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 h-16 w-16 rounded-full bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 hover:scale-110 transition-all duration-300"
                onClick={handlePrev}
                disabled={currentIndex === 0}
            >
                <ChevronLeft className="h-8 w-8" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 h-16 w-16 rounded-full bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/80 hover:scale-110 transition-all duration-300"
                onClick={handleNext}
                disabled={currentIndex === articles.length - 1}
            >
                <ChevronRight className="h-8 w-8" />
            </Button>

            <div className="perspective-1000 w-full max-w-4xl px-4 flex justify-center">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentIndex}
                        custom={direction}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: "spring", stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                            scale: { duration: 0.2 },
                            rotateY: { duration: 0.4 }
                        }}
                        className="w-full max-w-3xl"
                    >
                        <Card className="w-full h-[70vh] flex flex-col shadow-2xl border-muted/40 bg-card/95 backdrop-blur-md overflow-hidden relative group">
                            {/* Signal Indicator Bar */}
                            <div className={`absolute top-0 left-0 w-1.5 h-full ${getSignalColor(displaySignalStrength)} transition-colors duration-500`} />

                            <CardHeader className="pb-4 pl-8">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2 mb-2">
                                        <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 text-sm">
                                            <Tag className="w-3 h-3" /> {currentArticle.steepv_category}
                                        </Badge>
                                        <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1 text-sm">
                                            <Layers className="w-3 h-3" /> {currentArticle.industry}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold flex items-center gap-1">
                                            <Signal className="w-3 h-3" /> Signal Strength:
                                        </span>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg hover:scale-105 transition-transform ${getSignalColor(displaySignalStrength)}`}
                                                >
                                                    {displaySignalStrength?.toUpperCase().replace('_', ' ') || "PENDING"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-48 p-2">
                                                <div className="flex flex-col gap-1">
                                                    <Button
                                                        variant={displaySignalStrength === null ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => updateSignalStrength("pending")}
                                                        className="justify-start"
                                                    >
                                                        PENDING
                                                    </Button>
                                                    <Button
                                                        variant={displaySignalStrength === "not_signal" ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => updateSignalStrength("not_signal")}
                                                        className="justify-start text-red-600"
                                                    >
                                                        NOT SIGNAL
                                                    </Button>
                                                    <Button
                                                        variant={displaySignalStrength === "low" ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => updateSignalStrength("low")}
                                                        className="justify-start text-blue-600"
                                                    >
                                                        LOW
                                                    </Button>
                                                    <Button
                                                        variant={displaySignalStrength === "medium" ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => updateSignalStrength("medium")}
                                                        className="justify-start text-yellow-600"
                                                    >
                                                        MEDIUM
                                                    </Button>
                                                    <Button
                                                        variant={displaySignalStrength === "strong" ? "default" : "ghost"}
                                                        size="sm"
                                                        onClick={() => updateSignalStrength("strong")}
                                                        className="justify-start text-green-600"
                                                    >
                                                        STRONG
                                                    </Button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold leading-tight mt-2 tracking-tight">{currentArticle.title}</h2>
                                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
                                    <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">{currentArticle.source}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(currentArticle.published_at).toLocaleDateString()}</span>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 overflow-y-auto py-4 pl-8 pr-6 custom-scrollbar">
                                {currentArticle.image_url && (
                                    <div className="mb-6 rounded-xl overflow-hidden border border-border/50 shadow-md">
                                        <img src={currentArticle.image_url} alt="Article thumbnail" className="w-full h-64 object-cover hover:scale-105 transition-transform duration-700" />
                                    </div>
                                )}
                                <p className="text-lg leading-relaxed text-card-foreground/90 font-serif">
                                    {currentArticle.summary}
                                </p>
                            </CardContent>

                            <CardFooter className="pt-4 pb-6 pl-8 border-t border-border/50 flex justify-between items-center bg-muted/10">
                                <div className="flex items-center gap-6 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                                        <div className="flex flex-col items-center justify-center">
                                            <ChevronUp className="w-3 h-3 animate-bounce" />
                                            <ChevronDown className="w-3 h-3" />
                                        </div>
                                        <span className="font-medium">Adjust Signal</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-lg border border-border/50">
                                        <div className="flex items-center justify-center gap-1">
                                            <ChevronLeft className="w-3 h-3" />
                                            <ChevronRight className="w-3 h-3" />
                                        </div>
                                        <span className="font-medium">Navigate</span>
                                    </div>
                                </div>

                                <Button variant="outline" size="sm" asChild className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors">
                                    <a href={currentArticle.link} target="_blank" rel="noopener noreferrer">
                                        Read Original <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
                {articles.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-12 bg-primary shadow-lg shadow-primary/50" : "w-2 bg-muted-foreground/30"}`}
                    />
                ))}
            </div>
        </div>
    );
}

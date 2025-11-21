"use client";

import { useEffect, useState } from "react";
import { fetchFeeds, createFeed, deleteFeed, fetchFeed, updateFeed, fetchAllFeeds } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { Plus, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";

export default function FeedsPage() {
    const [feeds, setFeeds] = useState<any[]>([]);
    const [newFeedUrl, setNewFeedUrl] = useState("");
    const [newFeedName, setNewFeedName] = useState("");
    const [newFeedCategory, setNewFeedCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [fetchingId, setFetchingId] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [feedToDelete, setFeedToDelete] = useState<number | null>(null);
    const [fetchingAll, setFetchingAll] = useState(false);

    // Editing state
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editCategory, setEditCategory] = useState("");

    const loadFeeds = async () => {
        try {
            const data = await fetchFeeds();
            setFeeds(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load feeds");
        }
    };

    useEffect(() => {
        loadFeeds();
    }, []);

    const handleAddFeed = async () => {
        if (!newFeedUrl || !newFeedName) {
            toast.error("Please provide both URL and Name");
            return;
        }
        setLoading(true);
        try {
            await createFeed(newFeedUrl, newFeedName, newFeedCategory);
            setNewFeedUrl("");
            setNewFeedName("");
            setNewFeedCategory("");
            setOpen(false);
            loadFeeds();
            toast.success("Feed added successfully");
        } catch (error) {
            toast.error("Failed to add feed");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFeed = async () => {
        if (!feedToDelete) return;
        try {
            await deleteFeed(feedToDelete);
            loadFeeds();
            toast.success("Feed deleted successfully");
        } catch (error) {
            toast.error("Failed to delete feed");
        } finally {
            setDeleteDialogOpen(false);
            setFeedToDelete(null);
        }
    };

    const handleFetchFeed = async (id: number) => {
        setFetchingId(id);
        try {
            const result = await fetchFeed(id);
            loadFeeds();
            toast.success(`Fetched ${result.new_articles} new articles`);
        } catch (error) {
            toast.error("Failed to fetch feed");
        } finally {
            setFetchingId(null);
        }
    };

    const startEditing = (feed: any) => {
        setEditingId(feed.id);
        setEditName(feed.name);
        setEditUrl(feed.url);
        setEditCategory(feed.category || "");
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName("");
        setEditUrl("");
        setEditCategory("");
    };

    const saveEditing = async (id: number) => {
        try {
            await updateFeed(id, editName, editUrl, editCategory);
            loadFeeds();
            toast.success("Feed updated successfully");
            cancelEditing();
        } catch (error) {
            toast.error("Failed to update feed");
        }
    };

    const handleFetchAllFeeds = async () => {
        setFetchingAll(true);
        try {
            const result = await fetchAllFeeds();
            loadFeeds();
            toast.success(`Fetched ${result.total_new_articles} new articles from all feeds`);
        } catch (error) {
            toast.error("Failed to fetch all feeds");
        } finally {
            setFetchingAll(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">RSS Feeds</h2>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={handleFetchAllFeeds}
                        disabled={fetchingAll}
                    >
                        {fetchingAll ? (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Fetching All...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Fetch All Feeds
                            </>
                        )}
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Feed
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Feed</DialogTitle>
                                <DialogDescription>
                                    Add a new RSS feed to monitor for signals.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Feed Name</label>
                                    <Input
                                        placeholder="e.g., MIT Technology Review"
                                        value={newFeedName}
                                        onChange={(e) => setNewFeedName(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">RSS Feed URL</label>
                                    <Input
                                        placeholder="https://example.com/feed.xml"
                                        value={newFeedUrl}
                                        onChange={(e) => setNewFeedUrl(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Industry/Category (Optional)</label>
                                    <Input
                                        placeholder="e.g., Artificial Intelligence, HealthTech"
                                        value={newFeedCategory}
                                        onChange={(e) => setNewFeedCategory(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddFeed} disabled={loading}>
                                    {loading ? "Adding..." : "Add Feed"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Managed Feeds</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>URL</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Last Checked</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {feeds.map((feed) => (
                                <TableRow key={feed.id}>
                                    <TableCell>
                                        {editingId === feed.id ? (
                                            <Input
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="h-8"
                                            />
                                        ) : (
                                            <span
                                                className="font-medium cursor-pointer hover:text-primary"
                                                onClick={() => startEditing(feed)}
                                            >
                                                {feed.name}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === feed.id ? (
                                            <Input
                                                value={editUrl}
                                                onChange={(e) => setEditUrl(e.target.value)}
                                                className="h-8 text-sm"
                                            />
                                        ) : (
                                            <span
                                                className="text-muted-foreground text-sm max-w-md truncate block cursor-pointer hover:text-primary"
                                                onClick={() => startEditing(feed)}
                                            >
                                                {feed.url}
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {editingId === feed.id ? (
                                            <Input
                                                value={editCategory}
                                                onChange={(e) => setEditCategory(e.target.value)}
                                                className="h-8"
                                                placeholder="Category"
                                            />
                                        ) : (
                                            <Badge
                                                variant="outline"
                                                className="cursor-pointer"
                                                onClick={() => startEditing(feed)}
                                            >
                                                {feed.category || "Uncategorized"}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {feed.last_fetched_at
                                            ? formatDistanceToNow(new Date(feed.last_fetched_at), { addSuffix: true })
                                            : "Never"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-2 justify-end">
                                            {editingId === feed.id ? (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => saveEditing(feed.id)}
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={cancelEditing}
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleFetchFeed(feed.id)}
                                                        disabled={fetchingId === feed.id}
                                                    >
                                                        {fetchingId === feed.id ? (
                                                            <>
                                                                <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                                                                Fetching...
                                                            </>
                                                        ) : (
                                                            "Fetch Now"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => {
                                                            setFeedToDelete(feed.id);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        Delete
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the feed and all associated articles.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteFeed}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

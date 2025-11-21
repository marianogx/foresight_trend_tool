const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://foresight-trend-tool.onrender.com";

export async function fetchFeeds() {
    const res = await fetch(`${API_BASE_URL}/feeds/`);
    if (!res.ok) throw new Error("Failed to fetch feeds");
    return res.json();
}

export async function fetchArticles(category?: string, industry?: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (category && category !== "All") params.append("category", category);
    if (industry) params.append("industry", industry);
    if (startDate) params.append("start_date", startDate);
    if (endDate) params.append("end_date", endDate);

    const res = await fetch(`${API_BASE_URL}/articles?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch articles");
    return res.json();
}

export async function createFeed(url: string, name?: string, category?: string) {
    const res = await fetch(`${API_BASE_URL}/feeds/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url,
            name: name || url,
            category: category || null
        }),
    });
    if (!res.ok) throw new Error("Failed to create feed");
    return res.json();
}

export async function deleteFeed(id: number) {
    const res = await fetch(`${API_BASE_URL}/feeds/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete feed");
    return res.json();
}

export async function fetchFeed(id: number) {
    const res = await fetch(`${API_BASE_URL}/feeds/${id}/fetch`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to fetch feed");
    return res.json();
}

export async function updateFeed(id: number, name: string, url: string, category?: string) {
    const res = await fetch(`${API_BASE_URL}/feeds/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, url, category }),
    });
    if (!res.ok) throw new Error("Failed to update feed");
    return res.json();
}

export async function fetchAllFeeds() {
    const res = await fetch(`${API_BASE_URL}/feeds/fetch-all`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to fetch all feeds");
    return res.json();
}

export async function getSetting(key: string) {
    const res = await fetch(`${API_BASE_URL}/settings/${key}`);
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch setting");
    }
    return res.json();
}

export async function saveSetting(key: string, value: string) {
    const res = await fetch(`${API_BASE_URL}/settings/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
    });
    if (!res.ok) throw new Error("Failed to save setting");
    return res.json();
}

export async function curateArticle(id: number, signalStrength: string, notes?: string) {
    const res = await fetch(`${API_BASE_URL}/curation/articles/${id}?signal_strength=${signalStrength}${notes ? `&admin_notes=${notes}` : ''}`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to curate article");
    return res.json();
}

export async function generateTrendSummary(days: number = 7, minSignal: string = "medium") {
    const res = await fetch(`${API_BASE_URL}/curation/generate-summary?days=${days}&min_signal_strength=${minSignal}`, {
        method: "POST",
    });
    if (!res.ok) throw new Error("Failed to generate summary");
    return res.json();
}

export async function fetchLogs(skip = 0, limit = 50, level?: string, eventType?: string, search?: string) {
    const params = new URLSearchParams({ skip: skip.toString(), limit: limit.toString() });
    if (level && level !== "ALL") params.append("level", level);
    if (eventType && eventType !== "ALL") params.append("event_type", eventType);
    if (search) params.append("search", search);

    const res = await fetch(`${API_BASE_URL}/logs/?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to fetch logs");
    return res.json();
}

export async function getTrendSummaries() {
    const res = await fetch(`${API_BASE_URL}/curation/summaries`);
    if (!res.ok) throw new Error("Failed to fetch summaries");
    return res.json();
}

export async function deleteTrendSummary(id: number) {
    const res = await fetch(`${API_BASE_URL}/curation/summaries/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete summary");
    return res.json();
}


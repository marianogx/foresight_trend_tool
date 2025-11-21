export interface Article {
    id: number;
    title: string;
    summary: string;
    link: string;
    published_at: string;
    source: string;
    steepv_category: string;
    industry: string;
    signal_strength: string | null;
    image_url?: string;
}

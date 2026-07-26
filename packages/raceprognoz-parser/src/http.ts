export const FetchHtmlResult = {
    includeUrl: "includeUrl"
} as const;

export type FetchOption = (typeof FetchHtmlResult)[keyof typeof FetchHtmlResult];

export async function fetchHtml(url: string): Promise<string>;
export async function fetchHtml(url: string, option: "includeUrl"): Promise<{ html: string; url: string }>;
export async function fetchHtml(url: string, option?: FetchOption): Promise<string | { html: string; url: string }> {

    const res = await fetch(url);

    if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
    }

    const html = await res.text();

    return option === FetchHtmlResult.includeUrl ? { html, url: res.url } : html;
}
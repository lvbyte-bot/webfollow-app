import TurndownService from "turndown";
import { marked } from 'marked';

const turndownService = new TurndownService();

export function html2md(html: string): string {
    return turndownService.turndown(html);
}

export async function md2html(md: string): Promise<string> {
    return await marked(md);
}
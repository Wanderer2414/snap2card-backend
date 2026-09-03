export function extractWords(text: string): string[] {
    const words = text.match(/[a-zA-Z]+/g);
    if (words == null) return [];
    return [...new Set(words)];
}
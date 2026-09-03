import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const LocalStorage = {
    baseDir: path.join(process.cwd(), "files"),

    async ensureDir(): Promise<void> {
        await mkdir(this.baseDir, { recursive: true });
    },

    async exists(source: string): Promise<boolean> {
        const filePath = this.getAbsPath(source);
        try {
            await stat(filePath);
            return true;
        }
        catch {
            return false;
        }
    },

    async save(filename: string, data: Buffer): Promise<void> {
        await this.ensureDir();
        const filePath = path.join(this.baseDir, filename);
        await writeFile(filePath, data);
    },

    getAbsPath(source: string): string {
        return path.join(this.baseDir, source.replace(/^\/files\//, ""));
    },
} as const;
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const pythonConfig = {
    venvDir: path.resolve(__dirname, "../../snap2card"),
    scriptsDir: path.resolve(__dirname, "../../scripts"),
    envVar: "PYTHON_BIN",
    defaultName: "python3",
    scriptFiles: {
        pdfExtract: "pdf_text_extract.py",
    } as const,
} as const;

export function resolvePython(): string {
    const venvPython = path.resolve(pythonConfig.venvDir, "bin/python");
    const envBin = process.env[pythonConfig.envVar];
    if (envBin != null && envBin.length > 0) return envBin;
    if (!existsSync(venvPython)) throw new Error("snap2card Python virtual environment not found");
    return venvPython;
}

export function scriptPath(name: keyof typeof pythonConfig.scriptFiles): string {
    return path.resolve(pythonConfig.scriptsDir, pythonConfig.scriptFiles[name]);
}
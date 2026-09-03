import { spawn } from "node:child_process";
import { resolvePython, scriptPath } from "../configs/python.js";

export interface PythonArgs {
    script: string;
    args: (string | number | boolean)[];
}

export function makeArgs(script: string, ...args: (string | number | boolean)[]): PythonArgs {
    return { script, args };
}

export interface PdfExtractArgs {
    pdfPath: string;
    maxPages: number;
    minReadableCharacters: number;
}

export function makePdfExtractArgs(pdfPath: string, maxPages: number, minReadableCharacters: number): PdfExtractArgs {
    return { pdfPath, maxPages, minReadableCharacters };
}

interface PdfExtractResponse {
    ok: boolean;
    code?: string;
    message?: string;
    text?: string;
    pageCount?: number;
    processedPageCount?: number;
    warnings?: string[];
}

function toCommandArgs(args: (string | number | boolean)[]): string[] {
    return args.map((arg) => arg.toString());
}

export async function runPython(input: PythonArgs): Promise<string> {
    const { stdout, exitCode } = await new Promise<{ stdout: string; exitCode: number | null }>((resolve) => {
        const child = spawn(resolvePython(), [input.script, ...toCommandArgs(input.args)]);
        let stdout = "";
        child.stdout.setEncoding("utf8");
        child.stdout.on("data", (chunk) => { stdout += chunk; });
        child.on("error", (err) => resolve({ stdout: JSON.stringify({ ok: false, code: "SPAWN_ERROR", message: err.message }), exitCode: null }));
        child.on("close", (code) => resolve({ stdout, exitCode: code }));
    });

    if (exitCode !== 0) {
        return JSON.stringify({ ok: false, code: "SPAWN_ERROR", message: `Process exited with code ${exitCode}` });
    }
    return stdout;
}

export async function runPythonJson<T>(input: PythonArgs): Promise<T | null> {
    const stdout = await runPython(input);
    try {
        return JSON.parse(stdout) as T;
    }
    catch (e) {
        return null;
    }
}

export async function extractPdfText(input: PdfExtractArgs): Promise<PdfExtractResponse> {
    const result = await runPythonJson<PdfExtractResponse>(makeArgs(
        scriptPath("pdfExtract"),
        input.pdfPath,
        "--max-pages", input.maxPages,
        "--min-readable-characters", input.minReadableCharacters,
    ));
    if (result == null) {
        return { ok: false, code: "PARSE_ERROR", message: "Could not parse Python output" };
    }
    return result;
}
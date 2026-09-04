import { readFileSync } from "node:fs";

export function getPassword(): string {
    const file = readFileSync('certs/postgres_password.txt')
    return file.toString().trim()
}

export function getPort(): number {
    const file = readFileSync('certs/port.txt')
    return Number.parseInt(file.toString().trim())
}

export function getOpenAIKey(): string {
    const file = readFileSync('certs/openai_api_key.txt')
    return file.toString().trim()
}

export function getModel(): string {
    try {
        const file = readFileSync('certs/llm_model.txt')
        const value = file.toString().trim()
        return value !== "" ? value : "gpt-4o-mini"
    }
    catch {
        return "gpt-4o-mini"
    }
}
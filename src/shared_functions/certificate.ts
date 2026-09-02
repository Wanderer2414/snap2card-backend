import { readFileSync } from "node:fs";

export function getPassword(): string {
    const file = readFileSync('certs/postgres_password.txt')
    return file.toString().trim()
}

export function getPort(): number {
    const file = readFileSync('certs/port.txt')
    return Number.parseInt(file.toString().trim())
}
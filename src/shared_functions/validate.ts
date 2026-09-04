export const idLength = 15;

export function isValidId(id: string | null | undefined): id is string {
    return id != null && id.length === idLength;
}

export function isCategoryIdValid(id: string | null | undefined): id is string {
    return id != null && id.length === idLength && id.startsWith("CATE");
}

export function isCardIdValid(id: string | null | undefined): id is string {
    return id != null && id.length === idLength && id.startsWith("CARD");
}

export function isExamIdValid(id: string | null | undefined): id is string {
    return id != null && id.length === idLength && id.startsWith("EXAM");
}

export function isQuizIdValid(id: string | null | undefined): id is string {
    return id != null && id.length === idLength && id.startsWith("QUIZ");
}

export function isExamLogIdValid(id: string | null | undefined): id is string {
    return id != null && id.length === idLength && id.startsWith("LOG");
}

export function isValidIds(ids: string[] | null | undefined): ids is string[] {
    return ids != null && ids.length > 0 && ids.every((id) => isValidId(id));
}

export function isValidEmail(email: string | null | undefined): email is string {
    return email != null && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidLength(value: string | null | undefined, max: number): value is string {
    return value != null && value.length <= max;
}

export function isUppercase(value: string | null | undefined): value is string {
    return value != null && value === value.toUpperCase();
}

export function isValidDate(date: string | null | undefined): date is string {
    return date != null && /^\d{4}-\d{2}-\d{2}$/.test(date);
}
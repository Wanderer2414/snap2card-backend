export function getTime(): String {
    const now = new Date();
    const hh: string = String(now.getHours()).padStart(2, '0');
    const mm: string = String(now.getMinutes()).padStart(2, '0');
    const ss: string = String(now.getSeconds()).padStart(2, '0');

    const timeString: string = `${hh}:${mm}:${ss}`;
    return timeString;

}
export function parseDateTime(value: string, utcOffset = "+03:00"): Date {

    const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);

    if (!match) {
        throw new Error(`Invalid date format: ${value}`);
    }

    const [, dd, mm, yyyy, hh, min, ss] = match;

    return new Date(
        `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${utcOffset}`
    );
}
export function parseUserInfo(text: string) {

    const match = text.match(/^(.*),\s*#(\d+)$/);

    if (!match) {
        throw new Error(`Invalid user info: ${text}`);
    }

    return {
        userName: String(match[1]),
        userId: Number(match[2])
    };
}
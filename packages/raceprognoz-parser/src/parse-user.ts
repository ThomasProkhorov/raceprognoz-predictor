export function parseUser(userText: string): { userName: string; userId: number; teamName: string } {    
    
    const separator = userText.indexOf("#");

    if (separator === -1) {
        throw new Error(`Cannot parse user: "${userText}"`);
    }
    
    const userName = userText.slice(0, separator);

    const userInfo = userText.slice(separator);

    const match = userInfo.match(/^#(\d+)\s*-\s*(.+)$/);

    if (!match) {
        throw new Error(`Cannot parse user info: "${userInfo}"`);
    }

    const [, userId, teamName] = match;

    return { userName, userId: Number(userId), teamName: String(teamName) };
}
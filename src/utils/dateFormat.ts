export function formatDate(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return new Intl.DateTimeFormat('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
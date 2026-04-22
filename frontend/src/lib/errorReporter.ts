/**
 * Frontend error reporting utility.
 * Sends logs to the backend proxy which then forwards them to Discord.
 */
export const reportLog = async (title: string, message: string, level: 'info' | 'warn' | 'error' = 'info') => {
    // Avoid spamming in local development
    if (import.meta.env.DEV && level !== 'error') return;

    try {
        await fetch(`${import.meta.env.VITE_API_URL}/monitor/log`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, message, level })
        });
    } catch (e) {
        // Silent fail to avoid infinite error loops if the logging backend is down
        console.warn('[Monitor] Failed to report log:', e);
    }
};

export const setupErrorMonitor = () => {
    window.onerror = (message, source, lineno, colno, error) => {
        reportLog(
            'Runtime Exception',
            `**Message**: ${message}\n**Source**: ${source}\n**Line**: ${lineno}:${colno}\n\`\`\`${error?.stack?.slice(0, 500) || 'No stack available'}\`\`\``,
            'error'
        );
    };

    window.onunhandledrejection = (event) => {
        reportLog(
            'Unhandled Rejection',
            `**Reason**: ${event.reason?.message || event.reason}\n\`\`\`${event.reason?.stack?.slice(0, 500) || 'No stack available'}\`\`\``,
            'error'
        );
    };
};

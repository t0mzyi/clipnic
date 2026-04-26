/**
 * Consistent date formatting utility for Clipnic (IST / Asia/Kolkata)
 */

const TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

export const formatToIST = (date: string | Date | number, options: Intl.DateTimeFormatOptions = {}) => {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    // Default options if none provided
    const defaultOptions: Intl.DateTimeFormatOptions = {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };

    return d.toLocaleDateString(LOCALE, defaultOptions);
};

export const formatDateTimeToIST = (date: string | Date | number) => {
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    return d.toLocaleString(LOCALE, {
        timeZone: TIMEZONE,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const getISTDate = () => {
    return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE }));
};

/**
 * Converts a local datetime-local input string (YYYY-MM-DDTHH:mm) to a UTC ISO string
 */
export const toUTCISO = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toISOString();
};

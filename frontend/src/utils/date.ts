/**
 * Consistent date formatting utility for Clipnic (IST / Asia/Kolkata)
 */

const TIMEZONE = 'Asia/Kolkata';
const LOCALE = 'en-IN';

export const formatToIST = (date: string | Date | number, options: Intl.DateTimeFormatOptions = {}) => {
    if (!date) return '—';
    
    let d: Date;
    if (typeof date === 'string') {
        // If it's a string without a timezone indicator, treat it as UTC
        const isoStr = (date.includes('T') || date.includes(' ')) && !date.includes('Z') && !date.includes('+') 
            ? date.replace(' ', 'T') + 'Z' 
            : date;
        d = new Date(isoStr);
    } else {
        d = new Date(date);
    }
    
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
    if (!date) return '—';

    let d: Date;
    if (typeof date === 'string') {
        const isoStr = (date.includes('T') || date.includes(' ')) && !date.includes('Z') && !date.includes('+') 
            ? date.replace(' ', 'T') + 'Z' 
            : date;
        d = new Date(isoStr);
    } else {
        d = new Date(date);
    }
    
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
    
    // If it's already an ISO string with timezone, just return it
    if (dateStr.includes('Z') || dateStr.includes('+')) return new Date(dateStr).toISOString();
    
    // If it's a datetime-local string (YYYY-MM-DDTHH:mm), parse it as local time
    // and convert to UTC ISO. 
    const d = new Date(dateStr);
    return d.toISOString();
};

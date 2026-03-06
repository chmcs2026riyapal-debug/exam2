/**
 * Utility functions for the application
 */

// Format a date string or timestamp into a readable date format
export const formatDate = (dateValue) => {
    if (!dateValue) return '';

    let date;
    // Handle potential numeric strings or timestamps
    if (typeof dateValue === 'string' && !isNaN(dateValue)) {
        date = new Date(parseInt(dateValue));
    } else {
        date = new Date(dateValue);
    }

    if (isNaN(date.getTime())) return 'Invalid Date';

    // Fix for the 60307 year bug: if year is unreasonably large, assume it's a messed up timestamp
    if (date.getFullYear() > 3000) {
        // Attempt to fix 1000x timestamp errors
        date = new Date(date.getTime() / 1000);
    }

    return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};


// Format a date string or timestamp into a readable time format
export const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Calculate percentage and return formatted string
export const calculatePercentage = (marks, total) => {
    const m = parseFloat(marks);
    const t = parseFloat(total);
    if (isNaN(m) || isNaN(t) || t === 0) return '0%';
    return ((m / t) * 100).toFixed(2) + '%';
};


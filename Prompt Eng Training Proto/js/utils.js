// Utility Functions - Helper functions and logging

import { CONFIG } from './config.js';

console.log('[UTILS] Loading utility functions...');

// Logging utilities
export const log = {
    info: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && ['info', 'debug', 'all'].includes(CONFIG.DEBUG.LOG_LEVEL)) {
            console.log(`[INFO] ${message}`, ...args);
        }
    },

    debug: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && ['debug', 'all'].includes(CONFIG.DEBUG.LOG_LEVEL)) {
            console.log(`[DEBUG] ${message}`, ...args);
        }
    },

    warn: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED) {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },

    error: (message, ...args) => {
        console.error(`[ERROR] ${message}`, ...args);
    },

    api: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.LOG_API_CALLS) {
            console.log(`[API] ${message}`, ...args);
        }
    },

    state: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.LOG_STATE_CHANGES) {
            console.log(`[STATE] ${message}`, ...args);
        }
    },

    ui: (message, ...args) => {
        if (CONFIG.DEBUG.ENABLED && CONFIG.DEBUG.LOG_UI_EVENTS) {
            console.log(`[UI] ${message}`, ...args);
        }
    }
};

// Generate unique ID
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

// Format date
export function formatDate(date) {
    const d = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return d.toLocaleDateString('en-US', options);
}

// Format relative time (e.g., "2 hours ago")
export function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    return formatDate(date);
}

// Estimate token count (rough approximation)
export function estimateTokens(text) {
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words * 1.3);
}

// Sanitize HTML to prevent XSS
export function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
}

// Escape HTML
export function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Debounce function
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Random integer between min and max (inclusive)
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Shuffle array
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Get random item from array
export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// Clamp number between min and max
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// Linear interpolation
export function lerp(start, end, factor) {
    return start + (end - start) * factor;
}

// Calculate percentage
export function percentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// Format number with commas
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Truncate text with ellipsis
export function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

// Wait/sleep function
export function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Copy to clipboard
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        log.info('Copied to clipboard');
        return true;
    } catch (err) {
        log.error('Failed to copy to clipboard:', err);
        return false;
    }
}

// Check if element is in viewport
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Scroll to element smoothly
export function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;

    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// Parse query string
export function parseQueryString(queryString = window.location.search) {
    const params = new URLSearchParams(queryString);
    const result = {};
    for (const [key, value] of params) {
        result[key] = value;
    }
    return result;
}

// Create query string
export function createQueryString(params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, value);
        }
    });
    return searchParams.toString();
}

// Deep clone object
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Deep merge objects
export function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return deepMerge(target, ...sources);
}

// Check if value is object
export function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

// Check if value is empty
export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string') return value.trim().length === 0;
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
}

// Validate email
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Track analytics event (Google Analytics)
export function trackEvent(category, action, label = '', value = 0) {
    if (CONFIG.ANALYTICS.TRACK_EVENTS && window.gtag) {
        log.info(`[ANALYTICS] Tracking event: ${category} - ${action} - ${label}`);
        window.gtag('event', action, {
            event_category: category,
            event_label: label,
            value: value
        });
    }
}

// Track page view
export function trackPageView(pageName) {
    if (CONFIG.ANALYTICS.TRACK_EVENTS && window.gtag) {
        log.info(`[ANALYTICS] Tracking page view: ${pageName}`);
        window.gtag('event', 'page_view', {
            page_title: pageName,
            page_location: window.location.href,
            page_path: window.location.pathname
        });
    }
}

// Track timing
export function trackTiming(category, variable, time, label = '') {
    if (CONFIG.ANALYTICS.TRACK_TIMING && window.gtag) {
        log.info(`[ANALYTICS] Tracking timing: ${category} - ${variable} - ${time}ms`);
        window.gtag('event', 'timing_complete', {
            name: variable,
            value: time,
            event_category: category,
            event_label: label
        });
    }
}

// Create timer for tracking
export function createTimer(category, variable) {
    const startTime = Date.now();
    return {
        stop: (label = '') => {
            const duration = Date.now() - startTime;
            trackTiming(category, variable, duration, label);
            return duration;
        }
    };
}

// Get browser info
export function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = '';

    if (ua.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)[1];
    } else if (ua.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)[1];
    } else if (ua.indexOf('Safari') > -1) {
        browserName = 'Safari';
        browserVersion = ua.match(/Version\/([0-9.]+)/)[1];
    } else if (ua.indexOf('Edge') > -1) {
        browserName = 'Edge';
        browserVersion = ua.match(/Edge\/([0-9.]+)/)[1];
    }

    return { name: browserName, version: browserVersion };
}

// Get device type
export function getDeviceType() {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet|ipad/i.test(ua)) return 'tablet';
    return 'desktop';
}

// Storage availability check
export function isLocalStorageAvailable() {
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

console.log('[UTILS] Utility functions loaded successfully');

export default {
    log,
    generateId,
    formatDate,
    formatRelativeTime,
    estimateTokens,
    sanitizeHTML,
    escapeHTML,
    debounce,
    throttle,
    randomInt,
    shuffleArray,
    randomItem,
    clamp,
    lerp,
    percentage,
    formatNumber,
    truncate,
    wait,
    copyToClipboard,
    isInViewport,
    scrollToElement,
    parseQueryString,
    createQueryString,
    deepClone,
    deepMerge,
    isObject,
    isEmpty,
    isValidEmail,
    trackEvent,
    trackPageView,
    trackTiming,
    createTimer,
    getBrowserInfo,
    getDeviceType,
    isLocalStorageAvailable
};

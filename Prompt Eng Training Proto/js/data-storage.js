// Data Storage Manager - LocalStorage wrapper with logging

import { log } from './utils.js';

console.log('[STORAGE] Initializing data storage manager...');

class DataStorage {
    constructor() {
        this.isAvailable = this.checkAvailability();
        log.info('Data storage initialized. Available:', this.isAvailable);
    }

    checkAvailability() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            log.error('LocalStorage not available:', e);
            return false;
        }
    }

    set(key, value) {
        if (!this.isAvailable) {
            log.warn('LocalStorage not available, cannot save:', key);
            return false;
        }

        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            log.debug(`Saved to storage: ${key}`, value);
            return true;
        } catch (e) {
            log.error(`Error saving to storage (${key}):`, e);
            return false;
        }
    }

    get(key, defaultValue = null) {
        if (!this.isAvailable) {
            log.warn('LocalStorage not available, returning default for:', key);
            return defaultValue;
        }

        try {
            const item = localStorage.getItem(key);
            if (item === null) {
                log.debug(`No data found for: ${key}, returning default`);
                return defaultValue;
            }
            const parsed = JSON.parse(item);
            log.debug(`Loaded from storage: ${key}`, parsed);
            return parsed;
        } catch (e) {
            log.error(`Error loading from storage (${key}):`, e);
            return defaultValue;
        }
    }

    remove(key) {
        if (!this.isAvailable) {
            log.warn('LocalStorage not available, cannot remove:', key);
            return false;
        }

        try {
            localStorage.removeItem(key);
            log.debug(`Removed from storage: ${key}`);
            return true;
        } catch (e) {
            log.error(`Error removing from storage (${key}):`, e);
            return false;
        }
    }

    clear() {
        if (!this.isAvailable) {
            log.warn('LocalStorage not available, cannot clear');
            return false;
        }

        try {
            localStorage.clear();
            log.info('Cleared all storage');
            return true;
        } catch (e) {
            log.error('Error clearing storage:', e);
            return false;
        }
    }

    exists(key) {
        if (!this.isAvailable) return false;
        return localStorage.getItem(key) !== null;
    }

    keys() {
        if (!this.isAvailable) return [];
        return Object.keys(localStorage);
    }

    size() {
        if (!this.isAvailable) return 0;
        return localStorage.length;
    }
}

const storage = new DataStorage();

export default storage;

console.log('[STORAGE] Data storage manager ready');

import { weekStart } from 'dayjs/locale/*';
import { writable } from 'svelte/store';

export const sessions = writable([]);

export const selectedEvent = writable({ start: null, date: null, end: null, track: null, title: null, id: null })

export const currentDate = writable(new Date())
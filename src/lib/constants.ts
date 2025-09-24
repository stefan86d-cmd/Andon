
import type { IssueCategory } from "./types";

export const allCategories: { id: IssueCategory; label: string; color: string }[] = [
    { id: 'it', label: 'IT & Network', color: '#0ea5e9' }, // sky-500
    { id: 'logistics', label: 'Logistics', color: '#f59e0b' }, // amber-500
    { id: 'tool', label: 'Tool & Equipment', color: '#84cc16' }, // lime-500
    { id: 'quality', label: 'Quality', color: '#10b981' }, // emerald-500
    { id: 'assistance', label: 'Need Assistance', color: '#ef4444' }, // red-500
    { id: 'other', label: 'Other', color: '#a855f7' }, // purple-500
];

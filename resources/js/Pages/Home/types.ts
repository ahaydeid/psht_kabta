import type { LucideIcon } from 'lucide-react';

export type PublicNavigationItem = {
    href: string;
    icon: LucideIcon;
    label: string;
};

export type PublicArticle = {
    category: string;
    date: string;
    excerpt: string;
    image: string;
    slug: string;
    title: string;
};

export type PublicGalleryItem = {
    image: string;
    title: string;
};

export type PublicTrainingSchedule = {
    day: string;
    place: string;
    time: string;
};

export type PublicQuickAccess = {
    description: string;
    href: string;
    label: string;
};

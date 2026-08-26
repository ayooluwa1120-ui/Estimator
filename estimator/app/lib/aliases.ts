import type { ReactNode } from "react";

export type ToggleProps = {
    checked: boolean;
    onChange: () => void;
    label: string;
};

export type CheckRowProps = {
    label: string;
    price: number;
    checked: boolean;
    onChange: () => void;
};


export type AccordionProps = {
    id: string;
    title: string;
    subtitle: string;
    open: boolean;
    enabled: boolean;
    onToggleEnabled: () => void;
    onToggleOpen: () => void;
    children: ReactNode;
};

export type ServiceKey = 'web' | 'marketing' | 'it';
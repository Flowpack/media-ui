declare module '*.module.css' {
    const classes: { [key: string]: string };
    export = classes;
    export default classes;
}

interface NeosI18n {
    translate: (
        id: string,
        fallback: string,
        packageKey: string,
        source: string,
        args: Record<string, unknown> | string[]
    ) => string;
    initialized: boolean;
}

// TODO: This is a copy of the interface in Neos.Ui and should preferably be made available to plugins
interface I18nRegistry {
    translate: (
        id?: string,
        fallback?: string,
        params?: Record<string, unknown> | (string | number)[],
        packageKey?: string,
        sourceName?: string
    ) => string;
}

interface NeosNotification {
    notice: (title: string) => void;
    ok: (title: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string) => void;
}

interface Window {
    NeosCMS: {
        I18n: NeosI18n;
        Notification: NeosNotification;
    };
}

type PaginationConfig = {
    assetsPerPage: number;
    maximumLinks: number;
};

type AssetType = 'image' | 'video' | 'audio' | 'document' | 'all';
type MediaType = `${string}/${string}`;

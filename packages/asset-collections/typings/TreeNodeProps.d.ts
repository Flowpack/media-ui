interface TreeNodeProps {
    title?: string;
    label?: string;
    level: number;
    collapsedByDefault?: boolean;
}

type DROP_POSITION = 'before' | 'into';

import * as React from 'react';

import { IconButton, Button } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles } from '../../../core';

const useStyles = createUseMediaUiStyles({
    item: {
        userSelect: 'none',
        '& button': {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        },
    },
});

interface PaginationItemProps {
    title: string;
    label?: string;
    onClick: (page: number) => void;
    page?: number;
    disabled?: boolean;
    selected?: boolean;
    icon?: string;
}

const PaginationItem: React.FC<PaginationItemProps> = ({
    title,
    label,
    onClick,
    page = null,
    selected = false,
    disabled = false,
    icon,
}: PaginationItemProps) => {
    const classes = useStyles();
    return (
        <li className={[classes.item, selected ? classes.selected : ''].join(' ')}>
            {icon ? (
                <IconButton
                    icon={icon}
                    disabled={disabled}
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    title={title}
                    onClick={() => onClick(page)}
                />
            ) : (
                <Button
                    icon={icon}
                    disabled={disabled}
                    size="regular"
                    style={selected ? 'brand' : 'transparent'}
                    hoverStyle="brand"
                    title={title}
                    onClick={() => onClick(page)}
                >
                    {label || page}
                </Button>
            )}
        </li>
    );
};

export default React.memo(PaginationItem);

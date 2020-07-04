import * as React from 'react';

import { IconButton } from '@neos-project/react-ui-components';
import { createUseMediaUiStyles } from '../../core';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    item: {
        width: '2.4rem',
        userSelect: 'none',
        lineHeight: '2.4rem',
        '& a': {
            display: 'block',
            height: '100%',
            width: '100%',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: theme.colors.primary,
                color: 'white'
            }
        }
    },
    selected: {
        border: `1px solid ${theme.colors.border}`,
        borderTop: 0,
        borderBottom: 0,
        '& a': {
            color: theme.colors.primary
        }
    }
}));

interface PaginationItemProps {
    title: string;
    label?: string;
    onClick: (page: number) => void;
    page: number;
    selected?: boolean;
    icon?: string;
}

const PaginationItem: React.FC<PaginationItemProps> = ({
    title,
    label,
    onClick,
    page,
    selected = false,
    icon
}: PaginationItemProps) => {
    const classes = useStyles();
    return (
        <li className={[classes.item, selected ? classes.selected : ''].join(' ')}>
            {icon ? (
                <IconButton
                    icon={icon}
                    size="regular"
                    style="transparent"
                    hoverStyle="brand"
                    title={title}
                    onClick={() => onClick(page)}
                />
            ) : (
                <a onClick={() => onClick(page)} title={title}>
                    {label || page}
                </a>
            )}
        </li>
    );
};

export default React.memo(PaginationItem);

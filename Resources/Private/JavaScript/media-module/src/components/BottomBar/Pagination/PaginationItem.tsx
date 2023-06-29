import React from 'react';
import cx from 'classnames';

import { IconButton, Button } from '@neos-project/react-ui-components';

import classes from './PaginationItem.module.css';

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
    return (
        <li className={cx(classes.item, selected && classes.selected)}>
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

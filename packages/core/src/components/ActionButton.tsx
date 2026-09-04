import React from 'react';
import cx from 'classnames';

import { Icon, Button } from '@neos-project/react-ui-components';

import classes from './ActionButton.module.css';

export interface ActionButtonProps {
    icon: string;
    label: string;
    onClick: () => void;
    disabled?: boolean;
    title?: string;
    hideLabel?: boolean;
    className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    label,
    onClick,
    disabled = false,
    title,
    hideLabel = false,
    className,
}) => {
    return (
        <Button
            size="small"
            className={cx(classes.button, className, hideLabel && classes.small)}
            disabled={disabled}
            title={title ?? label}
            onClick={onClick}
        >
            <Icon icon={icon} />
            <span className={cx(classes.label, hideLabel && classes.hideLabel)}>{label}</span>
        </Button>
    );
};

export default React.memo(ActionButton);

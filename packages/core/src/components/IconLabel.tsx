import React from 'react';
import cx from 'classnames';

import { Icon } from '@neos-project/react-ui-components';

interface IconLabelProps {
    icon?: string;
    iconUri?: string;
    label?: string;
    className?: string;
    children?: React.ReactElement;
}

import classes from './IconLabel.module.css';

const IconLabel: React.FC<IconLabelProps> = ({
    icon = 'question',
    iconUri = '',
    label = '',
    className = '',
    children = null,
}: IconLabelProps) => {
    return (
        <span className={cx(classes.wrapper, className)}>
            <span className={classes.iconWrap}>
                {iconUri ? <img src={iconUri} alt={label} className={classes.imgIcon} /> : <Icon icon={icon} />}
            </span>
            <span className={classes.label}>{children || label || ''}</span>
        </span>
    );
};

export default React.memo(IconLabel);

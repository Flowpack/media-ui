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

import './IconLabel.module.css';

const IconLabel: React.FC<IconLabelProps> = ({
    icon = 'question',
    iconUri = '',
    label = '',
    className = '',
    children = null,
}: IconLabelProps) => {
    return (
        <span className={cx('wrapper', className)}>
            <span className="iconWrap">
                {iconUri ? <img src={iconUri} alt={label} className="imgIcon" /> : <Icon icon={icon} />}
            </span>
            <span className="label">{children || label || ''}</span>
        </span>
    );
};

export default React.memo(IconLabel);

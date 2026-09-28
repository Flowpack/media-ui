import React from 'react';
import cx from 'classnames';

import classes from './Badge.module.css';

type BadgeVariant = 'success' | 'info' | 'warning' | 'error' | 'inverse';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: BadgeVariant;
}

const Badge: React.FC<BadgeProps> = ({ variant, className, children, ...rest }) => {
    return (
        <span className={cx(classes.badge, variant && classes[variant], className)} {...rest}>
            {children}
        </span>
    );
};

export default React.memo(Badge);

import React from 'react';

import { Icon } from '@neos-project/react-ui-components';

import classes from './IconStack.module.css';

type IconStackProps = {
    primaryIcon: string;
    secondaryIcon: string | undefined;
};

export const IconStack: React.FC<IconStackProps> = ({ primaryIcon, secondaryIcon }) => {
    return (
        <div className={classes.iconStack}>
            <Icon icon={primaryIcon} />
            {secondaryIcon && <Icon icon={secondaryIcon} />}
        </div>
    );
};

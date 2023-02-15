import * as React from 'react';

import { Icon } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    wrapper: {
        display: 'flex',
        alignItems: 'center',
        height: theme.spacing.goldenUnit,
        gap: theme.spacing.half,
    },
    iconWrap: {
        display: 'flex',
    },
    label: {
        fontWeight: 'bold',
        userSelect: 'none',
    },
    imgIcon: {
        width: 'auto',
        height: '18px',
    },
}));

interface IconLabelProps {
    icon?: string;
    iconUri?: string;
    label?: string;
    className?: string;
    children?: React.ReactElement;
}

const IconLabel: React.FC<IconLabelProps> = ({
    icon = 'question',
    iconUri = '',
    label = '',
    className = '',
    children = null,
}: IconLabelProps) => {
    const classes = useStyles();

    return (
        <span className={[classes.wrapper, className].join(' ')}>
            <span className={classes.iconWrap}>
                {iconUri ? <img src={iconUri} alt={label} className={classes.imgIcon} /> : <Icon icon={icon} />}
            </span>
            <span className={classes.label}>{children || label || ''}</span>
        </span>
    );
};

export default React.memo(IconLabel);

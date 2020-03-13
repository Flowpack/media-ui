import * as React from 'react';
import Icon from '@neos-project/react-ui-components/lib-esm/Icon';
import { createUseMediaUiStyles } from '../core';
import { MediaUiTheme } from '../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    iconWrap: {
        width: theme.spacing.goldenUnit,
        display: 'inline-flex',
        justifyContent: 'center'
    },
    headline: {
        '.neos &': {
            fontWeight: 'bold',
            lineHeight: theme.spacing.goldenUnit,
            paddingLeft: theme.spacing.half
        }
    }
}));

interface IconLabelProps {
    icon: string;
    label?: string;
    className?: string;
    children?: React.ReactElement;
}

export default function IconLabel(props: IconLabelProps) {
    const classes = useStyles();

    return (
        <div className={props.className}>
            <span className={classes.iconWrap}>
                <Icon icon={props.icon} />
            </span>
            <span className={classes.headline}>{props.children || props.label || ''}</span>
        </div>
    );
}

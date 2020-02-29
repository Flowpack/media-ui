import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { createUseStyles } from 'react-jss';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';

const useStyles = createUseStyles({
    '@keyframes cssloadWidth': {
        '0%, 100%': {
            transitionTimingFunction: 'cubic-bezier(1, 0, .65, .85)'
        },
        '0%': {
            width: 0
        },
        '100%': {
            width: '100%'
        }
    },
    container: {
        left: 0,
        top: 0,
        height: '2px',
        position: 'fixed',
        width: '100vw',
        zIndex: ({ theme }) => theme.loadingIndicatorZIndex
    },
    indicator: {
        height: '2px',
        position: 'relative',
        width: '100%'
    },
    bar: {
        height: '100%',
        position: 'relative',
        backgroundColor: ({ theme }) => theme.deletedColor,
        animation: '$cssloadWidth 2s cubic-bezier(.45, 0, 1, 1) infinite'
    }
});

export default function LoadingIndicator() {
    const theme = useMediaUiTheme();
    const classes = useStyles({ theme });
    const { isLoading } = useMediaUi();

    return (
        <>
            {isLoading && (
                <div className={classes.container}>
                    <div className={classes.indicator}>
                        <div className={classes.bar} />
                    </div>
                </div>
            )}
        </>
    );
}

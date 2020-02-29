import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { createUseStyles } from 'react-jss';
import { useIntl } from '../core/Intl';
import { useMediaUiTheme } from '../core/MediaUiThemeProvider';
import MediaUiTheme from '../interfaces/MediaUiTheme';

const useStyles = createUseStyles((theme: MediaUiTheme) => ({
    container: {
        '.neos &': {
            padding: '0 1rem 1rem 1rem'
        }
    },
    list: {
        '& li': {
            margin: '.5rem 0',
            cursor: 'pointer',
            userSelect: 'none'
        }
    },
    itemSelected: {
        fontWeight: 'bold'
    }
}));

export default function AssetSourceList() {
    const theme = useMediaUiTheme();
    const classes = useStyles({ theme });
    const { assetSources, assetSourceFilter, setAssetSourceFilter } = useMediaUi();
    const { translate } = useIntl();

    return (
        <>
            {assetSources.length > 1 && (
                <nav className={classes.container}>
                    <strong>{translate('assetSourceList.header', 'Media sources')}</strong>
                    <ul className={classes.list}>
                        {assetSources &&
                            assetSources.map(assetSource => (
                                <li key={assetSource.identifier}>
                                    <a
                                        className={
                                            assetSourceFilter?.identifier == assetSource.identifier
                                                ? classes.itemSelected
                                                : null
                                        }
                                        onClick={() => setAssetSourceFilter(assetSource)}
                                    >
                                        {assetSource.identifier === 'neos' ? 'Local' : assetSource.label}
                                    </a>
                                </li>
                            ))}
                    </ul>
                </nav>
            )}
        </>
    );
}

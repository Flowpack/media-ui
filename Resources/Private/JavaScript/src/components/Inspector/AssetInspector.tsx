import * as React from 'react';
import { createUseMediaUiStyles, useIntl, useMediaUi } from '../../core';
import { MediaUiTheme } from '../../interfaces';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    inspector: {
        '.neos &': {
            display: 'grid',
            gridAutoRows: 'auto',
            gridGap: '1rem',
            '& ul': {
                backgroundColor: theme.alternatingBackgroundColor,
                padding: '1rem'
            },
            '& input, & textarea': {
                width: '100%'
            }
        }
    },
    propertyGroup: {}
}));

export default function AssetInspector() {
    const classes = useStyles();
    const { selectedAsset } = useMediaUi();
    const { translate } = useIntl();

    return (
        <>
            {selectedAsset?.localAssetData && (
                <div className={classes.inspector}>
                    <div className={classes.propertyGroup}>
                        <label>{translate('inspector.title', 'Title')}</label>
                        <input type="text" readOnly={true} value={selectedAsset.localAssetData.title} />
                    </div>
                    <div className={classes.propertyGroup}>
                        <label>{translate('inspector.caption', 'Caption')}</label>
                        <textarea readOnly={true} rows={3} value={selectedAsset.localAssetData.caption} />
                    </div>
                    {selectedAsset.localAssetData.tags.length ? (
                        <div className={classes.propertyGroup}>
                            <label>{translate('inspector.tags', 'Tags')}</label>
                            <ul>
                                {selectedAsset.localAssetData.tags.map(tag => (
                                    <li key={tag.label}>{tag.label}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                    {selectedAsset.localAssetData.assetCollections.length ? (
                        <div className={classes.propertyGroup}>
                            <label>{translate('inspector.assetCollections', 'Collections')}</label>
                            <ul>
                                {selectedAsset.localAssetData.assetCollections.map(assetCollection => (
                                    <li key={assetCollection.title}>{assetCollection.title}</li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </div>
            )}
        </>
    );
}

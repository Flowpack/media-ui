import * as React from 'react';
import { useMediaUi } from '../core/MediaUi';
import { useIntl } from '../core/Intl';

export default function AssetInspector() {
    const { selectedAsset } = useMediaUi();
    const { translate } = useIntl();

    return (
        <>
            {selectedAsset && (
                <>
                    <div>
                        <label>{translate('inspector.title', 'Title')}</label>
                        <input type="text" readOnly={true} value={selectedAsset.localAssetData.title} />
                    </div>
                    <div>
                        <label>{translate('inspector.caption', 'Caption')}</label>
                        <input type="text" readOnly={true} value={selectedAsset.localAssetData.caption} />
                    </div>
                    <div>
                        <label>{translate('inspector.tags', 'Tags')}</label>
                        <ul>
                            {selectedAsset.localAssetData.tags.map(tag => (
                                <li key={tag.label}>{tag.label}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <label>{translate('inspector.assetCollections', 'Collections')}</label>
                        <ul>
                            {selectedAsset.localAssetData.assetCollections.map(assetCollection => (
                                <li key={assetCollection.title}>{assetCollection.title}</li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
        </>
    );
}

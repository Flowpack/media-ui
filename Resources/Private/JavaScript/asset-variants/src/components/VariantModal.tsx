import React, { FC, useEffect, useRef, useState } from 'react';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import 'react-image-crop/dist/ReactCrop.css';
import { Button, Dialog } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles, MediaUiTheme } from '@media-ui/core/src';
import { useSelectedAsset } from '@media-ui/core/src/hooks';

import assetVariantModalState from '../state/assetVariantModalState';
import useSelectedAssetVariant from '../hooks/useSelectedAssetVariant';
import selectedVariantIdState from '../state/selectedVariantIdState';
import ImageCrop from './ImageCrop';
import { PixelCrop } from 'react-image-crop';

const useStyles = createUseMediaUiStyles((theme: MediaUiTheme) => ({
    cropContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
}));

const VariantModal: FC = () => {
    const classes = useStyles();
    const { translate } = useIntl();
    const [isOpen, setIsOpen] = useRecoilState(assetVariantModalState);
    const setSelectedVariantId = useSetRecoilState(selectedVariantIdState);
    const asset = useSelectedAsset();
    const assetVariant = useSelectedAssetVariant();
    const [currentCrop, setCurrentCrop] = useState<PixelCrop>();
    const [hasChanged, setHasChanged] = useState(false);
    const aspectRatio = useRef<number>();
    const handleRequestClose = useCallback(() => {
        setSelectedVariantId(undefined);
        setIsOpen(false);
    }, [setIsOpen, setSelectedVariantId]);
    const handleCropComplete = (pxCrop: PixelCrop) => {
        const savedCropInformation = assetVariant.cropInformation;
        setHasChanged(
            savedCropInformation?.x !== pxCrop.x ||
                savedCropInformation?.y !== pxCrop.y ||
                savedCropInformation?.width !== pxCrop.width ||
                savedCropInformation?.height !== pxCrop.height
        );
    };

    const cropHasChanged = () => {
        const savedCropInformation = assetVariant.cropInformation;
        return (
            savedCropInformation?.x !== currentCrop.x ||
            savedCropInformation?.y !== currentCrop.y ||
            savedCropInformation?.width !== currentCrop.width ||
            savedCropInformation?.height !== currentCrop.height
        );
    };

    const handleSave = () => {
        console.log('saving', currentCrop);
    };

    useEffect(() => {
        setCurrentCrop({ unit: 'px', ...assetVariant.cropInformation });
        aspectRatio.current = assetVariant.width / assetVariant.height;
    }, [assetVariant]);

    return (
        <Dialog
            isOpen={isOpen}
            title={translate(
                'assetVariantModal.title',
                `Variant details for  ${assetVariant.presetIdentifier}: ${assetVariant.variantName}`,
                {
                    assetVariant: assetVariant,
                }
            )}
            onRequestClose={handleRequestClose}
            style="wide"
            actions={[
                <Button key="cancel" style="neutral" hoverStyle="darken" onClick={handleRequestClose}>
                    {translate('assetVariantModal.cancel', 'Cancel')}
                </Button>,
                <Button key="save" style="success" hoverStyle="success" disabled={!hasChanged} onClick={handleSave}>
                    {translate('assetVariantModal.save', 'Save')}
                </Button>,
            ]}
        >
            <div className={classes.cropContainer}>
                {assetVariant ? (
                    <ImageCrop
                        currentCrop={currentCrop}
                        onCropChange={setCurrentCrop}
                        onCropComplete={handleCropComplete}
                        originalPreviewUrl={asset.previewUrl}
                        aspectRatio={aspectRatio.current}
                    />
                ) : (
                    <span>{translate('assetVariantModal.loading', 'Loading...')}</span>
                )}
            </div>
        </Dialog>
    );
};

export default React.memo(VariantModal);

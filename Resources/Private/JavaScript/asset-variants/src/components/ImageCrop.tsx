import React, { FC } from 'react';
import ReactCrop, { PercentCrop, PixelCrop } from 'react-image-crop';

interface ImageCropPros {
    aspectRatio: number;
    currentCrop: any;
    onCropChange(crop: PixelCrop, percentageCrop: PercentCrop): void;
    onCropComplete(crop: PixelCrop, percentageCrop: PercentCrop): void;
    originalPreviewUrl: string;
}

const ImageCrop: FC<ImageCropPros> = ({
    aspectRatio,
    currentCrop,
    onCropChange,
    onCropComplete,
    originalPreviewUrl,
}: ImageCropPros) => {
    return (
        <ReactCrop
            aspect={aspectRatio}
            crop={currentCrop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            keepSelection={true}
        >
            <img src={originalPreviewUrl} />
        </ReactCrop>
    );
};

export default React.memo(ImageCrop);

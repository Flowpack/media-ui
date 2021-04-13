import * as React from 'react';
import { useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { useIntl, createUseMediaUiStyles } from '@media-ui/core/src';
import { selectedMediaTypeState } from '@media-ui/core/src/state';
import { clipboardState } from '@media-ui/feature-clipboard/src';

const useStyles = createUseMediaUiStyles({
    typeFilter: {},
});

interface MediaTypeOptions {
    [type: string]: {
        value: string;
        label: string;
        icon: string;
    };
}

const TypeFilter: React.FC = () => {
    const classes = useStyles();
    const [mediaTypeFilter, setMediaTypeFilter] = useRecoilState(selectedMediaTypeState);
    const { translate } = useIntl();
    const { visible: showClipboard } = useRecoilValue(clipboardState);

    const mediaTypeOptions = useMemo(
        (): MediaTypeOptions => ({
            all: {
                value: '',
                label: translate('typeFilter.mediaType.values.all', 'All'),
                icon: 'photo-video',
            },
            video: {
                value: 'video',
                label: translate('typeFilter.mediaType.values.video', 'Video'),
                icon: 'file-video',
            },
            audio: {
                value: 'audio',
                label: translate('typeFilter.mediaType.values.audio', 'Audio'),
                icon: 'file-audio',
            },
            image: {
                value: 'image',
                label: translate('typeFilter.mediaType.values.image', 'Images'),
                icon: 'file-image',
            },
            // TODO: The Media API currently only knows "Document" internally which is not a valid mimetype
            document: {
                value: 'document',
                label: translate('typeFilter.mediaType.values.document', 'Document'),
                icon: 'file',
            },
        }),
        [translate]
    );

    if (showClipboard) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                options={Object.values(mediaTypeOptions)}
                onValueChange={(value) => setMediaTypeFilter(value)}
                value={mediaTypeFilter}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(TypeFilter);

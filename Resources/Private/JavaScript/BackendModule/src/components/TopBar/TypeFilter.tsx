import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { SelectBox } from '@neos-project/react-ui-components';

import { createUseMediaUiStyles, useIntl } from '@media-ui/core/src';
import { selectedMediaTypeState } from '@media-ui/core/src/state';
import { MainViewState, mainViewState } from '../../state';

const useStyles = createUseMediaUiStyles({
    typeFilter: {},
    selectBox: {
        minWidth: 'auto',
    },
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
    const mainView = useRecoilValue(mainViewState);

    const onValueChange = useCallback(
        (value) => {
            if (value === 'unused') {
                // TODO: Implement
                console.log('unused TODO');
            } else {
                setMediaTypeFilter(value);
            }
        },
        [setMediaTypeFilter]
    );

    const mediaTypeOptions = useMemo(
        (): MediaTypeOptions => ({
            unused: {
                value: 'unused',
                label: translate('typeFilter.mediaType.values.unused', 'Unused'),
                icon: 'fab fa-creative-commons-zero',
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

    if (mainView !== MainViewState.DEFAULT) return null;

    return (
        <div className={classes.typeFilter}>
            <SelectBox
                className={classes.selectBox}
                options={Object.values(mediaTypeOptions)}
                onValueChange={onValueChange}
                value={mediaTypeFilter}
                allowEmpty={true}
                placeholderIcon="photo-video"
                placeholder={translate('typeFilter.mediaType.values.all', 'All')}
                optionValueField="value"
            />
        </div>
    );
};

export default React.memo(TypeFilter);

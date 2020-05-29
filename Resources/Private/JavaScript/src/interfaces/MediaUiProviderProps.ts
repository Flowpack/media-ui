import * as React from 'react';

export default interface MediaUiProviderProps {
    children: React.ReactElement;
    dummyImage: string;
    selectionMode?: boolean;
    containerRef: React.ElementRef<any>;
}

import * as React from 'react';

export default interface MediaUiProviderProps {
    children: React.ReactElement;
    notify: (type: string, message: string) => void;
    dummyImage: string;
}

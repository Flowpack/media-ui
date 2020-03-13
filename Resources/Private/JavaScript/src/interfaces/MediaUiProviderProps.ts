import * as React from 'react';

export default interface MediaUiProviderProps {
    children: React.ReactElement;
    csrf: string;
    endpoints: {
        graphql: string;
    };
    notify: (type: string, message: string) => void;
    dummyImage: string;
}

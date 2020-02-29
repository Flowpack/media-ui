import * as React from 'react';

export default interface MediaUiProviderProps {
    children: React.ReactElement;
    csrf: string;
    endpoints: {
        graphql: string;
    };
    notify: Function;
    dummyImage: string;
}

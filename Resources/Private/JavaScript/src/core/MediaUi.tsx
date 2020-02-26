import * as React from 'react';
import { createContext, useContext } from 'react';
import { useQuery } from '@apollo/react-hooks';
import { gql } from 'apollo-boost';
import Asset from '../interfaces/Asset';
import Tag from '../interfaces/Tag';

interface ProviderProps {
    children: React.ReactElement;
    csrf: string;
    endpoints: {
        graphql: string;
    };
    notify: Function;
}

interface ProviderValues {
    csrf: string;
    endpoints: any;
    assets: Array<Asset>;
    tags: Array<Tag>;
    notify: Function;
}

export const MediaUiContext = createContext(undefined);
export const useMediaUi = (): ProviderValues => useContext(MediaUiContext);

const ASSETS = gql`
    {
        assets {
            identifier
            title
            label
            caption
            mediaType
            fileExtension
            tags {
                label
            }
        }
        tags {
            label
        }
    }
`;

export function MediaUiProvider({ children, csrf, endpoints, notify }: ProviderProps) {
    const { loading, error, data } = useQuery(ASSETS);

    const assets = data && data.assets ? data.assets : [];
    const tags = data && data.tags ? data.tags : [];

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider value={{ csrf, endpoints, assets, tags, notify }}>
                {error ? <p>{error.message}</p> : loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}

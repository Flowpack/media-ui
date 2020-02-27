import * as React from 'react';
import { createContext, useContext, useState } from 'react';
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
    dummyImage: string;
}

interface ProviderValues {
    csrf: string;
    endpoints: any;
    assets: Array<Asset>;
    tags: Array<Tag>;
    notify: Function;
    tagFilter: Tag;
    setTagFilter: Function;
    dummyImage: string;
}

interface AssetQueryResult {
    assets: [Asset];
    tags: [Tag];
}

interface AssetQueryVariables {
    tag: string;
}

export const MediaUiContext = createContext(undefined);
export const useMediaUi = (): ProviderValues => useContext(MediaUiContext);

const ASSETS = gql`
    query ASSETS($tag: String) {
        assets(tag: $tag) {
            identifier
            title
            label
            caption
            mediaType
            fileExtension
            thumbnail
            tags {
                label
            }
        }
        tags {
            label
        }
    }
`;

export function MediaUiProvider({ children, csrf, endpoints, notify, dummyImage }: ProviderProps) {
    const [tagFilter, setTagFilter] = useState<Tag>();
    const { loading, error, data } = useQuery<AssetQueryResult, AssetQueryVariables>(ASSETS, {
        variables: { tag: tagFilter && tagFilter.label ? tagFilter.label : '' }
    });

    const assets = data && data.assets ? data.assets : [];
    const tags = data && data.tags ? data.tags : [];

    if (error) {
        console.error(error);
    }

    return (
        <>
            <MediaUiContext.Provider
                value={{ csrf, endpoints, assets, tags, notify, tagFilter, setTagFilter, dummyImage }}
            >
                {error ? <p>{error.message}</p> : loading ? <p>Loading...</p> : children}
            </MediaUiContext.Provider>
        </>
    );
}

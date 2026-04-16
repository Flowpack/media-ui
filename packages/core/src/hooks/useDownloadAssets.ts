import { gql, useApolloClient } from '@apollo/client';

const DELAY_BETWEEN_DOWNLOADS_MS = 200;

const ASSET_DOWNLOAD_FRAGMENT = gql`
    fragment AssetDownload on Asset {
        label
        filename
        file {
            url
        }
    }
`;

interface AssetDownloadFragment {
    label: string;
    filename: string;
    file: { url: string } | null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const triggerBrowserDownload = (url: string, filename: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener';
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
};

export default function useDownloadAssets() {
    const client = useApolloClient();

    const downloadOne = ({ assetId }: AssetIdentity) => {
        const data = client.readFragment<AssetDownloadFragment>({
            fragment: ASSET_DOWNLOAD_FRAGMENT,
            id: client.cache.identify({ __typename: 'Asset', id: assetId }),
        });

        if (!data?.file?.url) {
            throw new Error(`No downloadable URL for asset ${assetId}`);
        }

        triggerBrowserDownload(data.file.url, data.filename || data.label);
    };

    // Downloads run sequentially with a short throttle between clicks; rapid
    // programmatic anchor clicks are blocked/dropped by some browsers. The
    // per-identity result array (in input order) feeds directly into
    // useFailedAssetLabels.getFailedAssetLabels.
    const downloadAssets = async (identities: AssetIdentity[]): Promise<PromiseSettledResult<void>[]> => {
        const results: PromiseSettledResult<void>[] = [];
        for (let i = 0; i < identities.length; i++) {
            try {
                downloadOne(identities[i]);
                results.push({ status: 'fulfilled', value: undefined });
            } catch (reason) {
                results.push({ status: 'rejected', reason });
            }
            if (i < identities.length - 1) {
                await wait(DELAY_BETWEEN_DOWNLOADS_MS);
            }
        }
        return results;
    };

    return { downloadAssets };
}

import { FeatureFlags } from '@media-ui/core/src/interfaces';

setTimeout(() => {
    console.info('Started Media Module dev server script');

    const app = document.createElement('div');
    app.id = 'media-ui-app';
    app.setAttribute(
        'data-endpoints',
        JSON.stringify({
            graphql: '/graphql',
        })
    );
    app.setAttribute(
        'data-features',
        JSON.stringify({
            queryAssetUsage: true,
            pollForChanges: true,
            useNewMediaSelection: true,
            pagination: {
                assetsPerPage: 20,
                maximumLinks: 5,
            },
            propertyEditor: {
                collapsed: false,
            },
            createAssetRedirectsOption: true,
            showSimilarAssets: true,
            showAssetUsage: true,
            showVariantsEditor: true,
            limitToSingleAssetCollectionPerAsset: true,
        } as FeatureFlags)
    );
    app.setAttribute('data-dummy-image', '/dummy-image.svg');

    document.getElementById('content').appendChild(app);

    // Apply mock
    // @ts-ignore
    window.NeosCMS = {
        I18n: {
            initialized: true,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
            translate: (id, fallback: string, packageKey = null, source = null, args = []) => {
                Object.keys(args).forEach((key) => (fallback = fallback.replace(`{${key}}`, args[key])));
                return fallback;
            },
        },
        Notification: {
            notice: (title) => console.log(title),
            ok: (title) => console.log(title),
            error: (title, message) => console.error(message, title),
            warning: (title, message) => console.warn(message, title),
            info: (title) => console.info(title),
        },
    };
}, 0);

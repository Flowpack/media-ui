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
            mediaTypeFilterOptions: {
                all: {},
                image: {
                    'image/svg+xml': 'SVG',
                    'image/png': 'PNG',
                    'image/jpeg': 'JPEG',
                    'image/gif': 'GIF',
                    'image/webp': 'WEBP',
                },
                document: {
                    'application/pdf': 'PDF',
                },
                audio: {
                    'audio/mpeg': 'MP3',
                    'audio/ogg': 'OGG',
                    'audio/wav': 'WAV',
                    'audio/webm': 'WEBM',
                },
                video: {
                    'video/mp4': 'MP4',
                    'video/ogg': 'OGG',
                    'video/webm': 'WEBM',
                },
            },
        } as FeatureFlags)
    );
    app.setAttribute('data-dummy-image', '/dummy-image.svg');

    // @ts-ignore
    document.getElementById('content').appendChild(app);

    // Apply mock
    // @ts-ignore
    window.NeosCMS = {
        I18n: {
            initialized: true,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
            translate: (id: string, fallback: string, packageKey = null, source = null, args = []) => {
                Object.keys(args).forEach((key) => (fallback = fallback.replace(`{${key}}`, args[key])));
                return fallback;
            },
        },
        Notification: {
            notice: (title: string) => console.log(title),
            ok: (title: string) => console.log(title),
            error: (title: string, message: string) => console.error(message, title),
            warning: (title: string, message: string) => console.warn(message, title),
            info: (title: string) => console.info(title),
        },
    };
}, 0);

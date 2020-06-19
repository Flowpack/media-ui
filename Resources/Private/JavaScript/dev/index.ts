setTimeout(() => {
    console.info('Started Media Module dev server script');

    const app = document.createElement('div');
    app.id = 'media-ui-app';
    app.setAttribute(
        'data-endpoints',
        JSON.stringify({
            graphql: '/graphql'
        })
    );
    app.setAttribute('data-dummy-image', '/dummy-image.svg');

    document.getElementById('content').appendChild(app);

    // Apply mock
    window.NeosCMS = {
        I18n: {
            initialized: true,
            translate: (id, fallback: string, packageKey = null, source = null, args = []) => fallback
        },
        Notification: {
            notice: title => console.debug(title),
            ok: title => console.debug(title),
            error: (title, message) => console.error(message, title),
            warning: (title, message) => console.warn(message, title),
            info: title => console.info(title)
        }
    };
}, 2000);

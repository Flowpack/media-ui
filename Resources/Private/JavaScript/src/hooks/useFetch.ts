import { useState } from 'react';
import { useMediaUi } from '../core';

export default function useFetch(url: string, initOptions: RequestInit = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const { fetchWithErrorHandling } = useMediaUi();

    const fetchData = (body: BodyInit | null = null) => {
        setLoading(true);
        return fetchWithErrorHandling
            .withCsrfToken(csrfToken => ({
                method: 'POST',
                credentials: 'include',
                ...initOptions,
                url,
                headers: {
                    'X-Flow-Csrftoken': csrfToken
                },
                body
            }))
            .then(data => {
                setData(data);
                return data;
            })
            .finally(() => setLoading(false));
    };

    return { fetchData, data, loading };
}

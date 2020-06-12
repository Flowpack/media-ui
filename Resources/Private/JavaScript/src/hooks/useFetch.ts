import { useState } from 'react';

export default function useFetch(url: string, initOptions: RequestInit = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const options: RequestInit = {
        method: 'POST',
        credentials: 'include',
        ...initOptions
    };

    const fetchData = (body: BodyInit | null = null) => {
        setLoading(true);
        return fetch(url, { ...options, body })
            .then(response => response.json())
            .then(json => {
                setData(json);
                return json;
            })
            .finally(() => setLoading(false));
    };

    return { fetchData, data, loading };
}

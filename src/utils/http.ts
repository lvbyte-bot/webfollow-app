// src/api/request.js

const api_key = '8665df00224988011c557f3229c1fe69'

const url = '/fever/'

export async function request(params0: object, options = {
    method: "POST",
}): Promise<any> {
    // ... existing code ...
    const params = Object.assign({
        api_key,
    }, params0)
    const paramsStr = params2str(params);
    const fullUrl = `${url}?${paramsStr}`;
    const response = await fetch(fullUrl, options)
    if (!response.ok) {
        throw new Error('Network response was not ok');
    } else {
        return response.json()
    }
}

function params2str(params: object): string {
    return Object.entries(params)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}
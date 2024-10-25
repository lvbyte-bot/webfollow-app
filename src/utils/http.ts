// src/api/request.js

const key: string = '352E55075E6B8487D6BC55B6463B9141'

const url: string = localStorage.getItem('url') || 'https://api.webfollow.cc/plugins/fever/'

export async function request(params0: any, options: any = {
    method: "POST",
}): Promise<any> {
    const api_key = JSON.parse(localStorage.getItem('auth') || '{}')?.token || key
    // ... existing code ...
    const params = Object.assign({
        api_key,
    }, params0)
    // options.body = param2From(params)
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

// function param2From(params: object): FormData {
//     const formData = new FormData();
//     Object.entries(params)
//         .filter(([_, value]) => value)
//         .forEach(([key, value]) => formData.append(key, value));
//     return formData
// }
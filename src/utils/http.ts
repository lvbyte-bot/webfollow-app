// src/api/request.js

const key: string = '352E55075E6B8487D6BC55B6463B9141'

// const url: string = localStorage.getItem('url') || 'https://api.webfollow.cc/plugins/fever/'

export async function request(params: any, options: any = {
    method: "POST",
}): Promise<any> {
    const api_key = JSON.parse(localStorage.getItem('auth') || '{}')?.token || key
    const url = localStorage.getItem('url') || 'https://api.ifeed.cc/plugins/fever/'
    let fullUrl = url;
    const reqParams = Object.assign({
        api_key,
    }, params)
    if (url.indexOf('fever.php') > 0) {
        options = Object.assign({}, options, { body: param2From(reqParams) })
    } else {
        const paramsStr = params2str(reqParams);
        fullUrl = `${url}?${paramsStr}`;
    }
    try {
        const response = await fetch(fullUrl, options)
        if (!response.ok) {
            ifeedApp.tip('Network response was not ok')
            throw new Error('Network response was not ok');
        } else {
            return response.json()
        }
    } catch (e: any) {
        ifeedApp.tip(e)
        throw e;
    }

}

function params2str(params: object): string {
    return Object.entries(params)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
}

function param2From(params: object): FormData {
    const formData = new FormData();
    Object.entries(params)
        .filter(([_, value]) => value)
        .forEach(([key, value]) => formData.append(key, value));
    return formData
}
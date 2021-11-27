const hostname = 'http://localhost:5000';

export async function request(url, options) {
    const response = await fetch(hostname + url, options);
    const data = await response.json();
    return data;
}
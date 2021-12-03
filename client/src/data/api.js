const hostname = "http://localhost:5000";

export async function request(url, options) {
    try {
        const response = await fetch(hostname + url, options);
        if (response.ok === true) {
            return response.json();
        }

        const err = await response.json();
        throw err;
    }
    catch(err) {
        alert(err.message);
        throw err;
    }
}

export async function get(url) {
    return request(url);
}

export async function post(url, data) {
    return request(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}
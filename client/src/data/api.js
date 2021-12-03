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

function createOptions(method = "get", data) {
    const options = {
        method,
        headers: {}
    };

    if (data != undefined) {
        options.headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(data);
    }

    // TODO add JWT header

    return options;
}

export async function get(url) {
    return request(url, createOptions());
}

export async function post(url, data) {
    return request(url, createOptions("post", data));
}

export async function put(url, data) {
    return request(url, createOptions("put", data));
}

export async function del(url) {
    return request(url, createOptions("delete"));
}
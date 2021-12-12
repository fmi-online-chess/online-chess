export function createSubmitHandler(callback) {
    return (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const data = [...formData.entries()].reduce((a, [k, v]) => Object.assign(a, { [k]: v.trim() }), {});
        callback(data);
    };
}
export function createObservableState(target, onChangeListener) {
    const result = {};

    for (let prop in target) {
        if (typeof target[prop] == "object") {
            result[prop] = createObservableState(target[prop], onChangeListener);
        } else {
            result[prop] = target[prop];
        }
    }

    // eslint-disable-next-line no-undef
    return new Proxy(result, {
        get: getProp,
        set: setProp
    });

    function getProp(target, prop) {
        return target[prop];
    }

    function setProp(target, prop, value) {
        const old = target[prop];
        if (typeof value == "object") {
            target[prop] = createObservableState(value, onChangeListener);
        } else {
            target[prop] = value;
            onChangeListener(prop, old, value);
        }
        return true;
    }
}
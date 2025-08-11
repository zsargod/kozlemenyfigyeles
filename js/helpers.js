var $h = {};

$h.toQueryString = (obj, prefix) => {
    return Object.keys(obj)
        .map(key => {
            const value = obj[key];
            const prefixedKey = prefix || key;

            if (value !== null && typeof value === "object") {
                // Recursively handle nested objects/arrays
                return $h.toQueryString(value, prefixedKey);
            }

            return encodeURIComponent(prefixedKey) + "=" + encodeURIComponent(value);
        })
        .join("&");
};

$h.fetch = (url, options = {}) => {
    options.credentials = 'same-origin';
    return fetch(url, options);
};

$h.api = (url, options = {}, query={}) => {
    let clone = obj => JSON.parse(JSON.stringify(obj));
    let methods = {
        form: (data, id) => {
            if (data) {
                let formData;

                if (data instanceof FormData) {
                    formData = {
                        method: data.get('id') ? 'PUT' : 'POST',
                        body: data
                    };
                } else {
                    formData = {
                        method: data.id ? 'PUT' : 'POST',
                        body: JSON.stringify(data),
                        headers: {
                            'content-type': 'application/json; charset=utf-8'
                        }
                    };
                }

                if (id) {
                    formData.method = 'PATCH';
                }

                return methods.options(formData).path(id);
            }

            return this;
        },
        del: id => {
            return methods.options({method:'DELETE'}).path(id);
        },
        query: data => {
            return $h.api(url, clone(options), Object.assign(clone(query), data || {}));
        },
        options: data => {
            return $h.api(url, Object.assign(clone(options), data || {}), clone(query));
        },
        headers: data => {
            let opt = clone(options);

            opt.headers = opt.headers || {};
            Object.assign(opt.headers, data);

            return $h.api(url, opt);
        },
        path() {
            return $h.api(url + ['', ...arguments].join('/'), options);
        },
        then: cb => $h.fetch(url + '?' + $h.toQueryString(query), options).then(cb)
    };

    return methods;
};

$h.refs = ($el, name) => [].concat(name).map(n => [...$el.querySelectorAll('[data-ref=' + n + ']')]).flat();

$h.emit = (name, data, el, options = {}) => {
    if (!el) {
        el = document.querySelectorAll('[global-' + name + ']');
    }

    if (Array.isArray(name)) {
        name.forEach(d => $h.emit(d, data, el));
        return $h.emit;
    }

    if (Array.isArray(el) || el instanceof NodeList) {
        [...el].filter(d => typeof d === 'object').forEach(d => $h.emit(name, data, d));
        return $h.emit;
    }

    let ev = new Event(name, Object.assign({bubbles: true, cancelable: true}, options));

    ev.data = data;
    el.dispatchEvent(ev);

    return $h.emit;
};
var $h = {};

$h.refs = ($el, name) => [].concat(name).map(n=>[...$el.querySelectorAll('[data-ref='+n+']')]).flat();

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
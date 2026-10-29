// ProCVX - Safe browser storage helpers
(function (global) {
    function read(key) {
        try { return global.localStorage.getItem(key); } catch (error) { return null; }
    }

    function write(key, value) {
        try { global.localStorage.setItem(key, value); } catch (error) { /* Storage unavailable */ }
    }

    function remove(key) {
        try { global.localStorage.removeItem(key); } catch (error) { /* Storage unavailable */ }
    }

    function parseJson(value, fallback = null) {
        try { return JSON.parse(value); } catch (error) { return fallback; }
    }

    global.ProCVXStorage = Object.freeze({ read, write, remove, parseJson });
})(window);

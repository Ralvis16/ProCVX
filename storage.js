// ProCVX - Safe browser storage helpers
(function (global) {
    function read(key) {
        try { return global.localStorage.getItem(key); } catch (error) { return null; }
    }

    // Returns false when the value could not be stored (quota exceeded, private mode...)
    function write(key, value) {
        try { global.localStorage.setItem(key, value); return true; } catch (error) { return false; }
    }

    function remove(key) {
        try { global.localStorage.removeItem(key); } catch (error) { /* Storage unavailable */ }
    }

    function parseJson(value, fallback = null) {
        try { return JSON.parse(value); } catch (error) { return fallback; }
    }

    global.ProCVXStorage = Object.freeze({ read, write, remove, parseJson });
})(window);

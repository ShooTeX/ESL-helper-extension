var keyPrefix = ""; // I also use a '.' for seperation

GM_getValue = function(key, defValue) {
    var retval = window.localStorage.getItem(keyPrefix + key);
    if (!$(retval)) {
        return "";
    }
    return retval;
}

GM_setValue = function(key, value) {
    try {
        window.localStorage.setItem(keyPrefix + key, value);
    } catch (e) {
        GM_log("error setting value: " + e);
    }
}

GM_deleteValue = function(key) {
    try {
        window.localStorage.removeItem(keyPrefix + key);
    } catch (e) {
        GM_log("error removing value: " + e);
    }
}

GM_listValues = function() {
    var list = [];
    var reKey = new RegExp("^" + keyPrefix);
    for (var i = 0, il = window.localStorage.length; i < il; i++) {
        // only use the script's own keys
        var key = window.localStorage.key(i);
        if (key.match(reKey)) {
            list.push(key.replace(keyPrefix, ''));
        }
    }
    return list;
}

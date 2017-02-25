/* global angular, app */

app.service('Appearance', ['colTypes', function (colTypes) {

    this.tableColumnClass = function (colType) {
        var columnClass = '';
        switch (colType) {
            case colTypes.ID:
                columnClass = 'tag tag-link';
                break;
            case colTypes.TEXT:
            case colTypes.CUSTOMER:
            case colTypes.FAMILY:
                columnClass = 'text-uppercase';
                break;
            case colTypes.TITLE:
                columnClass = 'col-text text-uppercase';
                break;
            case colTypes.DATE:
                columnClass = 'tag tag-date';
                break;
            case colTypes.RESOURCE:
            case colTypes.STATUS:
            case colTypes.STATUSSM:
                columnClass = 'tag tag-pill';
                break;
            case colTypes.DISABLED:
                columnClass = 'tag tag-pill disabled';
                break;
            case colTypes.IDS:
            case colTypes.NUMBER:
            case colTypes.DOUBLE:
            case colTypes.WEEKS:
            case colTypes.HOURS:
            case colTypes.COSTS:
            case colTypes.ICON:
            case colTypes.BUTTONS:
                break;
        }
        return columnClass;
    };

    this.tableHeaderClass = function (colType) {
        var columnClass = '';
        switch (colType) {
            case colTypes.ID:
                columnClass = 'th-id';
                break;
            case colTypes.IDS:
                columnClass = 'th-ids';
                break;
            case colTypes.TEXT:
                columnClass = 'th-text';
                break;
            case colTypes.TITLE:
                columnClass = 'th-title';
                break;
            case colTypes.DATE:
                columnClass = 'th-date';
                break;
            case colTypes.CUSTOMER:
                columnClass = 'th-customer';
                break;
            case colTypes.RESOURCE:
            case colTypes.DISABLED:
                columnClass = 'th-resource';
                break;
            case colTypes.STATUS:
                columnClass = 'th-status';
                break;
            case colTypes.STATUSSM:
                columnClass = 'th-status-sm';
                break;
            case colTypes.FAMILY:
                columnClass = 'th-family';
                break;
            case colTypes.NUMBER:
            case colTypes.DOUBLE:
            case colTypes.WEEKS:
                columnClass = 'th-number';
                break;
            case colTypes.HOURS:
                columnClass = 'th-hours';
                break;
            case colTypes.COSTS:
                columnClass = 'th-costs';
                break;
            case colTypes.ICON:
                columnClass = 'th-icon';
                break;
            case colTypes.BUTTONS:
                columnClass = 'th-buttons';
                break;
        }
        return columnClass;
    }
    
}]);

app.factory('Cookie', ['$q', '$window', function ($q, $window) {
    function Cookie() {
    }
    Cookie.TIMEOUT = 5 * 60 * 1000; // five minutes
    Cookie._set = function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        } else {
            var expires = "";
        }
        $window.document.cookie = name + "=" + value + expires + "; path=/";
    }
    Cookie.set = function (name, value, days) {
        try {
            var cache = [];
            var json = JSON.stringify(value, function (key, value) {
                if (key === 'pool') {
                    return;
                }
                if (typeof value === 'object' && value !== null) {
                    if (cache.indexOf(value) !== -1) {
                        // Circular reference found, discard key
                        return;
                    }
                    cache.push(value);
                }
                return value;
            });
            cache = null;
            Cookie._set(name, json, days);
        } catch (e) {
            console.log('Cookie.set.error serializing', name, value, e);
        }
    };
    Cookie.get = function (name) {
        var cookieName = name + "=";
        var ca = $window.document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(cookieName) == 0) {
                var value = c.substring(cookieName.length, c.length);
                var model = null;
                try {
                    model = JSON.parse(value);
                } catch (e) {
                    console.log('Cookie.get.error parsing', key, e);
                };
                return model;
            }
        }
        return null;
    };
    Cookie.delete = function (name) {
        Cookie._set(name, "", -1);
    };
    Cookie.on = function (name) {
        var deferred = $q.defer();
        var i, interval = 1000, elapsed = 0, timeout = Cookie.TIMEOUT;
        function checkCookie() {
            if (elapsed > timeout) {
                deferred.reject('timeout');
            } else {
                var c = Cookie.get(name);
                if (c) {
                    deferred.resolve(c);
                } else {
                    elapsed += interval;
                    i = setTimeout(checkCookie, interval);
                }
            }
        }
        checkCookie();
        return deferred.promise;
    };
    return Cookie;
}]);

app.factory('LocalStorage', ['$q', '$window', 'Cookie', function ($q, $window, Cookie) {
    function LocalStorage() {
    }
    function isLocalStorageSupported() {
        var supported = false;
        try {
            supported = 'localStorage' in $window && $window['localStorage'] !== null;
            if (supported) {
                $window.localStorage.setItem('test', '1');
                $window.localStorage.removeItem('test');
            } else {
                supported = false;
            }
        } catch (e) {
            supported = false;
        }
        return supported;
    }
    LocalStorage.isSupported = isLocalStorageSupported();
    if (LocalStorage.isSupported) {
        LocalStorage.set = function (name, value) {
            try {
                var cache = [];
                var json = JSON.stringify(value, function (key, value) {
                    if (key === 'pool') {
                        return;
                    }
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        cache.push(value);
                    }
                    return value;
                });
                cache = null;
                $window.localStorage.setItem(name, json);
            } catch (e) {
                console.log('LocalStorage.set.error serializing', name, value, e);
            }
        };
        LocalStorage.get = function (name) {
            var value = null;
            if ($window.localStorage[name] !== undefined) {
                try {
                    value = JSON.parse($window.localStorage[name]);
                } catch (e) {
                    console.log('LocalStorage.get.error parsing', name, e);
                }
            }
            return value;
        };
        LocalStorage.delete = function (name) {
            $window.localStorage.removeItem(name);
        };
        LocalStorage.on = function (name) {
            var deferred = $q.defer();
            var i, timeout = Cookie.TIMEOUT;
            function storageEvent(e) {
                // console.log('LocalStorage.on', name, e);
                clearTimeout(i);
                if (e.originalEvent.key == name) {
                    try {
                        var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                        deferred.resolve(value);
                    } catch (e) {
                        console.log('LocalStorage.on.error parsing', name, e);
                        deferred.reject('error parsing ' + name);
                    }
                }
            }
            angular.element($window).on('storage', storageEvent);
            i = setTimeout(function () {
                deferred.reject('timeout');
            }, timeout);
            return deferred.promise;
        };
    } else {
        console.log('LocalStorage.unsupported switching to cookies');
        LocalStorage.set = Cookie.set;
        LocalStorage.get = Cookie.get;
        LocalStorage.delete = Cookie.delete;
        LocalStorage.on = Cookie.on;
    }
    return LocalStorage;
}]);

app.factory('SessionStorage', ['$q', '$window', 'Cookie', function ($q, $window, Cookie) {
    function SessionStorage() {
    }
    function isSessionStorageSupported() {
        var supported = false;
        try {
            supported = 'sessionStorage' in $window && $window.sessionStorage !== undefined;
            if (supported) {
                $window.sessionStorage.setItem('test', '1');
                $window.sessionStorage.removeItem('test');
            } else {
                supported = false;
            }
        } catch (e) {
            supported = false;
        }
        return supported;
    }
    SessionStorage.isSupported = isSessionStorageSupported();
    if (SessionStorage.isSupported) {
        SessionStorage.set = function (name, value) {
            try {
                var cache = [];
                var json = JSON.stringify(value, function (key, value) {
                    if (key === 'pool') {
                        return;
                    }
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        cache.push(value);
                    }
                    return value;
                });
                cache = null;
                $window.sessionStorage.setItem(name, json);
            } catch (e) {
                console.log('SessionStorage.set.error serializing', name, value, e);
            }
        };
        SessionStorage.get = function (name) {
            var value = null;
            if ($window.sessionStorage[name] !== undefined) {
                try {
                    value = JSON.parse($window.sessionStorage[name]);
                } catch (e) {
                    console.log('SessionStorage.get.error parsing', name, e);
                }
            }
            return value;
        };
        SessionStorage.delete = function (name) {
            $window.sessionStorage.removeItem(name);
        };
        SessionStorage.on = function (name) {
            var deferred = $q.defer();
            var i, timeout = Cookie.TIMEOUT;
            function storageEvent(e) {
                // console.log('SessionStorage.on', name, e);
                clearTimeout(i);
                if (e.originalEvent.key === name) {
                    try {
                        var value = JSON.parse(e.originalEvent.newValue); // , e.originalEvent.oldValue
                        deferred.resolve(value);
                    } catch (e) {
                        console.log('SessionStorage.on.error parsing', name, e);
                        deferred.reject('error parsing ' + name);
                    }
                }
            }
            angular.element($window).on('storage', storageEvent);
            i = setTimeout(function () {
                deferred.reject('timeout');
            }, timeout);
            return deferred.promise;
        };
    } else {
        console.log('SessionStorage.unsupported switching to cookies');
        SessionStorage.set = Cookie.set;
        SessionStorage.get = Cookie.get;
        SessionStorage.delete = Cookie.delete;
        SessionStorage.on = Cookie.on;
    }
    return SessionStorage;
}]);

app.factory('Animate', [function () {
    function Animate(callback, useTimeout) {
        this.callback = callback;
        this.isPlaying = false;
        this.key = null;
        this.ticks = 0;
        this.useTimeout = useTimeout === true ? true : false;
    }
    Animate.prototype = {
        play: function () {
            var _this = this;
            function loop(time) {
                _this.ticks++;
                _this.callback(time, _this.ticks);
                if (this.useTimeout) {
                    _this.key = window.setTimeout(loop, 1000 / 60);
                } else {
                    _this.key = window.requestAnimationFrame(loop);
                }
            }
            if (!this.key) {
                this.isPlaying = true;
                loop();
            }
        },
        pause: function () {
            if (this.key) {
                if (this.useTimeout) {
                    window.clearTimeout(this.key);
                } else {
                    window.cancelAnimationFrame(this.key);
                }
                this.key = null;
                this.isPlaying = false;
            }
        },
        playpause: function () {
            if (this.key) {
                this.pause();
            } else {
                this.play();
            }
        }
    }
    return Animate;
}]);

app.factory('Md5', [function () {

    var hex_chr = '0123456789abcdef'.split('');

    function cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);

    }

    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s) {
        var txt = '';
        var n = s.length,
        state = [1732584193, -271733879, -1732584194, 271733878], i;
        for (i = 64; i <= s.length; i += 64) {
            cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            cycle(state, tail);
            for (i = 0; i < 16; i++) tail[i] = 0;
        }
        tail[14] = n * 8;
        cycle(state, tail);
        return state;
    }

    /* there needs to be support for Unicode here,
        * unless we pretend that we can redefine the MD-5
        * algorithm for multi-byte characters (perhaps
        * by adding every four 16-bit characters and
        * shortening the sum to 32 bits). Otherwise
        * I suggest performing MD-5 as if every character
        * was two bytes--e.g., 0040 0025 = @%--but then
        * how will an ordinary MD-5 sum be matched?
        * There is no way to standardize text to something
        * like UTF-8 before transformation; speed cost is
        * utterly prohibitive. The JavaScript standard
        * itself needs to look at this: it should start
        * providing access to strings as preformed UTF-8
        * 8-bit unsigned value arrays.
        */
    function md5blk(s) { /* I figured global was faster.   */
        var md5blks = [], i; /* Andy King said do it this way. */
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i)
            + (s.charCodeAt(i + 1) << 8)
            + (s.charCodeAt(i + 2) << 16)
            + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    function rhex(n) {
        var s = '', j = 0;
        for (; j < 4; j++)
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
            + hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
    }

    function hex(x) {
        for (var i = 0; i < x.length; i++)
            x[i] = rhex(x[i]);
        return x.join('');
    }

    /* this function is much faster,
    so if possible we use it. Some IEs
    are the only ones I know of that
    need the idiotic second function,
    generated by an if clause.  */
    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }

    function Md5() { }
    Md5.encode = function (string) {
        return hex(md51(string));
    }
    if (Md5.encode('hello') !== '5d41402abc4b2a76b9719d911017c592') {
        add32 = function (x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF),
            msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
    }
    return Md5;
}]);

app.factory('Utils', ['$compile', '$controller', 'Vector', 'Md5', function ($compile, $controller, Vector, Md5) {
    (function () {
        // POLYFILL window.requestAnimationFrame
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
                                       || window[vendors[x] + 'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame) {
            window.requestAnimationFrame = function (callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function () { callback(currTime + timeToCall); }, timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        }
        if (!window.cancelAnimationFrame) {
            window.cancelAnimationFrame = function (id) {
                clearTimeout(id);
            };
        }
    }());
    (function () {
        // POLYFILL Array.prototype.reduce
        // Production steps of ECMA-262, Edition 5, 15.4.4.21
        // Reference: http://es5.github.io/#x15.4.4.21
        // https://tc39.github.io/ecma262/#sec-array.prototype.reduce
        if (!Array.prototype.reduce) {
            Object.defineProperty(Array.prototype, 'reduce', {
                value: function (callback) {// , initialvalue
                    if (this === null) {
                        throw new TypeError('Array.prototype.reduce called on null or undefined');
                    }
                    if (typeof callback !== 'function') {
                        throw new TypeError(callback + ' is not a function');
                    }
                    var o = Object(this);
                    var len = o.length >>> 0;
                    var k = 0;
                    var value;
                    if (arguments.length == 2) {
                        value = arguments[1];
                    } else {
                        while (k < len && !(k in o)) {
                            k++;
                        }
                        if (k >= len) {
                            throw new TypeError('Reduce of empty array with no initial value');
                        }
                        value = o[k++];
                    }
                    while (k < len) {
                        if (k in o) {
                            value = callback(value, o[k], k, o);
                        }
                        k++;
                    }
                    return value;
                }
            });
        }
    }());
    var _isTouch;
    function isTouch() {
        if (!_isTouch) {
            _isTouch = {
                value: ('ontouchstart' in window || 'onmsgesturechange' in window)
            }
        }
        // console.log(_isTouch);
        return _isTouch.value;
    }
    function getTouch(e, previous) {
        var t = new Vector();
        if (e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel') {
            var touch = null;
            var event = e.originalEvent ? e.originalEvent : e;
            var touches = event.touches.length ? event.touches : event.changedTouches;
            if (touches && touches.length) {
                touch = touches[0];
            }
            if (touch) {
                t.x = touch.pageX;
                t.y = touch.pageY;
            }
        } else if (e.type == 'click' || e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover' || e.type == 'mouseout' || e.type == 'mouseenter' || e.type == 'mouseleave') {
            t.x = e.pageX;
            t.y = e.pageY;
        }
        if (previous) {
            t.s = Vector.difference(previous, t);
        }
        t.type = e.type;
        return t;
    }
    function getRelativeTouch(element, point) {
        var rect = element[0].getBoundingClientRect();
        var e = new Vector(rect.left, rect.top);
        return Vector.difference(e, point);
    }
    function getClosest(el, selector) {
        var matchesFn, parent;
        ['matches', 'webkitMatchesSelector', 'mozMatchesSelector', 'msMatchesSelector', 'oMatchesSelector'].some(function (fn) {
            if (typeof document.body[fn] == 'function') {
                matchesFn = fn;
                return true;
            }
            return false;
        });
        if (el[matchesFn](selector)) {
            return el;
        }
        while (el !== null) {
            parent = el.parentElement;
            if (parent !== null && parent[matchesFn](selector)) {
                return parent;
            }
            el = parent;
        }
        return null;
    }
    function getClosestElement(el, target) {
        var matchesFn, parent;
        if (el === target) {
            return el;
        }
        while (el !== null) {
            parent = el.parentElement;
            if (parent !== null && parent === target) {
                return parent;
            }
            el = parent;
        }
        return null;
    }
    var getNow = Date.now || function () {
        return new Date().getTime();
    };
    function throttle(func, wait, options) {
        // Returns a function, that, when invoked, will only be triggered at most once
        // during a given window of time. Normally, the throttled function will run
        // as much as it can, without ever going more than once per `wait` duration;
        // but if you'd like to disable the execution on the leading edge, pass
        // `{leading: false}`. To disable execution on the trailing edge, ditto.
        var context, args, result;
        var timeout = null;
        var previous = 0;
        if (!options) options = {};
        var later = function () {
            previous = options.leading === false ? 0 : getNow();
            timeout = null;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        };
        return function () {
            var now = getNow();
            if (!previous && options.leading === false) previous = now;
            var remaining = wait - (now - previous);
            context = this;
            args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    clearTimeout(timeout);
                    timeout = null;
                }
                previous = now;
                result = func.apply(context, args);
                if (!timeout) context = args = null;
            } else if (!timeout && options.trailing !== false) {
                timeout = setTimeout(later, remaining);
            }
            return result;
        };
    }
    function where(array, query) {
        var found = null;
        if (array) {
            angular.forEach(array, function (item) {
                var has = true;
                angular.forEach(query, function (value, key) {
                    has = has && item[key] === value;
                });
                if (has) {
                    found = item;
                }
            });
        }
        return found;
    }
    function compileController(scope, element, html, data) {
        // console.log('Utils.compileController', element);
        element.html(html);
        var link = $compile(element.contents());
        if (data.controller) {
            var $scope = scope.$new();
            angular.extend($scope, data);
            var controller = $controller(data.controller, { $scope: $scope });
            if (data.controllerAs) {
                scope[data.controllerAs] = controller;
            }
            element.data('$ngControllerController', controller);
            element.children().data('$ngControllerController', controller);
            scope = $scope;
        }
        link(scope);
    }
    var ua = window.navigator.userAgent.toLowerCase();
    var safari = ua.indexOf('safari') !== -1 && ua.indexOf('chrome') === -1;
    var msie = ua.indexOf('trident') !== -1 || ua.indexOf('edge') !== -1 || ua.indexOf('msie') !== -1;
    var chrome = !safari && !msie && ua.indexOf('chrome') !== -1;
    var mobile = ua.indexOf('mobile') !== -1;
    function Utils() {
    }
    function reverseSortOn(key) {
        return function (a, b) {
            if (a[key] < b[key]) {
                return 1;
            }
            if (a[key] > b[key]) {
                return -1;
            }
            // a must be equal to b
            return 0;
        }
    }
    function format(string, prepend, expression) {
        string = string || '';
        prepend = prepend || '';
        var splitted = string.split(',');
        if (splitted.length > 1) {
            var formatted = splitted.shift();
            angular.forEach(splitted, function (value, index) {
                if (expression) {
                    formatted = formatted.split('{' + index + '}').join('\' + ' + prepend + value + ' + \'');
                } else {
                    formatted = formatted.split('{' + index + '}').join(prepend + value);
                }
            });
            if (expression) {
                return '\'' + formatted + '\'';
            } else {
                return formatted;
            }
        } else {
            return prepend + string;
        }
    }
    function reducer(o, key) {
        return o[key];
    }
    function reducerSetter(o, key, value) {
        if (typeof key == 'string') {
            return reducerSetter(o, key.split('.'), value);
        } else if (key.length == 1 && value !== undefined) {
            return o[key[0]] = value;
        } else if (key.length == 0) {
            return o;
        } else {
            return reducerSetter(o[key[0]], key.slice(1), value);
        }
    }
    function reducerAdder(o, key, value) {
        if (typeof key == 'string') {
            return reducerAdder(o, key.split('.'), value);
        } else if (key.length == 1 && value !== undefined) {
            return (o[key[0]] += value);
        } else if (key.length == 0) {
            return o;
        } else {
            return reducerAdder(o[key[0]], key.slice(1), value);
        }
    }
    Utils.reverseSortOn = reverseSortOn;
    Utils.getTouch = getTouch;
    Utils.getRelativeTouch = getRelativeTouch;
    Utils.getClosest = getClosest;
    Utils.getClosestElement = getClosestElement;
    Utils.throttle = throttle;
    Utils.where = where;
    Utils.format = format;
    Utils.compileController = compileController;
    Utils.reducer = reducer;
    Utils.reducerSetter = reducerSetter;
    Utils.reducerAdder = reducerAdder;
    Utils.toMd5 = function (string) {
        return Md5.encode(string);
    };
    Utils.ua = {
        safari: safari,
        msie: msie,
        chrome: chrome,
        mobile: mobile,
    };
    angular.forEach(Utils.ua, function (value, key) {
        if (value) {
            angular.element(document.getElementsByTagName('body')).addClass(key);
        }
    });
    return Utils;
}]);

app.factory('State', ['$timeout', function ($timeout) {
    function State() {
        this.isReady = false;
        this.idle();
    }
    State.prototype = {
        idle: function () {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.button = null;
            this.errors = [];
        },
        enabled: function () {
            return !this.isBusy && !this.isErroring && !this.isSuccessing;
        },
        busy: function () {
            if (!this.isBusy) {
                this.isBusy = true;
                this.isError = false;
                this.isErroring = false;
                this.isSuccess = false;
                this.isSuccessing = false;
                this.errors = [];
                // console.log('State.busy', this);
                return true;
            } else {
                return false;
            }
        },
        success: function () {
            this.isBusy = false;
            this.isError = false;
            this.isErroring = false;
            this.isSuccess = true;
            this.isSuccessing = true;
            this.errors = [];
            $timeout(function () {
                this.isSuccessing = false;
                this.button = null;
            }.bind(this), 1000);
        },
        error: function (error) {
            this.isBusy = false;
            this.isError = true;
            this.isErroring = true;
            this.isSuccess = false;
            this.isSuccessing = false;
            this.errors.push(error);
            $timeout(function () {
                this.isErroring = false;
                this.button = null;
            }.bind(this), 1000);
        },
        ready: function () {
            this.isReady = true;
            this.success();
        },
        errorMessage: function () {
            return this.isError ? this.errors[this.errors.length - 1] : null;
        },
        submitClass: function () {
            return {
                busy: this.isBusy,
                ready: this.isReady,
                successing: this.isSuccessing,
                success: this.isSuccess,
                errorring: this.isErroring,
                error: this.isError,
            };
        },
        submitMessage: function (idleMessage, busyMessage, successMessage, errorMessage) {
            idleMessage = idleMessage || 'Submit';
            if (this.isBusy) {
                return busyMessage || idleMessage;
            } else if (this.isSuccess) {
                return successMessage || idleMessage;
            } else if (this.isError) {
                return errorMessage || idleMessage;
            } else {
                return idleMessage;
            }
        },
    };
    return State;
}]);

app.factory('DataFilter', ['$filter', function ($filter) {
    function DataFilter(data) {
        /*
        this.dateFrom = null;
        this.dateTo = null;
        this.search = null;
        this.status = null;
        this.sort = null;
        */
        data ? angular.extend(this, data) : null;
    }
    DataFilter.prototype = {
        getObjectParams: function (obj) {
            var a = [];
            if (obj) {
                for (var p in obj) {
                    a.push({ name: p, value: obj[p] });
                }
            }
            return a;
        },
        getParams: function (source) {
            var post = {}, value;
            for (var p in this) {
                switch (p) {
                    case 'dateFrom':
                    case 'dateTo':
                    case 'status':
                        value = this[p];
                        if (value !== undefined) {
                            post[p] = value;
                        }
                        break;
                    case 'search':
                    case 'sort':
                        var json = JSON.stringify(this.getObjectParams(this[p]), null, '');
                        post[p] = window.btoa(json);
                        break;
                }
            }
            if (!source.unpaged) {
                post.page = source.page;
                post.size = source.size;
            }
            // console.log('DataFilter.getParams', post);
            return post;
        },
        getMonths: function () {
            var months = [];
            if (this.dateFrom && this.dateTo) {
                var range = [this.dateFrom, this.dateTo];
                range = range.sort(function (a, b) {
                    return a.getTime() - b.getTime();
                });
                function monthDiff(a, b) {
                    var months;
                    months = (b.getFullYear() - a.getFullYear()) * 12;
                    months -= a.getMonth() + 1;
                    months += b.getMonth() + 1; // we should add + 1 to get correct month number
                    months ++;
                    // console.log(months);
                    return months <= 0 ? 0 : months;
                }
                var diff = Math.max(1, monthDiff(range[0], range[1]));
                // console.log('getMonths', range[0], range[1], diff);
                var i = 0;
                while (i < diff) {
                    var date = new Date(range[0].getFullYear(), range[0].getMonth() + i, 1);
                    months.push({
                        id: date.getTime(),
                        name: $filter('date')(date, '(yyyy MM) MMMM'),
                        nameShort: $filter('date')(date, 'MMM yy'),
                    });
                    i++;
                };
            }
            return months;
        },
    };
    return DataFilter;
}]);

app.factory('DataSource', ['$q', '$http', '$rootScope', '$location', 'LocalStorage', 'State', 'DataFilter', function ($q, $http, $rootScope, $location, storage, State, DataFilter) {
    var PAGES_FIRST = 1;
    var PAGES_SIZE = 7;
    var PAGES_MAX = Number.POSITIVE_INFINITY;
    function DataSource(data) {
        this.state = new State();
        this.page = PAGES_FIRST;
        this.size = PAGES_SIZE;
        this.pages = PAGES_MAX;
        this.count = 0;
        this.maxPages = 10;
        this.items = [];
        this.rows = [];
        this.allrows = [];
        this.steps = [];
        this.filters = new DataFilter({});
        this.uri = '/api/items/paging';
        this.unpaged = false; // if true skip pagination
        data ? angular.extend(this, data) : null;        
    }
    DataSource.prototype = {
        resolve: function (deferred) {
            angular.forEach(this.response.data, function (item) {
                this.push(item);
            }, this.rows);
            deferred.resolve();
        },
        group: function (deferred) {
            deferred.resolve();
        },
        next: function ($d) {
            if (this.steps.length) {
                var deferred = $q.defer();
                deferred.promise.then(function (response) {
                    this.next($d);
                }.bind(this), function (response) {
                    this.error(response);
                }.bind(this));
                var step = this.steps.shift();
                step.call(this, deferred);
            } else {
                $d.resolve();
            }
        },
        when: function () {
            var deferred = $q.defer();
            angular.forEach(Array.prototype.slice.call(arguments), function(step) {
                this.push(step);
            }, this.steps);
            this.next(deferred);
            return deferred.promise;
        },
        unallowed: function (error) {
            this.deferred.reject(error);
            this.deferred = null;
            this.state.error(error);
            $location.$$lastRequestedPath = $location.path(); // $route.current.$$route.originalPath;
            $location.path('/signin');
        },
        error: function (response) {
            // typeof (err) === "string" ? err = { status: status } : (err == null ? err = { status: status } : err.status = status);
            var error = response ? { message: response.data ? response.data.message : "error", status: response.status } : null;
            if (error.message === 'ERROR_NOT_ALLOWED') {
                var q = storage.get('q');
                console.log('onError', error, 'q', q);
                this.unallowed(error);
            } else {
                this.deferred.reject(error);
                this.deferred = null;
                this.state.error(error);
            }
        },
        parseHeader: function () {
            var responseHeader = this.response.headers('X-Pagination');
            var responseView = responseHeader ? JSON.parse(responseHeader) : null;
            if (responseView) {
                this.page = responseView.page;
                this.size = responseView.size;
                this.count = responseView.count;
                this.pages = responseView.pages;
            } else {
                this.page = PAGES_FIRST;
                this.size = this.size || PAGES_SIZE;
                this.count = this.response.data.length;
                this.pages = Math.ceil(this.count / this.size);
            }
            this.pagination = this.getPages();
        },
        getUri: function () {
            return angular.isFunction(this.uri) ? this.uri() : this.uri;
        },
        getParams: function () {
            return { params: this.filters.getParams(this) };
        },
        get: function () {
            $http.get(this.getUri(), this.getParams()).then(function (response) {
                this.rows.length = 0;
                this.items.length = 0;
                this.response = response;
                this.parseHeader();
                this.when(this.resolve, this.group).then(function () {
                    this.allrows = this.allrows.concat(this.rows);
                    $rootScope.$broadcast('onDataSourceUpdate', this);
                    this.state.success();
                    this.deferred.resolve(this.rows);
                    this.deferred = null;
                }.bind(this));
            }.bind(this), function (response) {
                this.error(response);
            }.bind(this));
        },
        update: function ($d) {
            this.items = [];
            if (this.state.busy()) {
                this.when(this.group).then(function () {
                    this.state.success();
                }.bind(this));
            }
        },
        paging: function ($d) {
            var deferred = this.deferred = ($d || $q.defer());
            if ((this.page <= this.pages || $d !== undefined) && this.state.busy()) {
                this.opened = null;
                this.get();
            }
            return deferred.promise;
        },
        filter: function () {
            var deferred = $q.defer();
            this.allrows = [];
            this.paging(deferred);
            return deferred.promise;
        },
        add: function (item) {
            this.rows.push(item);
            this.allrows.push(item);
            this.update();
            this.count++;
            this.pages = Math.ceil(this.count / this.size);
        },
        remove: function (item) {
            var i = this.rows.indexOf(item);
            if (i !== -1) {
                this.rows.splice(i, 1);
            }
            i = this.allrows.indexOf(item);
            if (i !== -1) {
                this.allrows.splice(i, 1);
            }
            this.update();
            this.count--;
            this.pages = Math.ceil(this.count / this.size);
        },
        prevPage: function () {
            var page = this.page - 1;
            if (page > 0 && page <= this.pages) {
                this.page = page;
                this.paging();
            }
        },
        nextPage: function () {
            var page = this.page + 1;
            if (page > 0 && page <= this.pages) {
                this.page = page;
                this.paging();
            }
        },
        gotoPage: function (page) {
            if (page > 0 && page <= this.pages) {
                this.page = page;
                this.paging();
            }
        },
        firstPage: function () {
            if (this.page !== 1) {
                this.page = 1;
                this.paging();
            }
        },
        lastPage: function () {
            if (this.page !== this.pages) {
                this.page = this.pages;
                this.paging();
            }
        },
        hasMany: function () {
            return this.pages > this.maxPages;
        },
        hasMorePagesBehind: function () {
            var startingIndex = Math.max(0, this.page - this.maxPages);
            return startingIndex > 0;
        },
        hasMorePagesNext: function () {
            var endingIndex = Math.max(0, this.page - this.maxPages) + this.maxPages;
            return endingIndex < this.pages;
        },
        isPage: function (number) {
            return this.page === number;
        },
        hasPages: function () {
            return this.pages > 0 && this.pages < PAGES_MAX;
        },
        getPages: function () {
            var a = [], i;
            if (this.hasPages()) {
                var startingIndex = Math.max(0, this.page - this.maxPages);
                var endingIndex = Math.min(this.pages, startingIndex + this.maxPages);
                i = startingIndex;
                while (i < endingIndex) {
                    a.push({ number: (i + 1) });
                    i++;
                }
            }
            return a;
        },
        openClose: function (index) {
            if (this.opened === index) {
                this.opened = null;
            } else {
                this.opened = index;
            }
        },
        setSort: function (key, sort) {
            var deferred = $q.defer();
            if (!this.state.isBusy) {
                this.filters.sort = {};
                this.filters.sort[key] = sort;
                if (angular.isFunction(this.sort)) {
                    this.sort(this);
                    deferred.resolve(this.rows);
                } else {
                    this.allrows = [];
                    this.paging(deferred);
                }
            }
            return deferred.promise;
        },
        getSort: function (key) {
            if (this.filters.sort) {
                return this.filters.sort[key] || 0;
            } else {
                return 0;
            }
        },
        hasSort: function () {
            if (this.filters.sort) {
                var has = false;
                angular.forEach(this.filters.sort, function (value) {
                    has = has || value;
                });
                return has;
            } else {
                return false;
            }
        },
        setSearch: function (key, search) {
            var deferred = $q.defer();
            if (!this.state.isBusy) {
                this.filters.search = {};
                if (search && search !== '') {
                    this.filters.search[key] = search;
                }
                if (angular.isFunction(this.search)) {
                    this.search(this);
                    deferred.resolve(this.rows);
                } else {
                    this.allrows = [];
                    this.paging(deferred);
                }
            }
            return deferred.promise;
        },
        getSearch: function (key) {
            if (this.filters.search) {
                return this.filters.search[key] || 0;
            } else {
                return 0;
            }
        },
        hasSearch: function () {
            if (this.filters.search) {
                var has = false;
                angular.forEach(this.filters.search, function (value) {
                    has = has || (value && value !== '');
                });
                return has;
            } else {
                return false;
            }
        },
        setDateFrom: function (date) {
            var deferred = $q.defer();
            if (!this.state.isBusy) {
                this.filters.dateFrom = date || '';
                if (angular.isFunction(this.dateFrom)) {
                    this.dateFrom(this);
                    deferred.resolve(this.rows);
                } else {
                    this.allrows = [];
                    this.paging(deferred);
                }
            }
            return deferred.promise;
        },
        getDateFrom: function () {
            return this.filters.dateFrom || null;
        },
        setDateTo: function (date) {
            var deferred = $q.defer();
            if (!this.state.isBusy) {
                this.filters.dateTo = date || '';
                if (angular.isFunction(this.dateTo)) {
                    this.dateTo(this);
                    deferred.resolve(this.rows);
                } else {
                    this.allrows = [];
                    this.paging(deferred);
                }
            }
            return deferred.promise;
        },
        getDateTo: function () {
            return this.filters.dateTo || null;
        },
        setDates: function (from, to) {
            var deferred = $q.defer();
            if (!this.state.isBusy) {
                this.filters.dateFrom = from || '';
                this.filters.dateTo = to || '';
                this.allrows = [];
                this.paging(deferred);
            }
            return deferred.promise;
        },
    };
    return DataSource;
}]);

app.factory('Column', ['$parse', '$filter', 'Utils', 'colTypes', function ($parse, $filter, Utils, colTypes) {        
    function Column(data) {
        data ? angular.extend(this, data) : null;
        // PREPARE GETTER SETTERS
        if (angular.isFunction(this.value)) {
            this.value = this.value.bind(this);
        }
        this.raw = this.raw || this.value;
        this.source = this.source || this.value;
        this.getters = {};
        var fields = ['key', 'value', 'raw', 'source', 'post'];
        angular.forEach(fields, function (field) {
            if (this[field]) {
                this.getters[field] = angular.isFunction(this[field]) ? this[field] : $parse(this[field]);
            }
        }, this);
        this.setters = {};
        angular.forEach(this.getters, function (getter, key) {
            if (!angular.isFunction(this[key])) {
                this.setters[key] = getter.assign;
            }
        }, this);
        // PREPARE GETTER SETTERS
        this.reset();
    }
    Column.prototype = {
        getKey: function (item) {
            return this.getters.key(item);
        },
        getValue: function (item) {
            return this.getters.value(item);
        },
        getRaw: function (item) {
            return this.getters.raw(item);
        },
        getSource: function (item) {
            return this.getters.source(item);
        },
        reset: function () {
            this.values = [];
            this.keys = {};
            this.search = [];
            this.total = 0;
        },
        hasKey: function (item) {
            var has = true;
            var key = this.getKey(item);
            if (key && this.keys[key] != true) {
                this.keys[key] = true;
                has = false;
            }
            return has;
        },
        initValue: function (item) {
            this.setters.raw(item, (this.getters.value(item) || 0));
            return this;
        },
        addTotal: function (item, row) {
            this.setters.raw(item, (this.getters.raw(item) || 0) + (this.getters.value(row) || 0));
            return this;
        },
        addCount: function (item, row) {
            if (!this.hasKey(row) && this.setters.raw) {
                var v = null;
                if (item != row) {
                    v = (this.getters.raw(item) || 0) + 1;
                } else {
                    v = 1;                    
                }
                this.setters.raw(item, v);
            }
            return this;
        },
        addValue: function (item) {
            this.values = this.values || [];
            var key = this.getKey(item);
            var has = false;
            angular.forEach(this.values, function (v) {
                if (v.id == key) {
                    has = true;
                }
            })
            if (!has) {
                var value = this.getRaw(item);
                this.values.push({
                    id: key,
                    name: value || '-',
                });
            }
        },
        getValueTotal: function (filtered) {
            var value = 0;
            if (this.compare && this.type === colTypes.INCREMENT) {
                var current = 0; // (col.getters.raw(item) || 0);
                var previous = 0; // (this.getters.raw(item) || 0);                
                angular.forEach(filtered, function (item) {
                    current += (this.col.getters.raw(item) || 0);
                    previous += (this.getters.raw(item) || 0);
                }.bind(this));
                if (previous) {
                    value = (current - previous) / previous * 100;
                }
            } else {
                angular.forEach(filtered, function (item) {
                    value += this.getRaw(item) || 0;
                }.bind(this));
            }
            this.total = value;
            return value;
        },
        getValueFormatted: function (item) {
            var value = this.getRaw(item);
            switch (this.type) {
                case colTypes.RESOURCE:
                case colTypes.DISABLED:
                    value = $filter('shortName')(value);
                    break;
                case colTypes.ID:
                case colTypes.NUMBER:
                    value = $filter('customNumber')(value, 0);
                    break;
                case colTypes.DOUBLE:
                    value = $filter('customNumber')(value, 2);
                    break;
                case colTypes.WEEKS:
                    value = $filter('customNumber')(value, 2, ' W');
                    break;
                case colTypes.DATE:
                    value = $filter('date')(value, 'yyyy-MM-dd');
                    break;
                case colTypes.HOURS:
                    value = $filter('customNumber')(value, 0, ' H');
                    break;
                case colTypes.COSTS:
                    value = $filter('customNumber')(value, 0, ' €');
                    break;
                case colTypes.PERCENT:
                    value = $filter('customNumber')(value, 2, ' %');
                    break;
                case colTypes.INCREMENT:
                    value = angular.isNumber(value) ? (value > 0 ? '+' : '') + $filter('customNumber')(value, 2, ' %') : (value || '-');
                    break;
            }
            return value;
        },
        getFormatted: function (item) {
            if (this.dynamic) {
                return this.getValueFormatted(item);
            } else {
                return item.static[this.id].value;
            }
        },
        getTotal: function (filtered) {
            var value = this.getValueTotal(filtered);
            switch (this.type) {
                case colTypes.NUMBER:
                    value = $filter('customNumber')(value, 0);
                    break;
                case colTypes.DOUBLE:
                    value = $filter('customNumber')(value, 2);
                    break;
                case colTypes.WEEKS:
                    value = $filter('customNumber')(value, 2, ' W');
                    break;
                case colTypes.HOURS:
                    value = $filter('customNumber')(value, 0, ' H');
                    break;
                case colTypes.COSTS:
                    value = $filter('customNumber')(value, 0, ' €');
                    break;
                case colTypes.PERCENT:
                    value = $filter('customNumber')(value, 2, ' %');
                    break;
                case colTypes.INCREMENT:
                    value = angular.isNumber(value) ? (value > 0 ? '+' : '') + $filter('customNumber')(value, 2, ' %') : (value || '-');
                    break;
            }
            return value;
        },
        getFormat: function () {
            var format = '';
            switch (this.type) {
                case colTypes.ID:
                case colTypes.NUMBER:
                    format = '#';
                    break;
                case colTypes.DOUBLE:
                    format = '#';
                    break;
                case colTypes.DATE:
                    format = 'yyyy-mm-dd';
                    break;
                case colTypes.WEEKS:
                    format = '#,###0 [$W]';
                    break;
                case colTypes.HOURS:
                    format = '#,###0 [$H]';
                    break;
                case colTypes.COSTS:
                    format = '#,###.00 €';
                    break;
                case colTypes.PERCENT:                
                    format = '0.00%';
                    break;
                case colTypes.INCREMENT:
                    format = '[Color 10]+0.00%;[Red]-0.00%;-';
                    break;
            }
            return format;
        },
        getLink: function (item) {
            return angular.isFunction(this.link) ? this.link(item) : null;
        },
        getHeaderClass: function () {
            var cc = [];
            angular.forEach(this, function (value, key) {
                if (value === true) {
                    cc.push(key);
                }
            });
            switch (this.type) {
                case colTypes.NUMBER:
                case colTypes.DOUBLE:
                case colTypes.WEEKS:
                case colTypes.HOURS:
                case colTypes.COSTS:
                case colTypes.PERCENT:
                case colTypes.INCREMENT:
                    cc.push('text-xs-right');
                    break;
            }
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            return cc.join(' ');
        },
        getCellClass: function (item) {
            var cc = [];            
            angular.forEach(this, function (value, key) {
                if (value === true) {
                    cc.push(key);
                }
            });
            switch (this.type) {
                case colTypes.LINK:
                    cc.push('text-underline');
                    break;
                case colTypes.NUMBER:
                case colTypes.DOUBLE:
                case colTypes.WEEKS:
                case colTypes.HOURS:
                case colTypes.COSTS:
                    cc.push('text-xs-right');
                    break;
                case colTypes.PERCENT:
                    cc.push('text-xs-right');
                    break;
                case colTypes.INCREMENT:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        getColumnClass: function () {
            return this.color ? 'shade-light-blue-' + this.color : '';
        },
        getItemClass: function (item) {
            var cc = [];
            cc.push(item.static[this.id].baseClass);
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            return cc.join(' ');
        },
        getTextClass: function (item) {
            var cc = [];
            switch (this.type) {
                case colTypes.INCREMENT:
                    var value = this.getRaw(item);
                    if (angular.isNumber(value) && value < 0) {
                        cc.push('text-danger');
                    } else {
                        cc.push('text-success');
                    }
                    break;
            }
            return cc.join(' ');
        },
        getTotalClass: function (filtered) {
            var cc = [];
            switch (this.type) {
                case colTypes.NUMBER:
                case colTypes.DOUBLE:
                case colTypes.WEEKS:
                case colTypes.HOURS:
                case colTypes.COSTS:
                case colTypes.PERCENT:
                case colTypes.INCREMENT:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        searchToggle: function (item) {
            var index = this.search.indexOf(item.id);
            if (index === -1) {
                item.active = true;
                this.search.push(item.id);
            } else {
                item.active = false;
                this.search.splice(index, 1);
            }
        },
        isActive: function () {
            if (angular.isFunction(this.active) && this.active) {
                return this.active();
            } else {
                return this.active;
            }
        },
        toggle: function () {
            angular.isFunction(this.active) ? null : this.active = !this.active;
        },
        activate: function () {
            angular.isFunction(this.active) ? null : this.active = true;
        },
        deactivate: function () {
            angular.isFunction(this.active) ? null : this.active = false;
        },
        makeStatic: function (item) {
            if (this.post) {
                this.setters.raw(item, (this.getters.post(item) || 0));
            }
            var col = this;
            item.static[col.id] = {
                baseClass: col.getCellClass(item),
                textClass: col.getTextClass(item),
                value: col.getValueFormatted(item),
                link: col.link ? col.link(item) : null,
                pop: col.pop ? col.pop(item) : null,
            };
        },
    };
    Column.types = colTypes;
    return Column;
}]);

app.factory('Columns', ['$parse', 'Utils', 'Column', 'colTypes', function ($parse, Utils, Column, colTypes) {
    function Columns(columns) {
        var list = [];
        if (columns) {
            angular.forEach(columns, function (col, index) {
                col.id = index + 1;
                list.push(new Column(col));
            });
        }        
        angular.extend(list, Columns.prototype);
        return list;
    }
    Columns.prototype = {
        getCount: function () {
            var i = 0;
            angular.forEach(this, function (col) {
                i += col.isActive() ? 1 : 0;
            }.bind(this));
            return i;
        },
        getFirstCol: function () {
            var first = null;
            angular.forEach(this, function (col) {
                if (first === null && col.isActive() && col.groupBy && col.value !== 'month' && col.value !== 'monthShort') {
                    first = col;
                }
            });
            return first;
        },
        getChartKey: function (item, time) {
            var keys = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy && col.value !== 'month' && col.value !== 'monthShort' && keys.length === 0) {
                    keys.push(col.getKey(item));
                }
            });
            keys.push(time);
            return keys.join('-');
        },
        getGroupKey: function (item) {
            var keys = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy) {
                    keys.push(col.getKey(item));
                }
            });
            return keys.join('-');
        },
        getSortKey: function (item) {
            var values = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy) {
                    values.push(col.sort ? $parse(col.sort)(item) : col.getValueFormatted(item));
                }
            });
            return values.join('');
        },
        expand: function (data) {
            var options = {
                dynamic: true,
                compare: true,
            }
            data ? angular.extend(options, data) : null;
            // add percentuals and compares
            var array = [], cols = this;
            array.radios = {};
            angular.forEach(this, function (col, index) {
                col.id = array.length + 1;
                array.push(col);
                if (col.aggregate) {
                    if (options.dynamic) {
                        array.push(new Column({
                            id: array.length + 1,
                            name: '%',
                            value: function (item) {
                                return col.getters.raw(item) / col.total * 100;
                            },
                            key: col.key,
                            type: colTypes.PERCENT,
                            dynamic: true,
                            active: function () {
                                return array.showDynamics && col.active;
                            },
                            col: col,
                        }));
                    }
                    if (options.compare) {
                        array.push(new Column({
                            id: array.length + 1,
                            name: 'anno precedente',
                            value: function (item) {
                                return this.getters.raw(item);
                            },
                            raw: col.value + 'Last',
                            source: col.value,
                            key: col.key,
                            type: col.type, // 
                            count: col.count,
                            compare: true,
                            dynamic: true,
                            active: function () {
                                return array.showComparison && col.active;
                            },
                            col: col,
                        }));
                        array.push(new Column({
                            id: array.length + 1,
                            name: '%',
                            value: function (item) {
                                var current = (col.getters.raw(item) || 0);
                                var previous = (this.getters.raw(item) || 0);
                                if (previous) {
                                    return (current - previous) / previous * 100;
                                } else {
                                    return null; // '+∞ %';
                                }
                            },
                            raw: col.value + 'Gain',
                            source: col.value,
                            key: col.key,
                            type: colTypes.INCREMENT, // col.type, // 
                            count: col.count,
                            compare: true,
                            dynamic: true,
                            active: function () {
                                return array.showComparison && col.active;
                            },
                            col: col,
                        }));
                    }
                }
                if (col.radio && col.active) {
                    array.radios[col.radio] = col.value;
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getGroups: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.groupBy) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getCounters: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.count) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getAggregates: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.aggregate && !col.count) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getPercentages: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.type === colTypes.PERCENT) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getDynamics: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.dynamic) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        getCompares: function () {
            var array = [];
            angular.forEach(this, function (col, index) {
                if (col.compare) {
                    array.push(col);
                }
            });
            angular.extend(array, Columns.prototype);
            return array;
        },
        reset: function () {
            this.groups = {};
            angular.forEach(this, function (col) {
                col.reset();
            });
            return this;
        },
        makeStatic: function (items) {
            //console.log('Columns.makeStatic', 'items', items.length);
            angular.forEach(this, function (col, index) {
                col.values = [];
                col.static = {
                    active: col.isActive(),
                    headerClass: col.getHeaderClass(),
                };
            });
            angular.forEach(this, function (col, index) {
                if (col.static.active || col.dynamic) {
                    angular.forEach(items, function (item) {
                        col.makeStatic(item);
                        col.groupBy ? col.addValue(item) : null;
                    });
                    if (col.groupBy) {
                        col.values = col.values.sort(function (va, vb) {
                            var a, b;
                            a = va.name ? String(va.name).toLowerCase() : ''; // ignore upper and lowercase
                            b = vb.name ? String(vb.name).toLowerCase() : ''; // ignore upper and lowercase
                            if (a < b) {
                                return -1;
                            }
                            if (a > b) {
                                return 1;
                            }
                            return 0;
                        });
                    }
                }
            });
        },
        activeInRange: function (range) {
            var flag = false;
            var i = 0;
            while (!flag && i < this.length) {
                var col = this[i];
                if (col.static.active) {
                    flag = (range.indexOf(col.value) !== -1);
                }
                i++;
            }
            return flag;
        },
        unique: function (row, items) {
            var key = this.getGroupKey(row);
            var item = this.groups[key];
            if (!item) {
                item = this.groups[key] = row; // angular.copy(row);
                item.static = [];
                items.push(item);
            }
            return item;
        },
        iterate: function (row, items) {
            row = angular.copy(row);
            var item = this.unique(row, items);
            this.addTotals(item, row);
        },        
        compare: function (row, items) {
            row = angular.copy(row);
            angular.forEach(this, function (col) {
                if (col.compare) {
                    var value = col.getters.source(row);
                    col.setters.raw(row, value);
                }
            });
            angular.forEach(this, function (col) {
                if (col.compare) {
                    col.setters.source(row, 0);
                }
            });
            var item = this.unique(row, items);
            this.addTotals(item, row, true);
        },
        addTotals: function (item, row, comparing) {
            angular.forEach(this, function (col) {
                if (col.isActive() && (comparing ? col.compare : !col.compare)) {
                    if (col.count) {
                        col.addCount(item, row);
                    } else if (comparing || col.aggregate) {
                        if (!col.hasKey(row)) {
                            if (item === row) {
                                col.initValue(item);
                            } else {
                                col.addTotal(item, row);
                            }
                        }
                    }
                }
            });
            return this;
        },
        toggleColumns: function (c) {
            if (c.radio) {
                angular.forEach(this, function (col) {
                    if (c.radio === col.radio && c !== col) {
                        col.deactivate();
                    }
                });
                c.activate();
                this.radios[c.radio] = c.value;
            } else {
                c.toggle();
            }
        },
        searchDisabled: function (item, col, filtered) {
            var id = item.id, t = this;
            var has = false, index = 0;
            while(index < filtered.length) {
                has = has || col.getKey(filtered[index]) === id;
                if (has) {
                    index = filtered.length;
                } else {
                    index ++;
                }
            }
            return !has;    
        },
        setMode: function (mode) {
            this[mode] = !this[mode];
            switch (mode) {
                case 'showDynamics':
                    this.showComparison = false;
                    break;
                case 'showComparison':
                    this.showDynamics = false;
                    break;
            }
            return this[mode];
        },
    };
    Columns.types = colTypes;
    return Columns;
}]);

app.factory('ChartData', ['$filter', function ($filter) {
    function ChartData(data) {
        var defaults = {
            type: 'chart-line',
            labels: [],
            series: [],
            data: [],
            options: {
                bezierCurve: false,
                elements: {
                    line: {
                        tension: 0,
                    }
                },
                scaleLabel: function (label) {
                    return $filter('currency')(label.value);
                },
                tooltipTemplate: function (data) {
                    return $filter('currency')(data.value);
                },
                scales: {
                    yAxes: [{
                        gridLines: {
                            display: false
                        },
                        ticks: {
                            min: 0,
                            // max: 3,
                            // stepSize: 1,
                            callback: function (value, index, values) {
                                return $filter('customNumber')(value, 2, ' W');
                            }
                        }
                    }],
                    callbacks: {
                        label: function (label) {
                            console.log('b');
                            return $filter('customNumber')(label.value, 2, ' W');
                        }
                    }
                },
                tooltips: {
                    callbacks: {
                        title: function (tooltipItems, data) {
                            return '';
                        },
                        label: function (tooltipItem, data) {
                            var label = data.datasets[tooltipItem.datasetIndex].label;
                            var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return label + ': ' + $filter('customNumber')(datasetLabel, 2, ' W');
                        },
                    }
                },
            },
            onClick: function (points, evt) {
                console.log('chart', points, evt);
            },
            datasetOverride: [],
        };
        angular.extend(this, defaults);
        data ? angular.extend(this, data) : null;
    }
    ChartData.prototype = {
        getObjectParams: function (obj) {
            var a = [];
            if (obj) {
                for (var p in obj) {
                    a.push({ name: p, value: obj[p] });
                }
            }
            return a;
        },
        getParams: function (source) {
            var post = {}, value;
            for (var p in this) {
                switch (p) {
                    case 'dateFrom':
                    case 'dateTo':
                    case 'status':
                        value = this[p];
                        if (value !== undefined) {
                            post[p] = value;
                        }
                        break;
                    case 'search':
                    case 'sort':
                        var json = JSON.stringify(this.getObjectParams(this[p]), null, '');
                        post[p] = window.btoa(json);
                        break;
                }
            }
            if (!source.unpaged) {
                post.page = source.page;
                post.size = source.size;
            }
            // console.log('ChartData.getParams', post);
            return post;
        },
        getMonths: function () {
            var months = [];
            if (this.dateFrom && this.dateTo) {
                var range = [this.dateFrom, this.dateTo];
                range = range.sort(function (a, b) {
                    return a.getTime() - b.getTime();
                });
                function monthDiff(a, b) {
                    var months;
                    months = (b.getFullYear() - a.getFullYear()) * 12;
                    months -= a.getMonth() + 1;
                    months += b.getMonth() + 1; // we should add + 1 to get correct month number
                    months++;
                    // console.log(months);
                    return months <= 0 ? 0 : months;
                }
                var diff = Math.max(1, monthDiff(range[0], range[1]));
                // console.log('getMonths', range[0], range[1], diff);
                var i = 0;
                while (i < diff) {
                    var date = new Date(range[0].getFullYear(), range[0].getMonth() + i, 1);
                    months.push({
                        id: date.getTime(),
                        name: $filter('date')(date, '(yyyy MM) MMMM'),
                        nameShort: $filter('date')(date, 'MMM yy'),
                    });
                    i++;
                };
            }
            return months;
        },
    };
    return ChartData;
}]);

app.service('Droppables', ['ElementRect', function (ElementRect) {
    this.natives = [];
    this.callbacks = [];
    this.rects = [];
    this.add = function (nativeElement, callback) {
        this.natives.push(nativeElement);
        this.callbacks.push(callback || function () { });
        this.rects.push(ElementRect.fromNative(nativeElement));
    };
    this.remove = function (nativeElement) {
        var index = this.natives.indexOf(nativeElement);
        if (index !== -1) {
            this.natives.splice(index, 1);
            this.callbacks.splice(index, 1);
            this.rects.splice(index, 1);
        }
    };
    this.getIntersections = function (item) {
        var intersections = [], element;
        angular.forEach(this.rects, function (rect, index) {
            rect.set(rect.native);
            element = angular.element(rect.native);
            element.removeClass('dropping');
            if (rect.intersect(item)) {
                rect.distance = rect.center.distance(item.center);
                rect.data = this.callbacks[index]();
                intersections.push(rect);
                element.addClass('over');
            } else {
                element.removeClass('over');
            }
        }.bind(this));
        intersections.sort(function (a, b) {
            if (a.distance < b.distance) {
                return -1;
            }
            if (a.distance > b.distance) {
                return 1;
            }
            return 0;
        });
        return intersections;
    };
}]);

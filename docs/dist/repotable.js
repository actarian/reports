
(function(window, angular) {'use strict';

/* global angular */

var module = angular.module('repotable', ['ng', 'ngSanitize', 'ngMessages']);

/* global angular, module */

window.console ? null : window.console = { log: function () { } };

/*
window.domain = '//' + location.hostname + (location.port ? ':' + location.port : ''); // location.protocol + 
module.constant('domain', domain);
*/

module.constant('colTypes', {
    ID: 1,
    IDS: 2,
    TITLE: 3,
    DATE: 4,
    CUSTOMER: 5,
    RESOURCE: 6,
    STATUS: 7,
    STATUSSM: 8,
    FAMILY: 9,
    NUMBER: 10,
    HOURS: 11,
    COSTS: 12,
    PERCENT: 13,
    GAIN: 14,
    ICON: 15,
    BUTTONS: 16,
    DISABLED: 17,
    LINK: 18,
    BOOL: 19,
    DOUBLE: 20,
    WEEKS: 21,
});

module.constant('fieldTypes', {
    ID: 1,
    IDS: 2,
    TITLE: 3,
    DATE: 4,
    CUSTOMER: 5,
    RESOURCE: 6,
    STATUS: 7,
    STATUSSM: 8,
    FAMILY: 9,
    NUMBER: 10,
    HOURS: 11,
    COSTS: 12,
    PERCENT: 13,
    GAIN: 14,
    ICON: 15,
    BUTTONS: 16,
    DISABLED: 17,
    LINK: 18,
    BOOL: 19,
    DOUBLE: 20,
    WEEKS: 21,
});

module.constant('fieldTotalTypes', {
    SUM: 1,
    MIN: 2,
    MAX: 3,
    AVG: 4,
});

/* global angular, module */

/* global angular, module */

module.directive('draggableItem', ['$parse', '$timeout', 'Utils', 'Style', 'ElementRect', 'Droppables', function ($parse, $timeout, Utils, Style, ElementRect, Droppables) {

    return {
        require: 'ngModel',
        link: function (scope, element, attributes, model) {
            var nativeElement = element[0];
            var selector = attributes.draggableItem || '.item';
            var condition = attributes.draggableIf !== undefined ? $parse(attributes.draggableIf) : function () { return true; };
            var target = nativeElement.querySelector(selector);
            var style = new Style();
            var elementRect = new ElementRect();
            var down, move, diff, dragging, rects;
            function onStart(e) {
                if (condition(scope)) {
                    down = Utils.getTouch(e);
                    addDragListeners();
                }
                return false;
            }
            function onMove(e) {
                move = Utils.getTouch(e);
                diff = down.difference(move);
                if (!dragging && diff.power() > 25) {
                    dragging = true;
                    element.addClass('dragging');
                }
                if (dragging) {
                    style.transform = 'translateX(' + diff.x + 'px) translateY(' + diff.y + 'px)';
                    style.set(target);
                    elementRect.set(nativeElement).offset(diff);
                    rects = Droppables.getIntersections(elementRect);
                    if (rects.length) {
                        angular.element(rects[0].native).addClass('dropping');
                    }
                }
                // console.log(diff);
                return false;
            }
            function onEnd(e) {
                if (dragging) {
                    dragging = false;
                    element.removeClass('dragging');
                    style.transform = 'none';
                    style.set(target);
                    var fromIndex = $parse(attributes.droppableIndex)(scope);
                    var fromModel = $parse(attributes.ngModel)(scope);
                    if (rects.length) {
                        var event = null;
                        angular.forEach(rects, function (rect, index) {
                            angular.element(rect.native).removeClass('dropping over');
                            if (rect.data.droppable(scope) && !event) {
                                event = {
                                    from: {
                                        index: fromIndex,
                                        model: fromModel,
                                        target: target,
                                    },
                                    to: {
                                        index: rect.data.index,
                                        model: rect.data.model,
                                        target: rect.native
                                    },
                                };
                                $timeout(function () {
                                    scope.$emit('onDropItem', event);
                                });
                            }
                        });
                    } else {
                        var event = {
                            from: {
                                index: fromIndex,
                                model: fromModel,
                                target: target,
                            },
                            to: null,
                        };
                        $timeout(function () {
                            scope.$emit('onDropOut', event);
                        });
                    }
                }
                removeDragListeners();
                return false;
            }
            function addDragListeners() {
                angular.element(window).on('touchmove mousemove', onMove);
                angular.element(window).on('touchend mouseup', onEnd);
            };
            function removeDragListeners() {
                angular.element(window).off('touchmove mousemove', onMove);
                angular.element(window).off('touchend mouseup', onEnd);
            };
            function addListeners() {
                element.on('touchstart mousedown', onStart);
            };
            function removeListeners() {
                element.off('touchstart mousedown', onStart);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    };
}]);

module.directive('droppableItem', ['$parse', 'Utils', 'Style', 'Droppables', function ($parse, Utils, Style, Droppables) {
    var droppables = {};
    return {
        require: 'ngModel',
        link: function (scope, element, attributes, model) {
            var nativeElement = element[0];
            var selector = attributes.droppableItem || '.item';
            function onGetData() {
                var index = $parse(attributes.droppableIndex)(scope);
                var model = $parse(attributes.ngModel)(scope);
                var droppable = attributes.droppableIf !== undefined ? $parse(attributes.droppableIf) : function () { return true };
                return {
                    index: index,
                    model: model,
                    droppable: droppable,
                };
            }
            Droppables.add(nativeElement, onGetData);
            scope.$on('$destroy', function () {
                Droppables.remove(nativeElement);
            });
        }
    }
}]);

module.directive('toggler', ['$document', '$parse', '$timeout', 'Utils', function ($document, $parse, $timeout, Utils) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            if (attributes.value === undefined) {
                throw new Error('[toggler] attribute value required');
            }
            if (attributes.target === undefined) {
                throw new Error('[toggler] attribute target required');
            }
            function isActive() {
                return $parse(attributes.toggler + '==' + attributes.value)(scope);
            }
            function activate() {
                addOutListeners();
                $timeout(function () {
                    $parse(attributes.toggler + '=' + attributes.value)(scope);
                });
            }
            function deactivate() {
                removeOutListeners();
                $timeout(function () {
                    $parse(attributes.toggler + '=null')(scope);
                });
            }
            function onClick(e) {
                setTimeout(function () {
                    if (isActive()) {
                        deactivate();
                    } else {
                        activate();
                    }
                }, 100);
            }
            function onClickOut(e) {
                if (isActive()
                    && Utils.getClosestElement(e.target, element[0]) === null
                    && Utils.getClosest(e.target, attributes.target) === null) {
                    deactivate();
                }
            }
            function addOutListeners() {
                angular.element($document).on('click', onClickOut);
            };
            function removeOutListeners() {
                angular.element($document).off('click', onClickOut);
            };
            function addListeners() {
                element.on('click', onClick);
            };
            function removeListeners() {
                element.off('click', onClick);
            };
            scope.$on('$destroy', function () {
                removeListeners();
                removeOutListeners();
            });
            addListeners();
        }
    };
}]);

/* global angular, module */

module.filter('shortName', ['$filter', function ($filter) {
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }
    return function (value) {
        if (!value) {
            return '';
        }
        if (value.indexOf(' .') === value.length - 2) {
            value = value.split(' .').join('');
        }
        /*
        var splitted;
        if (value.indexOf('.') !== -1) {
            splitted = value.split('.');
        } else {
            splitted = value.split(' ');
        }
        */
        var splitted = value.split(' ');
        var firstName = splitted.shift();
        if (splitted.length) {
            var lastName = splitted.join(' ');
            return firstName.substr(0, 1).toUpperCase() + '.' + toTitleCase(lastName);
        } else {
            return firstName;
        }
    }
}]);

module.filter('customCurrency', ['$filter', function ($filter) {
    var legacyFilter = $filter('currency');
    return function (cost, currency) {
        return legacyFilter(cost * currency.ratio, currency.formatting);
    }
}]);

module.filter('customNumber', ['$filter', function ($filter) {
    var filter = $filter('number');
    return function (value, precision, unit) {
        unit = unit || '';
        return (value ? filter(value, precision) + unit : '-');
    }
}]);

module.filter('customHours', [function () {
    return function (value) {
        if (value) {
            var hours = Math.floor(value);
            var minutes = Math.floor((value - hours) * 60);
            var label = hours ? hours + ' H' : '';
            label += minutes ? ' ' + minutes + ' m' : '';
            return label;
        } else {
            return '-';
        }
    }
}]);

module.filter('customDate', ['$filter', function ($filter) {
    var filter = $filter('date');
    return function (value, format, timezone) {
        return value ? filter(value, format, timezone) : '-';
    }
}]);

module.filter('customTime', ['$filter', function ($filter) {
    return function (value, placeholder) {
        if (value) {
            return Utils.parseTime(value);
        } else {
            return (placeholder ? placeholder : '-');
        }
    }
}]);

module.filter('customDigital', ['$filter', function ($filter) {
    return function (value, placeholder) {
        if (value) {
            return Utils.parseHour(value);
        } else {
            return (placeholder ? placeholder : '-');
        }
    }
}]);

module.filter('customString', ['$filter', function ($filter) {
    return function (value, placeholder) {
        return value ? value : (placeholder ? placeholder : '-');
    }
}]);

module.filter('customEnum', function () {
    return function (val) {
        val = val + 1;
        return val < 10 ? '0' + val : val;
    };
});

/* global angular, module */

module.factory('State', ['$timeout', function ($timeout) {
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

module.factory('Animate', [function () {
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

module.factory('Md5', [function () {

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

module.factory('Utils', ['$compile', '$controller', 'Vector', 'Md5', function ($compile, $controller, Vector, Md5) {
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

module.factory('Vector', function () {
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Vector.make = function (a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    };
    Vector.size = function (a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    };
    Vector.normalize = function (a) {
        var l = Vector.size(a);
        a.x /= l;
        a.y /= l;
        return a;
    };
    Vector.incidence = function (a, b) {
        var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
        // if (angle < 0) angle += 2 * Math.PI;
        // angle = Math.min(angle, (Math.PI * 2 - angle));
        return angle;
    };
    Vector.distance = function (a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    };
    Vector.cross = function (a, b) {
        return (a.x * b.y) - (a.y * b.x);
    };
    Vector.difference = function (a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    };
    Vector.power = function (a, b) {
        var x = Math.abs(b.x - a.x);
        var y = Math.abs(b.y - a.y);
        return (x + y) / 2;
    };
    Vector.prototype = {
        size: function () {
            return Vector.size(this);
        },
        normalize: function () {
            return Vector.normalize(this);
        },
        incidence: function (b) {
            return Vector.incidence(this, b);
        },
        cross: function (b) {
            return Vector.cross(this, b);
        },
        distance: function (b) {
            return Vector.distance(this, b);
        },
        difference: function (b) {
            return Vector.difference(this, b);
        },
        power: function () {
            return (Math.abs(this.x) + Math.abs(this.y)) / 2;
        },
        towards: function (b, friction) {
            friction = friction || 0.125;
            this.x += (b.x - this.x) * friction;
            this.y += (b.y - this.y) * friction;
            return this;
        },
        add: function (b) {
            this.x += b.x;
            this.y += b.y;
            return this;
        },
        friction: function (b) {
            this.x *= b;
            this.y *= b;
            return this;
        },
        copy: function (b) {
            return new Vector(this.x, this.y);
        },
        toString: function () {
            return '{' + this.x + ',' + this.y + '}';
        },
    };
    return Vector;
});

module.factory('ElementRect', ['Vector', function (Vector) {
    function ElementRect() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.center = new Vector();
    }
    ElementRect.fromNative = function (nativeElement) {
        return new ElementRect().set(nativeElement);
    }
    ElementRect.prototype = {
        set: function (nativeElement) {
            var rect = nativeElement.getBoundingClientRect();
            this.x = rect.left;
            this.y = rect.top;
            this.width = nativeElement.offsetWidth;
            this.height = nativeElement.offsetHeight;
            this.center.x = this.x + this.width / 2;
            this.center.y = this.y + this.height / 2;
            this.native = nativeElement;
            return this;
        },
        offset: function (vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.center.x = this.x + this.width / 2;
            this.center.y = this.y + this.height / 2;
            return this;
        },
        intersect: function (element) {
            // console.log('intersect.this', this, 'element', element);
            return !(element.x > this.x + this.width ||
                        element.x + element.width < this.x ||
                        element.y > this.y + this.height ||
                        element.y + element.height < this.y);
        },
        toString: function () {
            return '{' + this.x + ',' + this.y + ',' + this.width + ',' + this.height + '}';
        },
    };
    return ElementRect;
}]);

module.factory('Style', function () {
    var prefix = function detectTransformProperty() {
        var transform = 'transform',
            webkit = 'webkitTransform';
        var div = document.createElement("DIV");
        if (typeof div.style[transform] !== 'undefined') {
            ['webkit', 'moz', 'o', 'ms'].every(function (prop) {
                var prefixed = '-' + prop + '-transform';
                if (typeof div.style[prefixed] !== 'undefined') {
                    prefix = prefixed;
                    return false;
                }
                return true;
            });
        } else if (typeof div.style[webkit] !== 'undefined') {
            prefix = '-webkit-transform';
        } else {
            prefix = undefined;
        }
        return prefix;
    }();
    function Style() {
        this.props = {
            scale: 1,
            hoverScale: 1,
            currentScale: 1,
        }
    }
    Style.prototype = {
        set: function (element) {
            var styles = [];
            angular.forEach(this, function (value, key) {
                if (key !== 'props')
                    styles.push(key + ':' + value);
            });
            element.style.cssText = styles.join(';') + ';';
        },
        transform: function (transform) {
            this[prefix] = transform;
        },
        transformOrigin: function (x, y) {
            this[prefix + '-origin-x'] = (Math.round(x * 1000) / 1000) + '%';
            this[prefix + '-origin-y'] = (Math.round(y * 1000) / 1000) + '%';
        },
    };
    Style.prefix = prefix;
    return Style;
});

/* global angular, module */

module.factory('Filters', [function () {
    function Filters() {
        this.keys = {};
        this.flags = {};
        this.values = [];
        this.search = [];
    }
    Filters.prototype = {
        has: function (id) {
            return (id && this.keys[id] === true) || false;
        },
        active: function (id) {
            return (this.has(id) && this.flags[id] === true) || false;
        },
        removeAll: function () {
            this.keys = {};
            this.values.length = 0;
        },
        reset: function () {
            this.removeAll();
            this.flags = {};
            this.search = [];
        },
        toggle: function (item) {
            if (this.active(item.id)) {
                item.active = this.flags[item.id] = false;
                var index = this.search.indexOf(item.id);
                this.search.splice(index, 1);
            } else {
                item.active = this.flags[item.id] = true;
                this.search.push(item.id);
            }
        },
        add: function (item) {
            if (item.id && !this.has(item.id)) {
                this.keys[item.id] = true;
                this.values.push(item);
            }
        },
        remove: function (item) {
            if (this.has(item.id)) {
                var index;
                if (this.flags[item.id] === true) {
                    item.active = this.flags[item.id] = false;
                    index = this.search.indexOf(item.id);
                    this.search.splice(index, 1);
                }
                index = this.values.indexOf(item);
                this.values.splice(index, 1);
                this.keys[item.id] = false;
            }
        },
        sort: function () {
            this.values.sort(function (va, vb) {
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
        },
        filter: function (cell) {
            if (this.search.length) {
                return (this.search.indexOf(cell.key) !== -1);
            } else {
                return true;
            }
        },
    };
    return Filters;
}]);

module.factory('Order', [function () {
    function Order() {
        this.set(0);
    }
    Order.prototype = {
        set: function (sort) {
            switch (sort) {
                case 1:
                    this.name = 'Asc';
                    this.sort = 1;
                    this.asc = true;
                    this.desc = false;
                    break;
                case -1:
                    this.name = 'Desc';
                    this.sort = -1;
                    this.asc = false;
                    this.desc = true;
                    break;
                default:
                    this.name = 'Ordina';
                    this.sort = 0;
                    this.asc = false;
                    this.desc = false;
            }
        },
        toggle: function () {
            var sort = this.sort - 1;
            sort === -2 ? sort = 1 : null;
            this.set(sort);
        },
    };
    return Order;
}]);

module.factory('Field', ['$parse', '$filter', 'Utils', 'Filters', 'Order', 'fieldTypes', 'fieldTotalTypes', function ($parse, $filter, Utils, Filters, Order, fieldTypes, fieldTotalTypes) {
    function Field(data) {
        this.filters = new Filters();
        this.order = new Order();
        this.typeTotal = this.typeTotal || fieldTotalTypes.SUM;
        data ? angular.extend(this, data) : null;
        // console.log('typeTotal', this.typeTotal);
        // PREPARE GETTER SETTERS
        if (angular.isFunction(this.value)) {
            this.value = this.value.bind(this);
        }
        this.name = this.name || this.value;
        this.raw = this.raw || this.value;
        this.key = this.key || this.value;
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
        this.keys = {};
        this.total = 0;
    }
    Field.prototype = {
        reset: function () {
            this.keys = {};
            this.total = 0;
            if (!this.isActive()) {
                this.filters.reset();
            }
        },
        hasKey: function (item) {
            var has = true;
            var key = this.getters.key(item);
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
        aggregation: function (item, row) {
            var a = (this.getters.raw(item) || 0);
            var b = (this.getters.value(row) || 0);
            var field = this;
            switch (field.typeTotal) {
                case fieldTotalTypes.MIN:
                    field.setters.raw(item, Math.min(a, b));
                    break;
                case fieldTotalTypes.MAX:
                    field.setters.raw(item, Math.max(a, b));
                    break;
                case fieldTotalTypes.AVG:
                    var n = 0;
                    field.setters.raw(item, (b + (a * n)) / (n + 1)); // (newVal + (avg * n)) / (n+1)
                    break;
                default:
                    field.setters.raw(item, a + b);
            }
            return field;
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
            var key = this.getters.key(item);
            if (!this.filters.has(key)) {
                var value = this.getters.raw(item);
                var active = this.filters.flags[key];
                this.filters.add({
                    id: key,
                    name: value || '-',
                    active: active,
                });
            }
        },
        getFormat: function () {
            var format = '';
            switch (this.type) {
                case fieldTypes.ID:
                case fieldTypes.NUMBER:
                    format = '#';
                    break;
                case fieldTypes.DOUBLE:
                    format = '#';
                    break;
                case fieldTypes.DATE:
                    format = 'yyyy-mm-dd';
                    break;
                case fieldTypes.WEEKS:
                    format = '#,###0 [$W]';
                    break;
                case fieldTypes.HOURS:
                    format = '#,###0 [$H]';
                    break;
                case fieldTypes.COSTS:
                    format = '#,###.00 €';
                    break;
                case fieldTypes.PERCENT:
                    format = '0.00%';
                    break;
                case fieldTypes.GAIN:
                    format = '[Color 10]+0.00%;[Red]-0.00%;-';
                    break;
            }
            return format;
        },
        getLink: function (item) {
            return angular.isFunction(this.link) ? this.link(item) : null;
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
        formatValue: function (value) {
            switch (this.type) {
                case fieldTypes.RESOURCE:
                case fieldTypes.DISABLED:
                    value = $filter('shortName')(value);
                    break;
                case fieldTypes.ID:
                case fieldTypes.NUMBER:
                    value = $filter('customNumber')(value, 0);
                    break;
                case fieldTypes.DOUBLE:
                    value = $filter('customNumber')(value, 2);
                    break;
                case fieldTypes.WEEKS:
                    value = $filter('customNumber')(value, 2, ' W');
                    break;
                case fieldTypes.DATE:
                    value = $filter('date')(value, 'yyyy-MM-dd');
                    break;
                case fieldTypes.HOURS:
                    value = $filter('customNumber')(value, 0, ' H');
                    break;
                case fieldTypes.COSTS:
                    value = $filter('customNumber')(value, 0, ' €');
                    break;
                case fieldTypes.PERCENT:
                    value = $filter('customNumber')(value, 2, ' %');
                    break;
                case fieldTypes.GAIN:
                    value = angular.isNumber(value) ? (value > 0 ? '+' : '') + $filter('customNumber')(value, 2, ' %') : (value || '-');
                    break;
            }
            return value;
        },
        getTotal: function (filtered) {
            var value = this.getValueTotal(filtered);
            return this.formatValue(value);
        },
        getValueTotal: function (filtered) {
            var value = 0, field = this;
            if (field.compare && field.type === fieldTypes.GAIN) {
                var current = 0; // (field.getters.raw(item) || 0);
                var previous = 0; // (this.getters.raw(item) || 0);                
                angular.forEach(filtered, function (item) {
                    current += (field.$field.getters.raw(item) || 0);
                    previous += (field.getters.raw(item) || 0);
                }.bind(this));
                if (previous) {
                    value = (current - previous) / previous * 100;
                }
            } else {
                switch (field.typeTotal) {
                    case fieldTotalTypes.SUM:
                        value = 0;
                        break;
                    case fieldTotalTypes.MIN:
                        value = Number.POSITIVE_INFINITY;
                        break;
                    case fieldTotalTypes.MAX:
                        value = Number.NEGATIVE_INFINITY;
                        break;
                    case fieldTotalTypes.AVG:
                        break;
                }
                angular.forEach(filtered, function (item, i) {
                    var a = value;
                    var b = (field.getters.raw(item) || 0);
                    switch (field.typeTotal) {
                        case fieldTotalTypes.SUM:
                            value = a + b;
                            break;
                        case fieldTotalTypes.MIN:
                            value = a < b ? a : b;
                            break;
                        case fieldTotalTypes.MAX:
                            value = a > b ? a : b;
                            break;
                        case fieldTotalTypes.AVG:
                            value = (b + (a * i)) / (i + 1);
                            break;
                    }
                });
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
            }
            field.total = value;
            return value;
        },
        getTotalClass: function (filtered) {
            var cc = [];
            switch (this.type) {
                case fieldTypes.NUMBER:
                case fieldTypes.DOUBLE:
                case fieldTypes.WEEKS:
                case fieldTypes.HOURS:
                case fieldTypes.COSTS:
                case fieldTypes.PERCENT:
                case fieldTypes.GAIN:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        getCellTotal: function (rows, index) {
            var value = 0, field = this, cell, previousCell;
            if (field.compare && field.type === fieldTypes.GAIN) {
                var current = 0;
                var previous = 0;         
                angular.forEach(rows, function (row) {
                    /*
                    cell = row.cols[index];
                    current += (field.$field.getters.raw(item) || 0);
                    previous += (cell.getValue() || 0);
                    */
                    cell = row.cols[field.$field.col.index];
                    previousCell = row.cols[index];
                    current += (cell.getValue() || 0);
                    previous += (previousCell.getValue() || 0);
                });
                if (previous) {
                    value = (current - previous) / previous * 100;
                }
            } else {
                switch (field.typeTotal) {
                    case fieldTotalTypes.SUM:
                        value = 0;
                        break;
                    case fieldTotalTypes.MIN:
                        value = Number.POSITIVE_INFINITY;
                        break;
                    case fieldTotalTypes.MAX:
                        value = Number.NEGATIVE_INFINITY;
                        break;
                    case fieldTotalTypes.AVG:
                        break;
                }
                angular.forEach(rows, function (row, i) {
                    cell = row.cols[index];
                    var a = value;
                    var b = (cell.getValue() || 0);                    
                    switch (field.typeTotal) {
                        case fieldTotalTypes.SUM:
                            value = a + b;
                            break;
                        case fieldTotalTypes.MIN:
                            value = a < b ? a : b;
                            break;
                        case fieldTotalTypes.MAX:
                            value = a > b ? a : b;
                            break;
                        case fieldTotalTypes.AVG:
                            value = (b + (a * i)) / (i + 1);
                            break;
                    }
                });
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
            }
            field.total = value;
            return value;
        },
        getHeaderClass: function () {
            var cc = [];
            angular.forEach(this, function (value, key) {
                if (value === true) {
                    cc.push(key);
                }
            });
            switch (this.type) {
                case fieldTypes.NUMBER:
                case fieldTypes.DOUBLE:
                case fieldTypes.WEEKS:
                case fieldTypes.HOURS:
                case fieldTypes.COSTS:
                case fieldTypes.PERCENT:
                case fieldTypes.GAIN:
                    cc.push('text-xs-right');
                    break;
            }
            /*
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            */
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
                case fieldTypes.LINK:
                    cc.push('text-underline');
                    break;
                case fieldTypes.NUMBER:
                case fieldTypes.DOUBLE:
                case fieldTypes.WEEKS:
                case fieldTypes.HOURS:
                case fieldTypes.COSTS:
                    cc.push('text-xs-right');
                    break;
                case fieldTypes.PERCENT:
                    cc.push('text-xs-right');
                    break;
                case fieldTypes.GAIN:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        getColumnClass: function () {
            return this.color ? 'shade-light-blue-' + this.color : '';
        },
        getTextClass: function (item) {
            var cc = [];
            switch (this.type) {
                case fieldTypes.GAIN:
                    var value = this.getters.raw(item);
                    if (angular.isNumber(value) && value < 0) {
                        cc.push('text-danger');
                    } else {
                        cc.push('text-success');
                    }
                    break;
            }
            return cc.join(' ');
        },
        /*
        getItemClass: function (item) {
            var cc = [];
            cc.push(item.cells[this.$id].cellClass);
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            return cc.join(' ');
        },
        getFormatted: function (item) {
            if (this.dynamic) {
                return this.formatValue(this.getters.raw(item));
            } else {
                return item.cells[this.$id].name;
            }
        },
        filter: function (item) {
            if (this.isActive() && this.filters.search.length) {
                return (this.filters.search.indexOf(item.cells[this.$id].key) !== -1);
            } else {
                return true;
            }
        },
        */
        toStatic: function (item) {
            if (this.post) {
                this.setters.raw(item, (this.getters.post(item) || 0));
            }
            var field = this;
            // var cell = item.cells[field.$id] = {
            var cell = {
                cellClass: field.getCellClass(item),
                textClass: field.getTextClass(item),
                link: (field.link ? field.link(item) : null),
                pop: (field.pop ? field.pop(item) : null),
                key: field.getters.key(item),
                getValue: function () {
                    if (field.dynamic && !field.post) {
                        return field.getters.value(item);
                    } else if (cell.value) {
                        return cell.value;
                    } else {
                        return field.getters.raw(item);
                    }
                },
                getName: function () {
                    if (field.dynamic && !field.post) {
                        return field.formatValue(cell.getValue());
                    } else if (cell.name) {
                        return cell.name;
                    } else {
                        return field.formatValue(cell.getValue());
                    }
                },
                getTotalValue: function (rows, index) {
                    return field.getCellTotal(rows, index);
                },
                getTotalName: function (rows, index) {
                    var value = cell.getTotalValue(rows, index);
                    return field.formatValue(value);
                },
                formatValue: function (value) {
                    return field.formatValue(value);
                },
            };
            cell.value = cell.getValue();
            cell.name = cell.getName();
            return cell;
        },
    };
    Field.types = fieldTypes;
    Field.totalTypes = fieldTotalTypes;
    return Field;
}]);

module.factory('Fields', ['$parse', 'Utils', 'Field', 'fieldTypes', function ($parse, Utils, Field, fieldTypes) {
    function Fields(fields) {
        var array = [];
        if (fields) {
            angular.forEach(fields, function (field, index) {
                field.$id = index + 1;
                array.push(new Field(field));
            });
        }
        angular.extend(array, Fields.prototype);
        return array;
    }
    Fields.prototype = {
        // EXPANSION
        expand: function (data) {
            var options = {
                dynamic: true,
                compare: false,
            }
            data ? angular.extend(options, data) : null;
            // add percentuals and compares
            var array = [], fields = this;
            array.radios = {};
            angular.forEach(this, function (field, index) {
                field.$id = array.length + 1;
                array.push(field);
                if (field.aggregate && field.value === field.raw) {
                    if (options.dynamic) {
                        array.push(new Field({
                            $id: array.length + 1,
                            name: '%',
                            value: function (item) {
                                return field.getters.raw(item) / field.total * 100;
                            },
                            key: field.key,
                            type: fieldTypes.PERCENT,
                            dynamic: true,
                            active: function () {
                                return array.show.dynamic && field.active;
                            },
                            $field: field,
                        }));
                    }
                    if (options.compare) {
                        var fieldPrevious = new Field({
                            $id: array.length + 1,
                            name: 'anno precedente',
                            value: function (item) {
                                return this.getters.raw(item);
                            },
                            raw: field.value + 'Last',
                            source: field.value,
                            key: field.key,
                            type: field.type, // 
                            count: field.count,
                            compare: true,
                            dynamic: true,
                            active: function () {
                                return (fields.show.compare && this.$field.active) || false;
                            },
                            $field: field,
                        });
                        array.push(fieldPrevious);
                        array.push(new Field({
                            $id: array.length + 1,
                            name: '%',
                            value: function (row) {
                                return 0;
                            },
                            post: function (row) {
                                var current = (field.getters.raw(row) || 0);
                                var previous = (fieldPrevious.getters.raw(row) || 0);
                                if (current && previous) {
                                    return ((current - previous) / previous) * 100;
                                } else if (current) {
                                    return Number.POSITIVE_INFINITY; // '+∞ %';
                                } else {
                                    return null; // '+∞ %';
                                }
                            },
                            raw: field.value + 'Gain',
                            source: field.value,
                            key: field.key,
                            type: fieldTypes.GAIN, // field.type, // 
                            count: field.count,
                            compare: true,
                            dynamic: true,
                            active: function () {
                                 return (fields.show.compare && this.$field.active) || false;
                            },
                            $field: field,
                        }));
                    }
                }
                if (field.radio && field.active) {
                    array.radios[field.radio] = field.value;
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        // AGGREGATE, GROUPBY & COMPARE
        reset: function () {
            this.groups = {};
            angular.forEach(this, function (field) {
                field.reset();
            });
            return this;
        },
        unique: function (row, items) {
            var key = this.getGroupKey(row);
            var item = this.groups[key];
            if (!item) {
                item = this.groups[key] = row; // angular.copy(row);
                item.cells = [];
                items.push(item);
            }
            return item;
        },
        iterate: function (row, items) {
            row = angular.copy(row);
            var item = this.unique(row, items);
            this.aggregation(item, row);
        },
        compare: function (row, items) {
            row = angular.copy(row);
            angular.forEach(this, function (field) {
                if (field.compare) {
                    var value = field.getters.source(row);
                    field.setters.raw(row, value);      
                }
            });
            /*
            // !!! _1_
            angular.forEach(this, function (field) {
                if (field.compare) {
                    field.setters.source(row, 0);
                }
            });
            */
            var item = this.unique(row, items);
            this.aggregation(item, row, true);
        },
        aggregation: function (item, row, comparing) {
            angular.forEach(this, function (field) {
                var mode = (comparing ? field.compare : !field.compare);
                if ((field.isActive() || field.always) && mode) {
                    if (field.count) {
                        field.addCount(item, row);
                    } else if (comparing || field.aggregate) {
                        if (!field.hasKey(row)) {
                            if (item === row) {
                                field.initValue(item);
                            } else {
                                field.aggregation(item, row);
                            }
                        }
                    }
                }
            });
            return this;
        },
        // AGGREGATE, GROUPBY & COMPARE
        getCount: function () {
            var i = 0;
            angular.forEach(this, function (field) {
                i += field.isActive() ? 1 : 0;
            }.bind(this));
            return i;
        },
        getFirstField: function () {
            var first = null;
            angular.forEach(this, function (field) {
                if (first === null && field.isActive() && field.groupBy && field.value !== 'month' && field.value !== 'monthShort') {
                    first = field;
                }
            });
            return first;
        },
        getGroupKey: function (item) {
            var keys = [];
            angular.forEach(this, function (field) {
                if (field.isActive() && field.groupBy) {
                    keys.push(field.getters.key(item));
                }
            });
            return keys.join('-');
        },
        getGroups: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.groupBy) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        getAggregates: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.aggregate && !field.count) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        getPercentages: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.type === fieldTypes.PERCENT) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        getDynamics: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.dynamic) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        getCompares: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.compare) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },
        getCounters: function () {
            var array = [];
            angular.forEach(this, function (field, index) {
                if (field.count) {
                    array.push(field);
                }
            });
            angular.extend(array, Fields.prototype);
            return array;
        },        
        activeInRange: function (range) {
            var flag = false;
            var i = 0;
            while (!flag && i < this.length) {
                var field = this[i];
                if (field.active) {
                    flag = (range.indexOf(field.value) !== -1);
                }
                i++;
            }
            return flag;
        },        
        toggleFields: function (field) {
            if (field.radio) {
                angular.forEach(this, function (item) {
                    if (field.radio === item.radio && field !== item) {
                        item.deactivate();
                    }
                });
                field.activate();
                this.radios[field.radio] = field.value;
            } else {
                field.toggle();
            }
        },
        show: {
            table: true, // defaults
        },
        // ELIMINARE
        /*
        isFilterDisabled: function (row, field, filtered) { // check if other values are disabled !! unused
            var id = row.id,
                t = this;
            var has = false,
                index = 0;
            while (index < filtered.length) {
                has = has || field.getters.key(filtered[index]) === id;
                if (has) {
                    index = filtered.length;
                } else {
                    index++;
                }
            }
            return !has;
        },
        getSortKey: function (item) {
            var values = [];
            angular.forEach(this, function (field) {
                if (field.isActive() && field.groupBy) {
                    values.push(field.sort ? $parse(field.sort)(item) : field.formatValue(field.getters.raw(item)));
                }
            });
            return values.join('');
        },
        */
        toStatic: function (items) {
            var fields = this,
                cols = [],
                rows = [],
                cell;
            // primo ciclo
            angular.forEach(fields, function (field, index) {
                field.filters.removeAll();
                field.col = {
                    active: field.isActive(),
                    headerClass: field.getHeaderClass(),
                    columnClass: field.getColumnClass(),
                    totalClass: field.getTotalClass(),
                    format: field.getFormat(),

                    $id: field.$id,
                    colName: field.name,
                    type: field.type,
                    groupBy: field.groupBy,
                    aggregate: field.aggregate,
                    compare: field.compare,
                    filters: field.filters,
                    order: field.order,
                    originaIndex: index,
                };
                if (field.col.active) {
                    field.col.index = cols.length;
                    cols.push(field.col);
                }
            });
            // lasciare serve un secondo ciclo!
            angular.forEach(fields, function (field) {
                if (field.col.active || (field.dynamic && !field.compare) || field.always) {
                    angular.forEach(items, function (item, i) {
                        cell = field.toStatic(item);
                        if (field.hasSearch && field.groupBy) {
                            field.addValue(item);
                        }
                        var row = rows[i] = (rows[i] || { cols: [] });
                        cell = angular.extend(angular.copy(cell), field.col);
                        row.cols[field.col.index] = cell;
                    });
                    if (field.hasSearch && field.groupBy) {
                        field.filters.sort();
                    }
                }
            });
            // lasciare serve un terzo ciclo!
            angular.forEach(cols, function (field, index) {
                var last = rows[rows.length - 1].cols[index];
                field.$last = last;
                field.getTotalValue = function (rows) {
                    return this.$last.getTotalValue(rows, index);
                };
                field.getTotalName = function (rows) {
                    return this.$last.getTotalName(rows, index);
                };
                /*
                field.totalValue = field.getTotalValue();
                field.totalName = field.getTotalName();
                */
            });
            //console.log('Fields.toStatic', 'cols', cols.length, 'rows', rows.length);
            return { cols: cols, rows: rows };
        },
    };
    Fields.fromDatas = function (datas) {
        return Fields.parseDatas(datas);
    }
    Fields.parseDatas = function getFields(datas) {
        var fields = null;
        if (datas && datas.length) {
            fields = [];
            function parse(item, prop) {
                if (angular.isArray(item)) {
                    angular.forEach(item, function (value, key) {
                        parse(value, (prop || '') + '[' + key + ']');
                    });
                } else if (angular.isObject(item)) {
                    angular.forEach(item, function (value, key) {
                        parse(value, (prop ? prop + '.' : '') + key);
                    });
                } else {
                    var field = {
                        value: prop,
                        type: fieldTypes.TEXT,
                        active: fields.length < 6,
                    };
                    if (angular.isDate(item) || (angular.isNumber(item) && 
                        (prop.toLowerCase().indexOf('date') !== -1 || prop.toLowerCase().indexOf('time') !== -1)
                        )) {
                        field.type = fieldTypes.DATE;
                        field.groupBy = true;
                        field.hasSearch = true;
                    } else if (angular.isNumber(item)) {
                        field.type = fieldTypes.NUMBER;
                        field.aggregate = true;
                        field.color = 1;
                    } else {
                        field.groupBy = true;
                        field.hasSearch = true;
                    }
                    fields.push(field);
                }
            }
            parse(datas[0]);
        }
        return fields;
    };
    Fields.types = fieldTypes;
    return Fields;
}]);

module.factory('Table', ['$parse', 'Fields', 'fieldTypes', 'orderByFilter', function ($parse, Fields, fieldTypes, orderByFilter) {
    var MAX_FIELDS_ORDERED = 4;
    function Table(fields, options) {
        this.fields = new Fields(fields).expand(options);
        this.defaults = fields.map(function (field) {
            return {
                $id: field.$id,
                active: field.active,
            };
        });
        this.colGroups = [{
            name: 'GroupBy',
            items: this.fields.getGroups()
        }, ];
        this.valGroups = [{
            name: 'Aggregate',
            items: this.fields.getAggregates()
        }, ];
        this.excludes = [];
        this.includes = [];
        this.setOptions(options);
        // DATAS
        this.datas = [];
        this.items = [];    
        this.rows = [];
        this.cols = [];    
    }
    Table.prototype = {
        setDatas: function (datas, compares) {
            if (datas) {
                angular.forEach(datas, function (item, index) {
                    item.$id = index + 1;
                });
            }
            this.datas = datas;
            if (compares) {
                angular.forEach(compares, function (item, index) {
                    item.$id = index + 1;
                });
            }
            this.compares = compares;
            this.update();
        },
        setOptions: function (options) {
            var table = this;
            this.options = [{
                name: 'Columns',
                template: 'partials/report/filters/columns',
                icon: 'icon-columns',
                groups: this.colGroups,
                toggle: function(item) {
                    return table.toggleField(item);
                },
                active: true,
            }, {
                name: 'Values',
                template: 'partials/report/filters/values',
                icon: 'icon-values',
                groups: this.valGroups,
                toggle: function(item) {
                    return table.toggleField(item);
                },
            }, {
                name: 'Options',
                template: 'partials/report/filters/flags',
                icon: 'icon-options',
                rows: [{
                    name: 'Exclude',
                    items: this.exclude,
                    toggle: function (item) {
                        return table.exclude(item); 
                    },
                }, {
                    name: 'Include',
                    items: this.includes,
                    toggle: function (item) {
                        return table.include(item); 
                    },
                }, {
                    name: 'Flags',
                    items: [{
                        name: 'Percentuali di incidenza',
                        key: 'dynamic',
                    }],
                    toggle: function (item) {
                        return table.toggle(item.key);
                    }
                }],
            },];
        },
        update: function () {
            this.items = [];
            this.rows = [];
            this.cols = [];
            var datas = this.datas;
            var items = this.items;
            var fields = this.fields;
            var excludes = this.excludes;
            var includes = this.includes;
            var compares = this.compares;
            fields.reset();
            // var compared = null;
            angular.forEach(datas, function (row) {
                var has = true;
                angular.forEach(excludes, function (e) {
                    if (e.active) {
                        has = has && e.filter(row);
                    }
                });
                angular.forEach(includes, function (i) {
                    if (i.active) {
                        has = has && i.filter(row);
                    }
                });
                if (has) {
                    fields.iterate(row, items);
                }
            });
            if (compares) {
                // compared = [];
                angular.forEach(compares, function (row) {
                    var has = true;
                    angular.forEach(excludes, function (e) {
                        if (e.active) {
                            has = has && e.filter(row);
                        }
                    });
                    angular.forEach(includes, function (i) {
                        if (i.active) {
                            has = has && i.filter(row);
                        }
                    });
                    if (has) {
                        // compared.push(row);
                        fields.compare(row, items);
                    }
                });
            }
            this.toStatic();
        },
        setOrderBy: function () {
            // var defaults = [];
            // var orders = [];
            var table = this;
            var defaultsFiltered = [];
            var ordersFiltered = [];
            var sign;
            angular.forEach(table.fields, function (field, index) {
                if (field.col.active) {
                    if (field.order.sort !== 0) {
                        sign = (field.order.sort === -1 ? '-' : '');
                        ordersFiltered.push(sign + 'cols[' + defaultsFiltered.length + '].getValue()');
                        // orders.push(sign + field.raw);                        
                    }
                    defaultsFiltered.push('cols[' + defaultsFiltered.length + '].getValue()');
                    // defaults.push(field.raw);
                }
            });
            // defaults.length = Math.min(MAX_FIELDS_ORDERED, defaults.length);
            defaultsFiltered.length = Math.min(MAX_FIELDS_ORDERED, defaultsFiltered.length);
            // table.orderBy = orders.length ? orders : defaults; // null;
            table.filteredOrderBy = ordersFiltered.length ? ordersFiltered : defaultsFiltered; // null;
            // console.log('Table.sort', 'filteredOrderBy', table.filteredOrderBy);
        },
        exclude: function (item) {
            item.active = !item.active;
            this.update();
        },
        include: function (item) {
            item.active = !item.active;
            this.update();
        },
        has: function (mode) {
            return (this.fields ? this.fields.show[mode] : null);
        },
        resetFilters: function () {
            var table = this;
            angular.forEach(table.fields, function (field, key) {
                angular.forEach(table.defaults, function (item) {
                    if (field.$id === item.$id) {
                        angular.isFunction(field.active) ? null : field.active = item.active;
                    }
                });
                field.filters.reset();
            });
            table.fields = table.fields.sort(function (a, b) {
                return a.$id - b.$id;
            });
            // table.fields.radios.workloads = 'supplier.name'; //??? default radios ???
            table.update();
        },
        doFilterStatic: function (cols) {
            var table = this; 
            var fields = table.fields, cell;
            return function (row) {
                var has = true;
                angular.forEach(table.cols, function (col, index) {
                    cell = row.cols[index];
                    cell.matches = null;
                    has = has && col.filters.filter(cell);
                });
                // SPOSTARE RICERCA SEARCH OBJECT
                if (has && table.search && table.search.length) {
                    var match = false;
                    angular.forEach(row.cols, function(cell) {
                        cell.matches = new RegExp(table.search, 'gim').exec(cell.name);
                        match = match || (cell.matches !== null);
                    });
                    has = has && match;
                }
                return has;
            };
        },
        toggle: function (mode) {
            var value = null;
            if (this.fields) {
                var show = this.fields.show;
                show[mode] = !show[mode];
                switch (mode) {
                    case 'dynamic':
                        show.compare = false;
                        break;
                    case 'compare':
                        show.dynamic = false;
                        break;
                }
                value = show[mode];
            }
            this.toStatic(); //!!! nuovo
            return value;
        },
        toggleField: function (field) {
            this.fields.toggleFields(field);
            this.update();
        },
        toggleOrder: function (field) {
            angular.forEach(this.fields, function (f) {
                if (f.$id !== field.$id) {
                    f.order.set(0);
                }
            });
            field.order.toggle();
            this.setOrderBy();
        },
        swap: function (from, to) {
            // console.log('Table.swap', 'from', from, 'to', to);
            angular.forEach(this.fields, function(field) {
                if (field.$id === from.$id) {
                    from = field;
                }
                if (field.$id === to.$id) {
                    to = field;
                }
            });
            // from = this.fields[this.fields.indexOf(from)];
            // to = this.fields[this.fields.indexOf(to)];
            var fi = this.fields.indexOf(from);
            var field = this.fields[fi];
            this.fields.splice(fi, 1);
            var ti = this.fields.indexOf(to);
            this.fields.splice(ti, 0, field);
            // console.log('Table.swap', fi, ti, field);
            this.update();
        },
        toStatic: function () {
            var table = this;
            var filtered = table.fields.toStatic(table.items);
            table.rows = filtered.rows;
            table.cols = filtered.cols;
            table.setOrderBy();            
            if (this.after && angular.isFunction(this.after)) {
                this.after(items);
            }
        },
        toJson: function (data) {
            var table = this;
            var json = {
                name: 'Repotable',
                description: 'a view of selected datas', // + $filter('date')(filters.dateFrom, 'dd MMM yyyy') + ' al ' + $filter('date')(filters.dateTo, 'dd MMM yyyy'),
            };
            data ? angular.extend(json, data) : null;
            json.columns = [];
            json.rows = [];
            if (table.rows.length) {
                var cols = table.cols;
                var rows = table.rows;
                angular.forEach(cols, function (col, index) {
                    json.columns.push({
                        index: index,
                        name: col.colName,
                        format: col.format,
                    });
                });
                angular.forEach(rows, function (row, index) {
                    var item = [];
                    angular.forEach(cols, function (col, index) {
                        var cell = row.cols[index];
                        item[index] = cell.getValue();
                        switch (col.type) {
                            case fieldTypes.PERCENT:
                            case fieldTypes.GAIN:
                                item[index] /= 100;
                                break;
                        }
                    });
                    json.rows.push(item);
                });
                var item = [];
                angular.forEach(cols, function (col, index) {
                    if (col.aggregate) {
                        item[index] = col.getTotalValue();
                        switch (col.type) {
                            case fieldTypes.PERCENT:
                            case fieldTypes.GAIN:
                                item[index] /= 100;
                                break;
                        }
                    } else {
                        item[index] = null;
                    }
                });
                json.rows.push(item);
            }
            return json;
        },
    };
    Table.fromDatas = function (datas) {
        if (!angular.isArray(datas) || !datas.length > 1 || !angular.isObject(datas[0])) {
            angular.forEach(datas, function (data) {
                if (angular.isArray(data) && data.length && angular.isObject(data[0])) {
                    datas = data;
                }
            });
        }
        if (!angular.isArray(datas)) {
            datas = [datas];
        }
        var fields = Fields.fromDatas(datas);
        var table = new Table(fields);
        table.setDatas(datas);
        return table;
    };
    return Table;
}]);





module.factory('Column__', ['$parse', '$filter', 'Utils', 'Filters', 'Order', 'colTypes', function ($parse, $filter, Utils, Filters, Order, colTypes) {
    var totalTypes = {
        SUM: 1,
        MIN: 2,
        MAX: 3,
        AVG: 4,
    }
    function Column(data) {
        this.filters = new Filters();
        this.order = new Order();
        this.typeTotal = this.typeTotal || totalTypes.SUM;
        data ? angular.extend(this, data) : null;
        // console.log('typeTotal', this.typeTotal);
        // PREPARE GETTER SETTERS
        if (angular.isFunction(this.value)) {
            this.value = this.value.bind(this);
        }
        this.name = this.name || this.value;
        this.raw = this.raw || this.value;
        this.key = this.key || this.value;
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
        this.keys = {};
        this.total = 0;
    }
    Column.prototype = {
        reset: function () {
            this.keys = {};
            this.total = 0;
            if (!this.isActive()) {
                this.filters.reset();
            }
        },
        addValue: function (item) {
            var key = this.getters.key(item);
            if (!this.filters.has(key)) {
                var value = this.getters.raw(item);
                var active = this.filters.flags[key];
                this.filters.add({
                    id: key,
                    name: value || '-',
                    active: active,
                });
            }
        },
        filter: function (item) {
            if (this.isActive() && this.filters.search.length) {
                return (this.filters.search.indexOf(item.static[this.id].key) !== -1);
            } else {
                return true;
            }
        },
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
        hasKey: function (item) {
            var has = true;
            var key = this.getters.key(item);
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
        aggregation: function (item, row) {
            var a = (this.getters.raw(item) || 0);
            var b = (this.getters.value(row) || 0);
            var col = this;
            switch (col.typeTotal) {
                case totalTypes.MIN:
                    col.setters.raw(item, Math.min(a, b));
                    break;
                case totalTypes.MAX:
                    col.setters.raw(item, Math.max(a, b));
                    break;
                case totalTypes.AVG:
                    var n = 0;
                    col.setters.raw(item, (b + (a * n)) / (n + 1)); // (newVal + (avg * n)) / (n+1)
                    break;
                default:
                    col.setters.raw(item, a + b);
            }
            return col;
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
        getFormatted: function (item) {
            if (this.dynamic) {
                return this.formatValue(this.getters.raw(item));
            } else {
                return item.static[this.id].name;
            }
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
                case colTypes.GAIN:
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
                case colTypes.GAIN:
                    cc.push('text-xs-right');
                    break;
            }
            /*
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            */
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
                case colTypes.GAIN:
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
            cc.push(item.static[this.id].cellClass);
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            return cc.join(' ');
        },
        getTextClass: function (item) {
            var cc = [];
            switch (this.type) {
                case colTypes.GAIN:
                    var value = this.getters.raw(item);
                    if (angular.isNumber(value) && value < 0) {
                        cc.push('text-danger');
                    } else {
                        cc.push('text-success');
                    }
                    break;
            }
            return cc.join(' ');
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
        formatValue: function (value) {
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
                case colTypes.GAIN:
                    value = angular.isNumber(value) ? (value > 0 ? '+' : '') + $filter('customNumber')(value, 2, ' %') : (value || '-');
                    break;
            }
            return value;
        },
        getTotal: function (filtered) {
            var value = this.getValueTotal(filtered);
            return this.formatValue(value);
        },
        getValueTotal: function (filtered) {
            var value = 0, col = this;
            if (col.compare && col.type === colTypes.GAIN) {
                var current = 0; // (col.getters.raw(item) || 0);
                var previous = 0; // (this.getters.raw(item) || 0);                
                angular.forEach(filtered, function (item) {
                    current += (col.$col.getters.raw(item) || 0);
                    previous += (col.getters.raw(item) || 0);
                }.bind(this));
                if (previous) {
                    value = (current - previous) / previous * 100;
                }
            } else {
                switch (col.typeTotal) {
                    case totalTypes.SUM:
                        value = 0;
                        break;
                    case totalTypes.MIN:
                        value = Number.POSITIVE_INFINITY;
                        break;
                    case totalTypes.MAX:
                        value = Number.NEGATIVE_INFINITY;
                        break;
                    case totalTypes.AVG:
                        break;
                }
                angular.forEach(filtered, function (item, i) {
                    var a = value;
                    var b = (col.getters.raw(item) || 0);
                    switch (col.typeTotal) {
                        case totalTypes.SUM:
                            value = a + b;
                            break;
                        case totalTypes.MIN:
                            value = a < b ? a : b;
                            break;
                        case totalTypes.MAX:
                            value = a > b ? a : b;
                            break;
                        case totalTypes.AVG:
                            value = (b + (a * i)) / (i + 1);
                            break;
                    }
                });
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
            }
            col.total = value;
            return value;
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
                case colTypes.GAIN:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        getCellTotal: function (rows, index) {
            var value = 0, col = this, cell;
            if (col.compare && col.type === colTypes.GAIN) {
                var current = 0;
                var previous = 0;         
                angular.forEach(rows, function (row) {
                    cell = row.cols[index];
                    current += (col.$col.getters.raw(item) || 0);
                    previous += (cell.getValue() || 0);
                });
                if (previous) {
                    value = (current - previous) / previous * 100;
                }
            } else {
                switch (col.typeTotal) {
                    case totalTypes.SUM:
                        value = 0;
                        break;
                    case totalTypes.MIN:
                        value = Number.POSITIVE_INFINITY;
                        break;
                    case totalTypes.MAX:
                        value = Number.NEGATIVE_INFINITY;
                        break;
                    case totalTypes.AVG:
                        break;
                }
                angular.forEach(rows, function (row, i) {
                    cell = row.cols[index];
                    var a = value;
                    var b = (cell.getValue() || 0);                    
                    switch (col.typeTotal) {
                        case totalTypes.SUM:
                            value = a + b;
                            break;
                        case totalTypes.MIN:
                            value = a < b ? a : b;
                            break;
                        case totalTypes.MAX:
                            value = a > b ? a : b;
                            break;
                        case totalTypes.AVG:
                            value = (b + (a * i)) / (i + 1);
                            break;
                    }
                });
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
            }
            col.total = value;
            return value;
        },
        toStatic: function (item) {
            if (this.post) {
                this.setters.raw(item, (this.getters.post(item) || 0));
            }
            var col = this;
            var cell = item.static[col.id] = {
                cellClass: col.getCellClass(item),
                textClass: col.getTextClass(item),
                link: col.link ? col.link(item) : null,
                pop: col.pop ? col.pop(item) : null,
                key: col.getters.key(item),
                getValue: function () {
                    if (col.dynamic) {
                        return col.getters.value(item);
                    } else if (cell.value) {
                        return cell.value;
                    } else {
                        return col.getters.raw(item);
                    }
                },
                getName: function () {
                    if (col.dynamic) {
                        return col.formatValue(cell.getValue());
                    } else if (cell.name) {
                        return cell.name;
                    } else {
                        return col.formatValue(cell.getValue());
                    }
                },
                getTotalValue: function (rows, index) {
                    return col.getCellTotal(rows, index);
                },
                getTotalName: function (rows, index) {
                    var value = cell.getTotalValue(rows, index);
                    return col.formatValue(value);
                },
                formatValue: function (value) {
                    return col.formatValue(value);
                },
            };
            cell.value = cell.getValue();
            cell.name = cell.getName();
            return cell;
        },
    };
    Column.types = colTypes;
    return Column;
}]);

module.factory('Columns__', ['$parse', 'Utils', 'Column', 'colTypes', function ($parse, Utils, Column, colTypes) {
    function Columns(columns) {
        var array = [];
        if (columns) {
            angular.forEach(columns, function (col, index) {
                col.id = index + 1;
                array.push(new Column(col));
            });
        }
        angular.extend(array, Columns.prototype);
        return array;
    }
    Columns.prototype = {
        // EXPANSION
        expand: function (data) {
            var options = {
                dynamic: true,
                compare: false,
            }
            data ? angular.extend(options, data) : null;
            // add percentuals and compares
            var array = [],
                cols = this;
            array.radios = {};
            angular.forEach(this, function (col, index) {
                col.id = array.length + 1;
                array.push(col);
                if (col.aggregate && col.value === col.raw) {
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
                                return array.show.dynamic && col.active;
                            },
                            $col: col,
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
                                return array.show.compare && col.active;
                            },
                            $col: col,
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
                            type: colTypes.GAIN, // col.type, // 
                            count: col.count,
                            compare: true,
                            dynamic: true,
                            active: function () {
                                return array.show.compare && col.active;
                            },
                            $col: col,
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
        // AGGREGATE, GROUPBY & COMPARE
        reset: function () {
            this.groups = {};
            angular.forEach(this, function (col) {
                col.reset();
            });
            return this;
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
            this.aggregation(item, row);
        },
        compare: function (row, items) {
            row = angular.copy(row);
            angular.forEach(this, function (col) {
                if (col.compare) {
                    var value = col.getters.source(row);
                    col.setters.raw(row, value);
                    col.setters.source(row, 0); // !!! _1_
                }
            });
            /*
            // !!! _1_
            angular.forEach(this, function (col) {
                if (col.compare) {
                    col.setters.source(row, 0);
                }
            });
            */
            var item = this.unique(row, items);
            this.aggregation(item, row, true);
        },
        aggregation: function (item, row, comparing) {
            angular.forEach(this, function (col) {
                if ((col.isActive() || col.always) && (comparing ? col.compare : !col.compare)) {
                    if (col.count) {
                        col.addCount(item, row);
                    } else if (comparing || col.aggregate) {
                        if (!col.hasKey(row)) {
                            if (item === row) {
                                col.initValue(item);
                            } else {
                                col.aggregation(item, row);
                            }
                        }
                    }
                }
            });
            return this;
        },
        // AGGREGATE, GROUPBY & COMPARE
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
        getGroupKey: function (item) {
            var keys = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy) {
                    keys.push(col.getters.key(item));
                }
            });
            return keys.join('-');
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
        show: {
            table: true, // defaults
        },
        // ELIMINARE
        /*
        isFilterDisabled: function (item, col, filtered) { // check if other values are disabled !! unused
            var id = item.id,
                t = this;
            var has = false,
                index = 0;
            while (index < filtered.length) {
                has = has || col.getters.key(filtered[index]) === id;
                if (has) {
                    index = filtered.length;
                } else {
                    index++;
                }
            }
            return !has;
        },
        getSortKey: function (item) {
            var values = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy) {
                    values.push(col.sort ? $parse(col.sort)(item) : col.formatValue(col.getters.raw(item)));
                }
            });
            return values.join('');
        },
        */
        toStatic: function (items) {
            var cols = [],
                rows = [],
                cell;
            //console.log('Columns.rows', 'rows', rows.length);
            angular.forEach(this, function (col) {
                col.filters.removeAll();
                col.static = {
                    active: col.isActive(),
                    headerClass: col.getHeaderClass(),
                    columnClass: col.getColumnClass(),
                    totalClass: col.getTotalClass(),
                    format: col.getFormat(),

                    id: col.id,
                    colName: col.name,
                    type: col.type,
                    groupBy: col.groupBy,
                    aggregate: col.aggregate,
                    compare: col.compare,
                    filters: col.filters,
                    order: col.order,
                };
                if (col.static.active) {
                    col.static.index = cols.length;
                    cols.push(col.static);
                }
            });
            // lasciare serve un secondo ciclo!
            angular.forEach(this, function (col) {
                if (col.static.active || col.dynamic || col.always) {
                    angular.forEach(items, function (item, i) {
                        var cell = col.toStatic(item);
                        if (col.hasSearch && col.groupBy) {
                            col.addValue(item);
                        }
                        var row = rows[i] = (rows[i] || { cols: [] });
                        cell = angular.extend(angular.copy(cell), col.static);
                        row.cols[col.static.index] = cell;
                    });
                    if (col.hasSearch && col.groupBy) {
                        col.filters.sort();
                    }
                }
            });
            // lasciare serve un terzo ciclo!
            angular.forEach(cols, function (col, index) {
                var last = rows[rows.length - 1].cols[index];
                col.$last = last;
                col.getTotalValue = function (rows) {
                    return last.getTotalValue(rows, index);
                };
                col.getTotalName = function (rows) {
                    return last.getTotalName(rows, index);
                };
            });
            // console.log('Table.toStatic', rows.length);
            return { cols: cols, rows: rows };
        },
    };
    Columns.fromDatas = function (datas) {
        return Columns.parseCols(datas);
    }
    Columns.parseCols = function getColumns(datas) {
        var cols = null;
        if (datas && datas.length) {
            cols = [];
            function parse(item, prop) {
                if (angular.isArray(item)) {
                    angular.forEach(item, function (value, key) {
                        parse(value, (prop || '') + '[' + key + ']');
                    });
                } else if (angular.isObject(item)) {
                    angular.forEach(item, function (value, key) {
                        parse(value, (prop ? prop + '.' : '') + key);
                    });
                } else {
                    var col = {
                        value: prop,
                        type: colTypes.TEXT,
                        active: cols.length < 6,
                    };
                    if (angular.isDate(item) || (angular.isNumber(item) && 
                        (prop.toLowerCase().indexOf('date') !== -1 || prop.toLowerCase().indexOf('time') !== -1)
                        )) {
                        col.type = colTypes.DATE;
                        col.groupBy = true;
                        col.hasSearch = true;
                    } else if (angular.isNumber(item)) {
                        col.type = colTypes.NUMBER;
                        col.aggregate = true;
                        col.color = 1;
                    } else {
                        col.groupBy = true;
                        col.hasSearch = true;
                    }
                    cols.push(col);
                }
            }
            parse(datas[0]);
        }
        return cols;
    };
    Columns.types = colTypes;
    return Columns;
}]);

module.factory('Table__', ['$parse', 'Columns', 'colTypes', 'orderByFilter', function ($parse, Columns, colTypes, orderByFilter) {
    var MAX_COLS_ORDERED = 4;
    function Table(cols, options) {
        this.cols = new Columns(cols).expand(options);
        this.defaults = cols.map(function (col) {
            return {
                id: col.id,
                active: col.active,
            };
        });
        this.colGroups = [{
            name: 'GroupBy',
            items: this.cols.getGroups()
        }, ];
        this.valGroups = [{
            name: 'Aggregate',
            items: this.cols.getAggregates()
        }, ];
        this.excludes = [];
        this.includes = [];
        this.setOptions(options);        
    }
    Table.prototype = {
        setDatas: function (datas, compares) {
            if (datas) {
                angular.forEach(datas, function (item, index) {
                    item.$id = index + 1;
                });
            }
            this.datas = datas;
            if (compares) {
                angular.forEach(compares, function (item, index) {
                    item.$id = index + 1;
                });
            }
            this.compares = compares;
            this.update();
        },
        setOptions: function (options) {
            var table = this;
            this.options = [{
                name: 'Columns',
                template: 'partials/report/filters/columns',
                icon: 'icon-columns',
                groups: this.colGroups,
                toggle: function(item) {
                    return table.toggleCol(item);
                },
                active: true,
            }, {
                name: 'Values',
                template: 'partials/report/filters/values',
                icon: 'icon-values',
                groups: this.valGroups,
                toggle: function(item) {
                    return table.toggleCol(item);
                },
            }, {
                name: 'Options',
                template: 'partials/report/filters/flags',
                icon: 'icon-options',
                rows: [{
                    name: 'Exclude',
                    items: this.exclude,
                    toggle: function (item) {
                        return table.exclude(item); 
                    },
                }, {
                    name: 'Include',
                    items: this.includes,
                    toggle: function (item) {
                        return table.include(item); 
                    },
                }, {
                    name: 'Flags',
                    items: [{
                        name: 'Percentuali di incidenza',
                        key: 'dynamic',
                    }],
                    toggle: function (item) {
                        return table.toggle(item.key);
                    }
                }],
            },];
        },
        update: function () {
            this.rows = [];
            var datas = this.datas;
            var rows = this.rows;
            var cols = this.cols;
            var excludes = this.excludes;
            var includes = this.includes;
            var compares = this.compares;
            cols.reset();
            // var compared = null;
            angular.forEach(datas, function (row) {
                var has = true;
                angular.forEach(excludes, function (item) {
                    if (item.active) {
                        has = has && item.filter(row);
                    }
                });
                angular.forEach(includes, function (item) {
                    if (item.active) {
                        has = has && item.filter(row);
                    }
                });
                if (has) {
                    cols.iterate(row, rows);
                }
            });
            if (compares) {
                // compared = [];
                angular.forEach(compares, function (row) {
                    var has = true;
                    angular.forEach(excludes, function (item) {
                        if (item.active) {
                            has = has && item.filter(row);
                        }
                    });
                    angular.forEach(includes, function (item) {
                        if (item.active) {
                            has = has && item.filter(row);
                        }
                    });
                    if (has) {
                        // compared.push(row);
                        cols.compare(row, rows);
                    }
                });
            }
            this.toStatic();
            if (this.after && angular.isFunction(this.after)) {
                this.after(rows);
            }
        },
        setOrderBy: function () {
            var defaults = [];
            var orders = [];
            var defaultsFiltered = [];
            var ordersFiltered = [];
            var sign;
            angular.forEach(this.cols, function (col, index) {
                if (col.static.active) {
                    if (col.order.sort !== 0) {
                        sign = (col.order.sort === -1 ? '-' : '');
                        ordersFiltered.push(sign + 'cols[' + defaults.length + '].getValue()');
                        orders.push(sign + col.raw);                        
                    }
                    defaultsFiltered.push('cols[' + defaults.length + '].getValue()');
                    defaults.push(col.raw);
                }
            });
            defaults.length = Math.min(MAX_COLS_ORDERED, defaults.length);
            defaultsFiltered.length = Math.min(3, defaultsFiltered.length);
            this.orderBy = orders.length ? orders : defaults; // null;
            this.filteredOrderBy = ordersFiltered.length ? ordersFiltered : defaultsFiltered; // null;
            // this.filtered = orderByFilter(this.filtered, this.orderBy);
            // console.log('Table.sort', 'filteredOrderBy', this.filteredOrderBy);
        },
        exclude: function (item) {
            item.active = !item.active;
            this.update();
        },
        include: function (item) {
            item.active = !item.active;
            this.update();
        },
        has: function (mode) {
            return (this.cols ? this.cols.show[mode] : null);
        },
        resetFilters: function () {
            var table = this;
            angular.forEach(table.cols, function (col, key) {
                angular.forEach(table.defaults, function (item) {
                    if (col.id === item.id) {
                        angular.isFunction(col.active) ? null : col.active = item.active;
                    }
                });
                col.filters.reset();
            });
            table.cols = table.cols.sort(function (a, b) {
                return a.id - b.id;
            });
            // table.cols.radios.workloads = 'supplier.name'; //??? default radios ???
            table.update();
        },
        doFilterStatic: function (cols) {
            var table = this; 
            var cols = table.cols, cell;
            return function (row) {
                var has = true;
                angular.forEach(table.filtered.cols, function (col, index) {
                    cell = row.cols[index];
                    cell.matches = null;
                    has = has && col.filters.filter(cell);
                });
                if (has && table.search && table.search.length) {
                    var match = false;
                    angular.forEach(row.cols, function(cell) {
                        cell.matches = new RegExp(table.search, 'gim').exec(cell.name);
                        match = match || (cell.matches !== null);
                    });
                    has = has && match;
                }
                return has;
            };
        },
        toggle: function (mode) {
            var value = null;
            if (this.cols) {
                var show = this.cols.show;
                show[mode] = !show[mode];
                switch (mode) {
                    case 'dynamic':
                        show.compare = false;
                        break;
                    case 'compare':
                        show.dynamic = false;
                        break;
                }
                value = show[mode];
            }
            this.toStatic(); //!!! nuovo
            return value;
        },
        toggleCol: function (col) {
            this.cols.toggleColumns(col);
            this.update();
        },
        toggleOrder: function (col) {
            angular.forEach(this.cols, function (item) {
                if (item.id !== col.id) {
                    item.order.set(0);
                }
            });
            col.order.toggle();
            this.setOrderBy();
        },
        swap: function (from, to) {
            // console.log('Table.swap', 'from', from, 'to', to);
            from = this.cols[this.filtered.cols.indexOf(from)];
            to = this.cols[this.filtered.cols.indexOf(to)];
            var index = this.cols.indexOf(from);
            var item = this.cols[index];
            this.cols.splice(index, 1);
            index = this.cols.indexOf(to);
            this.cols.splice(index, 0, item);
            this.update();
        },
        // ELIMINARE
        /*
        doFilterColumns: function (cols) {
            return function (col) {
                return col.isActive(); // col.dynamic ? (cols.show.dynamic && col.active()) : col.active;
            };
        },
        doFilterMultiple: function (cols) {
            // table.update(); // doing regroup
            return function (item) {
                var has = true;
                angular.forEach(cols, function (col) {
                    has = has && col.filter(item);
                });
                return has;
            };
        },
        doFilter: function (cols) {
            // this.update(); // doing regroup
            return function (item) {
                var has = true;
                angular.forEach(cols, function (col) {
                    if (col.isActive() && col.filters && col.filters.id !== 0) {
                        has = has && col.getters.key(item) === col.filters.id;
                    }
                }.bind(this));
                return has;
            };
        },
        getRowClass: function (item) {
            return ''; // item.status ? 'status-' + Appearance.negotiationClass(item.status.id) : '';
        },
        onOpen: function (item) {
            console.log('onOpen', item);
        },
        */
        toStatic: function () {
            this.filtered = this.cols.toStatic(this.rows);
            // this.filtered = this.rows.slice();
            this.setOrderBy();
        },
        toJson: function (data) {
            var json = {
                name: 'Repotable',
                description: 'a view of selected datas', // + $filter('date')(filters.dateFrom, 'dd MMM yyyy') + ' al ' + $filter('date')(filters.dateTo, 'dd MMM yyyy'),
            };
            data ? angular.extend(json, data) : null;
            json.columns = [];
            json.rows = [];
            if (this.filtered && this.filtered.rows.length) {
                var cols = this.filtered.cols;
                var rows = this.filtered.rows;
                angular.forEach(cols, function (col, index) {
                    json.columns.push({
                        index: index,
                        name: col.colName,
                        format: col.format,
                    });
                });
                angular.forEach(rows, function (row, index) {
                    var item = [];
                    angular.forEach(cols, function (col, index) {
                        var cell = row.cols[index];
                        item[index] = cell.getValue();
                        switch (col.type) {
                            case colTypes.PERCENT:
                            case colTypes.GAIN:
                                item[index] /= 100;
                                break;
                        }
                    });
                    json.rows.push(item);
                });
                var item = [];
                angular.forEach(cols, function (col, index) {
                    if (col.aggregate) {
                        item[index] = col.getTotalValue();
                        switch (col.type) {
                            case colTypes.PERCENT:
                            case colTypes.GAIN:
                                item[index] /= 100;
                                break;
                        }
                    } else {
                        item[index] = null;
                    }
                });
                json.rows.push(item);
            }
            return json;
        },
    };
    Table.fromDatas = function (datas) {
        if (!angular.isArray(datas) || !datas.length > 1 || !angular.isObject(datas[0])) {
            angular.forEach(datas, function (data) {
                if (angular.isArray(data) && data.length && angular.isObject(data[0])) {
                    datas = data;
                }
            });
        }
        if (!angular.isArray(datas)) {
            datas = [datas];
        }
        var cols = Columns.fromDatas(datas);
        var table = new Table(cols);
        table.setDatas(datas);
        return table;
    };
    return Table;
}]);







module.service('Droppables', ['ElementRect', function(ElementRect) {
    this.natives = [];
    this.callbacks = [];
    this.rects = [];
    this.add = function(nativeElement, callback) {
        this.natives.push(nativeElement);
        this.callbacks.push(callback || function() {});
        this.rects.push(ElementRect.fromNative(nativeElement));
    };
    this.remove = function(nativeElement) {
        var index = this.natives.indexOf(nativeElement);
        if (index !== -1) {
            this.natives.splice(index, 1);
            this.callbacks.splice(index, 1);
            this.rects.splice(index, 1);
        }
    };
    this.getIntersections = function(item) {
        var intersections = [],
            element;
        angular.forEach(this.rects, function(rect, index) {
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
        intersections.sort(function(a, b) {
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

})(window, window.angular);

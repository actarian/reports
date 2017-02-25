﻿/* global angular, module */

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

module.filter('groupBy', ['$parse', 'filterWatcher', function ($parse, filterWatcher) {
    function _groupBy(collection, getter) {
        var dict = {};
        var key;
        angular.forEach(collection, function (item) {
            key = getter(item);
            if (!dict[key]) {
                dict[key] = [];
            }
            dict[key].push(item);
        });
        return dict;
    }
    return function (collection, property) {
        if (!angular.isObject(collection) || angular.isUndefined(property)) {
            return collection;
        }
        return filterWatcher.isMemoized('groupBy', arguments) || filterWatcher.memoize('groupBy', arguments, this, _groupBy(collection, $parse(property)));        
    }
}]);

module.provider('filterWatcher', function () {
    function isNull(value) {
        return value === null;
    }
    function isScope(obj) {
        return obj && obj.$evalAsync && obj.$watch;
    }
    this.$get = ['$window', '$rootScope', function ($window, $rootScope) {
        var $$cache = {};
        var $$listeners = {};
        var $$timeout = $window.setTimeout;
        function getHashKey(fName, args) {
            function replacerFactory() {
                var cache = [];
                return function (key, val) {
                    if (angular.isObject(val) && !isNull(val)) {
                        if (~cache.indexOf(val)) {
                            return '[Circular]';
                        }
                        cache.push(val);
                    }
                    if ($window == val) return '$WINDOW';
                    if ($window.document == val) return '$DOCUMENT';
                    if (isScope(val)) return '$SCOPE';
                    return val;
                }
            }
            return [fName, JSON.stringify(args, replacerFactory())]
              .join('#')
              .replace(/"/g, '');
        }
        function removeCache(event) {
            var id = event.targetScope.$id;
            angular.forEach($$listeners[id], function (key) {
                delete $$cache[key];
            });
            delete $$listeners[id];
        }
        function cleanStateless() {
            $$timeout(function () {
                if (!$rootScope.$$phase) {
                    $$cache = {};
                }
            }, 2000);
        }
        function addListener(scope, hashKey) {
            var id = scope.$id;
            if (angular.isUndefined($$listeners[id])) {
                scope.$on('$destroy', removeCache);
                $$listeners[id] = [];
            }
            return $$listeners[id].push(hashKey);
        }
        function $$isMemoized(filterName, args) {
            var hashKey = getHashKey(filterName, args);
            return $$cache[hashKey];
        }
        function $$memoize(filterName, args, scope, result) {
            var hashKey = getHashKey(filterName, args);
            //store result in `$$cache` container
            $$cache[hashKey] = result;
            // for angular versions that less than 1.3
            // add to `$destroy` listener, a cleaner callback
            if (isScope(scope)) {
                addListener(scope, hashKey);
            } else {
                cleanStateless();
            }
            return result;
        }
        return {
            isMemoized: $$isMemoized,
            memoize: $$memoize
        }
    }];
});

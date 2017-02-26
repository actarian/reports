/* global angular, module */

module.factory('DataFilter', ['$filter', function ($filter) {
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

module.factory('DataSource', ['$q', '$http', '$rootScope', '$location', 'State', 'DataFilter', function ($q, $http, $rootScope, $location, State, DataFilter) {
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
            this.deferred.reject(error);
            this.deferred = null;
            this.state.error(error);
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

module.factory('Column', ['$parse', '$filter', 'Utils', 'colTypes', function ($parse, $filter, Utils, colTypes) {        
    function Column(data) {
        data ? angular.extend(this, data) : null;
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

module.factory('Columns', ['$parse', 'Utils', 'Column', 'colTypes', function ($parse, Utils, Column, colTypes) {
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
    Columns.fromDatas = function (datas) {
        return Columns.parseCols(datas);
    }
    Columns.parseCols = function getColumns(datas) {
        var cols = null;
        if (datas && datas.length) {
            cols = [];
            function parse(item, prop) {
                if (angular.isArray(item)) {
                    angular.forEach(item, function(value, key) {
                        parse(value, (prop || '') + '[' + key + ']');
                    });
                } else if (angular.isObject(item)) {
                    angular.forEach(item, function(value, key) {
                        parse(value, (prop ? prop + '.' : '') + key);
                    });
                } else {
                    /*
                    ID: 1,
                    DATE: 4,
                    STATUS: 7,
                    NUMBER: 10,
                    PERCENT: 13,
                    DOUBLE: 20,
                    */
                    var col = {
                        value: prop,
                        type: colTypes.TEXT,
                        active: cols.length < 3,
                    };
                    if (angular.isNumber(item)) {
                        col.type = colTypes.NUMBER;
                        col.aggregate = true;
                        col.color = 1;
                    } else if (angular.isDate(item)) {
                        col.type = colTypes.DATE;
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
    return Columns;
}]);

module.factory('Table', ['$parse', 'Columns', 'Column', 'colTypes', function ($parse, Columns, Column, colTypes) {
    function Table(cols) {
        this.cols = new Columns(cols).expand({ dynamic: true, compare: false });
        this.cols.showReport = true;
        this.defaults = cols.map(function (col) { 
            return { 
                id: col.id, 
                active: col.active,
            };
        });
        this.colGroups = [{
            name: 'GroupBy',
            cols: this.cols.getGroups()
        }, ];
        this.valGroups = [{
            name: 'Aggregate',
            cols: this.cols.getAggregates()
        }];
        this.excludes = [];
        this.includes = [];
        /*
        this.excludes = [{
            name: 'Monte ore / tutti i reparti', filter: function (row) {
                return !(row.supplier.id === 15143);
            }, active: true,
        }, ];
        */
    }
    Table.prototype = {
        groupBy: function (datas, compares) {
            // console.log(datas, compares);
            var rows = this.rows;
            var cols = this.cols;
            var excludes = this.excludes;
            var includes = this.includes;
            cols.reset();
            var compared = null;
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
                compared = [];
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
                        compared.push(row);
                        cols.compare(row, rows);
                    }
                });
            }
            cols.makeStatic(rows);
            // $scope.groupChart();
        },
        update: function() {
            this.rows = [];
            this.groupBy(this.datas);
        },
        setDatas: function(datas) {
            this.datas = datas;
            this.update ();
        },

        resetFilters: function () {
            var table = this;
            angular.forEach(table.cols, function (col, key) {
                angular.forEach(table.defaults, function (item) {
                    if (col.id === item.id) {
                        angular.isFunction(col.active) ? null : col.active = item.active;
                    }
                });
                col.search = null;
            });
            table.cols = table.cols.sort(function (a, b) {
                return a.id - b.id;
            });
            // table.cols.radios.workloads = 'supplier.name';
            table.update();
        },
        exclude: function (item) {
            item.active = !item.active;
            this.update();
        },
        include: function (item) {
            item.active = !item.active;
            this.update();
        },
        toggleCol: function (col) {
            this.cols.toggleColumns(col);
            this.update();
        },
        doFilter: function (cols) {
            // this.update(); // doing regroup
            return function (item) {
                var has = true;
                angular.forEach(cols, function (col) {
                    if (col.isActive() && col.search && col.search.id !== 0) {
                        has = has && col.getKey(item) === col.search.id;
                    }
                }.bind(this));
                return has;
            };
        },
        doFilterMultiple: function (cols) {
            // table.update(); // doing regroup
            return function (item) {
                var has = true;
                angular.forEach(cols, function (col) {
                    if (col.isActive() && col.search.length) {
                        has = has && col.search.indexOf(col.getKey(item)) != -1;
                    }
                }.bind(this));
                return has;
            };
        },
        doFilterColumns: function (cols) {
            return function (col) {
                return col.isActive(); // col.dynamic ? (cols.showDynamics && col.active()) : col.active;
            };
        },
        doOrder: function (cols) {
            return function (item) {
                return cols.getSortKey(item);
            };
        },
        getRowClass: function (item) {
            return ''; // item.status ? 'status-' + Appearance.negotiationClass(item.status.id) : '';
        },
        onOpen: function (item) {
            console.log('onOpen', item);
        },
        
    };
    Table.fromDatas = function(datas) {
        var cols = Columns.fromDatas(datas);
        return new Table(cols);
    };
    return Table;
}]);

module.factory('ChartData', ['$filter', function ($filter) {
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

module.service('Droppables', ['ElementRect', function (ElementRect) {
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

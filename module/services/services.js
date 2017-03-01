/* global angular, module */

module.factory('Column', ['$parse', '$filter', 'Utils', 'colTypes', function ($parse, $filter, Utils, colTypes) {
    var totalTypes = {
        SUM: 1,
        MIN: 2,
        MAX: 3,
        AVG: 4,
    }
    function Column(data) {
        this.typeTotal = this.typeTotal || totalTypes.SUM;
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
            var a = (this.getters.raw(item) || 0);
            var b = (this.getters.value(row) || 0);
            switch (this.typeTotal) {
                case totalTypes.MIN:
                    this.setters.raw(item, Math.min(a, b));
                    break;
                case totalTypes.MAX:
                    this.setters.raw(item, Math.max(a, b));
                    break;
                case totalTypes.AVG:
                    var n = 0;
                    this.setters.raw(item, (b + (a * n)) / (n + 1)); // (newVal + (avg * n)) / (n+1)
                    break;
                default:
                    this.setters.raw(item, a + b);
            }
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
                switch (this.typeTotal) {
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
                    var b = (this.getRaw(item) || 0);
                    switch (this.typeTotal) {
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
                }.bind(this));
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
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
                case colTypes.DATE:
                    value = $filter('date')(value, 'yyyy-MM-dd');
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
        show: {
            table: true, // defaults
        },
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
                                return array.show.dynamic && col.active;
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
                                return array.show.compare && col.active;
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
                                return array.show.compare && col.active;
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
                if (col.static.active || col.dynamic || col.always) {
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
                if ((col.isActive() || col.always) && (comparing ? col.compare : !col.compare)) {
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
            while (index < filtered.length) {
                has = has || col.getKey(filtered[index]) === id;
                if (has) {
                    index = filtered.length;
                } else {
                    index++;
                }
            }
            return !has;
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
    Columns.types = colTypes;
    return Columns;
}]);

module.factory('Table', ['$parse', 'Columns', 'colTypes', function ($parse, Columns, colTypes) {
    function Table(cols) {
        this.cols = new Columns(cols).expand({ dynamic: true, compare: false });
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
        }, ];
        this.excludes = [];
        this.includes = [];
    }
    Table.prototype = {
        setDatas: function (datas, compares) {
            this.datas = datas;
            this.compares = compares;
            this.update();
        },
        update: function () {
            this.rows = [];
            this.groupBy(this.datas);
        },
        groupBy: function (datas) {
            var rows = this.rows;
            var cols = this.cols;
            var excludes = this.excludes;
            var includes = this.includes;
            var compares = this.compares;
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
            if (this.after && angular.isFunction(this.after)) {
                this.after(rows);
            }
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
            // table.cols.radios.workloads = 'supplier.name'; //??? default radios ???
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
                return col.isActive(); // col.dynamic ? (cols.show.dynamic && col.active()) : col.active;
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
            return value;
        },
        has: function (mode) {
            return (this.cols ? this.cols.show[mode] : null);
        },
    };
    Table.fromDatas = function (datas) {
        if (!angular.isArray(datas) || !datas.length > 1) {
            angular.forEach(datas, function (data) {
                if (angular.isArray(data)) {
                    datas = data;
                }
            });
        }
        if (!angular.isArray(datas)) {
            datas = [datas];
        }
        var cols = Columns.fromDatas(datas);
        return new Table(cols);
    };
    return Table;
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

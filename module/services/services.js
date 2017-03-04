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

module.factory('Column', ['$parse', '$filter', 'Utils', 'Filters', 'Order', 'colTypes', function ($parse, $filter, Utils, Filters, Order, colTypes) {
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
            var key = this.getKey(item);
            if (!this.filters.has(key)) {
                var value = this.getRaw(item);
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
                return this.formatValue(this.getRaw(item));
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
                case colTypes.INCREMENT:
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
            if (col.compare && col.type === colTypes.INCREMENT) {
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
                case colTypes.INCREMENT:
                    cc.push('text-xs-right');
                    break;
            }
            return cc.join(' ');
        },
        getCellTotal: function (rows, index) {
            var value = 0, col = this, cell;
            if (col.compare && col.type === colTypes.INCREMENT) {
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
                key: col.getKey(item),
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
                            type: colTypes.INCREMENT, // col.type, // 
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
                    keys.push(col.getKey(item));
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
        isFilterDisabled: function (item, col, filtered) { // check if other values are disabled !! unused
            var id = item.id,
                t = this;
            var has = false,
                index = 0;
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
        show: {
            table: true, // defaults
        },
        // ELIMINARE
        /*
        getSortKey: function (item) {
            var values = [];
            angular.forEach(this, function (col) {
                if (col.isActive() && col.groupBy) {
                    values.push(col.sort ? $parse(col.sort)(item) : col.formatValue(col.getRaw(item)));
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

module.factory('Table', ['$parse', 'Columns', 'colTypes', 'orderByFilter', function ($parse, Columns, colTypes, orderByFilter) {
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
                        has = has && col.getKey(item) === col.filters.id;
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
                            case colTypes.INCREMENT:
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
                            case colTypes.INCREMENT:
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
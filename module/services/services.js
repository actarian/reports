/* global angular, module */

// REPORTS

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
        clear: function () {
            var filters = this;
            angular.forEach(this.values, function (item) {
                filters.off(item);
            });
        },
        on: function (item) {
            item.active = this.flags[item.id] = true;
            this.search.push(item.id);
        },
        off: function (item) {
            item.active = this.flags[item.id] = false;
            var index = this.search.indexOf(item.id);
            this.search.splice(index, 1);
        },
        toggle: function (item) {
            if (this.active(item.id)) {
                this.off(item);
            } else {
                this.on(item);
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

module.factory('Order', ['repoLocale', function (repoLocale) {
    function Order() {
        this.set(0);
    }
    Order.prototype = {
        set: function (sort) {
            switch (sort) {
                case 1:
                    this.name = repoLocale.asc;
                    this.sort = 1;
                    this.asc = true;
                    this.desc = false;
                    break;
                case -1:
                    this.name = repoLocale.desc;
                    this.sort = -1;
                    this.asc = false;
                    this.desc = true;
                    break;
                default:
                    this.name = repoLocale.order;
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
        // AGGREGATE
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
                var value = this.formatValue(this.getters.raw(item));
                var active = this.filters.flags[key];
                this.filters.add({
                    id: key,
                    name: value || '-',
                    active: active,
                });
            }
        },
        // METHODS
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
        // FORMATTING
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
        // TOTALS
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
                    /*
                    // MEDIA PONDERATA
                    // Here's a functional approach, requiring ES5:
                    var w = a.unzip(3).map(function(v, i, a) {
                        var weight = v[0] * v[1];
                        var sum = weight * v[2];
                        return [sum, weight];
                    }).reduce(function(p, c, i, a) {
                        return [p[0] + c[0], p[1] + c[1]];
                    }, [0, 0]);
                    var aw = w[0] / w[1];
                    // which in pseudo-code is:
                    // split the array into chunks of three
                    // convert each three [p1, p2, x ] into a pair [ p1 * p2 * x , p1 * p2 ]
                    // sum the pairs (along the array, not within each pair)
                    // divide one by the other
                    // and where the (non-standard) unzip function which chunks the array is:
                    Object.defineProperty(Array.prototype, 'unzip', {
                        value: function(n) {
                            n = n || 2;
                            return this.reduce(function(p, c, i, a) {
                                if (i % n === 0) {
                                    p.push(a.slice(i, i + n));
                                }
                                return p;
                            }, []);
                        }
                    });
                    */
                });
                (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) ? value = 0 : null;
            }
            field.total = value;
            return value;
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
        // STYLES
        getHeaderClass: function () {
            return this.groupBy ? '' : 'text-right';
            /*
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
                    cc.push('text-right');
                    break;
            }
            */
            /*
            var columnClass = this.getColumnClass();
            if (columnClass != '') {
                cc.push(columnClass);
            }
            */
            // return cc.join(' ');
        },
        getColumnClass: function () {
            return this.color ? 'shade-light-blue-' + this.color : '';
        },
        getCellClass: function (item) {
            var field = this;
            var cc = [];
            angular.forEach(field, function (value, key) {
                if (value === true) {
                    cc.push(key);
                }
            });
            field.groupBy ? null : cc.push('text-right');
            angular.forEach(fieldTypes, function (value, key) {
                if (value === field.type) {
                    cc.push('cell-' + key.toLowerCase());
                }
            });
            switch (field.type) {
                case fieldTypes.LINK:
                    cc.push('text-underline');
                    break;
                    /*
                case fieldTypes.NUMBER:
                case fieldTypes.DOUBLE:
                case fieldTypes.WEEKS:
                case fieldTypes.HOURS:
                case fieldTypes.COSTS:
                    cc.push('text-right');
                    break;
                case fieldTypes.PERCENT:
                    cc.push('text-right');
                    break;
                case fieldTypes.GAIN:
                    cc.push('text-right');
                    break;
                    */
            }
            return cc.join(' ');
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
                    cc.push('text-right');
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
        // STATIC
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
                            name: field.name + ' anno precedente',
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
                var last = rows.length ? (rows[rows.length - 1].cols[index]) : null;
                field.$last = last;
                field.getTotalValue = function (rows) {
                    return this.$last ? this.$last.getTotalValue(rows, index) : null;
                };
                field.getTotalName = function (rows) {
                    return this.$last ? this.$last.getTotalName(rows, index) : null;
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
                        if (angular.isString(item) && item.indexOf('http') === 0) {
                            field.type = fieldTypes.LINK;
                        }
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

module.factory('Table', ['$parse', '$filter', 'Fields', 'fieldTypes', 'fieldTotalTypes', 'repoLocale', function ($parse, $filter, Fields, fieldTypes, fieldTotalTypes, repoLocale) {
    var MAX_FIELDS_ORDERED = 4;
    function Table(fields, options) {
        this.fields = new Fields(fields).expand(options);
        this.defaults = fields.map(function (field) {
            return {
                $id: field.$id,
                active: field.active,
            };
        });
        this.groupables = [{
            name: repoLocale.groupBy,
            items: this.fields.getGroups()
        }, ];
        this.aggregables = [{
            name: repoLocale.aggregate,
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
        this.locale = repoLocale;
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
                name: repoLocale.columns,
                icon: 'icon-columns',
                groups: this.groupables,
                toggle: function (item) {
                    return table.toggleField(item);
                },
                active: true,
            }, {
                name: repoLocale.values,
                icon: 'icon-values',
                groups: this.aggregables,
                toggle: function (item) {
                    return table.toggleField(item);
                },
            }, {
                name: repoLocale.options,
                icon: 'icon-options',
                groups: [{
                    name: repoLocale.exclude,
                    items: this.excludes,
                    toggle: function (item) {
                        return table.exclude(item);
                    },
                }, {
                    name: repoLocale.include,
                    items: this.includes,
                    toggle: function (item) {
                        return table.include(item);
                    },
                }, {
                    name: repoLocale.flags,
                    items: [{
                        name: repoLocale.incidence,
                        key: 'dynamic',
                    }],
                    toggle: function (item) {
                        return table.toggle(item.key);
                    }
                }],
            }, ];
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
        active: function (item) {
            if (this.fields && this.fields.indexOf(item) !== -1) {
                return item.isActive();
            } else if (this.excludes.indexOf(item) !== -1 || this.includes.indexOf(item) !== -1) {
                return item.active;
            } else {
                return this.has(item.key);
            }
        },
        has: function (key) {
            return (this.fields ? this.fields.show[key] : null);
        },
        set: function (key, value) {
            if (this.fields) {
                this.fields.show[key] = value;
            }
            return this;
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
        hasRow: function (row) {
            var table = this, cell;
            var has = true;
            angular.forEach(table.cols, function (col, index) {
                cell = row.cols[index];
                cell.matches = null;
                has = has && col.filters.filter(cell);
            });
            // SPOSTARE RICERCA SEARCH OBJECT
            if (has && table.search && table.search.length) {
                var match = false;
                angular.forEach(row.cols, function (cell) {
                    cell.matches = new RegExp(table.search, 'gim').exec(cell.name);
                    match = match || (cell.matches !== null);
                });
                has = has && match;
            }
            return has;
        },
        doFilterStatic: function (cols) {
            var table = this;
            var fields = table.fields, cell;
            return function (row) {
                return table.hasRow(row);
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
            angular.forEach(this.fields, function (field) {
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
                this.after(table.items);
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
                var filteredRows = [];
                angular.forEach(cols, function (col, index) {
                    json.columns.push({
                        index: index,
                        name: col.colName,
                        format: col.format,
                    });
                });
                angular.forEach(rows, function (row, index) {
                    if (table.hasRow(row)) {
                        filteredRows.push(row);
                    }
                });
                filteredRows = $filter('orderBy')(filteredRows, table.filteredOrderBy);
                angular.forEach(filteredRows, function (row, index) {
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
                        item[index] = col.getTotalValue(filteredRows);
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
    Table.types = fieldTypes;
    Table.totalTypes = fieldTotalTypes;
    return Table;
}]);

// REPORTS

module.value('repoLocale', {
    report: 'Report',
    groupBy: 'GroupBy',
    aggregate: 'Aggregate',
    columns: 'Columns',
    values: 'Values',
    options: 'Options',
    exclude: 'Exclude',
    include: 'Include',
    flags: 'Flags',
    incidence: 'Incidence',
    filter: 'Filter',
    order: 'Order',
    desc: 'Desc',
    asc: 'Asc',
    reset: 'Reset',
    no_results: 'no results',
});

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

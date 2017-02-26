﻿/* global angular, app */

app.controller('RootCtrl', ['$scope', '$location', '$timeout', '$http', '$templateCache', '$compile', '$window', 'Appearance', function ($scope, $location, $timeout, $http, $templateCache, $compile, $window, Appearance) {

    $scope.appearance = Appearance;

    $scope.stop = function ($event) {
        $event.stopImmediatePropagation();
        return true;
    };
    $scope.goBack = function () {
        $window.history.back();
    };

}]);

app.controller('TableCtrl', ['$scope', function ($scope) {

    $scope.init = function (source) {
        $scope.source = source;
        $scope.state = $scope.source.state;
        $scope.source.paging();
    };

}]);

app.controller('DemoCtrl', ['$scope', '$filter', '$location', '$http', '$q', 'State', 'Utils', 'Appearance', 'DataFilter', 'DataSource', 'Table', 'Columns', 'Range', 'ChartData', 'colTypes', function ($scope, $filter, $location, $http, $q, State, Utils, Appearance, DataFilter, DataSource, Table, Columns, Range, ChartData, colTypes) {
    var state = $scope.state = new State();

    var tabs = $scope.tabs = [{
        id: 1,
        name: 'Columns',
        template: 'partials/report/filters/columns',
        icon: 'icon-time',
    }, {
        id: 2,
        name: 'Values',
        template: 'partials/report/filters/values',
        icon: 'icon-time',
    }, {
        id: 3,
        name: 'Options',
        template: 'partials/report/filters/flags',
        icon: 'icon-time',
    },];
    tabs.show = true;
    tabs.id = 1;

    function CountryCols(){
        return [{
            name: 'region', value: 'region', key: 'region', type: colTypes.TEXT, active: true, hasSearch: true, groupBy: true,
        }, {
            name: 'name', value: 'name', key: 'name', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'country',
        }, {
            name: 'capital', value: 'capital', key: 'name', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'country',
        }, {
            name: 'language', value: 'languages[0].name', key: 'languages[0].name', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'country',
        }, {
            name: 'currency', value: 'currencies[0].name', key: 'currencies[0].name', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'country',
        }, {
            name: 'alpha2Code', value: 'alpha2Code', key: 'name', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'country',
        }, {
            name: 'lat', value: 'latlng[0]', key: 'name', type: colTypes.NUMBER, active: false, groupBy: true, color: 1,
        }, {
            name: 'lng', value: 'latlng[1]', key: 'name', type: colTypes.NUMBER, active: false, groupBy: true, color: 1,
        }, {
            name: 'area', value: 'area', key: 'name', type: colTypes.NUMBER, active: true, aggregate: true, color: 2,
        }, {
            name: 'population', value: 'population', key: 'name', type: colTypes.NUMBER, active: true, aggregate: true, color: 3,
        }, {
            name: 'abitante * km2', value: 'population / area', key: 'name', type: colTypes.NUMBER, active: true, aggregate: true, color: 4,
        }, ];
        /*
        alpha2Code: "AF"
        alpha3Code: "AFG"
        altSpellings: Array[2]
        area: 652230
        borders: Array[6]
        callingCodes: Array[1]
        capital: "Kabul"
        currencies: Array[1]
        demonym: "Afghan"
        gini: 27.8
        languages: Array[3]
        latlng: Array[2]
        name: "Afghanistan"
        nativeName: "افغانستان"
        numericCode: "004"
        population: 27657145
        region: "Asia"
        timezones: Array[1]
        topLevelDomain: Array[1]
        translations: Object
        */
    }
    function GitCols(){
        return [{
            name: 'owner', value: 'owner.login', key: 'owner.id', type: colTypes.TEXT, active: true, hasSearch: true, groupBy: true, radio: 'git',
        }, {
            name: 'name', value: 'name', key: 'id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'git',
        }, {
            name: 'description', value: 'description', key: 'id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'git',
        }, {
            name: 'count', value: 'count', key: 'id', type: colTypes.NUMBER, active: false, count: true, aggregate: true,
        }, {
            name: 'size', value: 'size', key: 'orderRecord.id', type: colTypes.NUMBER, active: true, aggregate: true, color: 1,
        }, {
            name: 'stargazers_count', value: 'stargazers_count', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true, color: 2,
        }, {
            name: 'watchers_count', value: 'watchers_count', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true, color: 3,
        }, {
            name: 'score', value: 'score', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true, color: 4,
        }, {
            name: 'A = score * 2', value: 'score * 2', raw: 'A', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
        }, {
            name: 'B = A * 3', value: 'A * 3', raw: 'B', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
        }, {
            name: 'C = B / A', value: 'B / A', raw: 'C', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
        }]
    }

/*
    var filters = $scope.filters = new DataFilter();

    var compares;
    var source = $scope.source = new DataSource({
        unpaged: true,
        uri: function () {
            return 'api/restcountries.all.js';
            return 'https://restcountries.eu/rest/v2/all';
            return 'https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100';
        },
        filters: filters,
        resolveItems: function (items, rows, comparing) {
            // items = items.items;
            angular.forEach(items, function (item, index) {
                item.id = this.id;
                var date = new Date(item.created_at);
                if (comparing) {
                    date = new Date(date.setFullYear(date.getFullYear() + 1));
                }
                item.dt = date;
                item.dt.setDate(1);
                item.dt.setHours(0, 0, 0, 0);
                item.dt = item.dt.getTime();
                item.month = $filter('date')(date, '(yyyy MM) MMMM');
                item.monthShort = $filter('date')(date, 'MMM yy');
                rows.push(item);
                this.id++;
                rows.push(item);
            }, this);
            return rows;
        },
        resolve: function (deferred) {
            compares = null;
            this.id = 1;
            this.resolveItems(this.response.data, this.rows);
            deferred.resolve();
        },
        group: function (deferred) {
            if (table.cols.showComparison) {
                if (compares) {
                    GroupColumns(this.rows, this.items, compares);
                    deferred.resolve();
                } else {
                    // loadAndParseCompares
                    var from = new Date(filters.dateFrom.getTime());
                    var to = new Date(filters.dateTo.getTime());
                    var params = {
                        dateFrom: new Date(from.setFullYear(from.getFullYear() - 1)),
                        dateTo: new Date(to.setFullYear(to.getFullYear() - 1)),
                    };
                    Api.reports.negotiations(params).then(function success(response) {
                        compares = this.resolveItems(response, [], true);
                        GroupColumns(this.rows, this.items, compares);
                        deferred.resolve();
                    }.bind(this));
                }
            } else {
                GroupColumns(this.rows, this.items);
                deferred.resolve();
            }
        },
        search: function (datasource) {
            // console.log('search', datasource.items, datasource.filters);
        },
        sort: function (datasource) {
            // console.log('sort', datasource.items, datasource.filters);
        },
    });
*/


    var table;

    // var cols, defaults, colGroups, valGroups, excludes, includes, ranges;
    function onDatas(datas) {
        if (!table) {
            table = $scope.table = Table.fromDatas(datas);
        }
        table.setDatas(datas);
        /*
        if (!cols) {
            cols = Columns.fromDatas(datas);
            cols = new Columns(CountryCols());
            cols = $scope.cols = cols.expand({ dynamic: true, compare: false });
            cols.showReport = true;
            defaults = cols.map(function (col) { 
                return { 
                    id: col.id, 
                    active: col.active,
                };
            });
            colGroups = $scope.colGroups = [{
                name: 'GroupBy',
                cols: cols.getGroups()
            }, ];
            valGroups = $scope.valGroups = [{
                name: 'Aggregate',
                cols: cols.getAggregates()
            }];
            excludes = $scope.excludes = [{
                name: 'Monte ore / tutti i reparti', filter: function (row) {
                    return !(row.supplier.id === 15143);
                }, active: true,
            }, ];
            includes = $scope.includes = [];
            ranges = $scope.ranges = [
                new Range().currentQuarter().set(filters),
                new Range().currentSemester(),
                new Range().currentYear(),
            ];
        } else {
            // do update
        }
        */
    }

    if (state.busy()) {
        var uri = 'api/restcountries.all.js';
        // var uri = 'https://restcountries.eu/rest/v2/all';
        // var uri = 'https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100';
        $http.get(uri).then(function success(response) {
            var datas = response.data;
            // var datas = response.data.items;
            onDatas(datas);
            state.ready();
        }, function(response) {
            state.error(response);
        });
    }    






















    $scope.setRangeDiff = function (diff) {
        angular.forEach(ranges, function (range) {
            if (range.is(filters)) {
                range.setDiff(diff);
                range.set(filters, source);
            }
        });
    };
    $scope.resetFilters = function () {
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
    };
    $scope.exclude = function (item) {
        item.active = !item.active;
        table.update();
    };
    $scope.include = function (item) {
        item.active = !item.active;
        table.update();
    };
    $scope.toggleCol = function (col) {
        table.cols.toggleColumns(col);
        table.update();
    };
    $scope.doFilter = function (cols) {
        // table.update(); // doing regroup
        return function (item) {
            var has = true;
            angular.forEach(cols, function (col) {
                if (col.isActive() && col.search && col.search.id !== 0) {
                    has = has && col.getKey(item) === col.search.id;
                }
            }.bind(this));
            return has;
        };
    };
    $scope.doFilterMultiple = function (cols) {
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
    };
    $scope.doFilterColumns = function (cols) {
        return function (col) {
            return col.isActive(); // col.dynamic ? (cols.showDynamics && col.active()) : col.active;
        };
    };
    $scope.doOrder = function (cols) {
        return function (item) {
            return cols.getSortKey(item);
        };
    };
    $scope.getRowClass = function (item) {
        return ''; // item.status ? 'status-' + Appearance.negotiationClass(item.status.id) : '';
    };
    $scope.onOpen = function (item) {
        $location.path('/trattative/' + item.id);
    };
    $scope.excel = function (columns, rows) {
        console.log('excel', columns, rows);
        var json = {
            name: 'Report carichi di lavoro',
            description: 'Report carichi di lavoro', // + $filter('date')(filters.dateFrom, 'dd MMM yyyy') + ' al ' + $filter('date')(filters.dateTo, 'dd MMM yyyy'),
            columns: [],
            rows: [],
        };
        angular.forEach(columns, function (col, index) {
            json.columns.push({
                index: index,
                name: col.name,
                format: col.getFormat(),
            });
        });
        angular.forEach(rows, function (row, index) {
            var item = [];
            angular.forEach(columns, function (col, index) {
                item[index] = col.getValue(row);
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
        angular.forEach(columns, function (col, index) {
            if (col.aggregate) {
                item[index] = col.getValueTotal(rows);
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
        Api.app.exportExcel(json).then(function success(response) {
            var headers = response.headers();
            // console.log(response);
            var blob = new Blob([response.data], { type: headers['content-type'] });
            var windowUrl = (window.URL || window.webkitURL);
            var downloadUrl = windowUrl.createObjectURL(blob);
            var anchor = document.createElement("a");
            anchor.href = downloadUrl;
            var fileNamePattern = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            anchor.download = fileNamePattern.exec(headers['content-disposition'])[1];
            document.body.appendChild(anchor);
            anchor.click();
            windowUrl.revokeObjectURL(blob);
            anchor.remove();
            /*
            //Dispatching click event.
            if (document.createEvent) {
                var e = document.createEvent('MouseEvents');
                e.initEvent('click', true, true);
                link.dispatchEvent(e);
                return true;
            }
             */
            return;

        }, function error(response) {
            state.error(response);
        });
    };
    $scope.$on('onDropItem', function (scope, event) {
        // console.log('NegotiationReportCtrl.onDropItem', 'from', event.from, 'to', event.to);
        var fromIndex = table.cols.indexOf(event.from.model);
        var toIndex = table.cols.indexOf(event.to.model);
        var item = table.cols[fromIndex];
        table.cols.splice(fromIndex, 1);
        table.cols.splice(toIndex, 0, item);
    });
    $scope.$on('onDropOut', function (scope, event) {
        // console.log('NegotiationReportCtrl.onDropOut', event.model, event.from, event.to, event.target);
    });

}]);

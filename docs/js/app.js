/* global angular */

"use strict";

var app = angular.module('app', ['ngSanitize', 'ngRoute', 'ngMessages']); //, 'ngSilent', 'ui.bootstrap', 'relativeDate', 'ngFileUpload', 'textAngular', 'uiSwitch', 'rzModule', 'ngJsonExplorer', 'chart.js']);

app.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    
    $routeProvider.when('/test', {
        title: 'Test',
        templateUrl: 'partials/test.html',
        controller: 'TestCtrl',

    }).when('/404', {
        title: 'Error 404',
        templateUrl: 'partials/404.html',
    });

    $routeProvider.otherwise('/test');

    // HTML5 MODE url writing method (false: #/anchor/use, true: /html5/url/use)
    $locationProvider.html5Mode(true);

}]);

app.config(['$httpProvider', function ($httpProvider) {
    
    // $httpProvider.defaults.withCredentials = true;

}]);

app.run(['$rootScope', '$route', '$routeParams', '$window', '$q', '$timeout', function ($rootScope, $route, $routeParams, $window, $q, $timeout) {

    $rootScope.$on('$routeChangeSuccess', function () {
        var title = $route.current.title;
        angular.forEach($routeParams, function (value, key) {
            title = title.replace(new RegExp(':' + key, 'g'), value);
        });
        document.title = title || '';        
    });

}]);
/* global angular, app */

window.console ? null : window.console = { log: function () { } };
window.domain = '//' + location.hostname + (location.port ? ':' + location.port : ''); // location.protocol + 

app.constant('domain', domain);

app.constant('formActions', {
    CLI_PULL_NEW: 1,
    CLI_PUSH_EXHISTING: 2,
    COM_HANDLED: 3,
    COM_SUPPORT: 4,
    COM_UNAUTHORIZED: 5,
    COM_EXTRA_BUDGET: 6,
    COM_CLOSE: 7,
    PLDSSPETC_AC_SHORT_YES: 8,
    PLDSSPETC_AC_SHORT_NO: 9,
    PLDSSPETC_SHORT_YES: 10,
    PLDSSPETC_SHORT_NO: 11,
    CAPOF_CLOSE: 12,
    CAPOF_NO_BUDGET: 13,
    CAPOF_CREATE: 14,
    CAPOF_TASK: 15,
    DIRCOM_ACCEPTED: 16,
    DIRCOM_REFUSED: 17,
    CAPOF_INFO: 18,
    ASSIGNTO_CLOSE: 19,
});

app.constant('formTypes', {
    CLI_PULL: 1,
    COM_PULL_AC: 2,
    COM_PULL: 3,
    COM_PUSH: 4,
    COM_LONG: 5,
    COM_EXTRA: 6,
    COM_EXTRA_CONFIRMED: 7,
    PLDSSPETC_PUSH: 8,
    PLDSSPETC_PULL: 9,
    CAPOF_ASSIGNATION: 10,
    DIRCOM_EXTRA: 11,
    COMPLETE: 12,
    COM_TASK: 13,
});

app.constant('formStatus', {
    STATUS_WAITING:         1,
    STATUS_TASK:            2,
    STATUS_COM:             3,
    STATUS_BUDGET:          4,
    STATUS_COMPLETE:        5,
});

app.constant('taskStatus', {
    STATUS_OPENED: 1,
    STATUS_HANDLED: 2,
    STATUS_WAITING: 3,
    STATUS_COMPLETED: 4,
    STATUS_ESTIMATION: 5,
    STATUS_PLANNED: 6,
});

app.constant('teamStatus', {
    STATUS_UNDONE: 0,
    STATUS_DONE: 1,
});

app.constant('negotiationStatus', {
    STATUS_OPENED: 1,
    STATUS_CLOSED: 2,
});

app.constant('estimationStatus', {
    STATUS_RAI: 255,
    STATUS_COM: 270,
    STATUS_NEGOTIATION: 254,
    STATUS_ACCEPTED: 252,
    STATUS_REFUSED: 253,
    STATUS_COMPLETED: 271,
});

app.constant('projectTypes', {
    NORMAL:                 1,
    DOWNWARD:               2,
});

app.constant('projectStatus', {
    STATUS_OPENED: 1,
    STATUS_CLOSED: 2,
});

app.constant('userAreas', {
    DIRCOM: 250,
    COM: 210,
    SEG: 200,
    CAPOF: 80,
    PLDSSPE: 170,
    TEC: 140,
    NONE: 0,
});

app.constant('userGroups', {
    ADMIN: [10000],
    DIRCOM: [10000, 250, 1],
    COM: [10000, 210, 200],
    SEG: [10000, 200],
    PLDSSPETC: [10000, 220, 170, 160, 150, 140],
    PLDSSPE: [10000, 220, 170, 160, 150],
    RR: [10000, 220],
    DS: [10000, 170],
    PL: [10000, 160],
    SPE: [10000, 150],
    TEC: [10000, 140],
    CAPOF: [10000, 80],
    GESTIONALE: [10000, 1],
    REPORTTRATT: [10000, 1, 190, 80, 250],
});

app.constant('colTypes', {
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
    INCREMENT: 14,
    ICON: 15,
    BUTTONS: 16,
    DISABLED: 17,
    LINK: 18,
    BOOL: 19,
    DOUBLE: 20,
    WEEKS: 21,
});

/*
app.value('relativeDateTranslations', {
    just_now:               'adesso', // 'just now',
    seconds_ago:            '{{time}} secondi fa', // '{{time}} seconds ago',
    a_minute_ago:	        'un minuto fa', // 'a minute ago',
    minutes_ago:	        '{{time}} minuti fa', // '{{time}} minutes ago',
    an_hour_ago:            'un\'ora fa', // 'an hour ago',
    hours_ago:              '{{time}} ore fa', // '{{time}} hours ago',
    a_day_ago:              'ieri', // 'yesterday',
    days_ago:               '{{time}} giorni fa', // '{{time}} days ago',
    a_week_ago:             'una settimana fa', // 'a week ago',
    weeks_ago:              '{{time}} settimane fa', // '{{time}} weeks ago',
    a_month_ago:            'un mese fa', // 'a month ago',
    months_ago:             '{{time}} mesi fa', // '{{time}} months ago',
    a_year_ago:             'un anno fa', // 'a year ago',
    years_ago:              '{{time}} anni fa', // '{{time}} years ago',
    over_a_year_ago:        'più di un anno fa', // 'over a year ago',
    seconds_from_now:       'fra {{time}} secondi', // '{{time}} seconds from now',
    a_minute_from_now:      'fra un minuto', // 'a minute from now',
    minutes_from_now:       'tra {{time}} minuti', // '{{time}} minutes from now',
    an_hour_from_now:       'tra un\'ora', // 'an hour from now',
    hours_from_now:         'tra {{time}} ore', // '{{time}} hours from now',
    a_day_from_now:         'domani', // 'tomorrow',
    days_from_now:          'fra {{time}} giorni', // '{{time}} days from now',
    a_week_from_now:        'tra una settimana', // 'a week from now',
    weeks_from_now:         'fra {{time}} settimane', // '{{time}} weeks from now',
    a_month_from_now:       'tra un mese', // 'a month from now',
    months_from_now:        'fra {{time}} mesi', // '{{time}} months from now',
    a_year_from_now:        'tra un anno', // 'a year from now',
    years_from_now:         'tra {{time}} anni', // '{{time}} years from now',
    over_a_year_from_now:   'fra più di un anno', // 'over a year from now',
});

app.config(['ChartJsProvider', function (ChartJsProvider) {
    console.log(Chart.defaults.global);
    var colors = ['#1684FB', '#F21500', '#ffe200', '#FF6435', '#FF9700', '#4BAF4F', '#8BC24A', '#7A70E4', '#53E2DD', '#03A9F4'];
    ChartJsProvider.setOptions({
        chartColors: colors,
        responsive: true,
        maintainAspectRatio: true,
    });
    ChartJsProvider.setOptions('line', {
        showLines: true,
    });
    ChartJsProvider.setOptions('tooltips', {
        callbacks: {
            title: function (tooltipItems, data) {
                return ''; // title;
            },
            label: function (tooltipItem, data) {
                var label = data.datasets[tooltipItem.datasetIndex].label; // data.labels[tooltipItem.index];
                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                return label + ': ' + datasetLabel;
            }
        }
    });
    ChartJsProvider.setOptions('legend', {
        display: true,
    });    
}]);
*/
/* global angular, app */

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

app.controller('TestCtrl', ['$scope', '$route', '$filter', '$location', '$http', '$q', 'State', 'Utils', 'Appearance', 'DataFilter', 'DataSource', 'Columns', 'Range', 'ChartData', 'colTypes', function ($scope, $route, $filter, $location, $http, $q, State, Utils, Appearance, DataFilter, DataSource, Columns, Range, ChartData, colTypes) {
    var state = $scope.state = new State();

    var tabs = $scope.tabs = [{
        id: 2,
        name: 'Colonne',
        template: 'partials/report/filters/columns',
        icon: 'icon-time',
    }, {
        id: 3,
        name: 'Valori',
        template: 'partials/report/filters/values',
        icon: 'icon-time',
    }, {
        id: 4,
        name: 'Opzioni',
        template: 'partials/report/filters/flags',
        icon: 'icon-time',
    },];
    tabs.show = true;
    tabs.description = 'partials/report/description';
    tabs.id = 2;

    function GroupColumns(rows, items, compares) {
        // console.log(rows, items, compares);
        cols.reset();
        var compared = null;
        angular.forEach(rows, function (row) {
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
                cols.iterate(row, items);
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
                    cols.compare(row, items);
                }
            });
        }
        cols.makeStatic(items);
        // $scope.groupChart();
    }
    
    var filters = $scope.filters = new DataFilter();
    var ranges = $scope.ranges = [
        new Range().currentQuarter().set(filters),
        new Range().currentSemester(),
        new Range().currentYear(),
    ];

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

    var cols = $scope.cols = new Columns(CountryCols());
    cols = $scope.cols = cols.expand({ dynamic: true, compare: false });
    cols.showReport = true;
    var defaults = cols.map(function (col) { 
        return { 
            id: col.id, 
            active: col.active,
        };
    });
    var colGroups = $scope.colGroups = [{
        name: 'GroupBy',
        cols: cols.getGroups()
    }, ];
    var valGroups = $scope.valGroups = [{
        name: 'Aggregate',
        cols: cols.getAggregates()
    }];
    var excludes = $scope.excludes = [/*{
        name: 'Monte ore / tutti i reparti', filter: function (row) {
            return !(row.supplier.id === 15143);
        }, active: true,
    }, */];
    var includes = $scope.includes = [];

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
            console.log(items);
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
            if (cols.showComparison) {
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

    $scope.setRangeDiff = function (diff) {
        angular.forEach(ranges, function (range) {
            if (range.is(filters)) {
                range.setDiff(diff);
                range.set(filters, source);
            }
        });
    };
    $scope.resetFilters = function () {
        angular.forEach(cols, function (col, key) {
            angular.forEach(defaults, function (item) {
                if (col.id === item.id) {
                    angular.isFunction(col.active) ? null : col.active = item.active;
                }
            });
            col.search = null;
        });
        cols = $scope.cols = cols.sort(function (a, b) {
            return a.id - b.id;
        });
        // cols.radios.workloads = 'supplier.name';
        source.update();
    };
    $scope.exclude = function (item) {
        item.active = !item.active;
        source.update();
    };
    $scope.include = function (item) {
        item.active = !item.active;
        source.update();
    };
    $scope.toggleCol = function (col) {
        cols.toggleColumns(col);
        source.update();
    };
    $scope.doFilter = function (cols) {
        // source.update(); // doing regroup
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
        // source.update(); // doing regroup
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
        var fromIndex = cols.indexOf(event.from.model);
        var toIndex = cols.indexOf(event.to.model);
        var item = cols[fromIndex];
        cols.splice(fromIndex, 1);
        cols.splice(toIndex, 0, item);
    });
    $scope.$on('onDropOut', function (scope, event) {
        // console.log('NegotiationReportCtrl.onDropOut', event.model, event.from, event.to, event.target);
    });

    function Init() {
        state.ready();
    }    

    /*
    $scope.output = "A";
    $http.get('https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100').then(function success(response) {
        $scope.output = response;
    });
    */

}]);

/* global angular, app */

var aid = 0; // application unique id counter using for dev

app.directive('controlRow', ['$http', '$templateCache', '$compile', 'Utils', function ($http, $templateCache, $compile, Utils) {
    function templateFunction (element, attributes) {
        var form = attributes.form || 'Form';
        var title = attributes.title || 'Untitled';
        var placeholder = attributes.placeholder || title;
        var name = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++aid);
        var formKey = form + '.' + name;
        var formFocus = ' ng-focus="' + formKey + '.hasFocus=true" ng-blur="' + formKey + '.hasFocus=false"';
        var message = '', decoration = '', disabled = '';
        var label = (attributes.label ? attributes.label : 'name');
        var key = (attributes.key ? attributes.key : 'id');
        var model = attributes.model;
        var change = (attributes.onChange ? ' ng-change="' + attributes.onChange + '"' : '');
        var inputCols = attributes.cols ? 6 : 9;
        var colInput = 'col-lg-' + inputCols;
        var colLabel = 'col-lg-' + (12 - inputCols);
        var required = (attributes.required ? ' required="true"' : '');
        var readonly = (attributes.readonly ? ' readonly' : '');
        var options = (attributes.options ? ' ng-model-options="' + attributes.options + '" ' : '');
        var validate = (attributes.validate ? ' validate-type="' + attributes.validate + '" ' : '');
        var format = (attributes.format ? ' format="' + attributes.format + '" ' : '');
        var precision = (attributes.precision ? ' precision="' + attributes.precision + '" ' : '');
        if (attributes.disabled) {
            disabled = ' disabled';
        }
        if (attributes.required) {
            decoration = attributes.readonly || attributes.disabled ? '' : '<sup>✽</sup>';            
        }
        message = '<span ng-messages="' + (attributes.readonly ? '' : '(' + form + '.$submitted || ' + formKey + '.$touched) && ') + formKey + '.$error" role="alert">';
        message = message + '<span ng-message="required" class="label-error animated flash">obbligatorio ⤴</span>';
        switch (attributes.controlRow) {
            case 'password':
                message = message + '<span ng-message="minlength" class="label-error animated flash">almeno 3 caratteri ⤴</span>';
                break;
            case 'email':
                message = message + '<span ng-message="email" class="label-error animated flash">valore non corretto ⤴</span>';
                break;
            case 'number':
            case 'range':
                message = message + '<span ng-message="positive" class="label-error animated flash">solo valori positivi ⤴</span>';
                message = message + '<span ng-message="number" class="label-error animated flash">solo valori numerici ⤴</span>';
                break;
        }
        if (attributes.match !== undefined) {
            message = message + '<span ng-message="match" class="label-error animated flash">non corrispondente ⤴</span>';
        }
        message = message + '</span>';
        var validation = ' ng-class="{ \'control-focus\': ' + formKey + '.hasFocus, \'control-success\': ' + formKey + '.$valid, \'control-error\': ' + formKey + '.$invalid && (' + form + '.$submitted || ' + formKey + '.$touched), \'control-empty\': !' + formKey + '.$viewValue }"';
        var template = '<div class="row" ' + validation + '><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + decoration + '</label><div class="' + colInput + ' col-' + attributes.controlRow + '">';
        switch (attributes.controlRow) {
            case 'static':
                var click = (attributes.click ? ' ng-click="' + attributes.click + '"' : '');
                var mouseover = (attributes.mouseover ? ' ng-mouseover="' + attributes.mouseover + '"' : '');
                var mouseout = (attributes.mouseout ? ' ng-mouseover="' + attributes.mouseout + '"' : '');
                var icon = (attributes.icon ? '<i class="pull-xs-right ' + attributes.icon + '"></i>' : '');
                template += '<p class="form-control" ' + click + mouseover + mouseout + '><span ng-bind-html="' + model + ' || \'&nbsp;\'"></span>' + icon + '</p>';
                break;
            case 'checkbox':
                template = '<div class="' + colInput + '"' + validation + '><div class="col-xs-12"><label class="custom-control custom-checkbox">';
                template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + '">';
                template += '   <span class="custom-control-indicator"></span>';
                template += '   <span class="custom-control-description">' + title + '</span>';
                template += '</label>';
                // template += '<input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + required + ' class="toggle toggle-round-flat">';
                /*
                template = '<div class="checkbox">';
                template += '<span class="checkbox-label">' + title + required +'</span>';
                template += '<span class="switch"><input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + required + ' class="toggle toggle-round-flat"><label for="' + name + '"></label></span>';
                template += '</div>';
                */
                break;
            case 'yesno':
                template = '<div class="row" ' + validation + '><label class="col-lg-6 custom-control custom-checkbox">' + title + decoration + '</label>';
                template += '<div class="' + colLabel + '"><label class="custom-control custom-checkbox">';
                template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + '" ng-change="' + model + 'No=!' + model + '">';
                template += '   <span class="custom-control-indicator"></span>';
                template += '   <span class="custom-control-description">Sì</span>';
                template += '</label></div>';
                template += '<div class="' + colLabel + '"><label class="custom-control custom-checkbox">';
                template += '   <input type="checkbox" class="custom-control-input" ng-model="' + model + 'No" ng-change="' + model + '=!' + model + 'No">';
                template += '   <span class="custom-control-indicator"></span>';
                template += '   <span class="custom-control-description">No</span>';
                template += '</label>';
                // template += '<input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + required + ' class="toggle toggle-round-flat">';
                /*
                template = '<div class="checkbox">';
                template += '<span class="checkbox-label">' + title + required +'</span>';
                template += '<span class="switch"><input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + required + ' class="toggle toggle-round-flat"><label for="' + name + '"></label></span>';
                template += '</div>';
                */
                break;
            case 'switch':
                template = '<div class="row control-switch" ' + validation + '><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + decoration + '</label>';
                template += '<div class="' + colInput + '">';
                template += '<switch name="' + name + '" ng-model="' + model + '" ' + change + options + ' on="Sì" off="No" ' + required + disabled + readonly + formFocus + '></switch>';
                break;
            case 'range':
                validate = ' validate-type="number"';
                var nameHi = name + 'Hi';
                var formKeyHi = form + '.' + nameHi;
                var modelHi = attributes.modelHi;
                var validationHi = ' ng-class="{ \'control-focus\': ' + formKeyHi + '.hasFocus, \'control-success\': ' + formKeyHi + '.$valid, \'control-error\': ' + formKeyHi + '.$invalid && (' + form + '.$submitted || ' + formKeyHi + '.$touched), \'control-empty\': !' + formKeyHi + '.$viewValue }"';
                var requiredHi = required;
                if (attributes.requiredHi == 'true') {
                    requiredHi = ' required="true"';
                } else if (attributes.requiredHi == 'false') {
                    requiredHi = '';
                }
                var messageHi = ' ', decorationHi = ' ';
                if (attributes.required && attributes.requiredHi !== 'false') {
                    decorationHi = attributes.readonly || attributes.disabled ? '' : '<sup>✽</sup>';                    
                }
                messageHi = '<span ng-messages="' + (attributes.readonly ? '' : '(' + form + '.$submitted || ' + formKeyHi + '.$touched) && ') + formKeyHi + '.$error" role="alert">';
                messageHi = messageHi + '<span ng-message="required" class="label-error animated flash">obbligatorio ⤴</span>';
                switch (attributes.controlRow) {
                    case 'password':
                        messageHi = messageHi + '<span ng-message="minlength" class="label-error animated flash">almeno 3 caratteri ⤴</span>';
                        break;
                    case 'email':
                        messageHi = messageHi + '<span ng-message="email" class="label-error animated flash">valore non corretto ⤴</span>';
                        break;
                    case 'number':
                    case 'range':
                        messageHi = messageHi + '<span ng-message="positive" class="label-error animated flash">solo valori positivi ⤴</span>';
                        messageHi = messageHi + '<span ng-message="number" class="label-error animated flash">solo valori numerici ⤴</span>';
                        break;
                }
                if (attributes.match !== undefined) {
                    messageHi = messageHi + '<span ng-message="match" class="label-error animated flash">non corrispondente ⤴</span>';
                }
                messageHi = messageHi + '</span>';
                template = '<div class="row"><label for="' + name + '" class="' + colLabel + ' col-form-label">' + title + '</label><div class="' + colInput + ' col-' + attributes.controlRow + '">';
                template += '<div class="form-control-range form-control-range-min" ' + validation + '>' + decoration + '<input class="form-control" name="' + name + '" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>' + message + '</div>';
                template += '<div class="form-control-range form-control-range-max" ' + validationHi + '>' + decorationHi + '<input class="form-control" name="' + nameHi + '" ng-model="' + modelHi + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + requiredHi + disabled + readonly + formFocus + validate + format + precision + '>' + messageHi + '</div>';
                return template + '</div></div>';
                break;
            case 'range-slider':
                var himodel = (attributes.himodel ? ' rz-slider-high="' + attributes.himodel + '" ' : '');
                options = (attributes.options ? ' rz-slider-options="' + attributes.options + '" ' : '');
                template += '<rzslider rz-slider-model="' + model + '" ' + himodel + options + '"></rzslider>';
                break;
            case 'select':
                var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
                var optionLabel = Utils.format(label, 'item.', true);
                var options = attributes.number
                    ? 'item.' + key + ' as ' + optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter
                    : optionLabel + ' disable when item.disabled for item in ' + attributes.source + filter + ' track by item.' + key;
                template += '<select name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + ' ng-options="' + options + '" ' + (attributes.number ? 'convert-to-number' : '') + required + '><option value="" disabled selected hidden>' + placeholder + '</option></select>';
                break;
            case 'autocomplete':
                var canCreate = (attributes.canCreate ? attributes.canCreate : false);
                var flatten = (attributes.flatten ? attributes.flatten : false);
                var queryable = (attributes.queryable ? attributes.queryable : false);
                var onSelected = (attributes.onSelected ? ' on-selected="' + attributes.onSelected + '"' : '');
                template += '<input name="' + name + '" ng-model="' + model + '" type="hidden" ' + (attributes.required ? 'required' : '') + '>';
                template += '<div control-autocomplete="' + attributes.source + '" model="' + model + '" label="' + label + '"  key="' + key + '" can-create="' + canCreate + '" flatten="' + flatten + '" queryable="' + queryable + '" placeholder="' + placeholder + '" on-focus="' + formKey + '.hasFocus=true" on-blur="' + formKey + '.hasFocus=false"' + onSelected + '></div>';
                break;
            case 'textarea':
                var rows = (attributes.rows ? attributes.rows : '1');
                template += '<textarea name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" ' + required + disabled + ' rows="' + rows + '"' + formFocus + '></textarea>';
                break;
            case 'htmltext':
                template += '<div text-angular name="' + name + '" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" ' + required + disabled + readonly + formFocus + (attributes.required ? ' ta-min-text="1"' : '') + '></div>';
                break;
            case 'password':
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="password" ng-minlength="2" ' + required + disabled + formFocus + '>';
                break;
            case 'email':
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="email" ' + required + disabled + formFocus + '>';
                break;
            case 'number':
                validate = ' validate-type="number"';
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                break;
            case 'date':
                validate = ' validate-type="date"';
                format = ' format="dd-MM-yyyy"';
                if (attributes.disabled || attributes.readonly) {
                    template += '<div class="input-group"><input type="text" class="form-control" name="' + name + '" ng-model="' + model + '" placeholder="' + placeholder + '" ' + required + disabled + readonly + formFocus + validate + format + '><span class="input-group-addon"><i class="icon-calendar"></i></span></div>';
                } else {
                    template += '<input type="date" name="' + name + '" class="form-control form-control-hidden" is-open="flags.' + name + '" ng-model="' + model + '" placeholder="dd-MM-yyyy" ' + required + disabled + readonly + formFocus + ' uib-datepicker-popup datepicker-options="sources.datepickerOptions" datepicker-template-url="uib/template/datepicker/datepicker.html" show-button-bar="false" current-text="Oggi" clear-text="Rimuovi" close-text="Chiudi">';
                    template += '<div ng-click="(flags.' + name + ' = true)" class="input-group disabled"><input type="text" class="form-control" name="' + name + '" ng-model="' + model + '" placeholder="' + placeholder + '" ' + required + disabled + readonly + formFocus + validate + format + '><span class="input-group-addon"><i class="icon-calendar"></i></span></div>';
                }
                break;
                /*
            case 'date':
                placeholder = placeholder || 'dd-MM-yyyy';
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="date"' + required + disabled + readonly + formFocus + '>';
                break;
                */
            case 'datetime-local':
                placeholder = placeholder || 'dd-MM-yyyyTHH:mm:ss';
                // placeholder == title ? placeholder = 'dd/MM/yyyyTHH:mm:ss' : null;
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="datetime-local"' + required + disabled + readonly + formFocus + '>';
                break;
            case 'text':
            default:
                template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + validate + format + precision + '>';
                break;
        }
        return template + message + '</div></div>';
    }
    return {
        restrict: 'A',
        replace: true,
        compile: function (templateElement, templateAttributes) {            
            return function (scope, element, attributes) {
                element.html(templateFunction(templateElement, templateAttributes));
                $compile(element.contents())(scope);
            }
        }
    }
}]);

app.directive('control', [function () {
    return {
        restrict: 'A',
        replace: true,
        template: function (element, attributes) {
            var form = attributes.form || 'Form';
            var title = attributes.title || 'Untitled';
            var placeholder = attributes.placeholder || title;
            var name = title.replace(/[^0-9a-zA-Z]/g, "").split(' ').join('') + (++aid);
            var formKey = name; // form + '.' + name;
            var formFocus = ' ng-focus="' + formKey + '.hasFocus=true" ng-blur="' + formKey + '.hasFocus=false"';
            var message = '', decoration = '', disabled = '';
            var label = (attributes.label ? attributes.label : 'name');
            var key = (attributes.key ? attributes.key : 'id');
            var model = attributes.model;
            var change = (attributes.onChange ? ' ng-change="' + attributes.onChange + '"' : '');
            var required = (attributes.required ? ' required="true"' : '');
            var readonly = (attributes.readonly ? ' readonly' : '');
            var options = (attributes.options ? ' ng-model-options="' + attributes.options + '" ' : '');
            var validate = (attributes.validate ? ' validate-type="' + attributes.validate + '" ' : '');
            if (attributes.required) {
                decoration = attributes.readonly || attributes.disabled ? '' : '<sup>✽</sup>';
                message = '<span ng-messages="' + (attributes.readonly ? '' : '(' + form + '.$submitted || ' + formKey + '.$dirty) && ') + formKey + '.$error" role="alert"><span ng-message="required" class="label-error animated flash"> ⤴ required</span>';
                switch (attributes.control) {
                    case 'password':
                        message = message + '<span ng-message="minlength" class="label-error animated flash"> ⤴ at least 3 chars</span>';
                        break;
                    case 'email':
                        message = message + '<span ng-message="email" class="label-error animated flash"> ⤴ incorrect</span>';
                        break;
                    case 'number':
                        message = message + '<span ng-message="number" class="label-error animated flash"> ⤴ enter a valid number</span>';
                        message = message + '<span ng-message="number" class="label-error animated flash"> ⤴ enter a positive number</span>';
                        break;
                }
                if (attributes.match !== undefined) {
                    message = message + '<span ng-message="match" class="label-error animated flash"> ⤴ not matching</span>';
                }
                message = message + '</span>';
            } else {
                message = ' ';
            }
            if (attributes.disabled) {
                disabled = ' disabled';
            }
            // var template = '<ng-form name="' + name + '" ng-class="{ \'control-focus\': ' + formKey + '.hasFocus, \'control-success\': ' + formKey + '.$valid, \'control-error\': ' + formKey + '.$invalid && (' + form + '.$submitted || ' + formKey + '.$dirty), \'control-empty\': !' + formKey + '.$viewValue }"><label for="' + name + '" class="control-label">' + title + message + '</label>';
            var template = '<ng-form name="' + name + '" ng-class="{ \'control-focus\': ' + formKey + '.hasFocus }"><label for="' + name + '" class="control-label"><span class="control-title">' + title + '</span>' + decoration + ' ' + message + '</label>';
            // console.log('control' + formKey);
            switch (attributes.control) {
                case 'checkbox':
                    template = '<ng-form name="' + name + '" class="checkbox">';
                    template += '<span class="checkbox-label"><span class="control-title">' + title + '</span>' + decoration + ' ' + message + '</span>';
                    template += '<span class="switch"><input id="' + name + '" name="' + name + '" type="checkbox" ng-model="' + model + '" ' + change + required + ' class="toggle toggle-round-flat"><label for="' + name + '"></label></span>';
                    template += '</div>';
                    break;
                case 'select':
                    var filter = (attributes.min ? ' | filter:gte(\'' + key + '\', ' + attributes.min + ')' : '');
                    var options = attributes.number
                        ? 'item.' + key + ' as item.' + label + ' for item in ' + attributes.source + filter
                        : 'item.' + label + ' for item in ' + attributes.source + filter + ' track by item.' + key;
                    template += '<select name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + ' ng-options="' + options + '" ' + (attributes.number ? 'convert-to-number' : '') + required + '><option value="" disabled selected hidden>' + placeholder + '</option></select>';
                    break;
                case 'autocomplete':
                    var canCreate = (attributes.canCreate ? attributes.canCreate : false);
                    var flatten = (attributes.flatten ? attributes.flatten : false);
                    var queryable = (attributes.queryable ? attributes.queryable : false);
                    var onSelected = (attributes.onSelected ? ' on-selected="' + attributes.onSelected + '"' : '');
                    template += '<input name="' + name + '" ng-model="' + model + '" ' + change + ' type="hidden" ' + required +  disabled +'>';
                    template += '<div control-autocomplete="' + attributes.source + '" model="' + model + '" label="' + label + '"  key="' + key + '" can-create="' + canCreate + '" flatten="' + flatten + '" queryable="' + queryable + '" placeholder="' + placeholder + '" on-focus="' + formKey + '.hasFocus=true" on-blur="' + formKey + '.hasFocus=false"' + onSelected + '></div>';
                    break;
                case 'textarea':
                    var rows = (attributes.rows ? attributes.rows : '1');
                    template += '<textarea name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" ' + required + disabled +' rows="' + rows + '"' + formFocus + '></textarea>';
                    break;
                case 'datetime-local':
                    placeholder == title ? placeholder = 'yyyy-MM-ddTHH:mm:ss' : null;
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="datetime-local"' + required + readonly + formFocus + '>';
                    break;
                case 'password':
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="password" ng-minlength="2" ' + required + disabled + formFocus + '>';
                    break;
                case 'email':
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="email" ' + required + disabled + formFocus + '>';
                    break;
                case 'number':
                    validate = ' validate-type="number"';
                    template += '<input name="' + name + '" class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + ' validate-type="number">'; // ' validator="{ number: isNumber }">';
                    break;
                case 'text':
                default:
                    // var log = ' ng-change="log(\'' + formKey + '\', \'$valid\', ' + formKey + '.$valid, \'$dirty\', ' + formKey + '.$dirty, \'$pristine\', ' + formKey + '.$pristine, \'$error\', ' + formKey + '.$error)"';
                    var log = '';
                    template += '<input name="' + name + '" ' + log + ' class="form-control" ng-model="' + model + '" ' + change + options + ' placeholder="' + placeholder + '" type="text"' + required + disabled + readonly + formFocus + '>';
                    break;
            }
            return template + '</ng-form>';
        },
        link: function (scope, element, attributes, model) {
        },
    };
}]);

app.directive('validateType', ['$filter', function ($filter) {
    return {
        require: 'ngModel',
        link: function (scope, element, attributes, model) {
            var validateType = attributes.validateType;
            var format = attributes.format || '';
            var precision = attributes.precision || 2;
            var focus = false;
            switch (validateType) {
                case 'date':
                case 'datetime':
                case 'datetime-local':
                    model.$formatters.push(function (value) {
                        if (value) {
                            return $filter('date')(value, format);
                        } else {
                            return null;
                        }
                    });
                    break;
                case 'number':
                    model.$parsers.unshift(function (value) {
                        var valid = false, type = validateType;
                        if (value !== undefined && value !== "") {
                            valid = String(value).indexOf(Number(value).toString()) !== -1; // isFinite(value); // 
                            value = Number(value);
                            model.$setValidity('number', valid);
                            if (valid) {
                                model.$setValidity('positive', value >= 0.01);
                                attributes.min !== undefined ? model.$setValidity('range', value >= Number(attributes.min)) : null;
                                attributes.max !== undefined ? model.$setValidity('range', value <= Number(attributes.max)) : null;
                            }
                            /*                             
                            if (valid) {
                                if (value < 0.01) {
                                    valid = false;
                                    type = 'positive';
                                }
                                if (valid && attributes.min !== undefined) {
                                    valid = valid && value >= Number(attributes.min);
                                    if (!valid) {
                                        type = 'range';
                                    }
                                }
                                if (valid && attributes.max !== undefined) {
                                    valid = valid && value <= Number(attributes.max);
                                    if (!valid) {
                                        type = 'range';
                                    }
                                }
                            }
                            */
                            // console.log('validateType.number', type, valid, value);
                        } else {
                            valid = true;
                            value = Number(value);
                            model.$setValidity('number', true);
                            model.$setValidity('positive', true);
                            attributes.min !== undefined ? model.$setValidity('range', true) : null;
                            attributes.max !== undefined ? model.$setValidity('range', true) : null;
                        }
                        return value;
                    });
                    model.$formatters.push(function (value) {
                        if (value) {
                            return $filter('number')(value, precision) + ' ' + format;
                        } else {
                            return null;
                        }
                    });
                    /*
                    model.$render = function () {
                        console.log('model.render', model.$modelValue);
                        element[0].value = model.$modelValue ? $filter('number')(model.$modelValue, precision) + ' ' + format : ' ';
                    };
                    */
                    break;
            }
            function onFocus() {
                focus = true;
                if (format) {
                    element[0].value = model.$modelValue || null;
                    if (!model.$modelValue) {
                        model.$setViewValue(null);
                    }
                }
            }
            function doBlur() {
                if (format && !model.$invalid) {
                    switch (validateType) {
                        case 'date':
                        case 'datetime':
                        case 'datetime-local':
                            element[0].value = model.$modelValue ? $filter('date')(model.$modelValue, format) : ' ';
                            break;
                        default:
                            element[0].value = model.$modelValue ? $filter('number')(model.$modelValue, precision) + ' ' + format : ' ';
                            break;
                    }
                }
            }
            function onBlur() {
                focus = false;
                doBlur();
            }
            function addListeners() {
                element.on('focus', onFocus);
                element.on('blur', onBlur);
            }
            function removeListeners() {
                element.off('focus', onFocus);
                element.off('blur', onBlur);
            }
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    };
}]);

app.directive('dropdown', ['$window', 'Utils', function ($window, Utils) {
    return {
        restrict: 'C',
        link: function (scope, element, attributes, model) {
            var toggle = element[0].querySelector('.dropdown-toggle');
            var opened = element.hasClass('open');
            function onTap(e) {
                element.toggleClass('open');
                toggle.setAttribute('aria-expanded', element.hasClass('open').toString());
                addCloseListeners();
            };
            function onTapOut(e) {
                if (Utils.getClosest(e.target, '.dropdown')) {
                    return true;
                } else {
                    element.removeClass('open');
                    toggle.setAttribute('aria-expanded', element.hasClass('open').toString());
                    removeCloseListeners();
                }
            };
            function addCloseListeners() {
                angular.element($window).on('touchend mouseup', onTapOut);
            };
            function removeCloseListeners() {
                angular.element($window).off('touchend mouseup', onTapOut);
            };
            function addListeners() {
                angular.element(toggle).on('touchstart mousedown', onTap);
            };
            function removeListeners() {
                angular.element(toggle).off('touchstart mousedown', onTap);
            };
            scope.$on('$destroy', function () {
                removeListeners();
                removeCloseListeners();
            });
            addListeners();
        }
    }
}]);

app.directive('dropup', ['$window', 'Utils', function ($window, Utils) {
    return {
        restrict: 'C',
        link: function (scope, element, attributes, model) {
            var toggle = element[0].querySelector('.dropdown-toggle');
            var opened = element.hasClass('open');
            function onTap(e) {
                element.toggleClass('open');
                toggle.setAttribute('aria-expanded', element.hasClass('open').toString());
            };
            function onTapOut(e) {
                if (Utils.getClosest(e.target, '.dropdown')) {
                    return true;
                } else {
                    element.removeClass('open');
                    toggle.setAttribute('aria-expanded', element.hasClass('open').toString());
                }
            };
            function addListeners() {
                angular.element(toggle).on('touchstart mousedown', onTap);
                angular.element($window).on('touchend mouseup', onTapOut);
            };
            function removeListeners() {
                angular.element(toggle).off('touchstart mousedown', onTap);
                angular.element($window).off('touchend mouseup', onTapOut);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    }
}]);

app.directive('toggle', ['$window', '$document', '$timeout', 'Utils', 'Style', function ($window, $document, $timeout, Utils, Style) {
    var togglers = [];
    var reflow = function (element) {
        new Function('bs', 'return bs')(element ? element.offsetHeight : 0);
    };
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            if (!attributes.target) {
                return;
            }
            var target;
            var style = new Style();
            function show() {
                var collapsable = angular.element(target);
                if (collapsable.hasClass('in')) {
                    return;
                }
                collapsable.removeClass('collapse');
                if (target) {
                    var _height = target.offsetHeight;
                    style.height = '0px';
                    style.set(target);
                    collapsable.removeClass('collapse').addClass('collapsing');
                    target.setAttribute('aria-expanded', true);
                    element.removeClass('collapsed');
                    element[0].setAttribute('aria-expanded', true);
                    setTimeout(function () {
                        style.height = _height + 'px';
                        style.set(target);
                        setTimeout(function () {
                            collapsable.removeClass('collapsing').addClass('collapse').addClass('in');
                            target.style.height = 'auto';
                        }, 500);
                    }, 1);
                    scope.$broadcast('onToggled', target);
                }
                addCloseListeners();
            }
            function hide() {
                var collapsable = angular.element(target);
                if (!collapsable.hasClass('in')) {
                    return;
                }
                var _height = target ? target.offsetHeight : 0;
                style.height = _height + 'px';
                style.set(target);
                collapsable.addClass('collapsing').removeClass('collapse').removeClass('in');
                target.setAttribute('aria-expanded', false);
                element.addClass('collapsed');
                element[0].setAttribute('aria-expanded', false);                
                setTimeout(function () {
                    style.height = '0px';
                    style.set(target);
                    setTimeout(function () {
                        collapsable.removeClass('collapsing').addClass('collapse');
                        target.style.height = 'auto';
                    }, 500);
                }, 1);
                removeCloseListeners();
            }            
            function onTap(e) {
                // console.log('toggle.onTap');
                /*
                if (angular.element(target).hasClass('collapsing')) {
                    return;
                }
                */
                if (angular.element(target).hasClass('in')) {
                    hide();
                } else {
                    show();
                }
            }
            function onTapOut(e) {
                // console.log('toggle.onTapOut', e);
                if (Utils.getClosest(e.target, attributes.target)) {
                    return true;
                } else {
                    hide();
                }
            };
            function addCloseListeners() {
                angular.element($window).on('touchend mouseup', onTapOut);
            };
            function removeCloseListeners() {
                angular.element($window).off('touchend mouseup', onTapOut);
            };
            function addListeners() {
                element.on('touchstart mousedown', onTap);
            };
            function removeListeners() {
                element.off('touchstart mousedown', onTap);
            };
            scope.$on('onToggled', function ($scope, $target) {
                if (target !== $target) {
                    // console.log('toggle.onToggled');
                    hide();
                }
            });
            scope.$on('$destroy', function () {
                var index = togglers.indexOf(target);
                if (index !== -1) {
                    togglers.splice(index, 1);
                }
                removeListeners();
                removeCloseListeners();
            });
            setTimeout(function () {
                target = document.querySelector(attributes.target);
                togglers.push(target);
                // console.log('toggle', attributes.target, target);
                addListeners();
            });
        }
    }
}]);

app.directive('toggleEnter', ['$window', '$document', '$timeout', 'Utils', 'Style', function ($window, $document, $timeout, Utils, Style) {
    var togglers = [];
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            if (!attributes.target) {
                return;
            }
            var target;
            var style = new Style();
            var to;
            function show() {
                var collapsable = angular.element(target);
                if (collapsable.hasClass('in')) {
                    return;
                }
                to ? clearTimeout(to) : null;
                collapsable.removeClass('collapse');
                if (target) {
                    var _height = target.offsetHeight;
                    style.height = '0px';
                    style.set(target);
                    collapsable.removeClass('collapse').addClass('collapsing');
                    target.setAttribute('aria-expanded', true);
                    element.removeClass('collapsed');
                    element[0].setAttribute('aria-expanded', true);
                    to = setTimeout(function () {
                        style.height = _height + 'px';
                        style.set(target);
                        to = setTimeout(function () {
                            collapsable.removeClass('collapsing').addClass('collapse').addClass('in');
                            target.style.height = 'auto';
                        }, 500);
                    }, 1);
                    scope.$broadcast('onToggleEntered', target);
                }
                addCloseListeners();
            }
            function hide() {
                var collapsable = angular.element(target);
                if (!collapsable.hasClass('in')) {
                    return;
                }
                to ? clearTimeout(to) : null;
                to = setTimeout(function () { 
                    var _height = target ? target.offsetHeight : 0;
                    style.height = _height + 'px';
                    style.set(target);
                    collapsable.addClass('collapsing').removeClass('collapse').removeClass('in');
                    target.setAttribute('aria-expanded', false);
                    element.addClass('collapsed');
                    element[0].setAttribute('aria-expanded', false);
                    to = setTimeout(function () {
                        style.height = '0px';
                        style.set(target);
                        to = setTimeout(function () {
                            collapsable.removeClass('collapsing').addClass('collapse');
                            target.style.height = 'auto';
                        }, 125);
                    }, 1);
                    removeCloseListeners();
                }, 500);
            }
            function onOver(e) {
                if (angular.element(target).hasClass('collapsing')) {
                    return;
                }
                show();
            }
            function onLeave(e) {
                if (Utils.getClosest(e.toElement, attributes.target)) {
                    return true;
                } else {
                    hide();
                }
            }
            function onClick(e) {
                if (Utils.getClosestElement(e.target, element[0])) {
                    return true;
                } else if (Utils.getClosest(e.target, attributes.target)) {
                    return true;
                } else {
                    hide();
                }
            }
            function addCloseListeners() {
                if (attributes.toggleLeave) {
                    element.on('mouseleave', onLeave);
                    angular.element(target).on('mouseleave', onLeave);
                } else {
                    angular.element($window).on('click', onClick);
                }
            }
            function removeCloseListeners() {
                if (attributes.toggleLeave) {
                    element.off('mouseleave', onLeave);
                    angular.element(target).off('mouseleave', onLeave);
                } else {
                    angular.element($window).off('click', onClick);
                }
            }
            function addListeners() {
                element.on('mouseenter', onOver);
            }
            function removeListeners() {
                element.off('mouseenter', onOver);
            }
            scope.$on('onToggleEntered', function ($scope, $target) {
                if (target !== $target) {
                    console.log('toggleEnter.onToggleEntered');
                    hide();
                }
            });
            scope.$on('$destroy', function () {
                var index = togglers.indexOf(target);
                if (index !== -1) {
                    togglers.splice(index, 1);
                }
                removeListeners();
                removeCloseListeners();
            });
            setTimeout(function () {
                target = document.querySelector(attributes.target);
                togglers.push(target);
                addListeners();
            });
        }
    }
}]);

app.directive('state', ['$timeout', function ($timeout) {
    return {
        restrict: 'EA',
        template: '<button type="button" class="btn btn-sm btn-primary btn-block-md-down" ng-class="stateClass()" ng-disabled="stateDisabled()"><span ng-transclude></span></button>',
        transclude: true,
        replace: true,
        scope: {
            state: '=',
        },
        link: function (scope, element, attributes, model) {
            scope.stateClass = function () {
                if (scope.state.button === element) {
                    var sclass = {
                        busy: scope.state.isBusy,
                        successing: scope.state.isSuccessing,
                        success: scope.state.isSuccess,
                        errorring: scope.state.isErroring,
                        error: scope.state.isError,
                    };
                    // console.log('stateClass', sclass);
                    return sclass;
                } else {
                    return null;
                }
            };
            scope.stateDisabled = function () {
                var disabled = (scope.state.button && scope.state.button !== element); // || scope.$parent.$eval(attributes.onValidate);
                // console.log('stateDisabled', disabled);
                return disabled;
            };
            function onClick() {
                $timeout(function () {
                    if (!scope.$parent.$eval(attributes.onValidate)) {
                        console.log('state.onClick', attributes.onValidate, attributes.onClick);
                        scope.state.button = element;
                        return scope.$parent.$eval(attributes.onClick);
                    } else {
                        scope.$parent.$eval('form.$setSubmitted()');
                    }
                });
            };
            function addListeners() {
                element.on('touchstart click', onClick);
            };
            function removeListeners() {
                element.off('touchstart click', onClick);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    }
}]);

app.directive('sortable', ['$timeout', function ($timeout) {    
    return {
        restrict: 'A',
        scope: {
            source: '=sortable',
            key: '@sortableKey',
            sort: '=?',
        },
        template: '<th ng-class="{ \'sorted-up\': sort == 1, \'sorted-down\': sort == -1 }" ng-transclude></th>',
        transclude: true,
        replace: true,
        link: function (scope, element, attributes, model) {
            scope.sort = scope.sort || 0;
            function onSort() {
                scope.sort = scope.source.getSort(scope.key);
                // console.log('sortable.onSort', scope.key, scope.source.filters.sort);
            }
            scope.$watchCollection('source.filters.sort', onSort);
            onSort();
            function onTap() {
                if (scope.source.state.enabled()) {
                    var sort = scope.sort ? (scope.sort * -1) : 1;
                    scope.source.setSort(scope.key, sort).then(function (response) {
                        scope.sort = sort;
                    });
                }
            }
            function addListeners() {
                element.on('touchstart click', onTap);
            };
            function removeListeners() {
                element.off('touchstart click', onTap);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    }
}]);

app.directive('draggableItem', ['$parse', '$timeout', 'Utils', 'Style', 'ElementRect', 'Droppables', function ($parse, $timeout, Utils, Style, ElementRect, Droppables) {

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

app.directive('droppableItem', ['$parse', 'Utils', 'Style', 'Droppables', function ($parse, Utils, Style, Droppables) {
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

app.directive('linkTo', ['$parse', '$timeout', '$location', function ($parse, $timeout, $location) {
    return {
        link: function (scope, element, attributes, model) {
            if (!attributes.linkTo) {
                return;
            }
            function onLink() {
                var link = $parse(attributes.linkTo)(scope);
                if (!link) {
                    return;
                }
                element.attr('href', link.href);
                element.attr('target', link.target);
            }
            function onTap(event) {
                var link = $parse(attributes.linkTo)(scope);
                if (!link) {
                    return;
                }
                element.attr('href', link.href);
                element.attr('target', link.target);
                if (link.target === '_blank') {
                    window.open(link.href, '_blank');
                } else {
                    $timeout(function () {
                        var href = link.href.split(window.domain).join('');
                        $location.path(href);                        
                    });
                }
                event.stopImmediatePropagation();
                event.preventDefault();
                return false;
            }
            var events = {
                tap: 'click', // 'touchstart mousedown', // 'click',
            };
            function addListeners() {
                element.on(events.tap, onTap);
            };
            function removeListeners() {
                element.off(events.tap, onTap);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
            $timeout(onLink);
        }
    }
}]);

app.directive('pop', ['$parse', '$templateRequest', '$compile', '$controller', '$window', '$document', '$timeout', 'Utils', 'Style', function ($parse, $templateRequest, $compile, $controller, $window, $document, $timeout, Utils, Style) {
    /*
    function compilePop(scope, element, html, data) {
        element.html(html);
        var link = $compile(element.contents());
        console.log(data.controller, scope, element, html, data);
        if (data.controller) {
            var $scope = scope.$new(true);
            $scope = angular.extend($scope, data);
            var controller = $controller(data.controller, $scope); // , modal);
            if (data.controllerAs) {
                scope[data.controllerAs] = controller;
            }
            element.data('$ngControllerController', controller);
            element.children().data('$ngControllerController', controller);
        }
        link(scope);
    }
    */
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            var native = element[0], promise;
            var pop = {
                target: null,
                element: null,
                native: null,
            };
            function onOver(e) {
                promise = $timeout(function () {
                    onTargetOver();
                }, 1000);
            }
            function onOut(e) {
                promise ? $timeout.cancel(promise) : null;
            };
            function getPageScroll() {
                var supportPageOffset = window.pageXOffset !== undefined;
                var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
                var x = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
                var y = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;
                return { x: x, y: y };
            }
            function onTap() {
                if (!pop.native) {
                    var data = angular.copy($parse(attributes.pop)(scope));
                    // console.log('pop.onTargetOver', attributes.pop, data);
                    if (data && data != undefined) {
                        data.onClose = function () {
                            removeCloseListeners();
                            pop.element.remove();
                            pop.native = pop.element = promise = null;
                        };
                        pop.native = document.createElement('div');
                        pop.element = angular.element(pop.native);
                        pop.element.addClass('pop');
                        /*
                        var rect = native.getBoundingClientRect();
                        var point = getPageScroll();
                        pop.element.attr('style', 'top:' + (point.y) + 'px');
                        */
                        var body = $document.find('body').eq(0);
                        body.append(pop.element);
                        if (data.template) {
                            $templateRequest(data.template).then(function (html) {
                                Utils.compileController(scope, pop.element, html, data);
                            });
                        } else {
                            Utils.compileController(scope, pop.element, '<div>pop</div>', data);
                        }
                        // console.log('element', pop.element);
                        scope.$emit('onPopUp', pop.native);
                        $timeout(function () {
                            addCloseListeners();
                        }, 1000);
                    }
                }
                /*
                if (angular.element(pop.native).hasClass('collapsing')) {
                    return;
                }
                if (angular.element(pop.native).hasClass('in')) {
                    hide();
                } else {
                    show();
                }
                */
            }
            function onTapOut(e) {
                if (Utils.getClosest(e.target, '.pop')) {
                    return true;
                } else {
                    if (pop.native) {
                        removeCloseListeners();
                        pop.element.remove();
                        pop.native = pop.element = promise = null;
                    }
                }
            };
            scope.$watch(function () {
                return pop.element ? pop.element[0].offsetHeight : 0;
            }, function (newValue, oldValue) {
                if (newValue !== oldValue && pop.element) {
                    var rect = native.getBoundingClientRect();
                    var point = getPageScroll();
                    var top = Math.max(80, (rect.top + point.y - newValue));
                    pop.element.attr('style', 'top:' + top + 'px');
                }
            });
            function addCloseListeners() {
                /*
                element.on('mouseout', onTargetOut);
                pop.element.on('mouseout', onTargetOut);
                */
                angular.element($window).on('click', onTapOut);
            };
            function removeCloseListeners() {
                /*
                element.off('mouseout', onTargetOut);
                pop.element.off('mouseout', onTargetOut);
                */
                angular.element($window).off('click', onTapOut);
            };
            function addListeners() {
                /*
                element.on('mouseover', onOver);
                element.on('mouseout', onOut);
                */
                element.on('click', onTap);
            };
            function removeListeners() {
                /*
                element.off('mouseover', onOver);
                element.off('mouseout', onOut);
                */
                element.off('click', onTap);
            };
            scope.$on('onPopUp', function ($scope, $target) {
                if (pop.native !== $target) {
                    onTapOut();
                }
            });
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    }
}]);

app.directive('onClickOut', ['$document', '$parse', '$timeout', 'Utils', function ($document, $parse, $timeout, Utils) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            function onClick(e) {
                if (Utils.getClosestElement(e.target, element[0]) === null) {
                    $timeout(function () {                    
                        console.log('onClickOut', attributes.onClickOut, scope.cols.showValues);
                        var onClickOut = $parse(attributes.onClickOut);
                        onClickOut(scope);
                    });
                }
            }
            function addListeners() {
                angular.element($document).on('click', onClick);
            };
            function removeListeners() {
                angular.element($document).off('click', onClick);
            };
            scope.$on('$destroy', function () {
                removeListeners();
            });
            addListeners();
        }
    };
}]);

app.directive('toggler', ['$document', '$parse', '$timeout', 'Utils', function ($document, $parse, $timeout, Utils) {
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

/* global angular, app, Autolinker */

app.filter('shortName', ['$filter', function ($filter) {
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

app.filter('customCurrency', ['$filter', function ($filter) {
    var legacyFilter = $filter('currency');
    return function (cost, currency) {
        return legacyFilter(cost * currency.ratio, currency.formatting);
    }
}]);

app.filter('customNumber', ['$filter', function ($filter) {
    var filter = $filter('number');
    return function (value, precision, unit) {
        unit = unit || '';
        return (value ? filter(value, precision) + unit : '-');
    }
}]);

app.filter('customHours', [function () {
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

app.filter('customDate', ['$filter', function ($filter) {
    var filter = $filter('date');
    return function (value, format, timezone) {
        return value ? filter(value, format, timezone) : '-';
    }
}]);

app.filter('customTime', ['$filter', function ($filter) {
    return function (value, placeholder) {
        if (value) {
            return Utils.parseTime(value);
        } else {
            return (placeholder ? placeholder : '-');
        }
    }
}]);

app.filter('customDigital', ['$filter', function ($filter) {
    return function (value, placeholder) {
        if (value) {
            return Utils.parseHour(value);
        } else {
            return (placeholder ? placeholder : '-');
        }
    }
}]);

app.filter('customString', ['$filter', function ($filter) {
    return function (value, placeholder) {
        return value ? value : (placeholder ? placeholder : '-');
    }
}]);

app.filter('customEnum', function () {
    return function (val) {
        val = val + 1;
        return val < 10 ? '0' + val : val;
    };
});

app.filter('groupBy', ['$parse', 'filterWatcher', function ($parse, filterWatcher) {
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

app.provider('filterWatcher', function () {
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

/* global angular, app */

app.factory('Range', ['$filter', function ($filter) {
    function Range(data) {
        this.type = Range.types.QUARTER;
        data ? angular.extend(this, data) : null;
    }
    Range.prototype = {
        currentQuarter: function () {
            this.diff = 0;
            return this.setQuarter();
        },
        currentSemester: function () {
            this.diff = 0;
            return this.setSemester();
        },
        currentYear: function () {
            this.diff = 0;
            return this.setYear();
        },
        setQuarter: function () {
            this.type = Range.types.QUARTER;
            var now = new Date();
            now.setMonth(now.getMonth() + 3 * this.diff);
            var year = now.getFullYear();
            var quarter = Math.floor(now.getMonth() / 3);
            this.from = new Date(year, quarter * 3, 1);
            this.to = new Date(year, quarter * 3 + 3, 0);
            return this;
        },
        setSemester: function () {
            this.type = Range.types.SEMESTER;
            var now = new Date();
            now.setMonth(now.getMonth() + 6 * this.diff);
            var year = now.getFullYear();
            var semester = Math.floor(now.getMonth() / 6);
            this.from = new Date(year, semester * 6, 1);
            this.to = new Date(year, semester * 6 + 6, 0);
            return this;
        },
        setYear: function () {
            this.type = Range.types.YEAR;
            var now = new Date();
            now.setMonth(now.getMonth() + 12 * this.diff);
            var year = now.getFullYear();
            this.from = new Date(year, 0, 1);
            this.to = new Date(year, 12, 0);
            return this;
        },
        getName: function () {
            switch (this.type) {
                case Range.types.QUARTER:
                    return 'Trimestre ' + $filter('date')(this.from, 'MMM') + '-' + $filter('date')(this.to, 'MMM') + ' ' + $filter('date')(this.from, 'yyyy');
                    break;
                case Range.types.SEMESTER:
                    return 'Semestre ' + $filter('date')(this.from, 'MMM') + '-' + $filter('date')(this.to, 'MMM') + ' ' + $filter('date')(this.from, 'yyyy');
                    break;
                case Range.types.YEAR:
                    return 'Anno ' + $filter('date')(this.from, 'yyyy');
                    break;
            }
        },
        setDiff: function(diff) {
            this.diff += diff;
            switch (this.type) {
                case Range.types.QUARTER:
                    return this.setQuarter();
                    break;
                case Range.types.SEMESTER:
                    return this.setSemester();
                    break;
                case Range.types.YEAR:
                    return this.setYear();
                    break;
            }
        },
        set: function (filters, source) {
            filters.dateFrom = this.from;
            filters.dateTo = this.to;
            source ? source.setDates(filters.dateFrom, filters.dateTo) : null;
            return this;
        },
        is: function (filters) {
            return  filters.dateFrom.getTime() == this.from.getTime() &&
                    filters.dateTo.getTime() == this.to.getTime();
        },
    };
    Range.types = {
        QUARTER: 1,
        SEMESTER: 2,
        YEAR: 3,
    }
    return Range;
}]);

app.factory('Base', [function () {
    function Base() {
    }
    Base.prototype = {
        $$super: null,
        $super: {},
        $ctor: function () {
            this.$$super.apply(this, [].splice.call(arguments, 0));
        },
    };
    Base.extend = function (data) {
        if (!data || !data.constructor) {
            throw ('Base.extend.error: please pass an object with constructor eg. { constructor: function myFunc() {...} }');
        }
        var constructor = data.constructor;
        var methods = data.methods || {};
        // statics
        angular.extend(constructor, this);
        // prototypes
        constructor.prototype = angular.extend(Object.create(this.prototype), methods);
        constructor.prototype.constructor = constructor;
        constructor.prototype.$$super = this;
        constructor.prototype.$super = {};
        angular.forEach(this.prototype, function (value, key) {
            constructor.prototype.$super[key] = function (scope) {
                value.apply(scope, [].splice.call(arguments, 1));
            };
        });
        return constructor;
    };
    Base.prototype.constructor = Base;
    return Base;
}]);

app.factory('Point', ['Base', function (Base) {
    var Point = Base.extend({
        constructor: function Point(x, y, radius) {
            this.x = x || 0;
            this.y = y || 0;
            this.radius = radius || 100;
        },
        methods: {
            move: function (degree, w, h, pow) {
                var radius = this.radius * (1 + pow);
                this.x = w / 2 + radius * Math.sin(degree);
                this.y = h / 2 + radius * Math.cos(degree);
            },
            draw: function (ctx) {
                ctx.fillStyle = "white";
                ctx.fillRect(this.x, this.y, 4, 4);
            },
        }
    });
    return Point;
}]);

app.factory('Vector', function () {
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

app.factory('ElementRect', ['Vector', function (Vector) {
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

app.factory('Style', function () {
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

app.factory('Matrix', [function () {
    var transform = { name: 'transform', key: 'transform', matrix: null };
    var is3dSupported = function isSupported3d() {
        if (!window.getComputedStyle) {
            return false;
        }
        transform.matrix = window.WebKitCSSMatrix || window.MozCSSMatrix || window.MsCSSMatrix || window.OCSSMatrix || window.CSSMatrix;
        if (!transform.matrix) {
            return false;
        }
        var element = document.createElement('div'),
            has = false,
            properties = {
                webkitTransform: '-webkit-transform',
                OTransform: '-o-transform',
                msTransform: '-ms-transform',
                MozTransform: '-moz-transform',
                transform: 'transform'
            };

        document.body.insertBefore(element, null);
        for (var p in properties) {
            if (element.style[p] !== undefined) {
                element.style[p] = "translate3d(1px,1px,1px)";
                has = window.getComputedStyle(element).getPropertyValue(properties[p]);
                transform.name = p;
                transform.key = properties[p];
                break;
            }
        }
        document.body.removeChild(element);
        return (has !== undefined && has.length > 0 && has !== "none");
    }(transform);
    var decompositionTypeEnum = {
        QRLike: 1,
        LULike: 2,
    };

    function Matrix(element) {
        this.element = element || document.createElement('div');
        this.translate = { x: 0, y: 0, z: 0 };
        this.rotate = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.skew = { x: 0, y: 0 };
        this.matrix = this.decompose();
        this.decompositionType = decompositionTypeEnum.QRLike;
        console.log('Matrix', is3dSupported, transform);
        this.get();
    }
    Matrix.prototype.decompose = function () {
        var computedStyle = window.getComputedStyle(this.element);
        var style = computedStyle[transform.name]; //.transform || computedStyle.WebkitTransform || computedStyle.MozTransform || computedStyle.msTransform || computedStyle.OTransform;
        if (!style) {
            this.matrix = new transform.matrix();
        } else {
            style = style.trim();
            this.matrix = new transform.matrix(style);
            if (style === 'none') {
                this.translate.x = this.translate.y = this.translate.z = 0;
                this.rotate.x = this.rotate.y = this.rotate.z = 0;
                this.scale.x = this.scale.y = this.scale.z = 1;
                this.skew.x = this.skew.y = 0;

            } else {
                var matrix3dRegexp = /matrix3d\((.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*)\)/;
                var matrix3dMatch = matrix3dRegexp.exec(style);

                var matrix2dRegexp = /matrix\((.*),(.*),(.*),(.*),(.*),(.*)\)/;
                var matrix2dMatch = matrix2dRegexp.exec(style);

                if (matrix3dMatch !== null) {
                    /*****************/
                    /*** 3D MATRIX ***/
                    /*****************/
                    var matrix = new transform.matrix(style);
                    if (!matrix || isNaN(matrix.a) || isNaN(matrix.b) || isNaN(matrix.c) || isNaN(matrix.m41) || isNaN(matrix.m42) || isNaN(matrix.m43) || isNaN(matrix.m11)) {
                        throw "Could not catch CSSMatrix constructor for current browser, OR the constructor has returned a non-standard matrix object (need .a, .b, .c and mXX numerical properties to work)";
                    }
                    this.rotate.x = Math.asin(matrix.m22) * 180 / Math.PI; // deg;
                    this.rotate.y = Math.acos(matrix.m11) * 180 / Math.PI * (matrix.m13 > 0 ? -1 : 1); // deg
                    this.rotate.z = 0; // "TODO: Sorry, math people. I really need help here! Please implement this case for me. This will help you: http://9elements.com/html5demos/matrix3d/";
                    this.translate.x = matrix.m41; // px;
                    this.translate.y = matrix.m42; // px;
                    this.translate.z = matrix.m43; // px;
                    this.scale.x = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.scale.y = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.scale.z = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.skew.x = 0;
                    this.skew.y = 0;

                } else if (matrix2dMatch !== null) {
                    /*****************/
                    /*** 2D MATRIX ***/
                    /*****************/
                    var a = parseFloat(matrix2dMatch[1]);
                    var b = parseFloat(matrix2dMatch[2]);
                    var c = parseFloat(matrix2dMatch[3]);
                    var d = parseFloat(matrix2dMatch[4]);
                    var e = parseFloat(matrix2dMatch[5]);
                    var f = parseFloat(matrix2dMatch[6]);

                    var delta = a * d - b * c;

                    this.rotate.x = 0; // deg;
                    this.rotate.y = 0; // deg;
                    this.rotate.z = 0; // deg;

                    this.translate.x = e; // px;
                    this.translate.y = f; // px;
                    this.translate.z = 0; // px;

                    this.scale.x = 1;
                    this.scale.y = 1;
                    this.scale.z = 1;

                    this.skew.x = 0;
                    this.skew.y = 0;

                    if (this.decompositionType === decompositionTypeEnum.QRLike) {
                        // Apply the QR-like decomposition.
                        if (a != 0 || b != 0) {
                            var r = Math.sqrt(a * a + b * b);
                            this.rotate.z = (b > 0 ? Math.acos(a / r) : -Math.acos(a / r));
                            this.scale.x = r;
                            this.scale.y = delta / r;
                            this.skew.x = Math.atan((a * c + b * d) / (r * r));
                            this.skew.y = 0;
                        } else if (c != 0 || d != 0) {
                            var s = Math.sqrt(c * c + d * d);
                            this.rotate.z = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
                            this.scale.x = delta / s;
                            this.scale.y = s;
                            this.skew.x = 0;
                            this.skew.y = Math.atan((a * c + b * d) / (s * s));
                        } else { // a = b = c = d = 0
                            this.rotate.z = 0;
                            this.scale.x = 0;
                            this.scale.y = 0;
                            this.skew.x = 0;
                            this.skew.y = 0;
                        }
                    } else {
                        // Apply the LU-like decomposition.
                        if (a != 0) {
                            this.rotate.z = 0;
                            this.scale.x = a;
                            this.scale.y = delta / a;
                            this.skew.x = Math.atan(c / a);
                            this.skew.y = Math.atan(b / a);
                        } else if (b != 0) {
                            this.rotate.z = Math.PI / 2;
                            this.scale.x = b;
                            this.scale.y = delta / b;
                            this.skew.x = Math.atan(d / b);
                            this.skew.y = 0;
                        } else { // a = b = 0
                            this.rotate.z = 0;
                            this.scale.x = c;
                            this.scale.y = d;
                            this.skew.x = Math.PI / 4;
                            this.skew.y = 0;
                            this.scale.x = 0;
                            this.scale.y = 1;
                        }
                    }
                }
            }
        }
        return this.matrix;
    };
    Matrix.prototype.compose = function () {
        var matrix = new transform.matrix();
        if (is3dSupported) {
            matrix = matrix.translate(this.translate.x, this.translate.y, this.translate.z);
            matrix = matrix.scale(this.scale.x, this.scale.y, this.scale.z);
            matrix = matrix.rotate(this.rotate.x, this.rotate.y, this.rotate.z);
        } else {
            matrix = matrix.translate(this.translate.x, this.translate.y);
            matrix = matrix.scale(this.scale.x, this.scale.y);
            matrix = matrix.rotate(this.rotate.z);
        }
        return matrix;
    };
    Matrix.prototype.get = function () {
        this.decompose();
        console.log(this.toString());
    };
    Matrix.prototype.set = function () {
        var matrix = this.compose().toString();
        this.element.style[transform.name] = matrix;
        // console.log('Matrix.set', matrix);
        // console.log(this.toString());
    };
    Matrix.prototype.toString = function () {
        var t = this.translate;
        var r = this.rotate;
        var s = this.scale;
        return 'Matrix translate(' + t.x + ',' + t.y + ',' + t.z + ') rotate(' + r.x + ',' + r.y + ',' + r.z + ') scale(' + s.x + ',' + s.y + ',' + s.z + ')';
    };
    return Matrix;

}]);

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

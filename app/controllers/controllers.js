/* global angular, app */

app.controller('RootCtrl', ['$scope', '$location', '$timeout', '$http', '$templateCache', '$compile', '$window', 'Appearance', 'Links', function ($scope, $location, $timeout, $http, $templateCache, $compile, $window, Appearance, Links) {

    $scope.appearance = Appearance;
    $scope.links = Links;

    $scope.stop = function ($event) {
        $event.stopImmediatePropagation();
        return true;
    };
    $scope.goBack = function () {
        $window.history.back();
    };

}]);

app.controller('NegotiationReportCtrl', ['$scope', '$route', '$filter', '$location', 'State', 'Utils', 'Api', 'Appearance', 'Links', 'DataFilter', 'DataSource', 'Columns', 'Range', 'colTypes', 'user', function ($scope, $route, $filter, $location, State, Utils, Api, Appearance, Links, DataFilter, DataSource, Columns, Range, colTypes, user) {

    var state = $scope.state = new State();

    $scope.user = user;
    $scope.title = $route.current.$$route.title;

    var tabs = $scope.tabs = [{
        id: 1,
        name: 'Periodo',
        template: 'partials/report/filters/interval',
        icon: 'icon-time',
    }, {
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
    }, ];
    tabs.show = true;
    tabs.description = 'partials/report/description-negotiations';
    tabs.id = 1;

    var filters = $scope.filters = new DataFilter();
    var ranges = $scope.ranges = [
        new Range().currentQuarter().set(filters),
        new Range().currentSemester(),
        new Range().currentYear(),
    ];
    var cols = $scope.cols = new Columns([{
        name: 'Periodo', value: 'monthShort', key: 'dt', sort: 'dt', type: colTypes.TEXT, active: true, hasSearch: true, groupBy: true,
    }, {
        name: 'Commerciale', value: 'agent.name', key: 'agent.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Gruppo Cliente', value: 'customerGroup.name', key: 'customerGroup.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Cliente / Prospect', value: 'customer.name', key: 'customer.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Regione', value: 'region.name', key: 'region.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Sede Websolute', value: 'office.name', key: 'office.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Famiglia', value: 'family.name', key: 'family.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Categoria', value: 'category.name', key: 'category.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Prodotto', value: 'product.name', key: 'product.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Fornitore', value: 'supplier.name', key: 'supplier.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Stato Trattativa', value: 'negotiation.status.name', key: 'negotiation.status.id', type: colTypes.STATUS, active: false, groupBy: true,
    }, {
        name: 'Stato Preventivo / Macrostima', value: 'estimation.status.name', key: 'estimation.status.id', type: colTypes.STATUS, active: false, groupBy: true,
    }, {
        name: 'Stato Progetto', value: 'project.status.name', key: 'project.status.id', type: colTypes.STATUS, active: false, groupBy: true,
    }, {
        name: 'Rai Preventivo / Macrostima', value: 'rai.name', key: 'rai.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Responsabile Progetto Presale', value: 'manager.name', key: 'manager.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Titolo Progetto', value: 'project.name', key: 'project.id', type: colTypes.LINK, active: false, hasSearch: true, groupBy: true,
        link: function (item) {
            if (item.project && item.project.id) {
                return Links.project(item.project.id, '_blank');
            }
        }
    }, {
        name: 'Titolo Trattativa', value: 'negotiation.name', key: 'negotiation.id', type: colTypes.LINK, active: false, hasSearch: true, groupBy: true,
        link: function (item) {
            if (item.negotiation && item.negotiation.id) {
                return Links.negotiation(item.negotiation.id, '_blank');
            }
        }
    }, {
        name: 'Titolo Preventivo / Macrostima', value: 'estimation.name', key: 'estimation.id', type: colTypes.LINK, active: false, hasSearch: true, groupBy: true,
        link: function (item) {
            if (item.estimation && item.estimation.id) {
                return Links.negotiationRecord(item.estimation, item.negotiation, '_blank');
            }
        }
    }, {
        name: 'Conteggio Trattative', value: 'negotiation.count', key: 'negotiation.id', type: colTypes.NUMBER, active: true, hasSearch: true, count: true, aggregate: true,
    }, {
        name: 'Budget cliente ipotizzato', value: 'negotiation.budgetCustomer', key: 'negotiation.id', type: colTypes.COSTS, active: false, aggregate: true,
    }, {
        name: 'Importo proposto (medio)', value: 'budget', key: 'id', type: colTypes.COSTS, active: true, aggregate: true,
    }, {
        name: 'Importo da listino (medio)', value: 'costCatalog', key: 'id', type: colTypes.COSTS, active: false, aggregate: true,
    }, {
        name: 'Importo in ordine', value: 'costOrdered', key: 'id', type: colTypes.COSTS, active: true, aggregate: true,
    }, {
        name: 'Ore stimate (media)', value: 'hours', key: 'id', type: colTypes.HOURS, active: false, aggregate: true,
    }, {
        name: 'Ore budget presale', value: 'negotiation.hoursBudget', key: 'negotiation.id', type: colTypes.HOURS, active: false, aggregate: true,
        pop: function (item) {
            var pop = null;
            if (item.project && item.project.id && cols.activeInRange(['project.name', 'negotiation.name', 'estimation.name'])) {
                pop = getPop(item);
            }
            return pop;
        }
    }, {
        name: 'Ore fatte presale', value: 'negotiation.hoursDone', key: 'negotiation.id', type: colTypes.HOURS, active: false, aggregate: true,
        pop: function (item) {
            var pop = null;
            if (item.project && item.project.id && cols.activeInRange(['project.name', 'negotiation.name', 'estimation.name'])) {
                pop = getPop(item);
            }
            return pop;
        }
    }, /*{
        name: 'Importo in trattativa da', value: 'budgetFrom', key: 'id', type: colTypes.COSTS, active: true, aggregate: true,
    }, {
        name: 'Importo in trattativa a', value: 'budgetTo', key: 'id', type: colTypes.COSTS, active: true, aggregate: true,
    }, */, /*{
        name: 'Ore vendute da', value: 'hoursFrom', key: 'id', type: colTypes.HOURS, active: false, aggregate: true,
    }, {
        name: 'Ore vendute a', value: 'hoursTo', key: 'id', type: colTypes.HOURS, active: false, aggregate: true,
    }, */]);
    function getPop(item) {
        return {
            template: 'partials/pop/project',
            item: {
                customer: {
                    name: item.customer.name,
                },
                agent: {
                    name: item.agent.name,
                },
                project: {
                    id: item.project.id,
                    name: item.project.name,
                },
            },
            controller: 'ProjectPopCtrl',
        };
    }
    cols = $scope.cols = cols.expand();
    var colGroups = $scope.colGroups = [{
        name: 'Anagrafica',
        cols: [
            Utils.where(cols, { value: 'agent.name' }),
            Utils.where(cols, { value: 'customerGroup.name' }),
            Utils.where(cols, { value: 'customer.name' }),
            Utils.where(cols, { value: 'region.name' }),
            Utils.where(cols, { value: 'office.name' }),
        ]
    }, {
        name: 'Categorizzazione',
        cols: [
            Utils.where(cols, { value: 'family.name' }),
            Utils.where(cols, { value: 'category.name' }),
            Utils.where(cols, { value: 'product.name' }),
            Utils.where(cols, { value: 'supplier.name' }),
        ]
    }, {
        name: 'Stato',
        cols: [
            Utils.where(cols, { value: 'negotiation.status.name' }),
            Utils.where(cols, { value: 'estimation.status.name' }),
            Utils.where(cols, { value: 'project.status.name' }),
        ]
    }, {
        name: 'Titolo',
        cols: [
            Utils.where(cols, { value: 'negotiation.name' }),
            Utils.where(cols, { value: 'estimation.name' }),
            Utils.where(cols, { value: 'project.name' }),
        ]
    }, {
        name: 'Altro',
        cols: [
            Utils.where(cols, { value: 'monthShort' }),
            Utils.where(cols, { value: 'manager.name' }),
            Utils.where(cols, { value: 'rai.name' }),
        ]
    }, ];
    var valGroups = $scope.valGroups = [{
        name: 'Importi ed Ore',
        cols: [
            Utils.where(cols, { value: 'negotiation.count' }),
            Utils.where(cols, { value: 'negotiation.budgetCustomer' }),
            Utils.where(cols, { value: 'budget' }),
            Utils.where(cols, { value: 'costCatalog' }),
            Utils.where(cols, { value: 'costOrdered' }),
            Utils.where(cols, { value: 'hours' }),
            Utils.where(cols, { value: 'negotiation.hoursBudget' }),
            Utils.where(cols, { value: 'negotiation.hoursDone' }),
            // Utils.where(cols, { value: 'budgetFrom' }),
            // Utils.where(cols, { value: 'budgetTo' }),
            // Utils.where(cols, { value: 'hoursFrom' }),
            // Utils.where(cols, { value: 'hoursTo' }),
        ]
    }];
    var excludes = $scope.excludes = [{
        name: 'Commercializzato', filter: function (row) {
            return !row.marketed;
        }
    }, {
        name: 'Budget Media', filter: function (row) {
            return [23, 24, 25, 26].indexOf(row.product.id) === -1;
        }
    }, {
        name: 'Non Caratteristico', filter: function (row) {
            return row.family.id !== 12;
        }
    }];
    var includes = $scope.includes = [{
        name: 'Solo Canoni', filter: function (row) {
            return row.rented;
        }
    }, {
        name: 'Solo Una Tantum', filter: function (row) {
            return !row.rented;
        }
    }, {
        name: 'Nuovi Clienti', filter: function (row) {
            return filters.dateFrom ? new Date(row.customer.date) > filters.dateFrom : true;
        }
    }];
    var chartDatas;
    function GroupColumns(rows, items, compares) {
        // console.log(rows, items, compares);
        chartDatas = [];
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
                chartDatas.push(row);
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
    $scope.groupChart = function () {
        console.log('groupChart');
        var months = filters.getMonths();
        var defaultLabel = 'Importo in trattativa';
        var firstCol = cols.getFirstCol();
        // var values = firstCol && firstCol.values.length > 1 ? firstCol.values.slice(1) : [];
        var values = firstCol && firstCol.values ? firstCol.values : [];
        if (values.length) {
            chart.series = [];
            chart.data = [];
            angular.forEach(values, function (value) {
                chart.series.push(value.name);
                chart.data.push([]);
            });
        } else {
            chart.series = [defaultLabel];
            chart.data = [[]];
        }
        chart.labels = [];
        // console.log('firstCol', firstCol, values);
        var groups = {}, mindex = {}, vindex = [];
        angular.forEach(months, function (month, mm) {
            mindex[month.id] = mm;
            chart.labels.push(month.nameShort);
            if (values.length) {
                angular.forEach(values, function (value, vv) {
                    chart.data[vv][mm] = 0;
                });
            } else {
                chart.data[0][mm] = 0;
            }
        });
        angular.forEach(values, function (value, vv) {
            // console.log('value', value.id, value);
            vindex[value.id] = vv;
        });
        angular.forEach(chartDatas, function (row, ii) {
            var mm = mindex[row.dt];
            var vv = 0;
            if (firstCol) {
                vv = vindex[firstCol.getKey(row)];
            }
            var key = vv + '-' + mm;
            var item = groups[key];
            if (!item) {
                item = groups[key] = angular.copy(row);
                chart.data[vv][mm] = row.budget;
            } else {
                chart.data[vv][mm] += row.budget;
            }
        });
    }
    var compares;
    var source = $scope.source = new DataSource({
        unpaged: true,
        uri: function () {
            return '/api/reports/negotiations';
        },
        filters: filters,
        resolveItems: function (items, rows, comparing) {
            angular.forEach(items, function (item, index) {
                item.id = this.id;
                var date = new Date(item.negotiation.date);
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
    var chart = $scope.chart = {
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
                            return $filter('customNumber')(value, 0, ' €');
                        }
                    }
                }],
                callbacks: {
                    label: function (label) {
                        console.log('b');
                        return $filter('currency')(label.value);
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
                        return label + ': ' + $filter('customNumber')(datasetLabel, 0, ' €');
                    },
                }
            },
        },
        onClick: function (points, evt) {
            console.log('chart', points, evt);
        },
        datasetOverride: [],
    };
    cols.showReport = true;

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
            angular.isFunction(col.active) ? null : col.active = false;
            col.search = null;
            switch (col.value) {
                case 'monthShort':
                case 'negotiation.count':
                case 'budget':
                case 'costOrdered':
                    col.active = true;
                    break;
            }
        });
        cols = $scope.cols = cols.sort(function (a, b) {
            return a.id - b.id;
        });
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
        return item.status ? 'status-' + Appearance.negotiationClass(item.status.id) : '';
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
    $scope.onOpen = function (item) {
        $location.path('/trattative/' + item.id);
    };
    $scope.excel = function (columns, rows) {
        console.log('excel', columns, rows);
        var json = {
            name: 'Report Trattative',
            description: 'Report trattative dal ' + $filter('date')(filters.dateFrom, 'dd MMM yyyy') + ' al ' + $filter('date')(filters.dateTo, 'dd MMM yyyy'),
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

    state.ready();

}]);

app.controller('WorkloadReportCtrl', ['$scope', '$route', '$filter', '$location', '$q', 'State', 'Utils', 'Api', 'Appearance', 'Links', 'DataFilter', 'DataSource', 'Columns', 'Range', 'ChartData', 'colTypes', 'user', function ($scope, $route, $filter, $location, $q, State, Utils, Api, Appearance, Links, DataFilter, DataSource, Columns, Range, ChartData, colTypes, user) {

    var state = $scope.state = new State();

    $scope.user = user;
    $scope.title = $route.current.$$route.title;

    var tabs = $scope.tabs = [/*{
        id: 1,
        name: 'Periodo',
        template: 'partials/report/filters/interval',
        icon: 'icon-time',
    }, */{
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
    tabs.description = 'partials/report/description-workloads';
    tabs.id = 2;

    var sources = $scope.sources = {};
    state.busy();
    $q.all([
        Api.reports.workforce().then(function success(response) {
            sources.workforce = response;
            var types = ['area', 'team', 'office', 'resource'];            
            angular.forEach(types, function (type) {
                sources[type] = {};
            });
            angular.forEach(sources.workforce, function (item) {
                var hoursAmountDone = (item.resource.hoursAmountDone || 0);
                var hoursWeekly = (item.resource.active ? (item.resource.hoursWeekly || 0) : 0);
                angular.forEach(types, function (type) {
                    var id = item[type].id;
                    var source = sources[type][id] = (sources[type][id] || {});
                    source.hoursAmountDone = (source.hoursAmountDone || 0) + hoursAmountDone;
                    source.hoursWeekly = (source.hoursWeekly || 0) + hoursWeekly;
                    source.name = item[type].name;
                });
            });
            console.log(sources);
        }),
    ]).then(function success(response) {
        state.success();
        Init();
    }, function error(response) {
        state.error(response);
    });

    var chartDatas, datas;

    function getSource(row) {
        var source = { hoursAmountDone: 0, hoursWeekly: 0 };
        switch(cols.radios.workloads) {
            case 'supplier.name':
                if (sources.area) {
                    return sources.area[row.area.id] || source;
                }
                break;
            case 'office.name':
                if (sources.office) {
                    return sources.office[row.office.id] || source;
                }
                break;
            case 'team.name':
                if (sources.team) {
                    return sources.team[row.team.id] || source;
                }
                break;
            case 'resource.name':
                if (sources.resource) {
                    return sources.resource[row.resource.id] || source;
                }
                break;
        }
        return source;
    }
    function getPop(item) {
        return {
            template: 'partials/pop/project',
            item: {
                customer: {
                    name: item.customer.name,
                },
                agent: {
                    name: item.agent.name,
                },
                project: {
                    id: item.project.id,
                    name: item.project.name,
                },
            },
            controller: 'ProjectPopCtrl',
        };
    }
    function GroupColumns(rows, items, compares) {
        // console.log(rows, items, compares);
        chartDatas = [];
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
                chartDatas.push(row);
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
        datas = items;
        // $scope.groupChart();
    }
    
    var filters = $scope.filters = new DataFilter();
    var ranges = $scope.ranges = [
        new Range().currentQuarter().set(filters),
        new Range().currentSemester(),
        new Range().currentYear(),
    ];
    var cols = $scope.cols = new Columns([/*, {
        name: 'Famiglia', value: 'family.name', key: 'family.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Categoria', value: 'category.name', key: 'category.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Prodotto', value: 'product.name', key: 'product.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }*/, {
        name: 'Fornitore', value: 'supplier.name', key: 'supplier.id', type: colTypes.TEXT, active: true, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'Sede Websolute', value: 'office.name', key: 'office.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'Team', value: 'team.name', key: 'team.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'Risorsa', value: 'resource.name', key: 'resource.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'Cliente / Prospect', value: 'customer.name', key: 'customer.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Commerciale', value: 'agent.name', key: 'agent.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Capogruppo', value: 'chief.name', key: 'chief.id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Titolo Ordine', value: 'order.name', key: 'order.id', type: colTypes.LINK, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Stato Ordine', value: 'order.status.name', key: 'order.status.id', type: colTypes.STATUS, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Periodo', value: 'monthShort', key: 'dt', sort: 'dt', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true,
    }, {
        name: 'Conteggio Ordini', value: 'order.count', key: 'order.id', type: colTypes.NUMBER, active: false, hasSearch: true, count: true, aggregate: true,
    }, /*{
        name: 'Monte ore', value: 'order.hoursAmount', key: 'order.id', type: colTypes.HOURS, active: true, aggregate: true, 
    }, */{
        name: 'Residuo ordini', value: 'orderRecord.costUnbilled', key: 'orderRecord.id', type: colTypes.COSTS, active: true, aggregate: true, color: 1,
    }, {
        name: 'Carico residuo', value: 'orderRecord.hoursUnworked', key: 'orderRecord.id', type: colTypes.HOURS, active: true, aggregate: true, color: 1,
    }, {
        name: 'Residuo canoni', value: 'rented ? orderRecord.costUnbilled : 0', raw: 'orderRecord.costUnbilledRented', key: 'orderRecord.id', type: colTypes.COSTS, active: true, aggregate: true, color: 2,
    }, {
        name: 'Residuo una tantum', value: 'rented ? 0 : orderRecord.costUnbilled', raw: 'orderRecord.costUnbilledUnrented', key: 'orderRecord.id', type: colTypes.COSTS, active: true, aggregate: true, color: 2,
    }, {
        name: 'Carico canoni', value: 'rented ? orderRecord.hoursUnworked : 0', raw: 'orderRecord.hoursUnworkedRented', key: 'orderRecord.id', type: colTypes.HOURS, active: true, aggregate: true, color: 3,
    }, {
        name: 'Carico una tantum', value: 'rented ? 0 : orderRecord.hoursUnworked', raw: 'orderRecord.hoursUnworkedUnrented', key: 'orderRecord.id', type: colTypes.HOURS, active: true, aggregate: true, color: 3,
    }, {
        name: 'Carico settimanale da canoni', value: 'orderRecord.hoursBudget / 220 * 5', raw: 'order.hoursBudgetWeekly', key: 'orderRecord.id', type: colTypes.HOURS, active: true, aggregate: true, color: 4,
    }, {
        name: 'Carico settimanale da monte ore', value: function (row) {
            return (getSource(row).hoursAmountDone || 0) / 220 * 5;
        }, raw: 'hoursAmountDone', key: function (row) {
            var id = 0;
            switch (cols.radios.workloads) {
                case 'supplier.name':
                    id = row.area.id;
                    break;
                case 'office.name':
                    id = row.office.id;
                    break;
                case 'team.name':
                    id = row.team.id;
                    break;
                case 'resource.name':
                    id = row.resource.id;
                    break;
            }
            return id;
        }, type: colTypes.HOURS, active: true, aggregate: true, color: 4,
    }, {
        name: 'Forza lavoro settimanale totale', value: function (row) {
            return (getSource(row).hoursWeekly || 0);
        }, raw: 'hoursWeekly', key: function (row) {
            var id = 0;
            switch (cols.radios.workloads) {
                case 'supplier.name':
                    id = row.area.id;
                    break;
                case 'office.name':
                    id = row.office.id;
                    break;
                case 'team.name':
                    id = row.team.id;
                    break;
                case 'resource.name':
                    id = row.resource.id;
                    break;
            }
            return id;
        }, type: colTypes.HOURS, active: true, aggregate: true, color: 5,
    }, {
        name: 'Forza lavoro settimanale al netto del mo e canoni', value: function (row) {
            return 0;
        }, post: 'hoursWeekly - order.hoursBudgetWeekly - hoursAmountDone', raw: 'hoursForce', key: 'orderRecord.id', type: colTypes.HOURS, active: true, aggregate: true, color: 5,
    }, {
        name: 'Settimane per evadere il carico attuale una tantum', value: function (row) {
            return 0; // applicare post processing; // return Math.max(0, ((row.rented ? 0.00 : (row.orderRecord.hoursUnworked || 0)) / ((getSource(row).hoursWeekly || 0) - (row.orderRecord.hoursBudget / 220 * 5) - ((getSource(row).hoursAmountDone || 0) / 220 * 5))));
        }, post: function (row) {
            return Math.max(0, ((row.rented ? 0.00 : (row.orderRecord.hoursUnworked || 0)) / (row.hoursWeekly - row.order.hoursBudgetWeekly - row.hoursAmountDone)));
        }, raw: 'weeks', key: 'orderRecord.id', type: colTypes.WEEKS, active: true, aggregate: true,
    }]);
    cols = $scope.cols = cols.expand({ dynamic: true, compare: false });
    cols.showReport = true;
    var colGroups = $scope.colGroups = [{
        name: 'Carichi',
        cols: [
            /*Utils.where(cols, { value: 'family.name' }),
            Utils.where(cols, { value: 'category.name' }),
            Utils.where(cols, { value: 'product.name' }),*/
            Utils.where(cols, { value: 'supplier.name' }),
            Utils.where(cols, { value: 'office.name' }),
            Utils.where(cols, { value: 'team.name' }),
            Utils.where(cols, { value: 'resource.name' }),            
        ]
    }, {
        name: 'Altro',
        cols: [
            Utils.where(cols, { value: 'customer.name' }),
            Utils.where(cols, { value: 'order.name' }),
            Utils.where(cols, { value: 'order.status.name' }),
            Utils.where(cols, { value: 'monthShort' }),
            // Utils.where(cols, { value: 'agent.name' }),
            // Utils.where(cols, { value: 'chief.name' }),
        ]
    }, ];
    var valGroups = $scope.valGroups = [{
        name: 'Importi, Ore e Conteggi',
        cols: [
            Utils.where(cols, { value: 'order.count' }),
            Utils.where(cols, { value: 'orderRecord.costUnbilled' }),
            Utils.where(cols, { value: 'orderRecord.hoursUnworked' }),
            Utils.where(cols, { raw: 'orderRecord.costUnbilledRented' }),
            Utils.where(cols, { raw: 'orderRecord.costUnbilledUnrented' }),
            Utils.where(cols, { raw: 'orderRecord.hoursUnworkedRented' }),
            Utils.where(cols, { raw: 'orderRecord.hoursUnworkedUnrented' }),
            Utils.where(cols, { raw: 'order.hoursBudgetWeekly' }),
            Utils.where(cols, { raw: 'hoursAmountDone' }),
            Utils.where(cols, { raw: 'hoursWeekly' }),
            Utils.where(cols, { raw: 'hoursForce' }),
            Utils.where(cols, { raw: 'weeks' }),
        ]
    }];
    var excludes = $scope.excludes = [{
        name: 'Monte ore / tutti i reparti', filter: function (row) {
            return !(row.supplier.id === 15143);
        }, active: true,
    }, /*{
        name: 'Commercializzato', filter: function (row) {
            return !row.marketed;
        }
    }, {
        name: 'Budget Media', filter: function (row) {
            return [23, 24, 25, 26].indexOf(row.product.id) === -1;
        }
    }, {
        name: 'Non Caratteristico', filter: function (row) {
            return row.family.id !== 12;
        }
    },*/];
    var includes = $scope.includes = [/*{
        name: 'Solo Canoni', filter: function (row) {
            return row.rented;
        }
    }, {
        name: 'Solo Una Tantum', filter: function (row) {
            return !row.rented;
        }
    }, {
        name: 'Nuovi Clienti', filter: function (row) {
            return filters.dateFrom ? new Date(row.customer.date) > filters.dateFrom : true;
        }
    }*/];

    var compares;
    var source = $scope.source = new DataSource({
        unpaged: true,
        uri: function () {
            return '/api/reports/workloads';
        },
        filters: filters,
        resolveItems: function (items, rows, comparing) {
            angular.forEach(items, function (item, index) {
                item.id = this.id;
                var date = new Date(item.order.date);
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
    
    $scope.groupChart = function () {
        console.log('groupChart', datas);
        var months = filters.getMonths();
        var defaultLabel = 'Settimane';
        var firstCol = cols.getFirstCol();
        // var values = firstCol && firstCol.values.length > 1 ? firstCol.values.slice(1) : [];
        var values = firstCol && firstCol.values ? firstCol.values : [];
        if (values.length) {
            chart.series = [];
            chart.data = [];
            angular.forEach(values, function (value) {
                chart.series.push(value.name);
                chart.data.push([]);
            });
        } else {
            chart.series = [defaultLabel];
            chart.data = [[]];
        }
        chart.labels = [];
        // console.log('firstCol', firstCol, values);
        var groups = {}, mindex = {}, vindex = [];
        angular.forEach(months, function (month, mm) {
            mindex[month.id] = mm;
            chart.labels.push(month.nameShort);
            if (values.length) {
                angular.forEach(values, function (value, vv) {
                    chart.data[vv][mm] = 0;
                });
            } else {
                chart.data[0][mm] = 0;
            }
        });
        angular.forEach(values, function (value, vv) {
            // console.log('value', value.id, value);
            vindex[value.id] = vv;
        });
        angular.forEach(datas, function (row, ii) {
            var mm = mindex[row.dt];
            var vv = 0;
            if (firstCol) {
                vv = vindex[firstCol.getKey(row)];
            }
            var key = vv + '-' + mm;
            var item = groups[key];
            if (!item) {
                item = groups[key] = angular.copy(row);
                chart.data[vv][mm] = row.weeks;
            } else {
                chart.data[vv][mm] += row.weeks;
            }
        });
    }

    var chart = $scope.chart = new ChartData();

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
            angular.isFunction(col.active) ? null : col.active = false;
            col.search = null;
            switch (col.value) {
                case 'supplier.name':
                case 'orderRecord.costUnbilled':
                case 'orderRecord.hoursUnworked':
                    col.active = true;
                    break;
            }
            switch (col.raw) {
                case 'orderRecord.costUnbilledRented':
                case 'orderRecord.costUnbilledUnrented':
                case 'orderRecord.hoursUnworkedRented':
                case 'orderRecord.hoursUnworkedUnrented':
                case 'order.hoursBudgetWeekly':
                case 'hoursAmountDone':
                case 'hoursWeekly':
                case 'hoursForce':
                case 'weeks':
                    col.active = true;
                    break;
            }
        });
        cols = $scope.cols = cols.sort(function (a, b) {
            return a.id - b.id;
        });
        cols.radios.workloads = 'supplier.name';
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

}]);

app.controller('ProjectPopCtrl', ['$scope', 'State', 'Api', function ($scope, State, Api) {
    var state = $scope.state = new State();

    var item = $scope.item;

    var rows = $scope.rows = [];

    $scope.getBudgetInitial = function () {
        var hours = 0;
        angular.forEach(rows, function (row) {
            hours += row.budgetInitial;
        });
        return hours;
    };
    $scope.getBudget = function () {
        var hours = 0;
        angular.forEach(rows, function (row) {
            hours += row.budget;
        });
        return hours;
    };
    $scope.getHoursDone = function () {
        var hours = 0;
        angular.forEach(rows, function (row) {
            hours += row.hoursDone;
        });
        return hours;
    };

    state.busy();
    Api.reports.project(item.project.id).then(function success(response) {
        rows = $scope.rows = response;
        // console.log('ProjectPopCtrl', rows);
        state.ready();
    }, function error(response) {
        state.error(response);
    });
}]);

app.controller('TableCtrl', ['$scope', function ($scope) {

    $scope.init = function (source) {
        $scope.source = source;
        $scope.state = $scope.source.state;
        $scope.source.paging();
    };

}]);

app.controller('TestCtrl', ['$scope', '$route', '$filter', '$location', '$http', '$q', 'State', 'Utils', 'Api', 'Appearance', 'Links', 'DataFilter', 'DataSource', 'Columns', 'Range', 'ChartData', 'colTypes', function ($scope, $route, $filter, $location, $http, $q, State, Utils, Api, Appearance, Links, DataFilter, DataSource, Columns, Range, ChartData, colTypes) {

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
    tabs.description = 'partials/report/description-workloads';
    tabs.id = 2;

    function GroupColumns(rows, items, compares) {
        // console.log(rows, items, compares);
        chartDatas = [];
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
                chartDatas.push(row);
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
        datas = items;
        // $scope.groupChart();
    }
    
    var filters = $scope.filters = new DataFilter();
    var ranges = $scope.ranges = [
        new Range().currentQuarter().set(filters),
        new Range().currentSemester(),
        new Range().currentYear(),
    ];
    var cols = $scope.cols = new Columns([{
        name: 'owner', value: 'owner.login', key: 'owner.id', type: colTypes.TEXT, active: true, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'name', value: 'name', key: 'id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'workloads',
    }, {
        name: 'description', value: 'description', key: 'id', type: colTypes.TEXT, active: false, hasSearch: true, groupBy: true, radio: 'workloads',
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
        name: 'A', value: 'score * 2', raw: 'A', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
    }, {
        name: 'B', value: 'A * 2', raw: 'B', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
    }, {
        name: 'C', value: 'B / A', raw: 'C', key: 'id', type: colTypes.NUMBER, active: true, aggregate: true
    }]);
    cols = $scope.cols = cols.expand({ dynamic: true, compare: false });
    cols.showReport = true;
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
            return 'https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100';
        },
        filters: filters,
        resolveItems: function (items, rows, comparing) {
            console.log(items);
            items = items.items;
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
            angular.isFunction(col.active) ? null : col.active = false;
            col.search = null;
            switch (col.value) {
                case 'supplier.name':
                case 'orderRecord.costUnbilled':
                case 'orderRecord.hoursUnworked':
                    col.active = true;
                    break;
            }
            switch (col.raw) {
                case 'orderRecord.costUnbilledRented':
                case 'orderRecord.costUnbilledUnrented':
                case 'orderRecord.hoursUnworkedRented':
                case 'orderRecord.hoursUnworkedUnrented':
                case 'order.hoursBudgetWeekly':
                case 'hoursAmountDone':
                case 'hoursWeekly':
                case 'hoursForce':
                case 'weeks':
                    col.active = true;
                    break;
            }
        });
        cols = $scope.cols = cols.sort(function (a, b) {
            return a.id - b.id;
        });
        cols.radios.workloads = 'supplier.name';
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



  $scope.output = "A";

  $http.get('https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100').then(function success(response) {
    $scope.output = response;
  });

}]);

/* global angular, app */

app.controller('DemoCtrl', ['$scope', '$filter', '$http', 'State', 'Table', 'colTypes', function ($scope, $filter, $http, State, Table, colTypes) {
    var state = $scope.state = new State();

    var paths = $scope.paths = [{
        name: 'Countries',
        uri: 'api/restcountries.all.js',
    }, /*{
        name: 'Countries',
        uri: 'https://restcountries.eu/rest/v2/all',
    }, */{
        name: 'Beers!',
        uri: 'https://api.punkapi.com/v2/beers?per_page=80',
    }, /*{
        name: 'Drone Streak Api',
        uri: 'https://api.dronestre.am/data',
    },*/{
        name: 'Earthquakes USGS',
        uri: 'https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2017-01-01&endtime=2017-01-02',
    },{
        name: 'Game of Throne Books',
        uri: 'https://anapioficeandfire.com/api/books',
    }, {
        name: 'Game of Throne Houses',
        uri: 'https://anapioficeandfire.com/api/houses',
    }, {
        name: 'Uk Police Data',
        uri: 'https://data.police.uk/api/crimes-street/all-crime?poly=52.268,0.543:52.794,0.238:52.130,0.478&date=2016-06',
    }, {
        name: 'Universities',
        uri: 'https://raw.githubusercontent.com/Hipo/university-domains-list/master/world_universities_and_domains.json',
    }, {
        name: 'Git',
        uri: 'https://api.github.com/search/repositories?q=tetris+language:javascript&sort=stars&order=desc&per_page=100',
    }];
    paths.custom = { name:'Report', uri: null };

    var table;
    var load = $scope.load = function(path) {
        if (state.busy()) {
            var uri = path.uri;
            paths.current = path;
            $http.get(uri).then(function success(response) {
                var datas = response.data;
                table = $scope.table = Table.fromDatas(datas);
                table.name = paths.current.name;
                state.ready();
            }, function (response) {
                state.error(response);
            });
        }
    }
    load(paths[0]);

    $scope.$on('onDropItem', function (scope, event) {
        table.swap(event.from.model, event.to.model);
    });
    $scope.$on('onDropOut', function (scope, event) {
        // console.log('NegotiationReportCtrl.onDropOut', event.model, event.from, event.to, event.target);
    });

    $scope.stop = function ($event) {
        $event.stopImmediatePropagation();
        return true;
    };

/*
    
    var tabs = $scope.tabs = [{
        id: 1,
        name: 'Columns',
        template: 'partials/report/filters/columns',
        icon: 'icon-columns',
    }, {
        id: 2,
        name: 'Values',
        template: 'partials/report/filters/values',
        icon: 'icon-values',
    }, {
        id: 3,
        name: 'Options',
        template: 'partials/report/filters/flags',
        icon: 'icon-options',
    },];
    tabs.opened = false;
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
    $scope.excel = function excel(columns, rows) {
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
            return;
        }, function error(response) {
            state.error(response);
        });
    };
*/
}]);

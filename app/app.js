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
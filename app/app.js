/*--------------------------------------------------
W S  N E T  P R O J E C T
project website by websolute
--------------------------------------------------*/

/* global angular */

"use strict";

var HOUR_COST = 60; // 55

//var app = angular.module('app', ['ngTagsInput', 'ui.bootstrap', 'ngFileUpload', 'ui.tree']);
var app = angular.module('app', ['ngRoute', 'ngMessages', 'ngSilent', 'ui.bootstrap', 'relativeDate', 'ngFileUpload', 'ngSanitize', 'textAngular', 'uiSwitch', 'rzModule', 'ngJsonExplorer', 'chart.js']); // , 'ngAnimate', 'ngTagsInput'

app.constant('ROUTES', window.routes ? window.routes : []);

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

    $rootScope.broadcast = function (event, params) {
        $rootScope.$broadcast(event, params);
    };
    
    $rootScope.log = function () {
        if (console && console.info) {
            console.info.apply(console, arguments);
        }
    };


}]);

/* global angular */

"use strict";

var app = angular.module('app', ['reports', 'ngSanitize', 'ngMessages']); //, 'ngSilent', 'ui.bootstrap', 'relativeDate', 'ngFileUpload', 'textAngular', 'uiSwitch', 'rzModule', 'ngJsonExplorer', 'chart.js']);

app.config(['$httpProvider', function ($httpProvider) {
    
    // $httpProvider.defaults.withCredentials = true;

}]);

/*
app.run(['$rootScope', function ($rootScope) {

}]);
*/
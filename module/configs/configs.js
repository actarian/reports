/* global angular, module */

window.console ? null : window.console = { log: function () { } };

/*
window.domain = '//' + location.hostname + (location.port ? ':' + location.port : ''); // location.protocol + 
module.constant('domain', domain);
*/

module.constant('colTypes', {
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
    GAIN: 14,
    ICON: 15,
    BUTTONS: 16,
    DISABLED: 17,
    LINK: 18,
    BOOL: 19,
    DOUBLE: 20,
    WEEKS: 21,
});

module.constant('fieldTypes', {
    TEXT: 1,
    BOOL: 2,
    NUMBER: 3,
    DOUBLE: 4,
    PERCENT: 5,
    GAIN: 6,
    COSTS: 7,
    HOURS: 8,
    WEEKS: 9,
    DATE: 10,
    STATUS: 11,    
    RESOURCE: 12,
    LINK: 13,
});

module.constant('fieldTotalTypes', {
    SUM: 1,
    MIN: 2,
    MAX: 3,
    AVG: 4,
});

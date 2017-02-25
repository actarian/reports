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
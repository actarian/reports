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

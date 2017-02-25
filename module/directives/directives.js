/* global angular, module */

var aid = 0; // application unique id counter using for dev

module.directive('state', ['$timeout', function ($timeout) {
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

module.directive('sortable', ['$timeout', function ($timeout) {    
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

module.directive('draggableItem', ['$parse', '$timeout', 'Utils', 'Style', 'ElementRect', 'Droppables', function ($parse, $timeout, Utils, Style, ElementRect, Droppables) {

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

module.directive('droppableItem', ['$parse', 'Utils', 'Style', 'Droppables', function ($parse, Utils, Style, Droppables) {
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

module.directive('onClickOut', ['$document', '$parse', '$timeout', 'Utils', function ($document, $parse, $timeout, Utils) {
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

module.directive('toggler', ['$document', '$parse', '$timeout', 'Utils', function ($document, $parse, $timeout, Utils) {
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

/* global angular, module */

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

module.directive('stickyTableHeader', ['$rootScope', '$window', '$timeout', 'Utils', 'Animate', 'Style', function ($rootScope, $window, $timeout, Utils, Animate, Style) {
    return {
        restrict: 'A',
        link: function (scope, element, attributes, model) {
            if (Utils.ua.mobile || Utils.ua.msie) {
                element.addClass('sticky-disabled');
                return;
            }
            var stickySelector = attributes.stickyTableHeader !== undefined ? attributes.stickyTableHeader : '.fixed';
            var stickedClass = attributes.stickedClass !== undefined ? attributes.stickedClass : 'sticked';
            // OPTIONS
            var isSticked = false,
                scrollDir = 0,
                scrollDirCount = 0,
                scrollPointY = 0,
                scrollPointToY = 0,
                stickyY = 0,
                elementY = 0,
                elementPreviousY = 0,
                elementRect,
                elementTop,
                content,
                contentStyle = new Style();
            function draw() {
                update();
                content = content || angular.element(element[0].querySelector(stickySelector));
                scrollPointY += (scrollPointToY - scrollPointY) / 4;
                if (elementY < scrollPointY) {
                    stickyY = Math.min(element[0].offsetHeight - 215, (elementY - scrollPointY) * -1);
                    if (!isSticked) {
                        isSticked = true;
                        element.addClass(stickedClass);
                    }
                } else {
                    stickyY = 0;
                    if (isSticked) {
                        isSticked = false;
                        element.removeClass(stickedClass);
                    }
                }
                contentStyle.transform('translate3d(0, ' + stickyY + 'px, 0)');
                contentStyle.set(content[0]);
                return;
            }
            var animate = new Animate(draw); // , Utils.ua.safari);            
            function update() {
                elementRect = element[0].getBoundingClientRect();
                if (elementY === elementRect.top) {
                    elementPreviousY = elementY;
                    return;
                }
                elementY = elementRect.top;
                if (elementY >= elementPreviousY) {
                    scrollDirCount++;
                } else {
                    scrollDirCount--;
                }
                if (scrollDirCount > 3) {
                    scrollDirCount = 0;
                    // console.log('up')
                    scrollDir = 1;
                    scrollPointToY = 79;
                } else if (scrollDirCount < -3) {
                    scrollDirCount = 0;
                    // console.log('down')                    
                    scrollDir = 0;
                    scrollPointToY = 0;
                }
                elementPreviousY = elementY;
            }
            function addListeners() {
                animate.play();
            }
            function removeListeners() {
                animate.pause();
            }
            scope.$on('$destroy', function () {
                removeListeners();
            });
            var native = element[0];
            scope.$watchCollection(function () {
                var cols = Array.prototype.slice.call(native.querySelectorAll('.real th'), 0);
                var dummies = Array.prototype.slice.call(native.querySelectorAll('.dummy th'), 0);
                if (cols.length === dummies.length) {
                    var watchlist = cols.concat(dummies);
                    return watchlist.map(function (th) {
                        return th.getBoundingClientRect().width;
                    });
                } else {
                    return [];
                }
            }, function (widths) {
                var cols = native.querySelectorAll('.real th');
                var dummies = native.querySelectorAll('.dummy th');
                if (cols.length === dummies.length) {
                    angular.forEach(dummies, function (col, index) {
                        var width = col.getBoundingClientRect().width;
                        cols[index].style.width = width + 'px';
                        cols[index].style.minWidth = width + 'px';
                    });
                }
            });
            addListeners();
        }
    };
}]);

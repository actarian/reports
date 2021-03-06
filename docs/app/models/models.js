﻿/* global angular, app */

app.factory('Vector', function () {
    function Vector(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }
    Vector.make = function (a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    };
    Vector.size = function (a) {
        return Math.sqrt(a.x * a.x + a.y * a.y);
    };
    Vector.normalize = function (a) {
        var l = Vector.size(a);
        a.x /= l;
        a.y /= l;
        return a;
    };
    Vector.incidence = function (a, b) {
        var angle = Math.atan2(b.y, b.x) - Math.atan2(a.y, a.x);
        // if (angle < 0) angle += 2 * Math.PI;
        // angle = Math.min(angle, (Math.PI * 2 - angle));
        return angle;
    };
    Vector.distance = function (a, b) {
        return Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
    };
    Vector.cross = function (a, b) {
        return (a.x * b.y) - (a.y * b.x);
    };
    Vector.difference = function (a, b) {
        return new Vector(b.x - a.x, b.y - a.y);
    };
    Vector.power = function (a, b) {
        var x = Math.abs(b.x - a.x);
        var y = Math.abs(b.y - a.y);
        return (x + y) / 2;
    };
    Vector.prototype = {
        size: function () {
            return Vector.size(this);
        },
        normalize: function () {
            return Vector.normalize(this);
        },
        incidence: function (b) {
            return Vector.incidence(this, b);
        },
        cross: function (b) {
            return Vector.cross(this, b);
        },
        distance: function (b) {
            return Vector.distance(this, b);
        },
        difference: function (b) {
            return Vector.difference(this, b);
        },
        power: function () {
            return (Math.abs(this.x) + Math.abs(this.y)) / 2;
        },
        towards: function (b, friction) {
            friction = friction || 0.125;
            this.x += (b.x - this.x) * friction;
            this.y += (b.y - this.y) * friction;
            return this;
        },
        add: function (b) {
            this.x += b.x;
            this.y += b.y;
            return this;
        },
        friction: function (b) {
            this.x *= b;
            this.y *= b;
            return this;
        },
        copy: function (b) {
            return new Vector(this.x, this.y);
        },
        toString: function () {
            return '{' + this.x + ',' + this.y + '}';
        },
    };
    return Vector;
});

app.factory('ElementRect', ['Vector', function (Vector) {
    function ElementRect() {
        this.x = 0;
        this.y = 0;
        this.width = 0;
        this.height = 0;
        this.center = new Vector();
    }
    ElementRect.fromNative = function (nativeElement) {
        return new ElementRect().set(nativeElement);
    }
    ElementRect.prototype = {
        set: function (nativeElement) {
            var rect = nativeElement.getBoundingClientRect();
            this.x = rect.left;
            this.y = rect.top;
            this.width = nativeElement.offsetWidth;
            this.height = nativeElement.offsetHeight;
            this.center.x = this.x + this.width / 2;
            this.center.y = this.y + this.height / 2;
            this.native = nativeElement;
            return this;
        },
        offset: function (vector) {
            this.x += vector.x;
            this.y += vector.y;
            this.center.x = this.x + this.width / 2;
            this.center.y = this.y + this.height / 2;
            return this;
        },
        intersect: function (element) {
            // console.log('intersect.this', this, 'element', element);
            return !(element.x > this.x + this.width ||
                        element.x + element.width < this.x ||
                        element.y > this.y + this.height ||
                        element.y + element.height < this.y);
        },
        toString: function () {
            return '{' + this.x + ',' + this.y + ',' + this.width + ',' + this.height + '}';
        },
    };
    return ElementRect;
}]);

app.factory('Style', function () {
    var prefix = function detectTransformProperty() {
        var transform = 'transform',
            webkit = 'webkitTransform';
        var div = document.createElement("DIV");
        if (typeof div.style[transform] !== 'undefined') {
            ['webkit', 'moz', 'o', 'ms'].every(function (prop) {
                var prefixed = '-' + prop + '-transform';
                if (typeof div.style[prefixed] !== 'undefined') {
                    prefix = prefixed;
                    return false;
                }
                return true;
            });
        } else if (typeof div.style[webkit] !== 'undefined') {
            prefix = '-webkit-transform';
        } else {
            prefix = undefined;
        }
        return prefix;
    }();
    function Style() {
        this.props = {
            scale: 1,
            hoverScale: 1,
            currentScale: 1,
        }
    }
    Style.prototype = {
        set: function (element) {
            var styles = [];
            angular.forEach(this, function (value, key) {
                if (key !== 'props')
                    styles.push(key + ':' + value);
            });
            element.style.cssText = styles.join(';') + ';';
        },
        transform: function (transform) {
            this[prefix] = transform;
        },
        transformOrigin: function (x, y) {
            this[prefix + '-origin-x'] = (Math.round(x * 1000) / 1000) + '%';
            this[prefix + '-origin-y'] = (Math.round(y * 1000) / 1000) + '%';
        },
    };
    Style.prefix = prefix;
    return Style;
});

app.factory('Matrix', [function () {
    var transform = { name: 'transform', key: 'transform', matrix: null };
    var is3dSupported = function isSupported3d() {
        if (!window.getComputedStyle) {
            return false;
        }
        transform.matrix = window.WebKitCSSMatrix || window.MozCSSMatrix || window.MsCSSMatrix || window.OCSSMatrix || window.CSSMatrix;
        if (!transform.matrix) {
            return false;
        }
        var element = document.createElement('div'),
            has = false,
            properties = {
                webkitTransform: '-webkit-transform',
                OTransform: '-o-transform',
                msTransform: '-ms-transform',
                MozTransform: '-moz-transform',
                transform: 'transform'
            };

        document.body.insertBefore(element, null);
        for (var p in properties) {
            if (element.style[p] !== undefined) {
                element.style[p] = "translate3d(1px,1px,1px)";
                has = window.getComputedStyle(element).getPropertyValue(properties[p]);
                transform.name = p;
                transform.key = properties[p];
                break;
            }
        }
        document.body.removeChild(element);
        return (has !== undefined && has.length > 0 && has !== "none");
    }(transform);
    var decompositionTypeEnum = {
        QRLike: 1,
        LULike: 2,
    };

    function Matrix(element) {
        this.element = element || document.createElement('div');
        this.translate = { x: 0, y: 0, z: 0 };
        this.rotate = { x: 0, y: 0, z: 0 };
        this.scale = { x: 1, y: 1, z: 1 };
        this.skew = { x: 0, y: 0 };
        this.matrix = this.decompose();
        this.decompositionType = decompositionTypeEnum.QRLike;
        console.log('Matrix', is3dSupported, transform);
        this.get();
    }
    Matrix.prototype.decompose = function () {
        var computedStyle = window.getComputedStyle(this.element);
        var style = computedStyle[transform.name]; //.transform || computedStyle.WebkitTransform || computedStyle.MozTransform || computedStyle.msTransform || computedStyle.OTransform;
        if (!style) {
            this.matrix = new transform.matrix();
        } else {
            style = style.trim();
            this.matrix = new transform.matrix(style);
            if (style === 'none') {
                this.translate.x = this.translate.y = this.translate.z = 0;
                this.rotate.x = this.rotate.y = this.rotate.z = 0;
                this.scale.x = this.scale.y = this.scale.z = 1;
                this.skew.x = this.skew.y = 0;

            } else {
                var matrix3dRegexp = /matrix3d\((.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*),(.*)\)/;
                var matrix3dMatch = matrix3dRegexp.exec(style);

                var matrix2dRegexp = /matrix\((.*),(.*),(.*),(.*),(.*),(.*)\)/;
                var matrix2dMatch = matrix2dRegexp.exec(style);

                if (matrix3dMatch !== null) {
                    /*****************/
                    /*** 3D MATRIX ***/
                    /*****************/
                    var matrix = new transform.matrix(style);
                    if (!matrix || isNaN(matrix.a) || isNaN(matrix.b) || isNaN(matrix.c) || isNaN(matrix.m41) || isNaN(matrix.m42) || isNaN(matrix.m43) || isNaN(matrix.m11)) {
                        throw "Could not catch CSSMatrix constructor for current browser, OR the constructor has returned a non-standard matrix object (need .a, .b, .c and mXX numerical properties to work)";
                    }
                    this.rotate.x = Math.asin(matrix.m22) * 180 / Math.PI; // deg;
                    this.rotate.y = Math.acos(matrix.m11) * 180 / Math.PI * (matrix.m13 > 0 ? -1 : 1); // deg
                    this.rotate.z = 0; // "TODO: Sorry, math people. I really need help here! Please implement this case for me. This will help you: http://9elements.com/html5demos/matrix3d/";
                    this.translate.x = matrix.m41; // px;
                    this.translate.y = matrix.m42; // px;
                    this.translate.z = matrix.m43; // px;
                    this.scale.x = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.scale.y = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.scale.z = matrix.m11; // if (matrix.m11 === matrix.m22 && matrix.m22 === matrix.m33)
                    this.skew.x = 0;
                    this.skew.y = 0;

                } else if (matrix2dMatch !== null) {
                    /*****************/
                    /*** 2D MATRIX ***/
                    /*****************/
                    var a = parseFloat(matrix2dMatch[1]);
                    var b = parseFloat(matrix2dMatch[2]);
                    var c = parseFloat(matrix2dMatch[3]);
                    var d = parseFloat(matrix2dMatch[4]);
                    var e = parseFloat(matrix2dMatch[5]);
                    var f = parseFloat(matrix2dMatch[6]);

                    var delta = a * d - b * c;

                    this.rotate.x = 0; // deg;
                    this.rotate.y = 0; // deg;
                    this.rotate.z = 0; // deg;

                    this.translate.x = e; // px;
                    this.translate.y = f; // px;
                    this.translate.z = 0; // px;

                    this.scale.x = 1;
                    this.scale.y = 1;
                    this.scale.z = 1;

                    this.skew.x = 0;
                    this.skew.y = 0;

                    if (this.decompositionType === decompositionTypeEnum.QRLike) {
                        // Apply the QR-like decomposition.
                        if (a != 0 || b != 0) {
                            var r = Math.sqrt(a * a + b * b);
                            this.rotate.z = (b > 0 ? Math.acos(a / r) : -Math.acos(a / r));
                            this.scale.x = r;
                            this.scale.y = delta / r;
                            this.skew.x = Math.atan((a * c + b * d) / (r * r));
                            this.skew.y = 0;
                        } else if (c != 0 || d != 0) {
                            var s = Math.sqrt(c * c + d * d);
                            this.rotate.z = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
                            this.scale.x = delta / s;
                            this.scale.y = s;
                            this.skew.x = 0;
                            this.skew.y = Math.atan((a * c + b * d) / (s * s));
                        } else { // a = b = c = d = 0
                            this.rotate.z = 0;
                            this.scale.x = 0;
                            this.scale.y = 0;
                            this.skew.x = 0;
                            this.skew.y = 0;
                        }
                    } else {
                        // Apply the LU-like decomposition.
                        if (a != 0) {
                            this.rotate.z = 0;
                            this.scale.x = a;
                            this.scale.y = delta / a;
                            this.skew.x = Math.atan(c / a);
                            this.skew.y = Math.atan(b / a);
                        } else if (b != 0) {
                            this.rotate.z = Math.PI / 2;
                            this.scale.x = b;
                            this.scale.y = delta / b;
                            this.skew.x = Math.atan(d / b);
                            this.skew.y = 0;
                        } else { // a = b = 0
                            this.rotate.z = 0;
                            this.scale.x = c;
                            this.scale.y = d;
                            this.skew.x = Math.PI / 4;
                            this.skew.y = 0;
                            this.scale.x = 0;
                            this.scale.y = 1;
                        }
                    }
                }
            }
        }
        return this.matrix;
    };
    Matrix.prototype.compose = function () {
        var matrix = new transform.matrix();
        if (is3dSupported) {
            matrix = matrix.translate(this.translate.x, this.translate.y, this.translate.z);
            matrix = matrix.scale(this.scale.x, this.scale.y, this.scale.z);
            matrix = matrix.rotate(this.rotate.x, this.rotate.y, this.rotate.z);
        } else {
            matrix = matrix.translate(this.translate.x, this.translate.y);
            matrix = matrix.scale(this.scale.x, this.scale.y);
            matrix = matrix.rotate(this.rotate.z);
        }
        return matrix;
    };
    Matrix.prototype.get = function () {
        this.decompose();
        console.log(this.toString());
    };
    Matrix.prototype.set = function () {
        var matrix = this.compose().toString();
        this.element.style[transform.name] = matrix;
        // console.log('Matrix.set', matrix);
        // console.log(this.toString());
    };
    Matrix.prototype.toString = function () {
        var t = this.translate;
        var r = this.rotate;
        var s = this.scale;
        return 'Matrix translate(' + t.x + ',' + t.y + ',' + t.z + ') rotate(' + r.x + ',' + r.y + ',' + r.z + ') scale(' + s.x + ',' + s.y + ',' + s.z + ')';
    };
    return Matrix;

}]);

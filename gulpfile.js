var gulp = require('gulp'),

    /*
    less = require('gulp-less'),
    path = require('path'),
    jshint = require('gulp-jshint'),
    csslint = require('gulp-csslint'),
    scsslint = require('gulp-scss-lint'),
    plumber = require('gulp-plumber'),
    fs = require('fs'),
    promise = require('es6-promise'),
    rewrite = require('connect-modrewrite'),
    */

    autoprefixer = require('gulp-autoprefixer'),
    coffee = require('gulp-coffee'),
    concat = require('gulp-concat'),
    cssmin = require('gulp-cssmin'),
    html2js = require('gulp-html2js'),
    livereload = require('gulp-livereload'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    watch = require('gulp-watch'),
    webserver = require('gulp-webserver');

var folder = './';


/*-------------------------------------------------
SASS
-------------------------------------------------*/
gulp.task('sass:compile', function () {
    return gulp.src([
            './sass/**/*.scss',
            '!/**/_*.scss',
        ], {
            base: '.'
        })
        //.pipe(scsslint())
        // .pipe(sourcemaps.init())
        .pipe(sass().on('sass:compile.error', function (error) {
            console.log('sass:compile:error', error);
        }))
        .pipe(rename('repotable.css'))
        .pipe(gulp.dest('./docs/dist')) // save .css
        .pipe(autoprefixer()) // autoprefixer
        .pipe(cssmin())
        // .pipe(sourcemaps.write('.')) // save .map
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('./docs/dist')); // save .min.css
});
gulp.task('sass:watch', function () {
    return gulp.watch('./sass/**/*.scss', ['sass:compile'])
        .on('change', function (e) {
            console.log(e.type + ' watcher did change path ' + e.path);
        });
});
gulp.task('sass', ['sass:compile', 'sass:watch']);

/*******************
 *** JS TEMPLATE *** 
 *******************/
var templates = './module/templates/**/*.html';
gulp.task('templates:bundle:0', function () {
    return gulp.src(templates, {
            base: '.'
        })
        .pipe(rename({
            dirname: 'repotable/partials/', // flatten directory
            extname: '',
        }))
        .pipe(html2js('templates.js', {
            adapter: 'angular',
            base: '.',
            name: 'repotable',
            // fileHeaderString: '/* global angular: false */',
            indentString: '\t',
            // quoteChar: '\'',
            singleModule: true,
            useStrict: true,
        }))
        .pipe(gulp.dest('./module/templates')) // save .js
        /*
        .pipe(sourcemaps.init())
        .pipe(uglify()) // { preserveComments: 'license' }
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.')) // save .map
        .pipe(gulp.dest('.')); // save .min.js
        */
});
gulp.task('templates:bundles', ['templates:bundle:0'], function (done) {
    done();
});
gulp.task('templates:watch', function () {
    return gulp.watch(templates, ['templates:bundles'])
        .on('change', function (e) {
            console.log(e.type + ' watcher did change path ' + e.path);
        });
});


/******************
 *** JS BUNDLES ***
 ******************/
var jsbundle = [
    './module/b.js',
    './module/module.js',
    './module/configs/configs.js',
    './module/controllers/controllers.js',
    './module/directives/directives.js',
    './module/filters/filters.js',
    './module/models/models.js',
    './module/services/services.js',
    './module/templates/templates.js',
    './module/e.js',
];
gulp.task('js:bundle:0', function () {
    return gulp.src(jsbundle, {
            base: '.'
        })
        .pipe(rename({
            dirname: '', // flatten directory
        }))
        .pipe(concat('./docs/dist/repotable.js')) // concat bundle
        .pipe(gulp.dest('.')) // save .js
        .pipe(sourcemaps.init())
        .pipe(uglify()) // { preserveComments: 'license' }
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write('.')) // save .map
        .pipe(gulp.dest('.')); // save .min.js
});
gulp.task('js:bundles', ['js:bundle:0'], function (done) {
    done();
});
gulp.task('js:watch', function () {
    return gulp.watch(jsbundle, ['js:bundles'])
        .on('change', function (e) {
            console.log(e.type + ' watcher did change path ' + e.path);
        });
});


/*-------------------------------------------------
COFFEE
-------------------------------------------------*/
gulp.task('coffee', function () {
    gulp.src(folder + '**/*.coffee')
        .pipe(coffee({
            bare: true
        }))
        .pipe(gulp.dest(folder));
});


/*-------------------------------------------------
WEBSERVER
-------------------------------------------------*/
gulp.task('webserver', function () {
    return gulp.src(folder)
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            port: 5555,
            open: 'http://localhost:5555/docs/index.html',
            fallback: 'docs/index.html'
        }));
});

/*-------------------------------------------------
COMPILE
-------------------------------------------------*/
gulp.task('compile', ['sass:compile', 'templates:bundles', 'js:bundles'], function (done) {
    done();
});

/*-------------------------------------------------
WATCH
-------------------------------------------------*/
/*
gulp.task('watch', function () {
    var watcher = gulp.watch(folder + '**/
/*.js', ['js']);
    watcher.on('change', function (e) {
        console.log('watcher on change type ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
*/
gulp.task('watch', ['sass:watch', 'templates:watch', 'js:watch'], function (done) {
    done();
});

/*-------------------------------------------------
START
-------------------------------------------------*/
// gulp.task('start', ['webserver', 'coffee', 'watch']);
gulp.task('default', ['compile', 'webserver', 'watch']);
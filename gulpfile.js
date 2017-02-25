var gulp = require('gulp'),
/*
less = require('gulp-less'),
sass = require('gulp-sass'),
path = require('path'),
watch = require('gulp-watch'),
autoprefixer = require('gulp-autoprefixer'),
jshint = require('gulp-jshint'),
csslint = require('gulp-csslint'),
scsslint = require('gulp-scss-lint'),
plumber = require('gulp-plumber'),
fs = require('fs'),
promise = require('es6-promise'),
rewrite = require('connect-modrewrite'),
*/

coffee = require('gulp-coffee'),
livereload = require('gulp-livereload'),
webserver = require('gulp-webserver'),

rename = require('gulp-rename'),
concat = require('gulp-concat'),
sourcemaps = require('gulp-sourcemaps'),
uglify = require('gulp-uglify'),
watch = require('gulp-watch');

var folder = './';

/*-------------------------------------------------
LESS
-------------------------------------------------*/
gulp.task('less', function () {
    gulp.src('*.less').pipe(livereload());
});


/******************
 *** JS BUNDLES ***
 ******************/
var jsbundle = [
    './module/__begin.js',
    './module/module.js',
    './module/configs/configs.js',
    './module/controllers/controllers.js',
    './module/directives/directives.js',
    './module/filters/filters.js',
    './module/models/models.js',
    './module/services/services.js',
    './module/__end.js',    
];
gulp.task('js:bundle:0', function() {
    return gulp.src(jsbundle, { base: '.' })
    .pipe(rename({
        dirname: '', // flatten directory
    }))
    .pipe(concat('./docs/modules/report.js')) // concat bundle
    .pipe(gulp.dest('.')) // save .js
    .pipe(sourcemaps.init())
    .pipe(uglify()) // { preserveComments: 'license' }
    .pipe(rename({ extname: '.min.js' }))
    .pipe(sourcemaps.write('.')) // save .map
    .pipe(gulp.dest('.')); // save .min.js
});
gulp.task('js:bundles', ['js:bundle:0'], function(done) { 
    done(); 
});
gulp.task('js:watch', function () {
    return gulp.watch(jsbundle, ['js:bundles'])
    .on('change', function(e) {
        console.log(e.type + ' watcher did change path ' + e.path);
    });
});


/*-------------------------------------------------
COFFEE
-------------------------------------------------*/
gulp.task('coffee', function () {
    gulp.src(folder + '**/*.coffee')
      .pipe(coffee({bare: true}))
      .pipe(gulp.dest(folder));
});


/*-------------------------------------------------
WEBSERVER
-------------------------------------------------*/
gulp.task('webserver', function () {
    return gulp.src(folder + 'docs/')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            port: 5555,
            open: 'http://localhost:5555/index.html',
            fallback: 'index.html'
        }));
});

/*-------------------------------------------------
COMPILE
-------------------------------------------------*/
gulp.task('compile', ['js:bundles'], function(done) { done(); });

/*-------------------------------------------------
WATCH
-------------------------------------------------*/
/*
gulp.task('watch', function () {
    var watcher = gulp.watch(folder + '**//*.js', ['js']);
    watcher.on('change', function (e) {
        console.log('watcher on change type ' + e.type + ' path: ' + e.path);
    });
    return watcher;
});
*/
gulp.task('watch', ['js:watch'], function(done) { done(); });

/*-------------------------------------------------
START
-------------------------------------------------*/
// gulp.task('start', ['webserver', 'coffee', 'watch']);
gulp.task('default', ['compile', 'webserver', 'watch']);
var gulp = require('gulp');

/*
var less = require('gulp-less');
var path = require('path');
var watch = require('gulp-watch');
var autoprefixer = require('gulp-autoprefixer');
*/
var coffee = require('gulp-coffee');
var livereload = require('gulp-livereload');
var webserver = require('gulp-webserver');

var folder = './';

/*-------------------------------------------------
LESS
-------------------------------------------------*/
gulp.task('less', function () {
    gulp.src('*.less').pipe(livereload());
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
WATCH
-------------------------------------------------*/
gulp.task('watch', function () {
    var watcher = gulp.watch(folder + '**/*.coffee', ['coffee']);
    watcher.on('change', function (e) {
        console.log('watcher on change type ' + e.type + ' path: ' + e.path);
    });
    return watcher;
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
            open: 'http://localhost:5555/index.html',
            fallback: 'index.html'
        }));
});


/*-------------------------------------------------
START
-------------------------------------------------*/
// gulp.task('start', ['webserver', 'coffee', 'watch']);
gulp.task('default', ['webserver', 'watch']);
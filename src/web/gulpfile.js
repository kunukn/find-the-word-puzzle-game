'use strict';

var paths = {
    babel: {
        from: './src/scripts/*-es6.js',
        to: './assets/scripts'
    },
    sass: {
        from: './src/styles/*.scss',
        to: './assets/styles'
    }
}

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    babel = require("gulp-babel"),
    rename = require('gulp-rename'),
    notify = require('gulp-notify'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create();

gulp.task('default', ['watch'], function() {
    return browserSync.init({
        server: {
            baseDir: ["./"],
            index: "index.html"
        },        
        port: 3003,
        files: ["*.html", "assets/styles/*.css", "assets/scripts/*.js"]
    });
});


gulp.task('sass', function() {
    return gulp.src(paths.sass.from)
        .pipe(sass.sync().on('error', sass.logError))
        .pipe(gulp.dest(paths.sass.to))
        .pipe(notify({
            message: 'sass task complete'
        }));
});


gulp.task("babel", function() {
    return gulp.src(paths.babel.from)
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(rename(function(path) {
            path.basename = path.basename.replace(/-es6$/, '');
        }))
        .pipe(gulp.dest(paths.babel.to))
        .pipe(notify({
            message: 'babel task complete'
        }));
});

gulp.task('watch', function() {
    gulp.watch(paths.sass.from, ['sass']);
    gulp.watch(paths.babel.from, ['babel']);
});

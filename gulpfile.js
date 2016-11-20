var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

gulp.task('uglify-js', function() {
    return gulp.src(['hot-swap.js'])
        .pipe(uglify())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./'));
});

gulp.task('default', ['uglify-js']);
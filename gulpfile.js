/**
 * Created by johnuiterwyk on 3/12/16.
 */
// Include gulp
var gulp = require('gulp');

// Define base folders
var src = 'src/';
var dest = 'build/';

// Include plugins
var concat = require('gulp-concat');

// Concatenate JS Files
gulp.task('concat', function() {
    return gulp.src(src+'*.js')
        .pipe(concat('JetLagCore.js'))
        .pipe(gulp.dest(dest));
});

// Watch for changes in files
gulp.task('watch', function() {
    // Watch .js files
    gulp.watch(src + '*.js', ['concat']);
});

// Default Task
gulp.task('default', ['concat']);
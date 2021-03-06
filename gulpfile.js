const gulp = require('gulp');
const responsive = require('gulp-responsive');
const $ = require('gulp-load-plugins')();
const minify = require('gulp-minify');
const concat = require('gulp-concat');

const jsFiles = [
  'js/dbhelper.js',
  'js/sw_check.js',
  'js/main.js',
  'js/restaurant_info.js'
]
gulp.task('compressJs', function() {
  return gulp.src(jsFiles)
    .pipe(concat('scripts.js'))
    .pipe(gulp.dest('dist/js'))
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
    }))
    .pipe(gulp.dest('dist/js'))
});

gulp.task('responsiveImg', function () {
  return gulp.src('img/*.jpg')
    .pipe($.responsive({
      '*.jpg': [{
        width: 400,
        rename: {
          suffix: '-400px',
          extname: '.jpg',
        }
      }, {
        width: 600,
        rename: {
          extname: '.jpg',
        },
        // Do not enlarge the output image if the input image are already less than the required dimensions.
        withoutEnlargement: true,
      }, {
        // Convert images to the webp format
        width: 400,
        rename: {
          suffix: '-400px',
          extname: '.webp',
        },
        quality: 2
      }, {
        width: 600,
        rename: {
          extname: '.webp',
        },
        quality: 2,
        // Do not enlarge the output image if the input image are already less than the required dimensions.
        withoutEnlargement: true,
      }],
    }, {
      // Global configuration for all images
      // The output quality for JPEG, WebP and TIFF output formats
      quality: 20,
      // Use progressive (interlace) scan for JPEG and PNG output
      progressive: true,
      // Strip all metadata
      withMetadata: false,
      // Do not emit the error when image is enlarged.
      errorOnEnlargement: false,
    }))
    .pipe(gulp.dest('dist/img'));
});

gulp.task('watch', function(){
  gulp.watch('js/*.js', ['compressJs']);
  gulp.watch('img/*.jpg', ['responsiveImg']);
});

gulp.task('build', ['responsiveImg', 'compressJs']);

gulp.task('default', ['build', 'watch']);


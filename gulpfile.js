let fileswatch = 'html,txt,json,woff2,woff,eot,ttf';
const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app' },
    notify: false,
  });
}

function styles() {
  return src('app/scss/style.scss')
    .pipe(concat('style.css'))
    .pipe(sass())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions', 'not dead'],
        grid: true,
        cascade: false,
      })
    )
    .pipe(sourcemaps.init())
    .pipe(
      csso({
        comments: false,
        sourceMap: true,
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src('app/script/common.js')
    .pipe(sourcemaps.init())
    .pipe(concat('common.min.js'))
    .pipe(
      uglify({
        toplevel: true,
      })
    )
    .pipe(sourcemaps.write('./'))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function clear() {
  return del(['app/css/**/*', 'app/js/**/*']);
}

function startwatch() {
  watch('app/scss/**/*', parallel('styles'));
  watch(['app/**/*.js', '!app/js/*.min.js'], parallel('scripts'));
  watch('app/**/*.{' + fileswatch + '}').on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.clear = clear;
exports.assets = series(clear, styles, scripts);
exports.default = parallel(clear, styles, scripts, browsersync, startwatch);

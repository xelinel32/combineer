const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const terser = require('gulp-terser');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'src' },
    notify: false,
  });
}

function styles() {
  return src('src/scss/style.scss')
    .pipe(concat('style.css'))
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
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
    .pipe(
      sourcemaps.write('./', {
        addComment: false,
      })
    )
    .pipe(dest('src/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src('src/script/common.js')
    .pipe(sourcemaps.init())
    .pipe(concat('common.min.js'))
    .pipe(
      terser({
        toplevel: true,
      })
    )
    .pipe(sourcemaps.write('./'), {
      addComment: false,
    })
    .pipe(dest('src/js'))
    .pipe(browserSync.stream());
}

function clear() {
  return del(['src/css', 'src/js']);
}

function startwatch() {
  watch('src/scss/**/*', parallel('styles'));
  watch(['src/script/*.js', '!src/js/*.min.js'], parallel('scripts'));
  watch('src/**/*.html').on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.clear = clear;
exports.assets = series(clear, styles, scripts);
exports.default = parallel(clear, styles, scripts, browsersync, startwatch);

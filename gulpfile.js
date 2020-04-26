const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-image');
const newer = require('gulp-newer');
const fileinclude = require('gulp-file-include');

let imageswatch = 'jpg, jpeg, png, webp, svg';

function browsersync() {
  browserSync.init({
    server: { baseDir: 'dest' },
    notify: false,
  });
}

function styles() {
  return src([
    'node_modules/normalize.css/normalize.css',
    'src/scss/style.scss',
  ])
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: 'compressed',
      }).on('error', sass.logError)
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['>0.2%', 'not dead', 'not op_mini all'],
      })
    )
    .pipe(
      cleancss({
        level: 2,
        sourceMap: true,
      })
    )
    .pipe(concat('style.css'))
    .pipe(
      sourcemaps.write('./', {
        addComment: false,
      })
    )
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(
      uglify({
        toplevel: true,
      })
    )
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write('./'), {
      addComment: false,
    })
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

function html() {
  return src('src/**.html')
    .pipe(
      fileinclude({
        prefix: '@@'
      })
    )
    .pipe(
      htmlmin({
        collapseWhitespace: true,
        removeComments: true,
      })
    )
    .pipe(dest('dest'));
}

function img() {
  return src('src/img/**')
    .pipe(newer('src/img/**'))
    .pipe(imagemin())
    .pipe(dest('dest/img'));
}

function fonts() {
  return src('src/fonts/*').pipe(dest('dest/fonts'));
}

function clear() {
  return del('dest/**/*');
}

function startwatch() {
  watch('src/scss/**/*.scss', parallel('styles'));
  watch(['src/script/*.js', '!src/js/*.min.js'], parallel('scripts'));
  watch('src/img/*.{' + imageswatch + '}', parallel('img'));
  watch('src/*.html', parallel('html')).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.clear = clear;
exports.html = html;
exports.img = img;
exports.fonts = fonts;
exports.assets = series(clear, img, html, fonts, styles, scripts);
exports.default = parallel(clear, img, html, fonts, styles, scripts, browsersync, startwatch);

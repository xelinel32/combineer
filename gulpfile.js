const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-image');
const newer = require('gulp-newer');
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const polyfill = require('gulp-babel');

let imageswatch = 'jpg, jpeg, png, webp, svg';

function browsersync() {
  browserSync.init({
    server: { baseDir: 'dest' },
    notify: false,
  });
}

function styles() {
  return src('src/scss/style.scss')
    .pipe(sourcemaps.init())
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
    .pipe(
      csso({
        comments: false,
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
  return src('src/script/common.js')
    .pipe(sourcemaps.init())
    .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
    .pipe(
      polyfill({
        presets: ['@babel/env'],
      })
    )
    .pipe(
      uglify({
        toplevel: true,
      })
    )
    .pipe(concat('common.js'))
    .pipe(sourcemaps.write('./'), {
      addComment: false,
    })
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

function html() {
  return src('src/**.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
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
  return del('dest/**/*', {
    force: true,
  });
}

function startwatch() {
  watch('src/scss/**/*', parallel('styles'));
  watch(['src/script/*.js', '!src/js/*.min.js'], parallel('scripts'));
  watch('src/img/**.{' + imageswatch + '}', parallel('img'));
  watch('src/**.html', parallel('html')).on('change', browserSync.reload);
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

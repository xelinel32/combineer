let preprocessor = 'scss';
let fileswatch = 'html,htm,txt,json,md,woff2';
let imageswatch = 'jpg,jpeg,png,webp,svg';

const { src, dest, parallel, series, watch } = require('gulp');
const scss = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');

// Local Server

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app' },
    notify: false
  });
}

// Custom Styles & CSS Libraries

function styles() {
  return src([
    'app/' + preprocessor + '/main.*'
    // 'node_modules/normalize.css/normalize.css'
  ])
    .pipe(eval(preprocessor)())
    .pipe(concat('main.min.css'))
    .pipe(
      autoprefixer({ overrideBrowserslist: ['last 2 versions'], grid: true })
    )
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// Scripts & JS Libraries

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.min.js', // example (npm i --save-dev plugin)
    'app/script/common.js' // end point
  ])
    .pipe(concat('common.min.js'))
    .pipe(uglify()) // Minify JS (opt.)
    .pipe(dest('app/script'))
    .pipe(browserSync.stream());
}

// Image

function images() {
  return src('app/img/src/**/*')
    .pipe(newer('app/img/dest'))
    .pipe(imagemin())
    .pipe(dest('app/img/dest'));
}

function cleanimg() {
  return del('app/img/dest/**/*', { force: true });
}

// Watching

function startwatch() {
  watch('app/' + preprocessor + '/**/*', parallel('styles'));
  watch(['app/**/*.js', '!app/js/*.min.js'], parallel('scripts'));
  watch(['app/**/*.{' + imageswatch + '}'], parallel('images'));
  watch(['app/**/*.{' + fileswatch + '}']).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.assets = series(cleanimg, styles, scripts, images);
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.cleanimg = cleanimg;
exports.default = parallel(images, styles, scripts, browsersync, startwatch);

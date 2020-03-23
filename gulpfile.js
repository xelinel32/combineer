let preprocessor = 'scss'; // choose preprocessor folder/file ext.
let fileswatch = 'html,htm,txt,json,md,woff2,woff,eot,ttf'; // watching another file
let imageswatch = 'jpg,jpeg,png,webp,svg'; // work with img

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
const fontconvert = require('gulp-ttf2woff2');
const sourcemaps = require('gulp-sourcemaps');

// Local Server

function browsersync() {
  browserSync.init({
    server: { baseDir: 'app' },
    notify: false
  });
}

// Font Converter ttf to woff2

function fconvert() {
  return src('app/fonts/*.ttf')
    .pipe(fontconvert())
    .pipe(dest('app/fonts/dest'));
}

// Custom Styles & CSS Libraries

function styles() {
  return src('app/' + preprocessor + '/main.scss')
    .pipe(sourcemaps.init())
    .pipe(eval(preprocessor)())
    .pipe(concat('style.min.css'))
    .pipe(
      scss({
        outputStyle: 'compressed',
        imagePaths: '/img/dest/'
      })
    )
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 2 versions'],
        grid: true,
        cascade: false
      })
    )
    .pipe(cleancss({ level: { 2: { specialComments: 0 } }, sourceMap: true }))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

// Scripts & JS Libraries

function scripts() {
  return src(['node_modules/jquery/dist/jquery.js', 'app/script/common.js'])
    .pipe(sourcemaps.init())
    .pipe(concat('common.min.js'))
    .pipe(
      uglify({
        toplevel: true
      })
    ) // Minify JS (opt.)
    .pipe(sourcemaps.write('./', { addComment: false }))
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

// Image minify

function images() {
  return src('app/img/src/**/*')
    .pipe(newer('app/img/dest'))
    .pipe(imagemin())
    .pipe(dest('app/img/dest'));
}

function cleanimg() {
  return del('build/img/dest/**/*', { force: true });
}

// Watching

function startwatch() {
  watch('app/' + preprocessor + '/**/*', parallel('styles'));
  watch(['app/**/*.js', '!app/script/*.min.js'], parallel('scripts'));
  watch(['app/**/*.{' + imageswatch + '}'], parallel('images'));
  watch(['./*.{' + fileswatch + '}']).on('change', browserSync.reload);
}

exports.browsersync = browsersync;
exports.assets = series(cleanimg, fconvert, styles, scripts, images);
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.fconvert = fconvert;
exports.cleanimg = cleanimg;
exports.default = parallel(images, fconvert, styles, scripts, browsersync, startwatch);

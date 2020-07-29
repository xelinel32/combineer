const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const terser = require('gulp-terser')
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const imagemin = require('gulp-image');
const newer = require('gulp-newer');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');

const browsersync = () => {
  browserSync.init({
    server: { baseDir: 'dest' },
    notify: false,
    port: 3000,
    open: false,
    cors: true
  });
}

const styles = () => {
  return src([
    'node_modules/reset-css/reset.css',
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
        overrideBrowserslist: ['> 1%', 'last 2 versions', 'not dead'],
      })
    )
    .pipe(
      cleancss({
        level: 2,
        sourceMap: true,
      })
    )
    .pipe(concat('style.min.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

const scripts = () => {
  return src([
    'src/script/common.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(
      terser({
        toplevel: true,
      })
    )
    .pipe(concat('bundle.min.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

const fontPack = () => {
  return src('src/fonts/*').pipe(dest('dest/fonts'));
}

const imgPack = () =>{
  return src('src/img/**')
  .pipe(newer('dest/img/**'))
  .pipe(imagemin())
  .pipe(dest('dest/img'))  
}

const htmlFileInclude = () => {
    return src('src/**.html').pipe(fileinclude({prefix: '@@'})).pipe(dest('dest'))
}

const clear = () => {
  return del('dest/**/*');
}

const startwatch = () => {
  watch('src/scss/**/*.scss', parallel('styles'));
  watch('src/script/*.js', parallel('scripts'));
  watch('src/img/*', parallel('imgPack'));
  watch('src/*.html', parallel('htmlFileInclude')).on(
    'change',
    browserSync.reload
  );
}

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.clear = clear;
exports.fontPack = fontPack;
exports.htmlFileInclude = htmlFileInclude;
exports.imgPack = imgPack;
exports.build = series(clear, fontPack, imgPack, htmlFileInclude, styles, scripts);
exports.dev = parallel(clear, fontPack, imgPack, htmlFileInclude, styles, scripts, browsersync, startwatch);

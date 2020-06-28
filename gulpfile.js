const { src, dest, parallel, series, watch } = require('gulp');
const sass = require('gulp-sass');
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const babel = require('gulp-babel');

function browsersync() {
  browserSync.init({
    server: { baseDir: 'dest' },
    notify: false,
    port: 3000
  });
}

function styles() {
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
    .pipe(concat('style.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'src/script/common.js'
  ])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(
      uglify({
        toplevel: true,
      })
    )
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(dest('dest'))
    .pipe(browserSync.stream());
}

function fontPack() {
  return src('src/fonts/*').pipe(dest('dest/fonts'));
}

function imgPack(){
  return src('src/img/**').pipe(dest('dest/img'))  
}

function htmlFileInclude(){
    return src('src/**.html').pipe(fileinclude({prefix: '@@'})).pipe(dest('dest'))
}

function clear() {
  return del('dest/**/*');
}

function startwatch() {
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
exports.assets = series(clear, fontPack, imgPack ,htmlFileInclude, styles, scripts);
exports.default = parallel(clear, fontPack, imgPack ,htmlFileInclude, styles, scripts, browsersync, startwatch);

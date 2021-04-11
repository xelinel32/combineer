const {
  src, dest, parallel, series, watch
} = require('gulp');
const sass = require('gulp-sass'); // if you use sass(scss as default)
const cleancss = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const del = require('del');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const sourcemaps = require('gulp-sourcemaps');
const fileinclude = require('gulp-file-include');
const webpackStream = require('webpack-stream');
const svgSprite = require('gulp-svg-sprite');

const browsersync = () => {
  browserSync.init({
    server: { baseDir: 'dest' },
    notify: true,
    port: 4000,
    open: true,
  });
};

const styles = () => src('src/styles/style.scss')
  .pipe(sourcemaps.init())
  .pipe(
    sass({
      outputStyle: 'compressed',
    }).on('error', sass.logError)
  )
  .pipe(
    autoprefixer({
      overrideBrowserslist: ['> 3%', 'last 2 versions', 'not dead'],
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

const scripts = () => src('src/script/index.js')
  .pipe(
    webpackStream({
      mode: 'development',
      output: {
        filename: 'bundle.min.js',
      },
      module: {
        rules: [
          {
            test: /\.m?js$/,
            exclude: /(node_modules|bower_components)/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['@babel/preset-env'],
              },
            },
          },
        ],
      },
    })
  )
  .on('error', function (err) {
    // eslint-disable-next-line no-console
    console.error('WEBPACK ERROR', err);
    this.emit('end');
  })
  .pipe(sourcemaps.init())
  .pipe(uglify())
  .pipe(sourcemaps.write('./'))
  .pipe(dest('dest'))
  .pipe(browserSync.stream());

const fontPack = () => src('src/fonts/*').pipe(dest('dest/fonts'));

const imgPack = () => src([
  'src/assets/*.ico',
  'src/assets/*.png',
  'src/assets/*.jpeg',
  'src/assets/*.jpg',
])
  .pipe(newer('dest/img/*'))
  .pipe(imagemin())
  .pipe(dest('dest/img'));

const svgSprites = () => src('src/assets/*.svg')
  .pipe(
    svgSprite({
      mode: {
        stack: {
          sprite: '../sprite.svg', // sprite file name
        },
      },
    })
  )
  .pipe(dest('dest/img'));

const htmlFileInclude = () => src('src/*.html')
  .pipe(fileinclude({ prefix: '@@', basepath: '@file' }))
  .pipe(dest('dest'));

const clear = () => del('dest/**/*');

const startwatch = () => {
  watch('src/scss/**/*.scss', parallel('styles'));
  watch('src/script/*.js', parallel('scripts'));
  watch('src/assets/*', parallel('imgPack'));
  watch(['src/*.html', 'src/parts/*.html'], parallel('htmlFileInclude')).on(
    'change',
    browserSync.reload
  );
};

exports.browsersync = browsersync;
exports.styles = styles;
exports.scripts = scripts;
exports.clear = clear;
exports.fontPack = fontPack;
exports.htmlFileInclude = htmlFileInclude;
exports.imgPack = imgPack;
exports.build = series(
  clear,
  fontPack,
  imgPack,
  svgSprites,
  htmlFileInclude,
  styles,
  scripts
);
exports.dev = parallel(
  clear,
  fontPack,
  imgPack,
  svgSprites,
  htmlFileInclude,
  styles,
  scripts,
  browsersync,
  startwatch
);

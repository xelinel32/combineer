var gulp = require('gulp'),
  sass = require('gulp-sass'),
  browserSync = require('browser-sync'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify-es').default,
  cleancss = require('gulp-clean-css'),
  autoprefixer = require('gulp-autoprefixer'),
  newer = require('gulp-newer'),
  rename = require('gulp-rename'),
  responsive = require('gulp-responsive'),
  del = require('del');

// Local Server
gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: 'app'
    },
    notify: false
    // online: false, // Work offline without internet connection
    // tunnel: true, tunnel: 'projectname',
  });
});
function bsReload(done) {
  browserSync.reload();
  done();
}

// Custom Styles
gulp.task('styles', function() {
  return gulp
    .src('app/sass/**/*.sass', 'app/sass/**/*.scss')
    .pipe(
      sass({
        outputStyle: 'compressed',
        includePaths: [__dirname + '/node_modules']
      })
    )
    .pipe(concat('styles.min.css'))
    .pipe(
      autoprefixer({
        grid: true,
        overrideBrowserslist: ['last 2 versions']
      })
    )
    .pipe(cleancss({ level: { 1: { specialComments: 0 } } })) // Optional. Comment out when debugging
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.stream());
});

// Scripts & JS Libraries
gulp.task('scripts', function() {
  return gulp
    .src([
      'node_modules/jquery/dist/jquery.min.js', // Optional jQuery plug-in (npm i --save-dev jquery)
      'app/js/_libs.js', // JS libraries (all in one)
      'app/js/_custom.js' // Custom scripts. Always at the end
    ])
    .pipe(concat('scripts.min.js'))
    .pipe(uglify()) // Minify js (opt.)
    .pipe(gulp.dest('app/js'))
    .pipe(browserSync.reload({ stream: true }));
});

// Responsive Images
var quality = 90; // Responsive images quality

// Produce @1x images
gulp.task('img-responsive-1x', async function() {
  return gulp
    .src('app/img/_src/**/*.{png,jpg,jpeg}')
    .pipe(newer('app/img/@1x'))
    .pipe(
      responsive({
        '**/*': { width: '50%', quality: quality }
      })
    )
    .on('error', function(e) {
      console.log(e);
    })
    .pipe(
      rename(function(path) {
        path.extname = path.extname.replace('jpeg', 'jpg');
      })
    )
    .pipe(gulp.dest('app/img/@1x'));
});

// Produce @2x images
gulp.task('img-responsive-2x', async function() {
  return gulp
    .src('app/img/_src/**/*.{png,jpg,jpeg}')
    .pipe(newer('app/img/@2x'))
    .pipe(
      responsive({
        '**/*': { width: '100%', quality: quality }
      })
    )
    .on('error', function(e) {
      console.log(e);
    })
    .pipe(
      rename(function(path) {
        path.extname = path.extname.replace('jpeg', 'jpg');
      })
    )
    .pipe(gulp.dest('app/img/@2x'));
});

gulp.task(
  'img',
  gulp.series('img-responsive-1x', 'img-responsive-2x', bsReload)
);

// Clean @*x IMG's
gulp.task('cleanimg', function() {
  return del(['app/img/@*'], { force: true });
});

// Code & Reload
gulp.task('code', function() {
  return gulp.src('app/**/*.html').pipe(browserSync.reload({ stream: true }));
});

gulp.task('watch', function() {
  gulp.watch('app/sass/**/*.sass', gulp.parallel('styles'));
  gulp.watch('app/sass/**/*.scss', gulp.parallel('styles'));
  gulp.watch(
    ['app/js/_custom.js', 'app/js/_libs.js'],
    gulp.parallel('scripts')
  );
  gulp.watch('app/*.html', gulp.parallel('code'));
  gulp.watch('app/img/_src/**/*', gulp.parallel('img'));
});

gulp.task(
  'default',
  gulp.parallel('img', 'styles', 'scripts', 'browser-sync', 'watch')
);

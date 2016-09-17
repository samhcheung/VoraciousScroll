var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var concat = require('gulp-concat');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');
var ngAnnotate = require('gulp-ng-annotate');
var shell = require('gulp-shell');
var watch = require('gulp-watch');

gulp.task('nodemon', function() {
  nodemon({
    script: 'server/index.js',
    ext: 'html js'
  })
  .on('restart', function() {
    console.log('nodemon restarted server!');
  });
});

gulp.task('lint', function() {
  gulp.src(['./client/**/*.js', '!./client/lib/**']) //, './server/**/*.js' add to lint serverside js
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('clean', function() {
  return gulp.src('./dist/*')
    .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
<<<<<<< e0b39bdd63004d5501d749e1d6c5e3a53d3da9d7
  return gulp.src(['./public/styles/style.css'])
=======
  return watch(['./public/**/*.css'])
>>>>>>> Add gulp build processes with watch
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'));
});

gulp.task('minify-js', function() {
  return gulp.src(['./public/services/cloudAlgo.js', './public/services/timeline.js', './public/services/services.js', './public/features/results/results.js', './public/features/home/home.js', './public/features/home/trends.js', './public/features/home/primaryArticle.js', './public/features/profile/profile.js', 'public/layout.js', 'public/features/nav/nav.js'])
  .pipe(concat('build.js'))
  .pipe(ngAnnotate())
  .pipe(uglify())
  .pipe(gulp.dest('./dist/'));
});

gulp.task('copy-html-files', function () {
  gulp.src(['./public/**/*.html', './public/*.ico'])
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', function() {
    watch(['./public/**/*.js', './public/styles/style.css', './public/**/*.html', './public/*.ico'], function() {
      gulp.start('minify-js');
    });
});

gulp.task('set-prod', function() {
    return process.env.NODE_ENV = 'production';
});

gulp.task('set-dev', function() {
    return process.env.NODE_ENV = 'development';
});

gulp.task('forever', shell.task([
  'forever start server/index.js'
]));

gulp.task('stop', shell.task([
  'forever stop server/index.js'
]));
 
gulp.task('default', ['lint', 'nodemon']);

gulp.task('build', function() {
  runSequence(
    'clean',
    ['lint', 'minify-css', 'minify-js', 'copy-html-files', 'watch']
  );
});

gulp.task('devStart', function() {
  runSequence(
    'set-dev',
    'build',
    'default'
  );
});

gulp.task('prodStart', function() {
  runSequence(
    'set-prod',
    'build',
    'forever'
  );
});
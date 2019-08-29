const { src, dest, watch, series } = require('gulp')
const cleanCSS = require('gulp-clean-css')
const imagemin = require('gulp-imagemin')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const ghpages = require('gh-pages')

sass.compiler = require('node-sass')

function compileSass(done) {
    // We want to run 'sass css/app.scss app.css --watch'
    src('src/css/app.scss')
    // initialize gulp-sourcemaps
    .pipe(sourcemaps.init())
    .pipe(sass())
    // minify 'app.css'
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    // write to gulp-sourcemaps
    .pipe(sourcemaps.write())
    // 'app.css'
    .pipe(dest('dist'))
    // stream to browserSync
    .pipe(browserSync.stream())
    done()
}

function html(done) {
    // add '*.html' to 'dist/'
    src('src/*.html')
    .pipe(dest('dist'))
    done()
}

function fonts(done) {
    // add 'fonts/' to 'dist/'
    src('src/fonts/*')
    .pipe(dest('dist/fonts'))
    done()
}

function images(done) {
    // add 'images/' to 'dist/'
    src('src/img/*')
    // minify 'images/*' first
    .pipe(imagemin())
    .pipe(dest('dist/img'))
    done()
}

function watchSRC() {
    // initialize browserSync static server
    browserSync.init({
        server: {
            // './'
            baseDir: 'dist'
        }
    })
    // Watch 'src/'
    watch('src/*.html', html).on('change', browserSync.reload)
    watch('src/css/app.scss', compileSass)
    watch('src/fonts/*', fonts)
    watch('src/img/*', images)
}

function deploy(done) {
    ghpages.publish('dist')
    done()
}

exports.html = html
exports.sass = compileSass
exports.fonts = fonts
exports.images = images
exports.watch = watchSRC
exports.deploy = deploy
exports.default = series(html, compileSass, fonts, images, watchSRC)
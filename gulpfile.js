const { src, dest, watch, series } = require('gulp')
const postcss = require('gulp-postcss')
const cleanCSS = require('gulp-clean-css')
const concat = require('gulp-concat')
const imagemin = require('gulp-imagemin')
const sourcemaps = require('gulp-sourcemaps')
const browserSync = require('browser-sync').create()
const ghpages = require('gh-pages')

function compileCSS(done) {
    // We want to complete the same task(s) as before but with PostCSS
    src([
        'src/css/reset.css',
        'src/css/typography.css',
        'src/css/app.css'
    ])
    // initialize gulp-sourcemaps
    .pipe(sourcemaps.init())
    .pipe(
        postcss([  
            require('autoprefixer'),
            require('postcss-preset-env')({
                stage: 1,
                browsers: [
                    'IE 11', 
                    'last 2 versions'
                ]
            })
        ])
    )
    // concatenate the stylesheets
    .pipe(concat('app.css'))
    // minify 'app.css'
    .pipe(
        cleanCSS({ 
            compatibility: 'ie8' 
        })
    )
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
    watch('src/css/*', compileCSS)
    watch('src/fonts/*', fonts)
    watch('src/img/*', images)
}

function deploy(done) {
    ghpages.publish('dist')
    done()
}

exports.html = html
exports.css = compileCSS
exports.fonts = fonts
exports.images = images
exports.watch = watchSRC
exports.deploy = deploy
exports.default = series(
    html, 
    compileCSS,
    fonts, 
    images, 
    watchSRC,
    deploy
)
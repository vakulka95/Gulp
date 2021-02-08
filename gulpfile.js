const {src, dest, watch, series, parallel} = require('gulp'),
    fileinclude = require('gulp-file-include'),
    browserSync = require('browser-sync').create(),
    scss = require('gulp-sass'),
    concat = require('gulp-concat'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    media_group = require('gulp-group-css-media-queries'),
    autoprefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin'),
    del = require('del');



function browsersync(){
    browserSync.init({
        server: {
            baseDir: "dist/"
        }
    });
}

function html(){
    return src(['src/**/*.html', '!src/**/_*.html'])
        .pipe(fileinclude())
        .pipe(dest('dist/'))
        .pipe(browserSync.stream())
}

function css(){
    return src('src/scss/*.scss')
        .pipe(scss({outputStyle: 'compressed'}))
        // .pipe(concat('style.min.css'))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 5 versions'],
            grid: true
        }))
        .pipe( media_group())
        .pipe(dest('dist/css/nonMin'))
        .pipe(clean_css())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream())
}


function js(){
    return src([
        // 'node_modules/jquery/dist/jquery.js',
        'src/js/**/*.js',
    ])
    .pipe(concat('main.js'))
    .pipe(dest('dist/js/nonMin'))
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

function fonts(){
    return(src('src/fonts/**/*',))
        .pipe(dest('dist/fonts'))
}

function images(){
    return(src('src/images/**/*',))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('dist/images'))
}


function watching(){
    watch(['src/js/**/*.js'], js);
    watch(['src/scss/**/*.scss'], css);
    watch(['src/**/*.html'], html);
}

function clean(){
    return del('dist');
}

let build = series(clean, parallel(js, css, html, fonts, images));
let watches = parallel(build, watching, browsersync);


exports.browsersync = browsersync;
exports.watching = watching;
exports.html = html;
exports.css = css;
exports.js = js;
exports.fonts = fonts;
exports.images = images;
// exports.build = html;
exports.build = build;
exports.default = watches;


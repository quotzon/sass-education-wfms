//var syntax = 'scss'; // Syntax: sass or scss;

var gulp = require('gulp'), // Подключаем Gulp
    sass = require('gulp-sass'), //Подключаем Sass пакет
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    cleanCSS = require('gulp-clean-css'), // Подключаем пакет для минификации CSS
    rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    notify = require("gulp-notify"), // Подключаем библиотеку для уведомлений об ошибках
    del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache = require('gulp-cache'), // Подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'), // Подключаем библиотеку для автоматического добавления префиксов
    smartgrid = require('smart-grid');

var jsFiles = [
        './node_modules/jquery/dist/jquery.js',
        './src/js/main.js'
];

var sassFiles = [
        './src/sass/main.scss'
];

var cssFiles = [
        './node_modules/normalize.css/normalize.css',
        './src/css/main.css'
];
var buildFiles = [
        './src/css/styles.min.css',
        './src/js/libs.min.js',
        './src/fonts/**/*',
        './src/*.html'
];

/* It's principal settings in smart grid project */
var settings = {
    outputStyle: 'scss', /* less || scss || sass || styl */
    columns: 12, /* number of grid columns */
    offset: '30px', /* gutter width px || % || rem */
    mobileFirst: false, /* mobileFirst ? 'min-width' : 'max-width' */
    container: {
        maxWidth: '1200px', /* max-width оn very large screen */
        fields: '30px' /* side fields */
    },
    breakPoints: {
        lg: {
            width: '1100px', /* -> @media (max-width: 1100px) */
        },
        md: {
            width: '960px'
        },
        sm: {
            width: '780px',
            fields: '15px' /* set fields only if you want to change container.fields */
        },
        xs: {
            width: '560px',
            fields: '15px'
        }
        /* 
        We can create any quantity of break points.

        some_name: {
            width: 'Npx',
            fields: 'N(px|%|rem)',
            offset: 'N(px|%|rem)'
        }
        */
    }
};

smartgrid('./src/sass', settings);

function sasstocss(){
    return gulp.src(sassFiles)
	.pipe(sass({ outputStyle: 'expanded' }).on("error", notify.onError()))
	.pipe(gulp.dest('./src/css'));
}

function styles(){
    return gulp.src(cssFiles)
    .pipe(concat('styles.min.css'))
    .pipe(autoprefixer({
        browsers: ['last 15 versions'],
        cascade: false
    }))
    .pipe(cleanCSS({
        level: 2
    }))
    .pipe(gulp.dest('./src/css'))
    .pipe(browserSync.stream());
}

function scripts(){
    //return gulp.src('./src/js/**/*.js') Берем все необходимые библиотеки
    return gulp.src(jsFiles)
    .pipe(concat('scripts.min.js')) // Собираем их в кучу в новом файле libs.min.js
    .pipe(uglify({
        toplevel: true
    }))
    .pipe(gulp.dest('./src/js')) // Выгружаем в папку ./src/js
    .pipe(browserSync.stream());
}

function clean(){
    return del.sync('build'); // Удаляем папку dist перед сборкой
}

function clear(){
    return cache.clearAll();
}

function img(){
    return gulp.src('./src/img/**/*') // Берем все изображения из app
    .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    })))
    .pipe(gulp.dest('./build/img')); // Выгружаем на продакшен
}

function watch(){
    browserSync.init({
        server: {
            baseDir: "./src"
        },
        tunnel: true
    });
    gulp.watch('./src/sass/**/*.scss', gulp.series(sasstocss,styles));
    gulp.watch(['./src/js/**/*.js', '!./src/js/scripts.min.js'], scripts);
    gulp.watch('./src/**/*.html').on('change', browserSync.reload);
}

function buildFonts(){
    return gulp.src('./src/fonts/**/*')
    .pipe(gulp.dest('./build/fonts'));
}

function buildScripts(){
    return gulp.src('./src/js/scripts.min.js')
    .pipe(gulp.dest('./build/js'));
}

function buildStyles(){
    return gulp.src('./src/css/styles.min.css')
    .pipe(gulp.dest('./build/css'));
}

function buildHTML(){
    return gulp.src('./src/**/*.html')
    .pipe(gulp.dest('./build'));
}

gulp.task('styles', gulp.series(sasstocss, styles));
gulp.task('scripts', scripts);
gulp.task('clear', clear); //Автономный таск для очистки кеша Gulp
gulp.task('watch', watch); //Таск для запуск сервера
gulp.task('build', gulp.series(sasstocss, styles, scripts, gulp.parallel(buildFonts, buildScripts, buildStyles, buildHTML)));

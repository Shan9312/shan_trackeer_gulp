/**
 * Created by caoshi on 2018/10/17.
 */
var gulp = require('gulp'),
		connect =  require('gulp-connect'),
		uglify = require('gulp-uglify'),
		runSequence = require('gulp-run-sequence'),
		htmlmin  = require('gulp-htmlmin'),
		minifyCss = require("gulp-minify-css");

var del = require('del');
gulp.task('clear',function () {
	return del([
			'dist/**/*',
		]);
})
gulp.task('copy', function () {
	gulp.src('./font')
		.pipe(gulp.dest('dist/font'))
	gulp.src('./layer/**/*')
		.pipe(gulp.dest('dist/layer'))
	gulp.src('./img/**/*')
		.pipe(gulp.dest('dist/img'))
})
gulp.task('js',function () {
	gulp.src('./js/**/*')
		// .pipe(uglify())
		.pipe(gulp.dest('dist/js/'))
		.pipe(connect.reload());
})
gulp.task('css',function () {
	gulp.src('./css/*')
		.pipe(minifyCss())
		.pipe(gulp.dest('dist/css/'))
		.pipe(connect.reload());
})
gulp.task('html',function () {
	var options = {
		removeComments: true,//清除HTML注释
		collapseWhitespace: true,//压缩HTML
		collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
		removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
		removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
		removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
		minifyJS: true,//压缩页面JS
		minifyCSS: true//压缩页面CSS
	};
	gulp.src(['*html'])
		.pipe(htmlmin(options))
		.pipe(gulp.dest('dist'))
		.pipe(connect.reload())
	gulp.src(['./tpl/*.html'])
		.pipe(htmlmin(options))
		.pipe(gulp.dest('dist/tpl'))
		.pipe(connect.reload())
})
gulp.task('connect',function () {
	connect.server({
		livereload: true,
	})
})

gulp.task('watch',function () {
	gulp.watch('css/*.css',['css'])
	gulp.watch(['tpl/*.html','*.html'],['html'])
	gulp.watch(['js/*.js'],['js'])
})
gulp.task('build',function () {
	runSequence('clear',['copy','css','js','html']);
})
gulp.task('default',['watch','connect'])

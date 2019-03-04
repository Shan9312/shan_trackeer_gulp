
var url="http://47.100.49.248:6020/ppm/";//测试
var DOMAIN = 'http://47.100.49.248:6030/';//测试
// var url="http://47.100.126.108:6020/ppm/";//生产
//  var DOMAIN = 'http://47.100.126.108:6030/';//生产
var _v='1.3.1';
var loadIndex;
$.ajaxSetup({ //设置全局性的Ajax选项
    type:"POST",
    dataType:"json",
    beforeSend:function(){
        loadIndex=layer.load(2);
    },
    complete:function(){
        layer.close(loadIndex);
    },
    error:function(data){
        var msg=data.error_message?data.error_message:data.msg;
        layer.alert("网络出错，请检查网络或者重新登录",{
            closeBtn:false
        },function(index){
            location.href="login.html";
            layer.close(index)
        });
    }
});
function errormsg(data){
    if(data.code == 20300){
        layer.alert("账号数据异常，请重新登录",{
            closeBtn:false
        },function(index){
            location.href="login.html";
            layer.close(index)
        });
    }else{
        layer.alert(data.msg);
    }
}
//填充年份
function planYear(){
    var date=2016;
    $(".year").each(function(j,n){
        for(var i=0;i<10;i++){
            $('.year').append(new Option(date+i))
        }
    })
}
//格式化时间
function ts2YmdHis(t,type){
    var d = new Date(t);
    var year   = d.getFullYear();
    var month  = d.getMonth() + 1;
    var date   = d.getDate();
    var hour   = d.getHours();
    var minute = d.getMinutes();
    var s=type||"yyyy-dd-mm hh:ii";
    if (month < 10) {
        month = '0' + month;
    }
    if (date < 10) {
        date = '0' + date;
    }
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    var result;
    switch (s){
        case "yyyy-dd-mm hh:ii":
            result=year + '-' + month + '-' + date + ' ' + hour + ':' + minute ;
            break;
        case "yyyy-dd-mm":
            result=year + '-' + month + '-' + date ;
            break;
    }
    return result;
}
//检测数组中是否存在另一个值
function checkarr(arr,str){
    var num=0;
    $.each(arr,function(i,n){
        if($(n).html()==str){
            num++;
        }
    });
    if(num==0){
        return true;
    }else{
        return false;
    }

}
//转化格式
function zhuan(data){
    return data.substring(5,7)+"/"+data.substring(8,10)
}
function canvasDataURL(file,call){
    var ready=new FileReader();
    ready.readAsDataURL(file);
    ready.onload=function(){
        var img = new Image();
        img.src = this.result;
        img.onload = function(){
            var that = this;
            // 默认按比例压缩
            var w = that.width,
                h = that.height,
                scale = w / h;
            w = w>1920?1920:w;
            h=w / scale;
            //生成canvas
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            // 创建属性节点
            var anw = document.createAttribute("width");
            anw.nodeValue = w;
            var anh = document.createAttribute("height");
            anh.nodeValue = h;
            canvas.setAttributeNode(anw);
            canvas.setAttributeNode(anh);
            ctx.drawImage(that, 0, 0, w, h);
            // quality值越小，所绘制出的图像越模糊
            var base64 = canvas.toBlob(function (blob) {
                call(blob)
            },'image/jpeg', 0.2);
            //call(base64)
        }
    }
}
function convertBase64UrlToBlob(urlData){
    var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
//图片上传
function UP(dom,formData){
    $.ajax({
        url:DOMAIN+"ftpFile/upload/file?token="+Cookies.get("token"),
        dataType: 'json',
        data: formData,
        contentType: false,
        processData: false ,
        success:function(data){
            if(data.code==10000){
                $("#upImg").remove();
                $(dom).attr("src",data.data.imgUrl1);
            }else{
                layer.alert("上传失败！")
            }
        }
    })
}
function upImg(dom){
    if($("#upImg").length>0){
        $("#upImg input").click();
        return;
    }
    $("<form enctype='multipart/form-data' id='upImg' style='height:0;width:0;overflow: hidden;'><input type='file'  name='file' ></form>").appendTo("body");
    $("#upImg input").change(function(){
        loadIndex=layer.load(2);
        var formData = new FormData();
        var aa=this.value.toLowerCase().split('.');
        if(aa[aa.length-1]=='jpg'||aa[aa.length-1]=='bmp'||aa[aa.length-1]=='png'||aa[aa.length-1]=='jpeg'){
            var file;
            if (!this.files) {
                var filePath = this.value;
                var fileSystem = new ActiveXObject("Scripting.FileSystemObject");
                file = fileSystem.GetFile (filePath);
            } else {
                file=this.files[0];
            }
            if(file.size>1024*1024*1){
                var b1;
                canvasDataURL(file,function(data){
                    b1=convertBase64UrlToBlob(data);
                    formData.append("file", b1, "file_"+Date.parse(new Date())+".jpg");
                    UP(dom,formData)
                });
            }else{
                formData.append("file", file);
                UP(dom,formData)
            }
        }else{
            layer.alert("请选择格式为*.jpg、*.gif、*.bmp、*.png、*.jpeg 的图片",{
                end:function(){
                    $("#upImg").remove();
                }
            });
        }
    }).blur(function(){
        $("#upImg").remove();
    }).click()
}
function openHtml(url,type,obj){
    if($(".ifm.ifmRight."+type+"Details").length>0){
        return
    }
    $("<div class='ifm ifmRight "+type+"Details' ><iframe src='"+url+"' name='"+type+"Details' frameborder='0'></iframe></div>").appendTo(".bodyRight").animate({
        left:0,
        opacity:1
    },600)

}
function delHtml(type){
    parent.$('.'+type+'Details').animate({
        left:-20+"%",
        opacity:0
    },600,function(){
        $(this).remove()
    })
}
var Week = ['日','一','二','三','四','五','六'];
function getNowTime(){
    var time=new Date();
    return {
        yy:time.getFullYear(),//年
        mm:(time.getMonth()+1)>9?(time.getMonth()+1):"0"+(time.getMonth()+1),//月
        dd:time.getDate()>9?time.getDate():"0"+time.getDate(),//日
        w:Week[time.getDay()],//星期
        h:time.getHours()>9?time.getHours():"0"+time.getHours(),//时
        m:time.getMinutes()>9?time.getMinutes():"0"+time.getMinutes()//分
    }
}
var path=window.location.pathname;
if(path.indexOf('index')>-1){
    document.write('<script src="js/js.js?_v='+_v+'"></script><script src="js/service.js?_v='+_v+'"></script><script src="js/directive.js?_v='+_v+'"></script><script src="js/ctrl.js?_v='+_v+'"></script><script src="js/index.js?_v='+_v+'"></script>');
}else if(path.indexOf('admin_')>-1){
    document.write('<script src="../js/gauge.js"></script><script src="../js/echarts.js"></script><script src="../js/admin.js?_v='+_v+'"></script>');
}else if(path.indexOf('order_')>-1||path.indexOf('patrol_')>-1||path.indexOf('people_')>-1||path.indexOf('device_')>-1||path.indexOf('materiel_')>-1||path.indexOf('project_')>-1||path.indexOf('mine')>-1){
    document.write('<script src="../js/index.js?_v='+_v+'"><\/script>')
}else if(path.indexOf('download')>-1){

}else{
    document.write('<script src="js/index.js?_v='+_v+'"><\/script>');
}




function Selected(){
    $(".select select").change(function(){
        var text=$(this).children(":selected").html();
        $(this).prev().text(text);
    })
}
function progress(id,val,size,w,str) {
    $('#'+id).circleProgress({
        value:val,
        size: size,
        startAngle:-Math.PI/3,
        thickness: w,
        fill: {
            gradient: ['#ff7203','#ffaa00']
        },
        emptyFill: 'rgba(255,255,255,0)',
        animation: {
            duration: 1200,
            easing: 'circleProgressEasing'
        }
    }).on('circle-animation-progress', function(event, progress, stepValue) {
        if(str){
            $(this).next().find("h2").html(stepValue+'<b>项</b>');
        }else{
            $(this).next().find("h2,.conNum").html((stepValue*100).toFixed(2)+"%");
        }
        var next2=$(this).next().next();
        if(next2.length>0){
            next2.find("h2,.conNum").html((100-stepValue*100).toFixed(2)+"%");
        }
    });
}
function int(){
    Selected();
    require.config({
        paths: {
            echarts: '../js'
        }
    });
}
// echarts 表格；
function drawChart(c) {
    require(
        [
            'echarts',
            'echarts/chart/pie',
            'echarts/chart/bar',
            'echarts/chart/line'
        ],
        function (ec) {
            var Chart = ec.init(document.getElementById(c.id));
            Chart.clear();
            c.colorFlag=c.color?false:true;
            c.dataZoom={
                show : true,
                y: 40,
                height: 20,
                start : 80,
                end : 100,
                zoomLock:true,
                fillerColor:"rgba(0,0,0,0.3)",
                handleSize:0
            };
            if(c.xAxis.length<=12||!c.colorFlag){
                c.dataZoom={
                    show : false,
                    start : 0,
                    end : 100
                }
            }
            Chart.setOption({
                title:{
                    show:true,
                    text:c.title,
                    x:20,
                    textStyle:{
                        fontSize:20
                    }
                },
                tooltip : {
                    trigger: 'axis',
                    axisPointer : {            // 坐标轴指示器，坐标轴触发有效
                        type : 'none'        // 默认为直线，可选为：'line' | 'shadow'
                    },
                    formatter:function (value) {
                        if(c.obj)
                        c.obj.active=value[0].name;
                        return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value==0?"无数据"
                            :Number(value[0].value*100)>100
                                    ?(Number(value[0].value).toFixed(2)+"%")
                                    :(Number(value[0].value*100).toFixed(2)+"%"))
                    }
                },
                color:(c.color?c.color:["#0079ff","#ff9000","#ff0000"]),
                legend: {
                    show:true,
                    selectedMode:true,
                    data:c.legend,
                    x:(c.legendX?c.legendX:230),
                    y:(c.legendY?c.legendY:12),
                    textStyle:{
                        "color": "#828282"
                    }
                },
                toolbox: {
                    show : true,
                    feature : {
                        magicType : {show: true, type: ['line', 'bar']}
                    },
                    x:600,
                    y:12
                },
                calculable : false,
                clickable:true,
                xAxis : [
                    {
                        show:c.colorFlag,
                        splitLine:false,
                        data : c.xAxis,
                        axisLabel : {
                            textStyle:{
                                fontWeight:"bold"
                            }
                        }
                    }
                ],
                yAxis : [
                    {
                        show:c.colorFlag,
                        axisLabel : false,
                        axisLine:false,
                        max:(c.max?c.max:1),
                        min:(c.min?c.min:0)
                    }
                ],
                dataZoom:c.dataZoom,
                grid:{
                    x:0,
                    y:65,
                    x2:0,
                    y2:20,
                    borderWidth:0
                },
                series : c.series
            });
        }
    );
    if(c.fun){
        $("#"+c.id).off("click").on("click",function(e){
            var tip=$(".echarts-tooltip"),s=c.obj.active;
            var length=s.split("").length;
            if(tip.length>0&&tip.css("display")!="none"){
                if(s.substring(0,1)=="第"){
                    s=s.substring(1,length-1)
                }else{
                    s=s.substring(0,length-1)
                }

                c.fun(s);
            }

        })
    }
}
function animateNum(id,val,str){
    var num=0;
    var t=setInterval(function(){
        num+=val/100;
        if(num>=val){
            clearInterval(t);
            num=Number(val);
        }
        if(str){
            $("#"+id).html((num*100).toFixed(1)+"%");
        }else{
            if(num.toString().split(".").length>1&&num.toString().split(".")[1].length>1){
                $("#"+id).html(num.toFixed(2));
            }else {
                $("#"+id).html(num.toFixed(0));
            }
        }

    },12);
}
function dateSelect(obj,m,n){
    $(".data_select .select:eq(0) select").off("focus,change").on("focus",function(){
        var val=$(this).val();
        var str="<option value=''>不限制</option>";
        $.each(obj.dateList,function(i,n){
            switch (obj.type){
                case "周":
                    str+="<option value='"+n.week_no+"'>"+(n.week_no==obj.nowDate.week_no?"本周":("第"+n.week_no+"周"))+"</option> ";
                    break;
                case "月":
                    str+="<option value='"+n.month+"'>"+(n.month==obj.nowDate.month?"本月":(n.month+"月"))+"</option> ";
                    break;
                case "年":
                    str+="<option value='"+n.year+"'>"+(n.year==obj.nowDate.year?"本年":(n.year+"年"))+"</option> ";
                    break;
            }
        });
        $(this).html(str).val(val);
    }).on("change",function(){
        $(".data_select .select:eq(1) select").html("<option value=''>不限制</option>");
        $(".data_select .select:eq(1) label").html("不限制");
        if($(".pro_table .on").length>0){
            if(n)n();
        }else{
            m();
        }
    });
    $(".data_select .select:eq(1) select").off("focus,change").on("focus",function(){
        var val=$(".data_select .select:eq(0) select").val();
        val=(val==""?0:parseInt(val));
        var str="<option value=''>不限制</option>";
        $.each(obj.dateList,function(i,n){
            switch (obj.type){
                case "周":
                    if(parseInt(n.week_no)>=val)
                        str+="<option value='"+n.week_no+"'>"+(n.week_no==obj.nowDate.week_no?"本周":("第"+n.week_no+"周"))+"</option> ";
                    break;
                case "月":
                    if(parseInt(n.month)>=val)
                        str+="<option value='"+n.month+"'>"+(n.month==obj.nowDate.month?"本月":(n.month+"月"))+"</option> ";
                    break;
                case "年":
                    if(parseInt(n.year)>=val)
                        str+="<option value='"+n.year+"'>"+(n.year==obj.nowDate.year?"本年":(n.year+"年"))+"</option> ";
                    break;
            }
        });
        $(this).html(str);
    }).on("change",function(){
        if($(".pro_table .on").length>0){
            if(n)n();
        }else{
            m();
        }
    });
}
function Getgauge(id,textid,val,img,ovj) {
    var opts = {
        lines: 12,
        angle: -0.2, // The span of the gauge arc
        lineWidth: 0.2, // The line thickness
        pointer: {
            length: 0.3,
            strokeWidth: 0,
            iconPath: img,
            iconScale: 1,
            iconAngle: 0
        },
        colorStart: '#ff7000',
        colorStop: '#eee',
        strokeColor: '#E4E4E4',
        generateGradient: true
    };
    // if($.isEmptyObject(ovj.gaugeObj)){
    var canvas = $("#" + id + " canvas")[0];
    var gauge = new Gauge(canvas).setOptions(opts); // create sexy gauge!
    gauge.setTextField($("#" + textid)[0]);
    gauge.maxValue = 100; // set max gauge value
    gauge.animationSpeed = 20; // set animation speed (32 is default value)
    gauge.set(val); // set actual value
    ovj.gaugeObj = gauge;
    // }else{
    // ovj.gaugeObj.set(val);
// }
}
var admin={
    int:function(){
        admin.firstPage();
        $("#patrol").click(function(){
            var info=JSON.parse(localStorage.getItem("userInfo"));
            if(info && info.roleId>=4){//根据 登陆用户的id 判断级别，ß
                openHtml('tpl/admin_patrol.html?id='+info.projectId,'admin_patrol')
            }else{
                openHtml('tpl/admin_patrol_s.html','admin_patrol_s')//小于4的是 高级别领导
            }
        });
        $("#patroltwo").click(function(){
            openHtml('tpl/admin_patrol_two.html','admin_patrol_two');
        });
        $("#fault").click(function(){
            var info=JSON.parse(localStorage.getItem("userInfo"));
            if(info.roleId>=4){//根据 登陆用户的id 判断级别，ß
                openHtml('tpl/admin_fault.html?id='+info.projectId,'admin_fault')
            }else{
                openHtml('tpl/admin_fault_loads.html','admin_fault_loads')//小于4的是 高级别领导
            }
        });
        $("#loads").click(function(){
            var info=JSON.parse(localStorage.getItem("userInfo"));
            if(info.roleId>=4){
                openHtml('tpl/admin_moon.html?id='+info.projectId,'admin_moon')
            }else{
                openHtml('tpl/admin_loads.html','admin_loads')
            }
        });
        $("#rest").click(function(){
            openHtml('tpl/admin_rest.html','admin_rest')
        });
        $("#speed").click(function(){
            var info=JSON.parse(localStorage.getItem("userInfo"));
            if(info.roleId>=4){
                openHtml('tpl/admin_pro.html?id='+info.projectId,'admin_pro')
            }else{
                openHtml('tpl/admin_speed.html','admin_speed')
            }
        });
        $("#ppm").click(function(){
            openHtml('tpl/admin_ppm.html','admin_ppm')
        })
    },
    summaryDay:{
        patrol_task_rate:0,
        patrol_rate:0,
        fault_device_rate:0,
        good_device_rate:0,
        avg_order_engineer:0,
        avg_order_open:0,
        avg_order_assign:0,
        avg_order_fix:0,
        order_remain:0
    },
    gaugeObj:{},
    firstPage:function(){
        var ovj=admin;
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: "week"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    progress("s-progress",summaryDay.ORDER_EXPIRED_RATE?(1-Number(summaryDay.ORDER_EXPIRED_RATE)/100).toFixed(2):0,90,14);
                    progress("progress1",summaryDay.patrol_task_rate?summaryDay.patrol_task_rate:0,90,14);
                    progress("progress3",summaryDay.patrol_rate?summaryDay.patrol_rate:0,90,14);
                    Getgauge("progress2","progress2text",(data.ppmInfo.length>0&&data.ppmInfo[0].percent_taskDelayCount!=null?data.ppmInfo[0].percent_taskDelayCount*100:0),'img/tip.png',ovj);
                    animateNum("taskDelayCount",(data.ppmInfo.length>0&&data.ppmInfo[0].taskDelayCount!=null?data.ppmInfo[0].taskDelayCount:0));
                    animateNum("avg_order_engineer",summaryDay.avg_order_engineer?summaryDay.avg_order_engineer:0);
                    animateNum("avg_order_open",summaryDay.avg_order_open?summaryDay.avg_order_open.toFixed(2):0);
                    animateNum("avg_order_assign",summaryDay.avg_order_assign?summaryDay.avg_order_assign.toFixed(2):0);
                    animateNum("avg_order_fix",summaryDay.avg_order_fix?summaryDay.avg_order_fix.toFixed(2):0);
                    //animateNum("fault_device_rate",summaryDay.ORDER_EXPIRED_RATE?(1-Number(summaryDay.ORDER_EXPIRED_RATE)/100).toFixed(2):0,true);
                    animateNum("good_device_rate",summaryDay.good_device_rate?summaryDay.good_device_rate:0,true);
                    animateNum("order_remain",data.order_remain?data.order_remain:0);
                    animateNum("now_order_remain",data.now_order_remain?data.now_order_remain:0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var patrol_rate={
    active:"本周",
    type:"周",
    prograss_id:0,
    int:function(){
        var ovj=patrol_rate;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList,ovj.infoList_pro);
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    patrol_rate.type="周";
                    break;
                case "month":
                    patrol_rate.type="月";
                    break;
                case "year":
                    patrol_rate.type="年";
                    break;
            }
            $("#round").prev().html("本"+ovj.type+"巡视完成率");
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            if($(".pro_table .on").length>0){
                ovj.infoList_pro();
            }else{
                ovj.infoList();
            }
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    progress("round",summaryDay.patrol_rate?summaryDay.patrol_rate:0,60,10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    project_id:'',
    nowWeek:'',
    nowMonth:'',
    nowyear:'',
    //数据请求
    infoList:function(){
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        var _this=patrol_rate;
        $.ajax({
            url: DOMAIN+ 'summary/selectPatrolReport',
            async: false,
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate.type=="周"?starTime:undefined,
                weekEnd:patrol_rate.type=="周"?endTime:undefined,
                monthStar:patrol_rate.type=="月"?starTime:undefined,
                monthEnd:patrol_rate.type=="月"?endTime:undefined,
                yearStar:patrol_rate.type=="年"?starTime:undefined,
                yearEnd:patrol_rate.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    // var pid=data.nowDate.PATROL_COMPLETE_RATE;
                    patrol_rate.dateList=data.dateList;
                    patrol_rate.nowDate=data.nowDate;
                    patrol_rate.dataList=[];
                    patrol_rate.data_time=[];
                    patrol_rate.nowWeek=data.nowDate.week_no;
                    patrol_rate.nowMonth=data.nowDate.month;
                    patrol_rate.nowyear=data.nowDate.year;
                    $.each(data.data,function (i,n) {
                        patrol_rate.dataList[i]=n.PATROL_COMPLETE_RATE?Number(n.PATROL_COMPLETE_RATE):0;
                        //console.dir(patrol_rate.dataList[i]);

                        switch (patrol_rate.type){
                            case "周":
                                patrol_rate.data_time[i]=(n.week_no==patrol_rate.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                patrol_rate.data_time[i]=(n.month==patrol_rate.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                patrol_rate.data_time[i]=(n.year.substring(0,4)==patrol_rate.nowDate.year?"本年":(n.year.substring(0,4)+"年"));
                                break;
                        }

                    });
                    var pid=patrol_rate.dataList[patrol_rate.dataList.length-2>-1?patrol_rate.dataList.length-2:0];
                    _this.prograssChange(pid);
                    // 进度条数据
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:patrol_rate.type+"巡视任务完成率",
                            legend:["巡视完成率"],
                            xAxis:patrol_rate.data_time,
                            obj:patrol_rate,
                            max:100,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:patrol_rate.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value.toFixed(2))+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:patrol_rate.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
        if($(".select select").val()=='week'){
           $('.s-month').hide();
           $('.s-week').hide();
        }else if($(".select select").val()=='month'){
            $('.s-month').hide();
            $('.s-week').show();
        }else{
            $('.s-month').show();
            $('.s-week').show();
        }

    },
    infoList_pro:function(){
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        // console.log(starTime);
        $.ajax({
            url: DOMAIN+ 'summary/selectPatrolReport',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate.type=="周"?starTime:undefined,
                weekEnd:patrol_rate.type=="周"? endTime:undefined,
                monthStar:patrol_rate.type=="月"?starTime:undefined,
                monthEnd:patrol_rate.type=="月"?endTime:undefined,
                yearStar:patrol_rate.type=="年"?starTime:undefined,
                yearEnd:patrol_rate.type=="年"?endTime:undefined,
                projectId:$(".pro_table li.on").attr("data-id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    patrol_rate.dateList=data.dateList;
                    patrol_rate.nowDate=data.nowDate;
                    patrol_rate.dataList=[];
                    patrol_rate.data_time=[];
                    $.each(data.data,function (i,n) {
                        patrol_rate.dataList[i]=n.PATROL_COMPLETE_RATE?n.PATROL_COMPLETE_RATE:0;
                        switch (patrol_rate.type){
                            case "周":
                                patrol_rate.data_time[i]=(n.week_no==patrol_rate.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                patrol_rate.data_time[i]=(n.month==patrol_rate.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                patrol_rate.data_time[i]=(n.year.substring(0,4)==patrol_rate.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }

                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:patrol_rate.type+"巡视完成率",
                            legend:["巡视完成率"],
                            xAxis:patrol_rate.data_time,
                            obj:patrol_rate,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:patrol_rate.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value*100).toFixed(1)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:patrol_rate.pro_info_list
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    //点击 数据条获取数据表
    pro_info_list:function(s){
        if(s.indexOf("本")>-1){
            switch ($(".select select").val()){
                case 'week' :
                    s= patrol_rate.nowWeek;
                    break;
                case 'month' :
                    s= patrol_rate.nowMonth;
                    break;
                case 'year' :
                    s= patrol_rate.nowyear;
                    break;
                default:
                    s= undefined;
            }
        }

       //console.log(patrol_rate.nowWeek);

        var ss_account = JSON.parse(localStorage.getItem('account_list'));
        var ss_id=window.localStorage.getItem('project_id');
        if(!ss_id){
            ss_id=JSON.parse(localStorage.getItem('account_list'))[0].projectId;
        }else{
            ss_id=localStorage.getItem('project_id');
        }
        $('#accordion').html('');
        $.ajax({
            url:DOMAIN+ 'summary/selectPatrolTaskList',//日月年 获取数据
            type:'post',
            data: {
                token: Cookies.get("token"),
                projectId:ss_id,
                weekStar:patrol_rate.type=="周"?s:undefined,
                weekEnd:patrol_rate.type=="周"?s:undefined,
                monthStar:patrol_rate.type=="月"?s:undefined,
                monthEnd:patrol_rate.type=="月"?s:undefined,
                yearStar:patrol_rate.type=="年"?s:undefined,
                yearEnd:patrol_rate.type=="年"?s:undefined,
            },
            success: function (data) {

                if (data.code == 10000 ) {
                    // 月任务
                    var ss_days = data.data.dayList;
                    var ss_week = data.data.weekList;
                    var ss_month = data.data.monthList;
                    var str='';
                    $('.month_i').html(data.data.PATROL_MONTH_COMPLETE_RATE+'%');
                    $('.week_i').html(data.data.PATROL_WEEK_COMPLETE_RATE+'%');
                    $('.day_i').html(data.data.PATROL_DAY_COMPLETE_RATE+'%');

                    $.each(ss_month, function(i,n){
                        str+="<li lass='list-group-item' data-name="+ n.name +">"+ n.name  + "月</li>";
                    });
                    if($(".select select").val()=='week'){
                        $('[data-id="d1"]').hide();
                    }else{
                        $('[data-id="d1"]').show();
                        $('[data-id="d1"]').html(str);
                        $('[data-id="d1"]>li').click('li',function(){
                            patrol_rate.timeGetMsg('本');
                        });
                    }
                    // 周任务
                    str='';
                    $.each(ss_week,function(i,n){
                            var data = n.dataList[0]
                            var start = data.start_date.substring(5).replace('-','月').replace(/$/ig,'日');
                            var end = data.end_date.substring(5).replace('-','月').replace(/$/ig,'日');
                            str+="<li lass='list-group-item' data-name="+ n.name + ">" + start+"至"+end;
                            str+="</li>";
                    });
                    $('[data-id="d2"]').html(str);
                    $('[data-id="d2"]>li').click('li',function(e){
                        //点击 周，获取任务
                        e.stopPropagation();
                        var e =$(e.target);
                        var s_name=e.attr('data-name');
                        var week_content = ss_week.filter(function (item) {
                            return item.name == s_name
                        });
                        var week_txt=week_content[0].dataList;
                        var str='';
                        $.each(week_txt,function(i,n) {
                            var detailt=JSON.parse(n.beacon_list);
                            str += '<div class="panel"><div class="panel-heading" style="height:50px;">' +
                                '<a data-toggle="collapse" data-parent="#accordion" style="float:left;margin-right: 300px; width:200px;" href="#collapset'+i+'"  data-project-id='+n.project_id+'>'+n.task_name+'<span class="caret ss_span"></span></a>' +
                                '<a data-toggle="collapse" data-parent="#accordion"   href="#collapset'+i+'"  style="float:left;">' +
                                '<span>任务数' + n.subtask_count + '</span> 次  实际<span>'+n.subtask_yes_count+ '</span>次 </a> ' +
                                '</div> <div id="collapset'+i+'"  class="panel-collapse collapse in ss-collapse" >' +
                                '<div class="panel-body" style="background-color: #ebebeb;"> <p> <span style="color:#aaa"> 条线</span> ' +
                                '<span>巡视人: <i>'+n.patrol_account_names+'</i> </span> </p> <div class="con_ss"> <img src="../img/icon_bluetooth@3x.png" alt=""> ' +
                                '<p class="line" style="width:'+((detailt.length-1)*80)+'px"></p><ul class="context" data-id="s1">'
                            $.each(detailt,function(i,n) {
                                str+='<li> <span class="cirles"></span> <p class="txt">'+n.name+'</p> </li>'
                            });
                            str+='</ul></div></div></div></div>'
                        });
                        $('#accordion').html(str);
                        $('.ss-right .collapse').collapse()
                    });
                    //日任务
                    str='';
                    $.each(ss_days, function (i,n) {
                        var day_data = n.name.substring(5).replace('-','月').replace(/$/ig,'日');
                        str+="<li lass='list-group-item'  data-name="+ n.name + ">"+ day_data +"</li>";
                    });
                    $('[data-id="d3"]').html(str);
                    $('[data-id="d3"]>li').click('li',function(e){
                        //点击 日，获取任务
                        var e =$(e.target);
                        var s_name=e.attr('data-name');
                        //console.log(s_name);
                        var day_content = ss_days.filter(function (item) {
                            return item.name == s_name
                        });
                        var day_txt=day_content[0].dataList;
                        var str='';
                        $.each(day_txt,function(i,n) {
                            var detailt=JSON.parse(n.beacon_list);
                            str += '<div class="panel"><div class="panel-heading" style="height:50px;">' +
                                '<a data-toggle="collapse" data-parent="#accordion" style="float:left; width:200px; margin-right: 300px;" href="#collapset'+i+'"  data-project-id='+n.project_id+'>'+n.task_name+'<span class="caret ss_span"></span></a>' +
                                '<a data-toggle="collapse" data-parent="#accordion"  style="float:left; " href="#collapset'+i+'" >' +
                                '<span>任务数' + n.subtask_count + '</span> 次  实际<span>'+n.subtask_yes_count+ '</span>次 </a> ' +
                                '</div> <div id="collapset'+i+'"  class="panel-collapse collapse in ss-collapse">' +
                                '<div class="panel-body" style="background-color: #ebebeb;"> <p> <span style="color:#aaa"> 条线</span> ' +
                                '<span>巡视人: <i>'+n.patrol_account_names+'</i> </span> </p> <div class="con_ss"> <img src="../img/icon_bluetooth@3x.png" alt=""> ' +
                                '<p class="line" style="width:'+((detailt.length-1)*80)+'px"></p><ul class="context" data-id="s1">'
                            $.each(detailt,function(i,n) {
                                str+='<li> <span class="cirles"></span> <p class="txt">'+n.name+'</p> </li>'
                            });
                            str+='</ul></div></div></div></div>'
                        });
                        $('#accordion').html(str);
                        $('.ss-right .collapse').collapse()
                    });

                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    //点击下拉框 选择 排序时间
    deloogeAdd:function(){
        $('[attr-id="ss-dropdown"]').on('click','li',function (e) {
            var event = window.event || e;
            var el = event.target;
            $(".order_alert_rights .ss-close").show();
            var value = $(el).html();
            $('[attr-id="ss-time-btn"]').html(value);
        })
    },
    // 进度条数据
    prograssChange:function (id) {
        $('#round-ss').LineProgressbar({
            percentage: id,
            fillBackgroundColor: "#ff9711",
            height: '15px',
            radius: '3px',
            ShowProgressCount:true,
        });
    },
    //点击 月， 相关任务
    timeGetMsg:function(s){ //需要点击当前li 的 data-id； 把参数带过去获取内容；
        if(s.indexOf("本")>-1){
            if(patrol_rate.type=="周"){
                s=patrol_rate.nowWeek;
            }else{
                s=undefined;
            }

        }

        var  ss_id=localStorage.getItem('project_id');
        if(!ss_id){
            ss_id=JSON.parse(window.localStorage.getItem('account_list'))[0].projectId;
        }else{
            ss_id=localStorage.getItem('project_id');
        }


        // 需要考虑 projectId不存在的时候；
        $('#accordion').html('');
        $.ajax({
            url:DOMAIN+ 'summary/selectPatrolTaskList',//日月年 获取数据
            type:'post',
            data: {
                token: Cookies.get("token"),
                projectId:ss_id,
                weekStar:patrol_rate.type=="周"?s:undefined,
                weekEnd:patrol_rate.type=="周"?s:undefined,
                monthStar:patrol_rate.type=="月"?s:undefined,
                monthEnd:patrol_rate.type=="月"?s:undefined,
                yearStar:patrol_rate.type=="年"?s:undefined,
                yearEnd:patrol_rate.type=="年"?s:undefined,
            },
            success:function (data) {
                console.dir(data);
                if(data.code== '10000'){
                    var str='';
                    $.each(data.data.monthList[0].dataList,function(i,n) {
                        var detailt=JSON.parse(n.beacon_list);
                        str += '<div class="panel"><div class="panel-heading" style="height:50px;">' +
                            '<a data-toggle="collapse" data-parent="#accordion" href="#collapset'+i+'"  style="float:left; width:200px; margin-right: 300px;" data-project-id='+n.project_id+'>'+n.task_name+'<span class="caret ss_span"></span></a>' +
                            '<a data-toggle="collapse" data-parent="#accordion" href="#collapset'+i+'"  style="float:left; ">' +
                            '<span>任务数' + n.subtask_count + '</span> 次  实际<span>'+n.subtask_yes_count+ '</span>次 </a> ' +
                            '</div> <div id="collapset'+i+'"  class="panel-collapse collapse in ss-collapse">' +
                            '<div class="panel-body" style="background-color: #ebebeb;"> <p> <span style="color:#aaa"> 条线</span> ' +
                            '<span>巡视人: <i>'+n.patrol_account_names+'</i> </span> </p> <div class="con_ss"> <img src="../img/icon_bluetooth@3x.png" alt=""> ' +
                            '<p class="line" style="width:'+((detailt.length-1)*80)+'px"></p><ul class="context" data-id="s1">'
                        $.each(detailt,function(i,n) {
                          str+='<li> <span class="cirles"></span> <p class="txt">'+n.name+'</p> </li>'
                        });
                        str+='</ul></div></div></div></div>'
                    });
                    $('#accordion').html(str);
                    $('.ss-right .collapse').collapse()
                 }
              },
        });
    },
};
var patrol_rate_s={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=patrol_rate_s;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList,ovj.infoList_pro);
        // parent.openHtml('tpl/admin_patrol.html?id='+$(this).attr("data-id"),'admin_patrol');
        //------------
        $(".pro_table").delegate("ul li","click",function(){
            var ss_project_id = $(this).attr('data-id');
            window.localStorage.setItem('project_id', ss_project_id);
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            parent.openHtml('tpl/admin_patrol.html?id='+$(this).attr("data-id"),'admin_patrol');
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    patrol_rate_s.type="周";
                    break;
                case "month":
                    patrol_rate_s.type="月";
                    break;
                case "year":
                    patrol_rate_s.type="年";
                    break;
            }
            $("#round").prev().html("本"+ovj.type+"巡视完成率");
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            if($(".pro_table .on").length>0){
                ovj.infoList_pro();
            }else{
                ovj.infoList();
            }
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        var ovj=this;
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    progress("round",summaryDay.patrol_rate_s?summaryDay.patrol_rate_s:0,60,10);
                    ovj.prograssChange(summaryDay.patrol_task_rate?summaryDay.patrol_task_rate*100:0);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    account_list_i:[],
    infoList:function(){
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectPatrolReport',

            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate_s.type=="周"?starTime:undefined,
                weekEnd:patrol_rate_s.type=="周"?endTime:undefined,
                monthStar:patrol_rate_s.type=="月"?starTime:undefined,
                monthEnd:patrol_rate_s.type=="月"?endTime:undefined,
                yearStar:patrol_rate_s.type=="年"?starTime:undefined,
                yearEnd:patrol_rate_s.type=="年"?endTime:undefined
            },
            success: function (data) {

                if (data.code == 10000) {
                    patrol_rate_s.dateList=data.date;
                    patrol_rate_s.nowDate=data.nowDate;
                    patrol_rate_s.dataList=[];
                    patrol_rate_s.data_time=[];
                    $.each(data.data,function (i,n) {
                        patrol_rate_s.dataList[i]=n.PATROL_COMPLETE_RATE?n.PATROL_COMPLETE_RATE:0;
                        switch (patrol_rate_s.type){
                            case "周":
                                patrol_rate_s.data_time[i]=(n.week_no==patrol_rate_s.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                patrol_rate_s.data_time[i]=(n.month==patrol_rate_s.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                patrol_rate_s.data_time[i]=(n.dt.substring(0,4)==patrol_rate_s.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }

                    });/*
                     for (var j=8;j<52;j++){
                     patrol_rate.data_time[j]="本周";
                     }*/
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:patrol_rate_s.type+"巡视任务完成率",
                            legend:["巡视完成率"],
                            xAxis:patrol_rate_s.data_time,
                            obj:patrol_rate_s,
                            max:100,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:patrol_rate_s.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:patrol_rate_s.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    infoList_pro:function(){
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        var _this=this;
        $.ajax({
            url: DOMAIN+ 'summary/selectPatrolReport',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate.type=="周"?starTime:undefined,
                weekEnd:patrol_rate.type=="周"?endTime:undefined,
                monthStar:patrol_rate.type=="月"?starTime:undefined,
                monthEnd:patrol_rate.type=="月"?endTime:undefined,
                yearStar:patrol_rate.type=="年"?starTime:undefined,
                yearEnd:patrol_rate.type=="年"?endTime:undefined,
                projectId:$(".pro_table li.on").attr("data-id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    var pid=data.nowDate.PATROL_COMPLETE_RATE;
                    _this.prograssChange(pid);
                    patrol_rate.dateList=data.dateList;
                    patrol_rate.nowDate=data.nowDate;
                    patrol_rate.dataList=[];
                    patrol_rate.data_time=[];

                    $.each(data.data,function (i,n) {
                        patrol_rate.dataList[i]=n.patrol_rate?n.patrol_rate:0;
                        //将所以的 projectId存放在localstrage;
                        // patrol_rate.account_list_id[i]=n.project_id;
                        // window.sessionStorage.setItem('account_list_i', JSON.stringify(data));
                        switch (patrol_rate.type){
                            case "周":
                                patrol_rate.data_time[i]=(n.week_no==patrol_rate.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                patrol_rate.data_time[i]=(n.month==patrol_rate.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                patrol_rate.data_time[i]=(n.dt.substring(0,4)==patrol_rate.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }

                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:patrol_rate.type+"巡视完成率",
                            legend:["巡视完成率"],
                            xAxis:patrol_rate.data_time,
                            obj:patrol_rate,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:patrol_rate.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value*100).toFixed(1)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:patrol_rate.pro_info_list
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectPatrolReportOnProject',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate.type=="周"?s:undefined,
                weekEnd:patrol_rate.type=="周"?s:undefined,
                monthStar:patrol_rate.type=="月"?s:undefined,
                monthEnd:patrol_rate.type=="月"?s:undefined,
                yearStar:patrol_rate.type=="年"?s:undefined,
                yearEnd:patrol_rate.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.projectList,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p style='margin-left:20px;'>"+(patrol_rate.active)+"巡视任务完成率 "+(n.PATROL_COMPLETE_RATE?Number(n.PATROL_COMPLETE_RATE).toFixed(1)+"%":"无数据")+"</p>";
                        str+="</li>";
                    });
                    $(".pro_table ul").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    //点击下拉框 选择 排序时间
    deloogeAdd:function(){
        $('[attr-id="ss-dropdown"]').on('click','li',function (e) {
            var event = window.event || e;
            var el = event.target;
            $(".order_alert_rights .ss-close").show();
            var value = $(el).html();
            $('[attr-id="ss-time-btn"]').html(value);
        })
    },
    // 进度条数据
    prograssChange:function (num) {
        console.log(num)
        $('#round-ss').LineProgressbar({
            percentage: num,
            fillBackgroundColor: "#ff9711",
            height: '15px',
            radius: '3px',
            ShowProgressCount:true,
        });
    },
};
var patrol_rate_two={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=patrol_rate_two;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList,ovj.infoList_pro);
        $(".pro_table").delegate("ul li","click",function(){
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            if(this.className=="on"){
                $(this).removeClass("on");
                ovj.infoList();
            }else{
                $(".pro_table li.on").removeClass("on");
                $(this).addClass("on");
                ovj.infoList_pro();
            }
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            console.log(ovj.type);
            $("#round").prev().html("本"+ovj.type+"巡视完成率");
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            if($(".pro_table .on").length>0){
                ovj.infoList_pro();
            }else{
                ovj.infoList();
            }
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    progress("round",summaryDay.patrol_rate?summaryDay.patrol_rate:0,60,10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=patrol_rate_two;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:patrol_rate_two.type=="周"?starTime:undefined,
                weekEnd:patrol_rate_two.type=="周"?endTime:undefined,
                monthStar:patrol_rate_two.type=="月"?starTime:undefined,
                monthEnd:patrol_rate_two.type=="月"?endTime:undefined,
                yearStar:patrol_rate_two.type=="年"?starTime:undefined,
                yearEnd:patrol_rate_two.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.patrol_rate?n.patrol_rate:0;
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }

                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:ovj.type+"巡视完成率",
                            legend:["巡视完成率"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value*100).toFixed(2)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    infoList_pro:function(){
        var ovj=patrol_rate_two;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                projectId:$(".pro_table li.on").attr("data-id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.patrol_rate?n.patrol_rate:0;
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }

                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:ovj.type+"巡视完成率",
                            legend:["巡视完成率"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            series:[
                                {
                                    barWidth:36,
                                    name:'巡视完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value*100).toFixed(1)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){
        var ovj=this;
        var type = undefined;
        var active = '本周';
        if(s.indexOf("本")>-1) {
            s = undefined;
        }
        if (ovj.type) {
            type = ovj.type
            active = ovj.active;
        } else {
            type = ovj.obj.type;
            active = ovj.obj.active;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:type=="周"?s:undefined,
                weekEnd:type=="周"?s:undefined,
                monthStar:type=="月"?s:undefined,
                monthEnd:type=="月"?s:undefined,
                yearStar:type=="年"?s:undefined,
                yearEnd:type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.data,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p style='marginLeft:20px;'>"+(active)+"巡视完成率 "+(n.patrol_rate?(n.patrol_rate*100).toFixed(1)+"%":"无数据")+"</p>";
                        str+="</li>";
                    });
                    $(".pro_table ul").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var avg_order={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=avg_order;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("li","click",function(){
            parent.openHtml('tpl/admin_moon.html?id='+$(this).attr("data-id"),'admin_moon')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            ovj.infoList();
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    animateNum("avg",summaryDay.avg_order_engineer?summaryDay.avg_order_engineer:0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=avg_order;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.avg_order_engineer?n.avg_order_engineer:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"个人工单数据",
                            legend:["个人工单数据"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'个人工单数据',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){
        var ovj=avg_order;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.data,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p>"+(ovj.active)+"人均工单 "+(n.avg_order_engineer!=null?"<b>"+n.avg_order_engineer+"</b> 张":"无数据")+"</p>";
                        str+="</li>";
                    });
                    $(".pro_table ul").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var speed_order={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=speed_order;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("tbody tr","click",function(){
            parent.openHtml('tpl/admin_pro.html?id='+$(this).attr("data-id"),'admin_pro')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            ovj.infoList();
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    animateNum("avg_open",summaryDay.avg_order_open?summaryDay.avg_order_open:0);
                    animateNum("avg_assign",summaryDay.avg_order_assign?summaryDay.avg_order_assign:0);
                    animateNum("avg_fix",summaryDay.avg_order_fix?summaryDay.avg_order_fix:0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList_1:[],
    dataList_2:[],
    dataList_3:[],
    data_time:[],
    infoList:function(){
        var ovj=speed_order;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList_1=[];
                    ovj.dataList_2=[];
                    ovj.dataList_3=[];
                    ovj.data_time=[];
                    var maxNum=0,maxNum1=0,maxNum2=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList_1[i]=n.avg_order_open?n.avg_order_open:0;
                        ovj.dataList_2[i]=n.avg_order_assign?n.avg_order_assign:0;
                        ovj.dataList_3[i]=n.avg_order_fix?n.avg_order_fix:0;
                        if(maxNum<ovj.dataList_1[i]){
                            maxNum=Number(ovj.dataList_1[i]);
                        }
                        if(maxNum1<ovj.dataList_2[i]){
                            maxNum1=Number(ovj.dataList_2[i]);
                        }
                        if(maxNum2<ovj.dataList_3[i]){
                            maxNum2=Number(ovj.dataList_3[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    if(maxNum<maxNum1)maxNum=maxNum1;
                    if(maxNum<maxNum2)maxNum=maxNum2;
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"平均工单处理数据",
                            legend:["上周平均工单耗时","工单分配速度","工单处理速度"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:26,
                                    name:'上周平均工单耗时',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_1,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)+"<br/>"+value[1].seriesName+"："+(value[1].value)+"<br/>"+value[2].seriesName+"："+(value[2].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                },
                                {
                                    barWidth:26,
                                    name:'工单分配速度',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_2,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                },
                                {
                                    barWidth:26,
                                    name:'工单处理速度',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_3,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){ // table
        var ovj=speed_order;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.data,function(i,n){
                        str+="<tr data-id='"+n.project_id+"'>";
                        str+="<td>"+ovj.active+"</td>";
                        str+="<td>"+n.project_name+"</td>";
                        str+="<td>"+(n.avg_order_open!=null?(n.avg_order_open+" 个小时"):"无数据")+"</td>";
                        str+="<td>"+(n.avg_order_assign!=null?(n.avg_order_assign+" 个小时"):"无数据")+"</td>";
                        str+="<td>"+(n.avg_order_fix!=null?(n.avg_order_fix+" 个小时"):"无数据")+"</td>";
                        str+="</tr>";
                    });
                    $(".pro_table table tbody").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var fault_device={
    active:"本周",
    type:"周",
    expire_s:'EXPIRE1',
    undone:0,
    int:function(){
        var ovj=fault_device;
        //ovj.totleRate();
        ovj.infoList();
        ovj.deloogeAdd();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList,ovj.infoList_pro);
        //---------------
        $(".pro_table").delegate("tbody tr","click",function(){
            parent.openHtml('tpl/order_detail.html?id='+$(this).attr("data-id"),'order')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    fault_device.type="周";
                    break;
                case "month":
                    fault_device.type="月";
                    break;
                case "year":
                    fault_device.type="年";
                    break;
            }
            $("#round").prev().html("本"+ovj.type+"巡视完成率");
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            //ovj.totleRate();
            ovj.infoList();
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){ // 切换年月日
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    $('#round-ss').LineProgressbar({
                        percentage: summaryDay.ORDER_EXPIRED_RATE?(100-Number(summaryDay.ORDER_EXPIRED_RATE)).toFixed(2):0,
                        fillBackgroundColor: '#ff9711',
                        height: '15px',
                        radius: '3px'
                    });
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var _this=fault_device;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectTimeOrderReport',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:fault_device.type=="周"?starTime:undefined,
                weekEnd:fault_device.type=="周"?endTime:undefined,
                monthStar:fault_device.type=="月"?starTime:undefined,
                monthEnd:fault_device.type=="月"?endTime:undefined,
                yearStar:fault_device.type=="年"?starTime:undefined,
                yearEnd:fault_device.type=="年"?endTime:undefined,
                projectId:GetQueryString('id')
            },
            success: function (data) {
                if (data.code == 10000) {
                    fault_device.dateList=data.dateList;
                    fault_device.nowDate=data.nowDate;
                    fault_device.dataList=[];
                    fault_device.data_time=[];
                    var act;
                    $.each(data.data,function (i,n) {
                        var num=parseInt(n.ORDER_EXPIRED_RATE)+'%';
                        var undone=n.order_expired_count;
                        _this.prograssChange(num,undone,n.ORDER_EXPIRED_RATE ?(100-Number(n.ORDER_EXPIRED_RATE)):0);
                        // dataList 就是用于渲染echart的数据
                        fault_device.dataList[i]=n.ORDER_EXPIRED_RATE ?(100-Number(n.ORDER_EXPIRED_RATE)):0;
                        switch (fault_device.type){
                            case "周":
                                fault_device.data_time[i]=(n.week_no==fault_device.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                act=n
                                break;
                            case "月":
                                fault_device.data_time[i]=(n.month==fault_device.nowDate.month?"本月":(n.month+"月"));
                                act=n
                                break;
                            case "年":
                                fault_device.data_time[i]=(n.year.substring(0,4)==fault_device.nowDate.year?"本年":(n.year.substring(0,4)+"年"));
                                act=n
                                break;
                        }

                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:fault_device.type + "历史工单完成率",
                            legend:["工单完成率"],
                            legendX: 300,
                            xAxis:fault_device.data_time,
                            obj:fault_device,
                            max:100,
                            series:[
                                {
                                    barWidth:36,
                                    name:'工单完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:fault_device.dataList,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop',formatter:function(val){
                                                    return (val.value)+"%"
                                                }
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:fault_device.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    pro_info_list:function(s){ // 请求表格数据
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectTimeOrderList',
            type:'post',
            data: {
                token: Cookies.get("token"),
                projectId:GetQueryString('id'),
                orderBy:fault_device.expire_s,
                weekStar:fault_device.type=="周"?s:undefined,
                weekEnd:fault_device.type=="周"?s:undefined,
                monthStar:fault_device.type=="月"?s:undefined,
                monthEnd:fault_device.type=="月"?s:undefined,
                yearStar:fault_device.type=="年"?s:undefined,
                yearEnd:fault_device.type=="年"?s:undefined,
            },
            success: function (data) {
                if (data.code == '10000') {
                    var str="";
                    $.each(data.data,function(i,n){ // table数据
                        fault_device.num=
                        str+="<tr data-id='"+n.id+"'>";
                        str+="<td>"+n.order_no+"</td>";
                        str+="<td><div title='"+n.all_accountName_list+"' style='width: 230px;overflow: hidden;text-overflow: ellipsis;'>"+n.all_accountName_list+"</div></td>";
                        str+="<td>"+n.target_name+"</td>";
                        str+="<td>"+n.expired_hour+'小时'+"</td>";
                        str+="</tr>";
                    });
                    $("#tbodys").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });

    },
    //点击下拉框 选择 排序时间ss
    deloogeAdd:function(){
        $('[attr-id="ss-dropdown"]').on('click','li',function (e) {
            var event = window.event || e;
            var el = event.target;
            var value = $(el).html();
            $(".order_alert_rights .ss-close").show();
            fault_device.expire_s = $(el).attr('data-time');
            $('[attr-id="ss-time-btn"]').html(value);
            $.ajax({
                url: DOMAIN+ 'summary/selectTimeOrderList',
                type:'post',
                data: {
                    token: Cookies.get("token"),
                    orderBy:fault_device.expire_s,
                    projectId:GetQueryString('id')
                },
                success: function (data) {

                    if (data.code == '10000') {
                        var str="";
                        $.each(data.data,function(i,n){ // table数据

                            str+="<tr data-id='"+n.project_id+"'>";
                            str+="<td>"+n.id+"</td>";
                            str+="<td>"+n.all_accountName_list+"</td>";
                            str+="<td>"+n.target_name+"</td>";
                            str+="<td>"+n.expired_hour+'小时'+"</td>";
                            str+="</tr>";
                        });

                        $("#tbodys").html(str);
                    }
                    else {
                        errormsg(data)
                    }
                }
            });

        });
    },
    // 进度条数据
    prograssChange:function (num,undone,complateNum) {
        var _this=this;
        $('#round-ss').LineProgressbar({
                percentage: complateNum,
                fillBackgroundColor: '#ff9711',
                height: '15px',
                radius: '3px'
            });
        $('#s-cout').html(undone);
        $('#s-num').html(num);
        $('.s-times').html(_this.type);
    }
};
var fault_loads={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=fault_loads;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("li","click",function(){
            parent.openHtml('tpl/admin_fault.html?id='+$(this).attr("data-id"),'admin_fault')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            ovj.infoList();
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    var summaryDay=data.summaryDay?data.summaryDay:admin.summaryDay;
                    //animateNum("avg",summaryDay.avg_order_engineer?summaryDay.avg_order_engineer:0);
                    $('#round-ss').LineProgressbar({
                        percentage: summaryDay.ORDER_EXPIRED_RATE?100-Number(summaryDay.ORDER_EXPIRED_RATE):0,
                        fillBackgroundColor: '#ff9711',
                        height: '15px',
                        radius: '3px'
                    });
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=fault_loads;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectTimeOrderReport',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.data;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.ORDER_EXPIRED_RATE?(100-Number(n.ORDER_EXPIRED_RATE)).toFixed(2):0;
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"历史工单按时完成率",
                            legend:["巡视完成率"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:100,
                            series:[
                                {
                                    barWidth:36,
                                    name:'历史工单按时完成率',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value+'%')
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },1);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){
        var ovj=fault_loads;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectTimeOrderReportOnProject',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.projectList,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p>"+(ovj.active)+"工单完成率 "+(100-Number(n.ORDER_EXPIRED_RATE)).toFixed(2)+"%</p>";
                        str+="</li>";
                    });
                    $(".pro_table .loads").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var rest_order={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=rest_order;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList,ovj.infoList_pro);
        $(".pro_table").delegate("ul li","click",function(){
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            if(this.className=="on"){
                $(this).removeClass("on");
                ovj.infoList();
            }else{
                $(".pro_table li.on").removeClass("on");
                $(this).addClass("on");
                ovj.infoList_pro();
            }
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            if($(".pro_table .on").length>0){
                ovj.infoList_pro();
            }else{
                ovj.infoList();
            }
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val()
            },
            success: function (data) {
                if (data.code == 10000) {
                    animateNum("now_order_remain",data.now_order_remain?data.now_order_remain:1);
                    animateNum("order_remain",data.order_remain?data.order_remain:0);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=rest_order;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.order_remain?n.order_remain:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"平均剩余工单数历史",
                            legend:["平均剩余工单数"],
                            xAxis:ovj.data_time,
                            legendX:300,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'平均剩余工单数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    infoList_pro:function(){
        var ovj=rest_order;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                projectId:$(".pro_table li.on").attr("data-id")
            },
            success: function (data) {
                if (data.code == 10000) {

                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.order_remain?n.order_remain:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"平均剩余工单数历史",
                            legend:["平均剩余工单数"],
                            xAxis:ovj.data_time,
                            legendX:300,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'平均剩余工单数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        })
                    },10);
                }
                else {
                    layer.alert(data.msg);
                }
            }
        });
    },
    pro_info_list:function(s){
        var ovj=rest_order;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.data,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p>"+(ovj.active)+"剩余工单数 "+(n.order_remain?("<b>"+n.order_remain)+"</b> 张":"无数据")+"</p>";
                        str+="<p>实时未完成工单数 "+(n.now_order_remain?(n.now_order_remain):0)+" 张</p>";
                        str+="</li>";
                    });
                    $(".pro_table ul").html(str);
                    $('#admin_rest_yiyle').html(data.data.length>1?'实时平均未完成工单数':'实时未完成工单数');
                    $('#admin_rest_tiyle').html(data.data.length>1?'平均未完成工单':'未完成工单');
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};
var moon={
    active:"本周",
    type:"周",
    orderBy:0,
    int:function(){
        var ovj=moon;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("tbody tr","click",function(){
            parent.openHtml('tpl/admin_moon_peo.html?id='+$(this).attr("data-id")+"&proId="+GetQueryString("id"),'admin_moon_peo')
        }).delegate(".arrows i","click",function(){
            ovj.orderBy=parseInt($(this).attr("data-num"));
            ovj.pro_info_list($(".pro_table table tbody").attr("data-s"));
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            moon.totalType=1;
            ovj.infoList();
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                projectId:GetQueryString("id"),
                type: $(".select select").val(),
                dateType : "now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    $("#pro_name").html(data.data.length>0?data.data[0].project_name:"--");
                    $("#avg_order").html(data.data.length>0?(data.data[0].avg_order_engineer?data.data[0].avg_order_engineer:0):0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    dataList_1:[],
    legend:[],
    data_time:[],
    totalType:1,
    total:0,
    infoList:function(){
        var ovj=moon;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                projectId:GetQueryString("id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.avg_order_engineer?n.avg_order_engineer:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"moon",
                            title:"项目人均工单历史",
                            legend:["人均工单数"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'人均工单数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        });
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    //加载 表格
    pro_info_list:function(s){
        var ovj=moon;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectAccountListOCount',//加载 表格table
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now",
                projectId:GetQueryString("id"),
                orderBy:ovj.orderBy
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dataList_1=[];
                    ovj.legend=[];
                    $.each(data.data,function (i,n) {
                        if(n.engineerPercent){
                            ovj.dataList_1.push({
                                value:parseInt(n.avg_order_engineer),
                                name:n.name
                            });
                            ovj.legend.push(n.name);
                        }
                    });
                    setTimeout(function(){
                        drawChart({
                            id:"moonX",
                            title:"人员工单占比",
                            legend:ovj.legend,
                            color:["#ff6f10","#ff4000","#74dd00","#00b6bf","#0085cd","#a6189a","#fc005d","#ffae03"],
                            xAxis:ovj.legend,
                            legendX:200,
                            legendY:70,
                            series:[
                                {
                                    name:'人均工单数',
                                    type:'pie',
                                    center:['25%','60%'],
                                    radius : ['65%', '30%'],
                                    data:ovj.dataList_1,
                                    tooltip : {
                                        trigger: 'item',
                                        formatter: "{a} <br/>{b} : {c} ({d}%)"
                                    },
                                    itemStyle: {
                                        normal: {
                                            label : {
                                                show : false
                                            },
                                            labelLine : {
                                                show : false
                                            }
                                        },
                                        emphasis : {
                                            label : {
                                                show : true,
                                                position : 'center',
                                                textStyle : {
                                                    fontSize : '14'
                                                }
                                            }
                                        }
                                    }
                                }
                            ]
                        });
                    },10);
                    var str="";
                    moon.total=0;
                    $.each(data.data,function(i,n){
                        str+="<tr data-id='"+n.account_id+"'>";
                        str+="<td>"+n.name+"</td>";
                        str+="<td>"+n.value2+"</td>";
                        str+="<td>"+n.login_name+"</td>";
                        str+="<td>"+n.avg_order_engineer+" 张</td>";
                        moon.total+=n.avg_order_engineer;
                        str+="<td>"+(n.engineerPercent*100).toFixed(1)+"%</td>";
                        str+="<td>"+(n.avg_order_open!=null?n.avg_order_open+" 小时":"无数据")+"</td>";
                        str+="</tr>";
                    });
                    $(".pro_table table tbody").html(str).attr("data-s",s);




                    if(moon.totalType==1) {
                        $("#total_order").html(moon.total);
                    }
                    moon.totalType=0;
                }
                else {
                    errormsg(data)
                }
            }
        });

    }
};
var moon_peo={
    active:"本周",
    type:"周",
    int:function(){
        var ovj=moon_peo;
        ovj.totleRate();
        ovj.infoList();
        ovj.Page("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("tbody tr","click",function(){
            parent.openHtml('tpl/order_detail.html?id='+$(this).attr("data-id"),'order')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            $("#avg_order_engineer").prev("em").html("本"+ovj.type+"工单数量");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            ovj.infoList();
            ovj.Page("本");
        });
        $('.btn_daochu').on('click',function(){
            ovj.daochu();
        })
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectAccountListOCount',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                dateType : "now",
                accountId:GetQueryString("id"),
                projectId:GetQueryString("proId")
            },
            success: function (data) {
                if (data.code == 10000) {
                    $("#peo_name").html(data.accountInfo.name);
                    $("#peo_role").html(data.accountInfo.categoryName+" "+data.accountInfo.roleName);
                    $("#peo_num").html("工号："+data.accountInfo.login_name);
                    $("#peo_call").html("电话："+data.accountInfo.phone);
                    $("#peo_email").html("邮箱："+data.accountInfo.email);
                    $("#avg_order_engineer").html(data.data.length>0?(data.data[0].avg_order_engineer?data.data[0].avg_order_engineer:0):0);
                    $("#avg_order_open").html(data.data.length>0?(data.data[0].avg_order_open?data.data[0].avg_order_open:0):0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=moon_peo;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectAccountListOCount',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                accountId:GetQueryString("id"),
                projectId:GetQueryString("proId"),
                orderBy:0
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.avg_order_engineer?n.avg_order_engineer:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"个人工单数历史",
                            legend:["个人工单数"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'个人工单数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.Page
                        });
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    listPage:-1,
    Page:function(s){
        moon_peo.listPage=-1;
        moon_peo.pro_info_list(s);
        var t=setInterval(function(){
            $(".page").remove();
            if(moon_peo.listPage>-1){
                clearInterval(t);
            }
            if(moon_peo.listPage<=1)return;
            //console.log(Device.listPage)
            $(".admin").append("<div class='page'></div>");
            $(".page").createPage({
                pageCount:moon_peo.listPage,
                current:1,
                backFn:function(p){
                    moon_peo.pro_info_list(s,p);
                }
            });
        },80);
    },
    pro_info_list:function(s,pageNo){
        var ovj=moon_peo;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectOrder',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekNo:ovj.type=="周"?s:undefined,
                month:ovj.type=="月"?s:undefined,
                year:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now",
                accountId:GetQueryString("id"),
                orderBy:0,
                pageNo:pageNo?pageNo:1,
                pageSize:4
            },
            success: function (data) {
                if (data.code == 10000) {
                    moon_peo.listPage=data.data.page.totalPage;
                    var str="";
                    $.each(data.data.results,function(i,n){
                        str+="<tr data-id='"+n.order_id+"'>";
                        str+="<td>"+ovj.active+"</td>";
                        str+="<td>"+n.order_no+"</td>";
                        str+="<td>"+(n.device_category_name!=null?n.device_category_name:"--")+"</td>";
                        str+="<td>"+(n.device_name!=null?n.device_name:"--")+"</td>";
                        str+="<td>"+n.hour_complete+" 小时</td>";
                        str+="</tr>";
                    });
                    $(".pro_table table tbody").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    daochu:function(){
        var ovj=moon_peo;
        var s=ovj.active;
        var length=s.split("").length;
        if(s.substring(0,1)=="第"){
            s=s.substring(1,length-1)
        }else{
            s=s.substring(0,length-1)
        }
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        location.href=DOMAIN+ 'excel?token='+Cookies.get("token")+'&projectId='+GetQueryString("proId")+'&accountId='+GetQueryString("id")+(ovj.type=="周"&&s?'&weekNo='+s:'')+(ovj.type=="月"&&s?'&month='+s:'')+(ovj.type=="年"&&s?'&year='+s:'')+'&type='+$(".select select").val()+(s?'':'&dateType='+"now");
    }
};
var admin_pro={
    active:"本周",
    type:"周",
    orderBy:0,
    int:function(){
        var ovj=admin_pro;
        ovj.totleRate();
        ovj.infoList();
        ovj.Page("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate(".arrows i","click",function(){
            ovj.orderBy=parseInt($(this).attr("data-num"));
            ovj.Page($(".pro_table table tbody").attr("data-s"));
        }).delegate("tbody tr","click",function(){
            parent.openHtml('tpl/order_detail.html?id='+$(this).attr("data-id"),'order')
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            ovj.infoList();
            ovj.Page("本");
            this.getListAccount();
        });
    },
    totleRate:function(){
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                dateType : "now",
                projectId:GetQueryString("id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    $("#pro_name").html(data.data.length>0?data.data[0].project_name:"--");
                    $("#avg_order_open").html(data.data.length>0?(data.data[0].avg_order_open?data.data[0].avg_order_open:0):0);
                    $("#avg_order_assign").html(data.data.length>0?(data.data[0].avg_order_assign?data.data[0].avg_order_assign:0):0);
                    $("#avg_order_fix").html(data.data.length>0?(data.data[0].avg_order_fix?data.data[0].avg_order_fix:0):0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    data_time:[],
    infoList:function(){
        var ovj=admin_pro;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectProjectInfoList',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                projectId:GetQueryString("id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList_1=[];
                    ovj.dataList_2=[];
                    ovj.dataList_3=[];
                    ovj.data_time=[];
                    var maxNum=0,maxNum1=0,maxNum2=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList_1[i]=n.avg_order_open?n.avg_order_open:0;
                        ovj.dataList_2[i]=n.avg_order_assign?n.avg_order_assign:0;
                        ovj.dataList_3[i]=n.avg_order_fix?n.avg_order_fix:0;
                        if(maxNum<ovj.dataList_1[i]){
                            maxNum=Number(ovj.dataList_1[i]);
                        }
                        if(maxNum1<ovj.dataList_2[i]){
                            maxNum1=Number(ovj.dataList_2[i]);
                        }
                        if(maxNum2<ovj.dataList_3[i]){
                            maxNum2=Number(ovj.dataList_3[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.dt.substring(0,4)==ovj.nowDate.year?"本年":(n.dt.substring(0,4)+"年"));
                                break;
                        }
                    });
                    if(maxNum<maxNum1)maxNum=maxNum1;
                    if(maxNum<maxNum2)maxNum=maxNum2;
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"patrol",
                            title:"平均工单处理数据",
                            legend:["上周平均工单耗时","工单分配速度","工单处理速度"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'上周平均工单耗时',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_1,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)+"<br/>"+value[1].seriesName+"："+(value[1].value)+"<br/>"+value[2].seriesName+"："+(value[2].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                },
                                {
                                    barWidth:36,
                                    name:'工单分配速度',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_2,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                },
                                {
                                    barWidth:36,
                                    name:'工单处理速度',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList_3,
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.Page
                        })
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    listPage:-1,
    Page:function(s){
        admin_pro.listPage=-1;
        admin_pro.pro_info_list(s);
        var t=setInterval(function(){
            $(".page").remove();
            if(admin_pro.listPage>-1){
                clearInterval(t);
            }
            if(admin_pro.listPage<=1)return;
            //console.log(Device.listPage)
            $(".admin").append("<div class='page'></div>");
            $(".page").createPage({
                pageCount:admin_pro.listPage,
                current:1,
                backFn:function(p){
                    admin_pro.pro_info_list(s,p);
                }
            });
        },80);
    },
    pro_info_list:function(s,pageNo){
        var ovj=admin_pro;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectOrder',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekNo:ovj.type=="周"?s:undefined,
                month:ovj.type=="月"?s:undefined,
                year:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now",
                projectId:GetQueryString("id"),
                orderBy:ovj.orderBy,
                pageNo:pageNo?pageNo:1,
                pageSize:5
            },
            success: function (data) {
                if (data.code == 10000) {
                    admin_pro.listPage=data.data.page.totalPage;
                    var str="";
                    $.each(data.data.results,function(i,n){
                        str+="<tr data-id='"+n.order_id+"'>";
                        str+="<td>"+ovj.active+"</td>";
                        str+="<td>"+n.order_no+"</td>";
                        str+="<td>"+(n.device_name?n.device_name:"--")+"</td>";
                        str+="<td>"+n.hour_complete+" 小时</td>";
                        str+="<td>"+n.hour_assigne+" 小时</td>";
                        str+="<td>"+n.hour_fix+" 小时</td>";
                        str+="</tr>";
                    });
                    $(".pro_table table tbody").html(str).attr("data-s",s);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    //获取员工工单信息-ss
    getListAccount:function(s){
        // console.log('aa');
        var ovj=admin_pro;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectAccountListOCount',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now",
                projectId:GetQueryString("id"),
                orderBy:ovj.orderBy
            },
            success: function (data) {
                var str="";
                admin_pro.total=0;
                    $.each(data.data,function(i,n){
                        str+="<tr data-id='"+n.account_id+"'>";
                        str+="<td>"+n.name+"</td>";
                        str+="<td>"+n.value2+"</td>";
                        moon.total+=n.avg_order_engineer;
                        str+="<td>"+(n.engineerPercent*100).toFixed(1)+"%</td>";
                        str+="<td>"+(n.avg_order_open!=null?n.avg_order_open+" 小时":"无数据")+"</td>";
                        str+="</tr>";
                    });
                    // $(".pro_table table tbody").html(str).attr("data-s",s);
            }
        })
    }
};
var ppm_total={
    active:"本周",
    type:"周",
    orderBy:0,
    gaugeObj:{},
    int:function(){
        var ovj=ppm_total;
        ovj.totleRate();
        ovj.infoList();
        ovj.pro_info_list("本");
        dateSelect(ovj,ovj.infoList);
        $(".pro_table").delegate("ul li","click",function(){
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            if(this.className=="on"){
                $(this).removeClass("on");
                ovj.infoList();
            }else{
                $(".pro_table li.on").removeClass("on");
                $(this).addClass("on");
                ovj.infoList_pro();
            }
        });
        $(".title .select select").change(function(){
            switch($(this).val()){
                case "week":
                    ovj.type="周";
                    break;
                case "month":
                    ovj.type="月";
                    break;
                case "year":
                    ovj.type="年";
                    break;
            }
            $(".data_select .select select").off("focus,change").html("<option value=''>不限制</option>");
            $(".data_select .select label").html("不限制");
            ovj.active="本"+ovj.type;
            ovj.totleRate();
            if($(".pro_table .on").length>0){
                ovj.infoList_pro();
            }else{
                ovj.infoList();
            }
            ovj.pro_info_list("本");
        });
    },
    totleRate:function(){
        var ovj=ppm_total;
        $.ajax({
            url: DOMAIN+ 'summary/selectPPMInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                dateType : "now",
                isAVG:"yes"
            },
            success: function (data) {
                if (data.code == 10000) {
                    Getgauge("progress2","percent_taskDelayCount",data.data.length>0&&data.data[0].percent_taskDelayCount?(data.data[0].percent_taskDelayCount*100):0,'../img/tip.png',ovj);
                    animateNum("taskDelayCount",data.data.length>0&&data.data[0].taskDelayCount?data.data[0].taskDelayCount:0);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    dateList:[],
    nowDate:{},
    dataList:[],
    dataList_1:[],
    legend:[],
    data_time:[],
    totalType:1,
    total:0,
    infoList:function(){
        var ovj=ppm_total;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectPPMInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                isAVG:"yes"
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.taskDelayCount?n.taskDelayCount:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.year==ovj.nowDate.year?"本年":(n.year+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"ppm",
                            title:"历史超时数",
                            legend:["任务超时数"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'任务超时数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        });
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    infoList_pro:function(){
        var ovj=ppm_total;
        var starTime=$(".data_select .select:eq(0) select").val(),endTime=$(".data_select .select:eq(1) select").val();
        $.ajax({
            url: DOMAIN+ 'summary/selectPPMInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?starTime:undefined,
                weekEnd:ovj.type=="周"?endTime:undefined,
                monthStar:ovj.type=="月"?starTime:undefined,
                monthEnd:ovj.type=="月"?endTime:undefined,
                yearStar:ovj.type=="年"?starTime:undefined,
                yearEnd:ovj.type=="年"?endTime:undefined,
                isAVG:"yes",
                projectId:$(".pro_table li.on").attr("data-id")
            },
            success: function (data) {
                if (data.code == 10000) {
                    ovj.dateList=data.dateList;
                    ovj.nowDate=data.nowDate;
                    ovj.dataList=[];
                    ovj.data_time=[];
                    var maxNum=0;
                    $.each(data.data,function (i,n) {
                        ovj.dataList[i]=n.taskDelayCount?n.taskDelayCount:0;
                        if(maxNum<ovj.dataList[i]){
                            maxNum=Number(ovj.dataList[i]);
                        }
                        switch (ovj.type){
                            case "周":
                                ovj.data_time[i]=(n.week_no==ovj.nowDate.week_no?"本周":("第"+n.week_no+"周"));
                                break;
                            case "月":
                                ovj.data_time[i]=(n.month==ovj.nowDate.month?"本月":(n.month+"月"));
                                break;
                            case "年":
                                ovj.data_time[i]=(n.year==ovj.nowDate.year?"本年":(n.year+"年"));
                                break;
                        }
                    });
                    maxNum=maxNum+Number((maxNum/6).toFixed(2));
                    setTimeout(function(){
                        drawChart({
                            id:"ppm",
                            title:"历史超时数",
                            legend:["任务超时数"],
                            xAxis:ovj.data_time,
                            obj:ovj,
                            max:maxNum,
                            series:[
                                {
                                    barWidth:36,
                                    name:'任务超时数',
                                    type:'bar',
                                    symbol:"pin",
                                    data:ovj.dataList,
                                    tooltip:{
                                        formatter:function (value) {
                                            if(ovj) ovj.active=value[0].name;
                                            return value[0].name+"<br/>"+value[0].seriesName+"："+(value[0].value)
                                        }
                                    },
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'insideTop'
                                            }
                                        }
                                    }
                                }
                            ],
                            fun:ovj.pro_info_list
                        });
                    },10);
                }
                else {
                    errormsg(data)
                }
            }
        });
    },
    pro_info_list:function(s){
        var ovj=ppm_total;
        if(s.indexOf("本")>-1){
            s=undefined;
        }
        $.ajax({
            url: DOMAIN+ 'summary/selectPPMInfo',
            data: {
                token: Cookies.get("token"),
                type: $(".select select").val(),
                weekStar:ovj.type=="周"?s:undefined,
                weekEnd:ovj.type=="周"?s:undefined,
                monthStar:ovj.type=="月"?s:undefined,
                monthEnd:ovj.type=="月"?s:undefined,
                yearStar:ovj.type=="年"?s:undefined,
                yearEnd:ovj.type=="年"?s:undefined,
                dateType:s?undefined:"now"
            },
            success: function (data) {
                if (data.code == 10000) {
                    var str="";
                    $.each(data.data,function(i,n){
                        str+="<li data-id='"+n.project_id+"'>";
                        str+="<span>"+n.project_name+"</span>";
                        str+="<p>"+(ovj.active)+"平均超时数 "+(n.taskDelayCount?("<b>"+n.taskDelayCount)+"</b> 项":"无数据")+"</p>";
                        str+="<p>占任务总比 "+(n.percent_taskDelayCount?(n.percent_taskDelayCount*100).toFixed(1):0)+"%</p>";
                        str+="</li>";
                    });
                    $(".pro_table ul").html(str);
                }
                else {
                    errormsg(data)
                }
            }
        });
    }
};

angular.module("myctrl",[])
.controller("bodyLeft",["$scope","navList",function($scope,navList){
        var tfun;
        $scope.logo="img/logo.png";
        mine.getName();
        /*role*/
        $scope.userName=JSON.parse(localStorage.getItem("userInfo")).userName;
        $scope.roleList=JSON.parse(localStorage.getItem("account_list"));
        $scope.rcf=function(accountId,roleId){
            $scope.roles=accountId;
            var s="",list=navList[roleId].nav;
            $scope.isTracker=navList[roleId].isTracker;
            $scope.cut();
            $.each(list,function(i,n){
                if(n.cn=="项目"&&$scope.userName!="Admin"){
                    return;
                }
                s+='<a data-href="#'+ n.name+'">'+ n.cn+'</a>';
            });
            if(JSON.parse(localStorage.getItem("userInfo")).projectId==93){
                s='<a data-href="#order" class="">工单</a>';
            }
            $(".navBox").html(s);
            $(".wait span.on").removeClass();
            $(".ifmRight,.page").remove();
            location.href="index.html"+$(".navBox a:eq(0)").attr("data-href");
            $(".navBox a:eq(0)").addClass("active");
            $(".navbg").show().animate({
                top:($(".navBox a:eq(0)").index()*30+116)+"px"
            },500);
            if($scope.isTracker){
                tfun=setInterval(function(){
                    $scope.fun();
                },1000*60);
            }else{
                clearInterval(tfun)
            }
        };
        $scope.cut=function(){
            $.ajax({
                data:{
                    token:Cookies.get("token"),
                    accountId:$scope.roles
                },
                url:DOMAIN+"user/changeAccount",
                success:function(data){
                    if(data.code=="10000") {
                        localStorage.setItem("userInfo",JSON.stringify({
                            id:data.data.userId,
                            userName:data.data.userName,
                            icon:data.data.icon,
                            accountId:data.data.accountId,
                            projectId:data.data.projectId,
                            roleId:data.data.roleId
                        }));
                        localStorage.setItem("permissionList",JSON.stringify(data.data.permissionList));
                        var roleId=JSON.parse(localStorage.getItem("userInfo")).roleId;
                        if(roleId==6||roleId==7||roleId==8){
                            $(".header .addFun").hide()
                        }else{
                            $(".header .addFun").show()
                        }
                    }else{
                        errormsg(data)
                    }
                }
            })
        };
        /*nav*/
        var navFlag=true;
        $(".navBox").delegate("a","click",function(){
            if(!navFlag){
                return;
            }
            navFlag=false;
            $(".navBox a.active").removeClass("active");
            $(".ifmRight,.page").remove();
            var that=this;
            $(".wait span.on").removeClass();
            $(".navbg").show().animate({
                top:($(that).index()*30+116)+"px"
            },500,function(){
                $(that).addClass("active");
                location.href="index.html"+$(that).attr("data-href");
                navFlag=true;
            });
        });
        $(".wait span").click(function(){
            if(!navFlag){
                return;
            }
            navFlag=false;
            $('.navbg').hide();
            $(this).addClass('on');
            $('.navBox a.active').removeClass();
            $(".ifmRight,.page").remove();
            location.href="index.html#wait";
            $scope.trNum=0;
            navFlag=true;
        });
        $scope.rcf($scope.roleList[0].accountId,$scope.roleList[0].roleId);
        /*nav end*/
        /*time*/
        $scope.infoTime=getNowTime();
        setInterval(function(){
            $scope.$apply(function(){
                $scope.infoTime=getNowTime();
            })
        },1000*10);
        /*time end*/
        /*巡视进度*/
        $scope.pNum=0;
        $scope.tNum=20;
        $scope.fun=function(){
            var data=new Date();
            $.ajax({
                url: DOMAIN+ 'patrol/select/patrolCount',
                data: {
                    token: Cookies.get("token"),
                    dateDay: data.getFullYear()+"-"+((data.getMonth()+1)>9?(data.getMonth()+1):"0"+(data.getMonth()+1))+"-"+(data.getDate()>9?data.getDate():"0"+data.getDate())
                },
                beforeSend:function(){},
                success: function (data) {
                    if (data.code == 10000) {
                        $scope.pNum=data.data.patrolCount;
                        $scope.tNum=data.data.allCount;
                    }
                    else {
                        errormsg(data)
                    }
                }
            });
        };
        if($scope.isTracker){
            $scope.fun();
        }
        /*未读消息数*/
        $scope.trNum=0;
        $scope.trNumFun=function(){
            $.ajax({
                url: DOMAIN+ 'user/notReadCount',
                data: {
                    token: Cookies.get("token")
                },
                success: function (data) {
                    if (data.code == 10000) {
                        $scope.trNum=data.data.notReadCount;
                    }
                    else {
                        errormsg(data)
                    }
                }
            });
        };
        $scope.trNumFun();
        setInterval(function(){
            $scope.$apply(function(){
                $scope.trNumFun();
            })
        },1000*60*2);
        /*搜索确认*/
        $(".bodyRight").delegate(".ifm .header .search input","keyup",function(e){
            if(e.keyCode==13){
                $(".ifm .header .search i").click();
            }
        })
}])
.controller("order",["$scope",function($scope){
        var roleId=JSON.parse(localStorage.getItem("userInfo")).roleId;
        if(roleId==6||roleId==7||roleId==8){
            $(".header .addFun").hide()
        }else{
            $(".header .addFun").show()
        }
        Order.int();
}])
.controller("people",["$scope",function($scope){
        People.int();
}])
.controller("project",["$scope",function($scope){
       Project.int();
}])
.controller("device",["$scope",function($scope){
    Device.int();
    var menu=localStorage.getItem("permissionNameList");
    if(menu.indexOf('Material_Retrieve')>-1||menu.indexOf('Material_Update')>-1||menu.indexOf('Material_Update_Grant')>-1){
        $(".header .title i:eq(1)").show()
    }else{
        $(".header .title i:eq(1)").hide()
    }
    $(".header .title").delegate("i", "click", function() {
        $(".header .title i.on").removeClass("on");
        $(this).addClass("on");
        switch ($(this).index()) {
            case 0:
                Device.int();
                break;
            case 1:
                Materiel.int();
                break;
        }
    });
}])
.controller("patrol",["$scope",function($scope){
        Patrol.int();
}])
.controller("ppm",["$scope",function($scope){
        var roleId=JSON.parse(localStorage.getItem("userInfo")).roleId;
        if(roleId==4 || roleId == 14){
            $("#ppm").removeClass("manager")
        }else{
            $("#ppm").addClass("manager")
        }
        /*tab*/
        $scope.tab={
            int:function(){
                $("#ppmTab").delegate("li a","click",function(){
                    $scope.tab.click(this);
                }).delegate("li .dell","click",function(){
                    $scope.tab.del(this);
                }).delegate("li .edit","click",function(){
                    $scope.tab.edit(this);
                }).delegate("li .check","click",function(){
                    $scope.tab.check(this);
                }).delegate("li .check2","click",function(){
                    $scope.tab.check2(this);
                });
                $(".headLeft").click(function(){
                    $scope.tab.click(this);
                });
                $(".addTab i").click(function(){
                    $scope.tab.add();
                });
            },
            list:function(){
                var le=$(".headerRight ul li.on");
                var index=le.length==0?-1:le.index();
                $.ajax({
                    type:'GET',
                    data:{plan_id:parseInt($(".planBox ul .on")[0].id.split("_")[1]),token:Cookies.get("token")},
                    url:url+"job/line",
                    success:function(data){
                        if(data.code=="10000") {
                            var str="";
                            $.each(data.data,function(i,n){
                                if(n.pid==null){
                                    if(i==index){
                                        str+="<li id='job_"+n.id+"' class='on'>";
                                    }else{
                                        if(index==data.data.length&&i==index-1){
                                            str+="<li id='job_"+n.id+"' class='on'>";
                                        }else{
                                            str+="<li id='job_"+n.id+"'>";
                                        }
                                    }
                                    str+="<a>"+n.name+"</a>";
                                    str+="<div class='operation'>";
                                    str+="<img src='img/ppm/job_del.png' class='dell'/>";
                                    str+="<img src='img/ppm/job_xie.png' class='edit'/>";
                                    str+="<img src='img/ppm/job_p0.png' class='check'/>";
                                    str+="<img src='img/ppm/job_p.png' class='check2'/>";
                                    str+="</div>";
                                    str+="</li>";
                                }
                            });
                            $("#ppmTab").html(str);
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            click:function(dom){
                $("#ppmTab").find(".on").removeClass();
                if($(dom).hasClass("headLeft")){
                    $(".headLeft").removeClass("on");
                    $(".body").fadeIn();
                    $(".body-con").hide();
                }else{
                    $(".headLeft").addClass("on");
                    $(".body").hide();
                    $(".body-con").fadeIn();
                    $(dom).parent().addClass("on");
                    //获取时间
                    $scope.dataTime.makeTimeTitle();
                    $scope.system.list();
                }
            },
            add:function(){
                layer.prompt({
                    title: '请输入条线名称',
                    shade:[0.1,"#000"]
                }, function(value, index, elem){
                    $.ajax({
                        type:'POST',
                        data:JSON.stringify({"plan_id":parseInt($(".planBox ul .on")[0].id.split("_")[1]),"name":value}),
                        url:url+"job?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                layer.msg("添加成功！",{icon:1,time:2000});
                                $scope.tab.list();
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    })
                });
            },
            del:function(dom){
                layer.confirm('是否删除该条线?', {icon: 3, title:'提示'}, function(index){
                    $.ajax({
                        type:'DELETE',
                        url:url+"job/"+$(dom).parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.tab.list();
                                layer.msg("删除成功！",{icon:1,time:2000});
                                var t=setInterval(function(){
                                    if($(".headerRight ul li.on").length>0){
                                        clearInterval(t);
                                        $scope.system.list();
                                    }
                                },100);
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            edit:function(dom){
                var name=$(dom).parent().prev().html();
                layer.prompt({
                    value:name,
                    title: '修改条线名称',
                    shade:[0.1,"#000"]
                }, function(value, index, elem){
                    $.ajax({
                        type:'POST',
                        url:url+"job/"+$(dom).parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        contentType:"application/json",
                        data:JSON.stringify({
                            name:value
                        }),
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.tab.list();
                                layer.msg("修改成功！",{icon:1,time:2000});
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    })
                });
            },
            check:function(dom){
                if($(".editBox").length>0){
                    $(".editBox").remove();
                }
                var top=$(dom).parent().offset().top+26;
                var left=$(dom).parent().offset().left-26;
                var str='<div class="editBox" style="top:'+top+'px;left:'+left+'px" id="editBox"><span class="icon_caret"></span><div class="box"><b>条线负责人</b></div><div class="box"><ul class="use"></ul></div><div class="box"><ul class="no"></ul></div></div>';
                $("body").append(str);
                this.tabAdmin.lok();
                $(".editBox .use").delegate("li i","click",function(){
                    $scope.tab.tabAdmin.del(this);
                });
                $(".editBox .no").delegate("li i","click",function(){
                    $scope.tab.tabAdmin.add(this);
                })
            },
            check2:function(dom){
                if($(".editBox").length>0){
                    $(".editBox").remove();
                }
                var top=$(dom).parent().offset().top+26;
                var left=$(dom).parent().offset().left-48;
                var str='<div class="editBox" style="top:'+top+'px;left:'+left+'px" id="editBox"><span class="icon_caret"></span><div class="box"><b>本条线监督</b></div><div class="lok"><span></span></div></div>';
                $("body").append(str);
                this.tabAdmin.lok();
            },
            tabAdmin:{
                lookList:[],
                all:function(){
                    $.ajax({
                        type:'GET',
                        url:url+"user?token="+Cookies.get("token")+"&pageNo=1&pageSize=10000",
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000"){
                                var str="";
                                if(data.data.results.length==0){
                                    str+="<li>还没有条线负责人</li>";
                                }else{
                                    $.each(data.data.results,function(i,n){
                                        var flag=true;
                                        $.each($scope.tab.tabAdmin.lookList,function(j,m){
                                            if(m==n.id){
                                                flag=false;
                                            }
                                        });
                                        if(flag){
                                            str+="<li data-id='"+n.id+"'>";
                                            str+=n.name+"<i></i>";
                                            str+="</li>";
                                        }
                                    });
                                }
                                $(".editBox .no").html(str);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                },
                lok:function(){
                    $.ajax({
                        type:'GET',
                        url:url+"job/owner?token="+Cookies.get("token")+"&job_id="+$(".headerRight ul li.on")[0].id.split("_")[1],
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000"){
                                var box=$(".lok");
                                $scope.tab.tabAdmin.lookList=[];
                                if(data.data.length==0){
                                    box.html("还没有条线负责人！");
                                    $(".editBox .use").html("<li>还没有分配哦</li>")
                                }else{
                                    var str="",useStr="";
                                    $.each(data.data,function(i,n){
                                        str+="<span>"+n.user_name+"</span>";
                                        useStr+="<li data-id='"+n.account_id+"'>"+n.user_name+"<i></i></li>";
                                        $scope.tab.tabAdmin.lookList.push(n.account_id)
                                    });
                                    box.html(str);
                                    $(".editBox .use").html(useStr);
                                }
                                $scope.tab.tabAdmin.all();
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                },
                add:function(dom){
                    $.ajax({
                        type:'POST',
                        url:url+"job/owner?token="+Cookies.get("token"),
                        data:JSON.stringify({
                            "job_id":parseInt($(".headerRight ul li.on")[0].id.split("_")[1]),
                            "account_id":parseInt($(dom).parent().attr("data-id"))
                        }),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.tab.tabAdmin.lok();
                                setTimeout(function(){
                                    $scope.tab.tabAdmin.all();
                                },50);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                },
                del:function(dom){
                    $.ajax({
                        type:'DELETE',
                        url:url+"job/owner?token="+Cookies.get("token")+"&job_id="+$(".headerRight ul li.on")[0].id.split("_")[1]+"&account_id="+$(dom).parent().attr("data-id"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.tab.tabAdmin.lok();
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                }
            }
        };
        $scope.tab.int();
        /*tab end*/
        /*计划*/
        $scope.plan={
            int:function(){
                $(".planBox").delegate("li","click",function(){
                    $(".qiyongzhong ul li").removeClass("on");
                    $(this).addClass("on");
                    console.log($(this).parent()[0])
                    if($(this).parent()[0].id=="onuser"){
                        $("#ppm").addClass("noEnabled")
                    }else if($(this).parent()[0].id=="nouser"){
                        $("#ppm").removeClass("noEnabled")
                    }
                    localStorage.setItem("nowYear",parseInt($(this).attr("data-year")));
                    $scope.tab.list();
                }).delegate(".set_img","click",function(){
                    if($(".setBox").length>0){
                        $(".setBox").remove();
                    }
                    var str='<div class="setBox" id="setBox"><ul class="set">';
                    if($(this).parentsUntil("#onuser").parent()[0].id!="onuser"){
                        str+='<li class="set_del">删除</li>';
                    }
                    str+='<li class="set_copy">复制</li><li class="set_export">导出</li>';
                    str+='</ul><span></span></div>';
                    $(".body").append(str);
                    $(".setBox").css("top",$(this).offset().top-215-$(".setBox").height()+"px");
                    var that=this;
                    $(".set_del").click(function(){
                        $scope.plan.del(that);
                    });
                    $(".set_copy").click(function(){
                        $scope.plan.copy(that);
                    });
                    $(".set_export").click(function(){
                        $scope.plan.excel(that);
                    });
                }).delegate(".handle i","click",function(){
                    if($(this).parent().hasClass("mana")){
                        $scope.plan.un(this);
                    }else{
                        $scope.plan.use(this);
                    }
                }).delegate(".overtime","click",function(){
                    if(roleId!=4){
                        return
                    }
                    $scope.plan.remind(this);
                }).delegate(".planName","dblclick",function(){
                    if($(this).parentsUntil("#onuser").parent()[0].id!="onuser"){
                        $scope.plan.edit(this);
                    }
                });
                $scope.plan.list();
            },
            list:function(){
                $.ajax({
                    type:'GET',
                    url:url+"plan"+"?token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000"){
                            $(".planBox ul").html("");
                            $.each(data.data,function(i,n){
                                var str="";
                                str+="<li id='plan_"+n.plan_id+"' data-year='"+n.year+"'>";
                                if(n.valid==1){
                                    if(n.count_overtime>0){
                                        str+="<div class='overtime'><span>"+n.count_overtime+"</span><span>已超时</span></div>";
                                    }
                                    str+="<span class='planName'>"+n.name+"</span> ";
                                    str+="<span class='num'><i>"+n.count_complete+"</i>/"+n.count_all+"</span> ";
                                    str+="<span class='handle mana' ><i>停用</i><img src='img/ppm/set.png' class='set_img'></span>";
                                    str+="<span class='state'>查看中</span>";
                                    str+="<div class='plan_time'><i>年份 "+n.year+"</i> <i>创建时间 "+n.create_date+"</i> ";
                                    str+="<i>启用时间 "+n.start_date+"</i>";
                                    str+="<i class='author'>";
                                    if(n.create_user!=null){
                                        str+="作者："+n.create_user;
                                    }
                                    str+=" 项目："+n.project_name+"</i>";
                                    str+="</div>";
                                    str+="</li>";
                                    $("#onuser").append(str);
                                }else{
                                    str+="<span class='planName'>"+n.name+"</span> ";
                                    str+="<div class='plan_time'><i>年份 "+n.year+"</i> <i>创建时间 "+n.create_date+"</i> ";
                                    str+="<i>最后编辑 "+(n.update_date==null?"--":n.update_date)+"</i> <i class='author'>";
                                    if(n.create_user!=null){
                                        str+="作者："+n.create_user;
                                    }
                                    str+=" 项目："+n.project_name+"</i></div>";
                                    str+="<span class='num'><i>"+n.count_complete+"</i>/"+n.count_all+"</span> ";
                                    str+="<span class='handle'><i>启用</i><img src='img/ppm/set.png' class='set_img'></span>";
                                    str+="<span class='state'>编辑中</span>";
                                    str+="</li>";
                                    $("#nouser").append(str);
                                }
                            });
                            if($("#onuser li").length!=0||$(".qiyongzhong.mana").css("display")=="none"){
                                $("#onuser li:eq(0)").addClass("on").click();
                            }else{
                                $("#nouser li:eq(0)").addClass("on").click();
                            }
                            localStorage.setItem("nowYear",parseInt($(".planBox ul .on").attr("data-year")));
                        }else {
                            errormsg(data)
                        }
                    }
                });
            },
            add:function(){
                var Index=layer.open({
                    type:1,
                    title:false,
                    shade:[0.1,"#000"],
                    area:['394px','350px'],
                    closeBtn:false,
                    content:'<div class="addBox" id="addPlan"><div class="add_header">新建PPM<span class="add_ppm_icon"></span></div><div class="add_con" style="height: 289px;"><div class="conBox"><span class="title">PPM名称</span><div class="con"><input type="text" id="addApply"></div></div><div class="conBox"><span class="title">使用年份</span><div class="con"><select id="addnear"  class="year"></select></div></div><button class="confirm" style="left: 114px;">确认新建</button><button class="cancel" style="right: 63px;">取消</button></div></div>',
                    success:function(){
                        planYear();
                        $(".cancel").click(function(){
                            layer.close(Index)
                        });
                        $(".confirm").click(function(){
                            var name=$("#addApply").val();
                            if(name==""){
                                layer.tips("请输入计划名称！","#addApply",{tips:[2,"#50555C"]});
                                return;
                            }
                            $.ajax({
                                type:'POST',
                                data:JSON.stringify({
                                    "name": name,
                                    "year":$("#addnear").val()
                                }),
                                url:url+"plan?token="+Cookies.get("token")+"&project_id="+JSON.parse(localStorage.getItem("userInfo")).projectId,
                                contentType:"application/json",
                                success:function(data){
                                    if(data.code=="10000") {
                                        $scope.plan.list();
                                        layer.msg("添加成功！",{icon:1,time:2000});
                                        layer.close(Index)
                                    }else{
                                        errormsg(data)
                                    }
                                }
                            })
                        });
                    }
                });
            },
            del:function(dom){
                layer.confirm("是否删除该计划？", {icon: 3, title:'提示'},function(index){
                    $.ajax({
                        type:'DELETE',
                        url:url+"plan/"+parseInt($(dom).parent().parent()[0].id.split("_")[1])+"?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.plan.list();
                                layer.msg("删除成功！",{icon:1,time:2000});
                                layer.close(index)
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            edit:function(dom){
                var Index=layer.open({
                    type:1,
                    title:false,
                    shade:[0.1,"#000"],
                    area:['394px','255px'],
                    closeBtn:false,
                    content:'<div class="addBox" id="addPlan"><div class="add_header">修改PPM名称<span class="add_ppm_icon"></span></div><div class="add_con" style="height: 203px;"><div class="conBox"><span class="title">PPM名称</span><div class="con"><input type="text" id="editPlan"></div></div><button class="confirm" style="left: 114px;">确认修改</button><button class="cancel" style="right: 63px;">取消</button></div></div>',
                    success:function(){
                        $("#editPlan").val($(dom).html());
                        $(".cancel").click(function(){
                            layer.close(Index)
                        });
                        $(".confirm").click(function(){
                            var name=$("#addApply").val();
                            if(name==""){
                                layer.tips("请输入计划名称！","#addApply",{tips:[2,"#50555C"]});
                                return;
                            }
                            $.ajax({
                                type:'POST',
                                url:url+"plan/"+$(dom).parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                                contentType:"application/json",
                                data:JSON.stringify({
                                    name:$("#editPlan").val(),
                                    token:Cookies.get("token")
                                }),
                                success:function(data){
                                    if(data.code=="10000") {
                                        $scope.plan.list();
                                        layer.msg("修改成功！",{icon:1,time:2000});
                                        layer.close(Index)
                                    }else{
                                        errormsg(data)
                                    }
                                }
                            });
                        });
                    }
                });
            },
            copy:function(dom){
                var Index=layer.open({
                    type:1,
                    title:false,
                    shade:[0.1,"#000"],
                    area:['394px','350px'],
                    closeBtn:false,
                    content:'<div class="addBox" id="copyPlan"><div class="add_header">复制PPM<span class="add_ppm_icon"></span></div><div class="add_con" style="height: 289px;"><div class="conBox"><span class="title">PPM名称</span><div class="con"><input type="text" id="copyApply"></div></div><div class="conBox"><span class="title">使用年份</span><div class="con"><select id="copyYear"  class="year"></select></div></div><button class="confirm" style="left: 114px;">确认复制</button><button class="cancel" style="right: 63px;">取消</button></div></div>',
                    success:function(){
                        planYear();
                        $("#copyApply").val($(dom).parent().parent().find(".planName").html()+"—拷贝");
                        $("#copyYear").val($(dom).parent().parent().attr("data-year"));
                        $(".cancel").click(function(){
                            layer.close(Index)
                        });
                        $(".confirm").click(function(){
                            $.ajax({
                                type:'post',
                                url:url+"plan/copy?plan_id="+$(dom).parent().parent()[0].id.split("_")[1]+"&token="+Cookies.get("token"),
                                contentType:"application/json",
                                data:JSON.stringify({
                                    "name":$("#copyApply").val(),
                                    "year":$("#copyYear").val()
                                }),
                                success:function(data){
                                    if(data.code=="10000") {
                                        $scope.plan.list();
                                        layer.msg("添加成功！",{icon:1,time:2000});
                                        layer.close(Index)
                                    }else{
                                        errormsg(data)
                                    }
                                }
                            });
                        });
                    }
                });
            },
            excel:function(dom){
                $(".setBox").remove();
                var load=layer.load(2);
                location.href=url+"excel?plan_id="+$(dom).parent().parent()[0].id.split("_")[1]+"&token="+Cookies.get("token");
                setTimeout(function(){
                    layer.close(load)
                },10000)
            },
            use:function(dom){
                $.ajax({
                    type:'POST',
                    url:url+"plan/"+$(dom).parent().parent().attr("id").split("_")[1]+"/active?token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $scope.plan.list();
                            layer.msg("启用成功！",{icon:1,time:2000});
                        }else{
                            layer.alert("相同年份的计划不可以同时启用！");
                        }
                    },
                    error:function (data){
                        if(data.status==500){
                            layer.alert("相同年份的计划不可以同时启用！");
                        }else{
                            errormsg(data)
                        }

                    }
                });
            },
            un:function(dom){
                var Index=layer.open({
                    type:1,
                    title:false,
                    shade:[0.1,"#000"],
                    area:['464px','372px'],
                    closeBtn:false,
                    content:'<div class="addBox"><img src="img/ppm/jinggao.png" id="warn" style="height: 40px;margin-left: 170px; margin-top: 23px;"><div class="add_con" style="height: 305px;"><div class="detail" style="width: 300px;text-align: center;padding-top: 44px;margin:15px auto 0; border-top:1px solid #E4E4E4;"><span id="system" style="display: block;line-height: 24px;font-size: 20px;">停用后数据将被系统删除</span><span id="vender">确认停用吗？</span></div><span class="notes">请注意，你无法撤销此删除动作！</span><button class="confirm" style="left:153px;">确认停用</button><button class="cancel" style="right:94px;">取消</button></div></div>',
                    success:function(){
                        $(".cancel").click(function(){
                            layer.close(Index)
                        });
                        $(".confirm").click(function(){
                            $.ajax({
                                type:'POST',
                                url:url+"plan/"+$(dom).parent().parent().attr("id").split("_")[1]+"/deactive?token="+Cookies.get("token"),
                                contentType:"application/json",
                                success:function(data){
                                    if(data.code=="10000"){
                                        $scope.plan.list();
                                        layer.msg("停用成功！",{icon:1,time:2000});
                                        layer.close(Index)
                                    }else{
                                        errormsg(data)
                                    }
                                }
                            });
                        });
                    }
                });

            },
            remind:function(dom){
                layer.confirm("确认提醒该计划负责人？", {icon: 3, title:'提示'},function(index){
                    $.ajax({
                        type:'POST',
                        contentType:"application/json",
                        url:url+"msg/plan/send?plan_id="+$(dom).parent()[0].id.split("_")[1]+"&token="+Cookies.get("token"),
                        success:function(data){
                            if(data.code=="10000") {
                                layer.msg("操作成功！",{icon:1,time:2000});
                                layer.close(index)
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            }
        };
        $scope.plan.int();
        /*计划End*/
        /*系统*/
        $scope.system={
            int:function(){
                $(".conTable table").delegate("#addSystem","click",function(){
                    $scope.system.add();
                }).delegate(".del .sys_del","click",function(){
                    $scope.system.del(this);
                }).delegate(".del .sys_xie","click",function(){
                    $scope.system.edit(this);
                }).delegate(".del .sys_add","click",function(){
                    $scope.task.add(this);
                }).delegate(".del .task_del","click",function(){
                    $scope.task.del(this);
                }).delegate(".del .task_edit","click",function(){
                    $scope.task.edit(this);
                }).delegate(".mes","click",function(){
                    $scope.task.mes(this);
                })
            },
            list:function(){
                var sysLoad=layer.load(2);
                $.ajax({
                    type:'GET',
                    url:url+"task?job_id="+$(".headerRight ul li.on")[0].id.split("_")[1]+"&token="+Cookies.get("token"),
                    success:function(data){
                        if(data.code=="10000") {
                            var addStr=$("#addSystem").parent().parent()[0];
                            var str="",timeCon="";
                            $.each(data.data,function(i,n){
                                timeCon+="<div class='con' id='schedule_"+n.job_id_lv2+"'>";
                                str+="<tr id='system_"+n.job_id_lv2+"'>";
                                if(n.task_list.length>=3){
                                    str+="<td>"+n.job_name_lv2;
                                }else{
                                    str+="<td ><div style='width:70px;overflow: hidden;text-overflow: ellipsis;white-space: nowrap;'>"+n.job_name_lv2+"</div>";
                                }
                                str+="<div class='del'><img src='img/ppm/sys_del.png' alt='删除' class='sys_del'><img src='img/ppm/job_xie.png' alt='编辑' class='sys_xie edli'><img src='img/ppm/sys_add.png' alt='添加' class='sys_add'></div></td>";
                                str+="<td>";
                                str+="<ul class='conBox'>";
                                $.each(n.task_list,function(j,m){
                                    str+="<li id='task_"+m.task_id+"'>";
                                    str+=" <span class='mes'>"+m.task_name+"<i class='del'><img src='img/ppm/sys_del.png' alt='删除' class='task_del'><img src='img/ppm/sys_xie.png' alt='编辑' class='task_edit'></i></span>";
                                    str+="<span class='mes'>"+m.zone_list+"</span>";
                                    str+="<span>"+m.cycle_period+"</span>";
                                    str+="<span class='hoverRes'>"+m.vendor_name;
                                    str+="</span></li>";
                                    timeCon+="<ul>";
                                    timeCon+=$scope.task.make(m.grid_list);
                                    timeCon+="</ul>";
                                });
                                timeCon+="</div>";
                                str+="</ul></td></tr>";
                            });
                            $("#conBo .bo").html(timeCon);
                            $(".conTable table tbody").html(str).append(addStr);
                            gundong($("#scroll"),$(".conTable table"));
                        }else{
                            errormsg(data)
                        }
                        layer.close(sysLoad)
                    }
                });
            },
            add:function(){
                layer.prompt({
                    title: '请输入系统名称',
                    shade:[0.1,"#000"]
                }, function(value, index, elem){
                    $.ajax({
                        type:'POST',
                        data:JSON.stringify({"plan_id": parseInt($(".planBox ul .on")[0].id.split("_")[1]),"name":value,"pid":parseInt($(".headerRight ul li.on")[0].id.split("_")[1])}),
                        url:url+"job?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                layer.msg("添加成功！",{icon:1,time:2000});
                                $scope.system.list();
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            del:function(dom){
                layer.confirm('是否删除该系统?', {icon: 3, title:'提示'}, function(index){
                    $.ajax({
                        type:'DELETE',
                        url:url+"job/"+$(dom).parent().parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.system.list();
                                layer.msg("删除成功！",{icon:1,time:2000});
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            edit:function(dom){
                var name=$(dom).parent().parent().text();
                layer.prompt({
                    value:name,
                    title: '修改系统名称',
                    shade:[0.1,"#000"]
                }, function(value, index, elem){
                    $.ajax({
                        type:'POST',
                        url:url+"job/"+$(dom).parent().parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        data:JSON.stringify({
                            name:value
                        }),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.system.list();
                                layer.msg("修改成功！",{icon:1,time:2000});
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            }
        };
        $scope.system.int();
        /*系统 end*/
        /*任务*/
        $scope.task={
            make:function(data){
                var str="";
                $.each($scope.dataTime.data,function(i,n){
                    str+="<li>";
                    for(var q=0;q<n.week_list.length;q++){
                        var ifture=$scope.task.iftrue(n.week_list[q],data);
                        if(ifture.flag){
                            str+="<span class='"+ifture.status+"' data-id='"+ifture.id+"'></span>";
                        }else{
                            str+="<span class='none'></span>";
                        }
                    }
                    str+="</li>";
                });
                return str;
            },
            //判断日程的时间段以及完成状态
            iftrue:function(num,data){
                var obj={};
                obj.flag=false;
                $.each(data,function(i,n){
                    if(n.week_no==num.week_no){
                        obj.flag=true;
                        switch(n.status)
                        {
                            case 0:
                                obj.status="default";
                                obj.id=n.task_grid_id;
                                break;
                            case 1:
                                obj.status="ongoing";
                                obj.id=n.task_grid_id;
                                break;
                            case 2:
                                obj.status="finish";
                                obj.id=n.task_grid_id;
                                break;
                            case 3:
                                obj.status="delay";
                                obj.id=n.task_grid_id;
                                break;
                            case 4:
                                obj.status="unfinished";
                                obj.id=n.task_grid_id;
                                break;
                            case 9:
                                obj.status="unfinished";
                                obj.id=n.task_grid_id;
                                break;
                            default:
                                obj.status="none";
                                obj.id=n.task_grid_id;
                        }
                    }
                });
                return obj;
            },
            //获取系统
            sys:function(id){
                $.ajax({
                    type:'GET',
                    data:{job_id:$(".headerRight ul li.on")[0].id.split("_")[1],token:Cookies.get("token")},
                    url:url+"job/sys",
                    success:function(data){
                        if(data.code=="10000") {
                            $.each(data.data, function (i, n) {
                                $("#sysBox")[0].options.add(new Option(n.name, n.id))
                            });
                            $("#sysBox").val(id)
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            //获取供应商
            vender:function(){
                $.ajax({
                    type:'GET',
                    url:url+"vendor?token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $.each(data.data, function (i, n) {
                                $("#venderBox")[0].options.add(new Option(n.name, n.id))
                            });
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            //获取周期
            cycle:function(){
                $.ajax({
                    type:'GET',
                    url:url+"cycle",
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $.each(data.data, function (i, n) {
                                $("#cycle")[0].options.add(new Option(n.name + "(" + n.remark + ")", n.name))
                            });
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            add:function(dom) {
                var Index = layer.open({
                    type: 1,
                    title: false,
                    shade: [0.1, "#000"],
                    area: ['934px', '490px'],
                    closeBtn: false,
                    content: '<div class="addBox ppm_box"><div class="add_header">添加任务<span class="add_ppm_icon"></span></div><div class="add_con"><div class="add_con_left"><div class="conBox"><span class="title">系统</span><div class="con"><select id="sysBox"></select></div></div><div class="conBox"><span class="title">保养类别</span><div class="con"><input type="text" placeholder="*限制20字以内" maxlength="40" id="record"></div></div><div class="conBox"><div style="width: 50%;float: left"><span class="title">周期</span><div class="con"><select id="cycle"></select></div></div><div style="width: 50%;float: left"><span class="title">负责方</span><div class="con"><select id="venderBox"></select></div></div></div><div class="conBox"><span class="title">服务区域</span><div class="con" style="height: 304px" id="areaBox"><span id="areaCon" data="0">请选择区域</span><div class="area" id="area" style="z-index: 20"><div class="areaTop" id="areaTop1"><ul class="areaul"></ul></div><div class="areaBottom"><div class="areaqu"><input type="checkbox" id="areaAll" class="areaall"><label for="areaAll" class="arealabel">全选</label></div><button class="areaadd" id="showSet">区域管理</button></div></div><div class="area" id="setArea"><div class="areaTop"><ul class="areaul"></ul><span id="areaDelMsg">已删除<i>--</i>区域</span></div><div class="areaBottom"><div class="areaqu"><label class="arealabel" style="color:#007aff;" id="showArea">完成</label></div><div class="areaadd" style="width: 150px"><input type="text" class="addarea" ><button id="area_set_add" class="areaadd" style="width:80px">添加区域</button></div></div></div></div></div></div><div class="add_con_right"><div class="conBox" style="overflow: inherit"><span class="title" style="text-align: left">添加日程</span><div class="con" style="padding-left: 0"><div class="scheduleBox"><ul class="schedule"><li class="none">还没有日程</li></ul></div><div class="Bran" id="BranBox"><div class="BranTop" id="BranTop"><ul class="Brana"></ul></div><div class="BranBottom"><div class="Branqu"><input type="checkbox" id="areaAll1" class="Brana"><label for="areaAll1" class="Brana">全选</label></div></div></div></div></div><div class="conBox"><div style="width:40%;float: left"><span class="title" style="width: 2em;float: left;">起始</span><div class="con" style="padding-left:0;width:168px ;float: left;"><select  id="starTime"><option>请选择</option></select></div></div><div style="width: 40%;float: left"><span class="title" style="width: 2em;float: left;">结束</span><div class="con" style="padding-left:0;width:168px ;float: left;"><select  id="endTime"><option>请选择</option></select></div></div><div style="width: 20%;float: left"><div class="tianjia"><button>添加</button></div></div></div></div><button class="confirm" style="left:378px">确认新建</button><button class="cancel" style="right:337px">取消</button><span class="notes">确认前请仔细核对信息，确保无误！</span></div></div>',
                    success: function () {
                        $scope.task.vender();
                        $scope.task.cycle();
                        $scope.task.sys($(dom).parent().parent().parent()[0].id.split("_")[1]);
                        $scope.schedule.oldTime=[];
                        $("#starTime").focus(function () {
                            $scope.schedule.starTime()
                        });
                        $("#endTime").focus(function () {
                            $scope.schedule.endTime()
                        });
                        $(".tianjia button").click(function () {
                            $scope.schedule.add()
                        });
                        $(".schedule").delegate(".delSchedule", "click", function () {
                            $scope.schedule.del(this)
                        }).delegate(".Branbtn", "click", function () {
                            $scope.area.branOut(this)
                        });
                        $(".cancel").click(function () {
                            layer.close(Index)
                        });
                        /*区域*/
                        $scope.area.int();
                        $(".confirm").click(function () {
                            var name = $("#record").val(), zone_list = $('#areaCon').attr("data"), task_order_list = $scope.schedule.data();
                            if (name == "") {
                                layer.tips("请输入计划名称！", "#record", {tips: [2, "#50555C"]});
                                return;
                            }
                            if (zone_list == "0") {
                                layer.tips("请选择区域！", "#areaCon", {tips: [2, "#50555C"]});
                                return;
                            }
                            if ($(".schedule .none").length != 0) {
                                layer.tips("请设置日程！", ".tianjia button", {tips: [2, "#50555C"]});
                                return;
                            }
                            if(!checkarr($(".branarea i"),"--")){
                                layer.tips("请设置日程区域！", ".schedule", {tips: [2, "#50555C"]});
                                return;
                            }
                            $.ajax({
                                type: 'POST',
                                data: JSON.stringify({
                                    "cycle_period": $("#cycle").val(),
                                    "name": name,
                                    "vendor_id": parseInt($("#venderBox").val()),
                                    "zone_list": zone_list,
                                    "year": localStorage.getItem("nowYear"),
                                    "task_order_list": task_order_list
                                }),
                                contentType: "application/json",
                                url: url + "task?plan_id=" + $(".planBox ul li.on").attr("id").split("_")[1] + "&job_id=" + $(dom).parent().parent().parent()   .attr("id").split("_")[1] + "&token=" + Cookies.get("token"),
                                success: function (data) {
                                    if (data.code == "10000") {
                                        $scope.system.list();
                                        layer.msg("添加成功！", {icon: 1, time: 2000});
                                        layer.close(Index)
                                    } else {
                                        errormsg(data)
                                    }
                                }
                            });
                        });
                    }
                });
            },
            del:function(dom){
                layer.confirm('是否删除该任务?', {icon: 3, title:'提示'}, function(index){
                    $.ajax({
                        type:'DELETE',
                        url:url+"task/"+$(dom).parent().parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.system.list();
                                layer.msg("删除成功！",{icon:1,time:2000});
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            edit:function(dom){
                var name=$(dom).parent().parent().text();
                layer.prompt({
                    value:name,
                    title: '修改任务名称',
                    shade:[0.1,"#000"]
                }, function(value, index, elem){
                    $.ajax({
                        type:'POST',
                        url:url+"task/"+$(dom).parent().parent().parent()[0].id.split("_")[1]+"?token="+Cookies.get("token"),
                        data:JSON.stringify({
                            name:value
                        }),
                        contentType:"application/json",
                        success:function(data){
                            if(data.code=="10000") {
                                $scope.system.list();
                                layer.msg("修改成功！",{icon:1,time:2000});
                                layer.close(index);
                            }else{
                                errormsg(data)
                            }
                        }
                    });
                });
            },
            mes:function(dom){
                var pa=$(".conTable").offset();
                $(".message").css({
                    "top":($(dom).offset().top-pa.top+30)+"px",
                    "left":($(dom).offset().left-pa.left+30)+"px"
                }).show();
                $(".message span").html($(dom).text());
            }
        };
        /*任务 end*/
        /*区域*/
        $scope.area={
            int:function(){
                this.list();
                $("#areaCon").click(function(){
                    $('#area,#setArea').show();
                });
                $("#showArea").click(function(){
                    $("#setArea").css("z-index","10")
                });
                $("#showSet").click(function(){
                    $("#setArea").css("z-index","100")
                });
                $("#area_set_add").click(function(){
                    $scope.area.add();
                });
                $("#setArea").delegate("li input","click",function(){
                    $scope.area.del(this.id.split("_")[1]);
                });
                $("#areaAll,#areaAll1").click(function(){
                    $scope.area.all(this);
                });
                this.select("areaTop1","areaAll");
                this.select("BranTop","areaAll1");
            },
            areaArr:[],
            branArr:[],
            list:function(){
                $.ajax({
                    type:'GET',
                    url:url+"zone?project_id="+parseInt(JSON.parse(localStorage.getItem("userInfo")).projectId)+"&token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $scope.area.areaArr = data.data;
                            var str = "", sstr = "";
                            $.each($scope.area.areaArr, function (i, n) {
                                str += "<li class='areali'>";
                                str += "<input type='checkbox' id='area_" + n.id + "' class='areain'>";
                                str += "<label for='area_" + n.id + "' class='areala'>" + n.name + "</label>";
                                str += "<em class='areaEm' data-id='" + n.id + "' data-type='0' title='"+n.name+"'></em>";
                                str += "</li>";
                                sstr += "<li class='areali'>";
                                sstr += "<input type='button' id='sarea_" + n.id + "' class='areain'>";
                                sstr += "<label class='areala' title='"+n.name+"'>" + n.name + "</label>";
                                sstr += "</li>";
                            });
                            $("#area .areaTop ul").html(str);
                            $("#setArea .areaTop ul").html(sstr);
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            add:function(){
                var area=$("input.addarea").val();
                if(area==""){
                    layer.tips("请输入内容！","input.addarea",{tips:[4,"#50555C"]});
                    return;
                }
                $.ajax({
                    data:JSON.stringify({
                        "name":area,
                        "project_id":parseInt(JSON.parse(localStorage.getItem("userInfo")).projectId)
                    }),
                    url:url+"zone?token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $scope.area.list();
                            $(".addarea").val("");
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            del:function(id){
                $.ajax({
                    type:'DELETE',
                    url:url+"zone/"+id+"?token="+Cookies.get("token"),
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $("#areaDelMsg").show().find("i").html($("#sarea_"+id).parent().find("label").html());
                            setTimeout(function(){
                                $("#areaDelMsg").hide();
                            },2000);
                            $scope.area.list();
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            //区域全选
            all:function(dom){
                if($(dom)[0].checked==true){
                    $.each($(dom).parent().parent().parent().find("li input"),function(i,n){
                        n.checked=true
                    })
                }else if($(dom)[0].checked==false){
                    $.each($(dom).parent().parent().parent().find("li input"),function(i,n){
                        n.checked=false
                    })
                }
            },
            starId:0,
            endId:0,
            select:function(id,allId){
                $("#"+id+" ul").delegate("li em","click",function(){
                    var emList=$("#"+id+" ul li em");
                    if($(this).attr("data-type")==0){
                        $.each(emList,function(i,n){
                            $(n).attr("data-type","1");
                        });
                        $(this).addClass("areabg");
                        $scope.area.starId=parseInt($(this).attr("data-id"));
                        $("#"+id+" ul").bind("mousemove",function(e){
                            var end=$(e.target).attr("data-id");
                            $.each(emList,function(i,n){
                                var num=parseInt($(n).attr("data-id"));
                                if(num>=$scope.area.starId&&num<=end||num<=$scope.area.starId&&num>=end){
                                    $(n).addClass("areabg");
                                }else{
                                    $(n).removeClass("areabg");
                                }
                            })
                        })
                    }else if($(this).attr("data-type")==1){
                        $scope.area.endId=parseInt($(this).attr("data-id"));
                        $.each(emList,function(i,n){
                            $(n).attr("data-type","0");
                            $(n).removeClass("areabg");
                        });
                        $("#"+id+" ul").unbind("mousemove");
                        $.each($("#"+id+" ul li input"),function(i,n){
                            var num=parseInt($(n).attr("id").split("_")[1]);
                            if(num>=$scope.area.starId&&num<=$scope.area.endId||num<=$scope.area.starId&&num>=$scope.area.endId){
                                if(n.checked==false){
                                    n.checked=true;
                                }else{
                                    n.checked=false;
                                }
                            }
                        });
                    }
                    //监测区域是否全部选中
                    var j= 0,obj=$("#"+id+" ul li input");
                    obj.each(function(i,n){
                        if(n.checked==true){
                            j++;
                        }
                    });
                    if((obj.length-j)==0){
                        $("#"+allId)[0].checked=true;
                    }else{
                        $("#"+allId)[0].checked=false;
                    }
                });
            },
            sure:function(className,conObj){
                var con="",idcon="",m=0;
                if(className=="area"){
                    $scope.area.branArr=[];
                }
                $.each($("."+className+" ul li"),function(i,n){
                    if($(n).find("input")[0].checked==true){
                        con=con+$(n).find("label").html()+"、";
                        idcon=idcon+$(n).find("input").attr("id").split("_")[1]+",";
                        if(className=="area") {
                            $scope.area.branArr[m++] = $(n).find('input')[0].id.split("_")[1];
                        }
                    }
                });
                if(con!=""){
                    con=con.substring(0,con.length-1);
                    idcon=idcon.substring(0,idcon.length-1);
                    conObj.html(con).attr("data",idcon);
                }else {
                    if(className=="area"){
                        conObj.html("请选择区域").attr("data",0);
                    }else{
                        conObj.html("--").attr("data",0);
                    }
                }
                $('.'+className).hide()
            },
            branOut:function(dom){
                if(this.branArr.length==0){
                    layer.tips("请选择区域！","#areaCon",{tips:[2,"#50555C"]});
                    return;
                }
                $(".schedule").find(".branarea i").removeClass("BranCon");
                $(dom).parent().find(".branarea i").addClass("BranCon");
                var top=$(dom).parent().position().top;
                $('.Bran').css("top",top+45+"px").slideDown();
                var str="";
                $.each($scope.area.branArr,function(i,n){
                    str+="<li>";
                    $.each($scope.area.areaArr,function(j,m){
                        if(n==m.id){
                            str+="<input type='checkbox' id='Bran_"+m.id+"'>";
                            str+="<label for='Bran_"+m.id+"'>"+m.name+"</label>";
                            str+="<em class='BranEm' data-id='"+m.id+"' data-type='0' title='"+m.name+"'></em>";
                        }
                    });
                    str+="</li>";
                });
                $(".BranTop ul").html(str);
                if(!$(".BranCon").attr("data")){
                    $("#areaAll1")[0].checked=false;
                    return;
                }
                var arr=$(".BranCon").attr("data").split(",");
                var flag=false;
                $.each($(".BranTop ul li input"),function(i,n){
                    if(arr.indexOf(n.id.split("_")[1])>=0){
                        n.checked=true;
                    }else{
                        flag=true;
                    }
                });
                if(flag){
                    $("#areaAll1")[0].checked=false;
                }else{
                    $("#areaAll1")[0].checked=true;
                }
            }
        };
        /*区域 end*/
        /*日程*/
        $scope.schedule={
            oldTime:[],
            starTime:function(){
                $("#starTime").html("<option>请选择</option>");
                $.each($scope.dataTime.data,function(i,n){
                    var str=n.month+"月";
                    $.each(n.week_list,function(j,m){
                        var str1="",flag=true;
                        str1+="第"+(j+1)+"周";
                        str1+=" 总第"+m.week_no+"周";
                        $.each($scope.schedule.oldTime,function(b,v){
                            if(m.week_no==v){
                                flag=false;
                            }
                        });
                        if(flag){
                            $("#starTime")[0].options.add(new Option(str+str1,m.week_no))
                        }
                    });
                });
            },
            endTime:function(){
                $("#endTime").html("<option>请选择</option>");
                var starTime=$("#starTime").val();
                var mm=starTime;
                $.each($scope.dataTime.data,function(i,n){
                    var str=n.month+"月";
                    $.each(n.week_list,function(j,m){
                        if(m.week_no>=starTime){
                            var str1="",flag=true;
                            str1+="第"+(j+1)+"周";
                            str1+=" 总第"+m.week_no+"周";
                            $.each($scope.schedule.oldTime,function(b,v){
                                if(m.week_no==v){
                                    flag=false;
                                }
                            });
                            if(flag) {
                                if(m.week_no!=mm){
                                    return;
                                }
                                $("#endTime")[0].options.add(new Option(str + str1,m.week_no));
                                mm=m.week_no+1;
                            }
                        }
                    });
                });
            },
            add:function(){
                var starTime=$("#starTime").val();
                var endTime=$("#endTime").val();
                if(starTime=="请选择"){
                    layer.tips("请选择起始时间！","#starTime",{tips:[3,"#50555C"]});
                    return;
                }
                if(endTime=="请选择"){
                    layer.tips("请选择结束时间！","#endTime",{tips:[3,"#50555C"]});
                    return;
                }
                if($(".schedule .none").length!=0){
                    $(".schedule .none").remove()
                }
                for(var p=parseInt(starTime);p<=endTime;p++){
                    $scope.schedule.oldTime.push(p);
                }
                var starStr,endStr;
                $.each($scope.dataTime.data,function(i,n){
                    var str=n.month+"月";
                    $.each(n.week_list,function(j,m){
                        var str1="";
                        str1+="第"+(j+1)+"周";
                        str1+=" 总第<i>"+m.week_no+"</i>周";
                        if(m.week_no==starTime){
                            starStr=str+str1;
                        }
                        if(m.week_no==endTime){
                            endStr=str+str1;
                        }
                    });
                });
                var addStr="";
                addStr+="<li>";
                addStr+="<span data-star='"+starTime+"' data-end='"+endTime+"' class='timeD'>";
                addStr+=starStr+"<i>——</i>"+endStr;
                addStr+="</span>";
                addStr+="<button class='delSchedule'>删除</button><button class='Branbtn'>区域分配</button><br>";
                addStr+="<span class='allNum'>共<i>"+(endTime-starTime+1)+"</i>周</span>";
                addStr+="<span class='branarea'>区域<i data='0'>--</i></span>";
                addStr+="</li>";
                $(".schedule").append(addStr);
                $("#starTime").html("<option>请选择</option>");
                $("#endTime").html("<option>请选择</option>");
            },
            del:function(dom){
                if($(".schedule li").length==1){
                    $(".schedule").append("<li class='none'>还没有日程</li>")
                }
                for(var i=0;i<parseInt($(dom).parent().find(".allNum i").html());i++){
                    var index=$scope.schedule.oldTime.indexOf(parseInt($(dom).parent().find(".timeD").attr("data-star"))+i);
                    $scope.schedule.oldTime.splice(index,1);
                }
                $(dom).parent().remove();
            },
            data:function(){
                var arr=[];
                $.each($(".schedule li"),function(i,n){
                    var obj={};
                    obj.start_week=$(n).find(".timeD").attr("data-star");
                    obj.end_week=$(n).find(".timeD").attr("data-end");
                    obj.zone_list=$(n).find(".branarea i").attr("data");
                    arr.push(obj);
                });
                return arr;
            }
        };
        /*日程 end*/
        //获取时间
        $scope.dataTime={
            data:[],
            makeTimeTitle:function(){
                var noe=new Date();
                var year=localStorage.getItem("nowYear")||noe.getFullYear();
                $.ajax({
                    type:"get",
                    url:url+"calendar?year="+year+"&period=month",
                    contentType:"application/json",
                    success:function(data){
                        if(data.code=="10000") {
                            $scope.dataTime.data = data.data;
                            var str = "";
                            $.each($scope.dataTime.data, function (i, n) {
                                str += "<li id='mon" + n.month + "'>";
                                if(n.month>9){
                                    str += "<div class='month'>" + n.year+"-"+ n.month + "</div>";
                                }else{
                                    str += "<div class='month'>" + n.year+"-0"+ n.month + "</div>";
                                }
                                for (var j = 0; j < n.week_list.length; j++) {
                                    str += "<i>" + n.week_list[j].week_no + "</i>";
                                }
                                str += "</li>";
                            });
                            $("#timeCon .title ul").html(str);
                            //获取时间背景  获取当前时间
                            $scope.dataTime.currMon();
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            //时间表左右箭头
            currentMonth:[1,2,3],
            lraFlag:true,
            lra:function(res){
                if(!$scope.dataTime.lraFlag){
                    return;
                }
                $scope.dataTime.lraFlag=false;
                var left,n=3;
                if(res=="left"){
                    $scope.dataTime.currentMonth[0]-=n;
                    $scope.dataTime.currentMonth[1]-=n;
                    $scope.dataTime.currentMonth[2]-=n;
                }else{
                    $scope.dataTime.currentMonth[2]+=n;
                    $scope.dataTime.currentMonth[1]+=n;
                    $scope.dataTime.currentMonth[0]+=n;
                }
                if($scope.dataTime.currentMonth[0]==1){
                    left=0
                }else if($scope.dataTime.currentMonth[0]==10){
                    left=-$('#timeCon').innerWidth()+$('.timeBox').innerWidth()
                }else{
                    left=-$(".timeBox .title ul #mon"+$scope.dataTime.currentMonth[0]).position().left+30;
                }
                $("#timeCon").animate({
                    left:left+"px"
                },800,function(){
                    $scope.dataTime.lraFlag=true;
                    if($scope.dataTime.currentMonth[0]==1){
                        $("#timeLeft").hide();
                    }else{
                        $("#timeLeft").show();
                    }
                    if($scope.dataTime.currentMonth[2]==12){
                        $("#timeRight").hide();
                    }else{
                        $("#timeRight").show();
                    }
                });
            },
            //判断当前月份
            currMon:function(){
                $.ajax({
                    type:'GET',
                    url:url+"calendar/now",
                    contentType:"application/json",
                    success:function(data){
                        //设置时间表背景
                        if(data.code=="10000") {
                            var str = "",nowDate=new Date();
                            var wwlist=$scope.dataTime.data[$scope.dataTime.data.length-1].week_list
                            for (var i = 1; i <= wwlist[wwlist.length-1].week_no; i++) {
                                if (i == data.data.week_no&&localStorage.getItem("nowYear")==nowDate.getFullYear()) {
                                    str += "<li class='on'></li>"
                                } else {
                                    str += "<li></li>"
                                }
                            }
                            $(".timeBox .bg").html(str);
                            //判断当前月份
                            if(parseInt(localStorage.getItem("nowYear"))==nowDate.getFullYear()){
                                mon = data.data.month;
                            }else{
                                mon=1;
                            }
                            if (mon <= 3) {
                                $("#timeLeft").hide();
                                $("#timeRight").show();
                                mon = 1;
                            } else if (mon > 3 && mon <= 6) {
                                $("#timeLeft").show();
                                $("#timeRight").show();
                                mon = 4;
                            } else if (mon > 6 && mon <= 9) {
                                $("#timeLeft").show();
                                $("#timeRight").show();
                                mon = 7;
                            } else if (mon > 9 && mon <=12) {
                                $("#timeLeft").show();
                                $("#timeRight").hide();
                                mon = 10;
                            }
                            var left=0;
                            if(mon==10){
                                left=-$('#timeCon').innerWidth()+$('.timeBox').innerWidth()
                            }else{
                                left = -$(".timeBox .title ul #mon" + mon).position().left;
                            }
                            $("#timeCon").css({left: left + "px"});
                            $scope.dataTime.currentMonth = [mon, mon + 1, mon + 2];
                        }else{
                            errormsg(data)
                        }
                    }
                });
            }
        };
        //时间hover弹出判断
        $(".timeBox").delegate(".con ul li span","click",function(){
            if(this.className=="none"){
                return
            }
            /*setLocal("gid",parseInt($(this).attr("data-id")));*/
            $(".hover-box .hover-hlt").hide();
            $("#"+this.className+"_hover").show();
            var top=$(this).offset().top-$(".timeBox").offset().top+40;
            var left=$(this).offset().left-$(".timeBox").offset().left-45;
            if(left<15){
                if(top<=300){
                    top-=30;
                    left+=75;
                    $(".hoverArrow").css({
                        top:10+"px",
                        left:-18+"px",
                        transform:"rotate(-90deg)"
                    })
                }else{
                    top-=200;
                    left+=75;
                    $(".hoverArrow").css({
                        top:174+"px",
                        left:-18+"px",
                        transform:"rotate(-90deg)"
                    })
                }
            }else if(left>=15&&left<=165){
                if(top>=300){
                    top-=244;
                    $(".hoverArrow").css({
                        top:200+"px",
                        left:49+"px",
                        transform:"rotate(180deg)"
                    })
                }else{
                    $(".hoverArrow").css({
                        top:-13+"px",
                        left:49+"px",
                        transform:"rotate(0deg)"
                    })
                }
            }else if(left>165&&left<=315){
                if(top<300){
                    left-=45;
                    $(".hoverArrow").css({
                        top:-13+"px",
                        left:94+"px",
                        transform:"rotate(0deg)"
                    })
                }else{
                    top-=244;
                    left-=45;
                    $(".hoverArrow").css({
                        top:200+"px",
                        left:94+"px",
                        transform:"rotate(180deg)"
                    })
                }
            }else if(left>315){
                if(top<=300){
                    top-=30;
                    left-=123;
                    $(".hoverArrow").css({
                        top:10+"px",
                        left:160+"px",
                        transform:"rotate(90deg)"
                    })
                }else{
                    top-=200;
                    left-=123;
                    $(".hoverArrow").css({
                        top:174+"px",
                        left:160+"px",
                        transform:"rotate(90deg)"
                    })
                }
            }
            $scope.Hover.hoverTX(left);
            $scope.Hover.getHover(top,left,$(this).attr("data-id"));
        });
        $(".hover-box").delegate(".remindClick","click",function(){
            $scope.Hover.remindClick($(this).attr("data-id"))
        }).delegate(".clickFinish","click",function(){
            $scope.Hover.clickFinish($(this).attr("data-id"))
        });
        // 相关工单 点击事件
        $scope.relationWork = function () {
	        openHtml(
		        "tpl/order_detail.html?id=" + $('.relationWork').attr('data-device-id'),
		        "order"
	        );
        };
        $scope.Hover={
            hoverTX:function(leftNum){
                var left=leftNum;
                if(left<=150){
                    left=160
                }else{
                    left=-90
                }
                $(".hover-right").css({
                    left:left+"px",
                    opacity: 1
                });
            },
            getHover:function(top,left,id){
                $.ajax({
                    type:'GET',
                    contentType:"application/json",
                    url:url+"task/grid/"+id+"?token="+Cookies.get("token"),
                    success:function(data){
                        if(data.code=="10000") {
                            $(".hlb span:eq(0)").html("条线：" + data.data.job_name_lv1);
                            $(".hlb span:eq(1)").html("系统：" + data.data.job_name_lv2);
                            $(".hlb span:eq(2)").html("保养类别：" + data.data.task_name);
                            $(".hlb span:eq(3)").html("服务区域：" + data.data.zone_list);
                            $(".hlb span:eq(4)").html("任务期间：" + (zhuan(data.data.start_date) + "-" + zhuan(data.data.end_date)));
                            $(".hlb span:eq(5)").html("完成时间：" + zhuan(data.data.end_date));
                            $(".hover-box .remindClick,.hover-box .clickFinish").attr("data-id",id);
	                          $(".hover-box .relationWork").show()
	                           $("#click-finish").show();
	                        if (data.data.device_order_id) {
	                            $(".hover-box .relationWork").attr("data-device-id",data.data.device_order_id);
                            } else {
	                            $(".hover-box .relationWork").hide()
                            }
                            console.log(data.data.status)
                            if(data.data.status==2||data.data.status==3){
                                data.data.event_list.forEach(function(item,index){
                                    if(item.action==4){
                                        if(item.remark!=""){
                                            $(".hlb span:eq(6)").html("完成情况：" +item.remark).show();
                                        }else{
                                            $(".hlb span:eq(6)").html("完成情况：--" ).show();
                                        }
                                    }
                                });
	                            $("#click-finish .clickFinish").hide();
                            }else if(data.data.status==1||data.data.status==4){
                                $(".hlb span:eq(6)").hide();
                                $(".clickFinish").show();
                            }else{
                                $(".hlb span:eq(6)").hide();
                                $(".clickFinish").hide();
                            }
                            var str = "<span class='hover'>提醒记录</span>";
                            $.each(data.data.event_list, function (i, n) {
                                if (i == 0) {
                                    str += "<i class='on hover'>" + n.create_at.substring(5,16) + "</i>";
                                } else {
                                    str += "<i class='hover'>" + n.create_at.substring(5,16) + "</i>";
                                }
                            });
                            $(".hover-right").html(str);
                            $(".hover-box").css({
                                top: top + "px",
                                left: left + "px"
                            }).show();
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            remind:function(id){
                $.ajax({
                    type:'GET',
                    contentType:"application/json",
                    url:url+"task/grid/"+id+"?token="+Cookies.get("token"),
                    success:function(data){
                        if(data.code=="10000") {
                            var str = "<span class='hover'>提醒记录</span>";
                            $.each(data.data.event_list, function (i, n) {
                                if (i == 0) {
                                    str += "<i class='on hover'>" + n.create_at.substring(5,16) + "</i>";
                                } else {
                                    str += "<i class='hover'>" + n.create_at.substring(5,16) + "</i>";
                                }
                            });
                            $(".hover-right").html(str);
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            remindClick:function(id){
                $.ajax({
                    type:'POST',
                    contentType:"application/json",
                    url:url+"task/event/"+id+"?token="+Cookies.get("token"),
                    data:JSON.stringify({
                        "action": 1
                    }),
                    success:function(data){
                        if(data.code=="10000") {
                            $scope.Hover.remind(id);
                        }else{
                            errormsg(data)
                        }
                    }
                });
            },
            clickFinish:function(id){
                var Index=layer.open({
                    type:1,
                    title:false,
                    shade:[0.1,"#000"],
                    area:['432px','320px'],
                    closeBtn:false,
                    content:'<div class="addBox" id="clickFinish"><div class="add_header">填写完成信息备注</div><div class="add_con" style="height: 257px;"><div class="conBox" style="padding-left: 0"><div class="con"><textarea name="" id="finishCon" style="width: 310px;height:98px;resize: none"></textarea><i style="display: block;color: #9b9b9b;font-size: 14px;line-height: 30px">请将字数控制在40字以内</i></div></div><button class="confirm" style="left: 204px;">完成</button><button class="cancel" style="right: 56px;">取消</button></div></div>',
                    success:function(){
                        $(".cancel").click(function(){
                            layer.close(Index)
                        });
                        $(".confirm").click(function(){
                            $.ajax({
                                type:'POST',
                                contentType:"application/json",
                                url:url+"task/event/"+id+"?token="+Cookies.get("token"),
                                data:JSON.stringify({
                                    "action": 4,
                                    "remark": $("#finishCon").val()
                                }),
                                success:function(data){
                                    if(data.code=="10000") {
                                        $scope.system.list();
                                        layer.msg("操作成功！",{icon:1,time:2000});
                                        layer.close(Index)
                                    }else{
                                        errormsg(data)
                                    }
                                }
                            });
                        });
                    }
                });
            }
        };
        $(document).mouseup(function(a){
            if ($(a.target).attr("id") != "areaBox" && ($(a.target).parentsUntil("#areaBox").parent().length == 0 || $(a.target).parentsUntil("#areaBox").parent()[0].id != "areaBox")) $scope.area.sure("area",$("#areaCon"));
            if ($(a.target).attr("id") != "BranBox" && ($(a.target).parentsUntil("#BranBox").parent().length == 0 || $(a.target).parentsUntil("#BranBox").parent()[0].id != "BranBox")) $scope.area.sure("Bran",$(".BranCon"));
            if ($(a.target).attr("id") != "mes" && ($(a.target).parentsUntil("#mes").parent().length == 0 || $(a.target).parentsUntil("#mes").parent()[0].id != "mes")) $(".message").hide();
            if ($(a.target).attr("id") != "setBox" && ($(a.target).parentsUntil(".setBox").parent().length == 0 || $(a.target).parentsUntil(".setBox").parent()[0].id != "setBox")) $("#setBox").remove();
            if ($(a.target).attr("id") != "editBox" && ($(a.target).parentsUntil(".editBox").parent().length == 0 || $(a.target).parentsUntil("#editBox").parent()[0].id != "editBox")) $("#editBox").remove();
            if ($(a.target).attr("id") != "hover-box" && ($(a.target).parentsUntil(".hover-box").parent().length == 0 || $(a.target).parentsUntil("#hover-box").parent()[0].id != "hover-box")) $("#hover-box").hide();
        });
}])
.controller("wait",["$scope",function($scope){
        Wait.int()
}])
.controller("admin",["$scope",function($scope){
    if($("#gauge_js").length<1){
        $("head").append('<script src="js/gauge.js?_v='+_v+'" id="gauge_js"></script><script src="js/admin.js?_v='+_v+'"></script>');
    }
        admin.int();
}]);
//滚动条对象
function scrollObj(scrollObj,tableObj,html){
    this.scrollObj=scrollObj;
    this.tableObj=tableObj;
    this.tableH=this.tableObj.height();
    this.boxH=this.tableObj.parent().height();
    this.scrollH=this.boxH*this.boxH/this.tableH;
    this.v1=parseFloat(this.scrollObj.css("top"));
    this.v2=-(this.tableH-this.boxH)*this.v1/(this.boxH-this.scrollH);
    this.html=html;
    this.html.css({"user-select":"none"});
    this.scroll();
    this.drag();
}
scrollObj.prototype={
    int:function(){
        var tableH=this.tableObj.height();
        if(tableH!=this.tableH){
            this.tableH=tableH;
            this.boxH=this.tableObj.parent().height();
            this.scrollH=this.boxH*this.boxH/this.tableH;
            this.v1=parseFloat(this.scrollObj.css("top"));
            this.v2=-(this.tableH-this.boxH)*this.v1/(this.boxH-this.scrollH);
            this.scrollObj.height(this.scrollH);
        }
        if($(".message").length>0){
            $(".message").hide();
        }
        if($(".hover-box").length>0){
            $(".hover-box").hide();
        }

    },
    mouseWheel:function(obj,upfun,downfun){
        if (obj.addEventListener) {
            obj.addEventListener("mousewheel",fun,false);
            obj.addEventListener("DOMMouseScroll",fun,false);
        }else if(obj.attachEvent){
            obj.attachEvent("onmousewheel",fun);
        }
        function fun(e){
            var ev=e||window.event;
            if (ev.detail==-3||ev.wheelDelta==120) {
                if (upfun) {
                    upfun.call(obj,e);
                }
            }else if(ev.detail==3||ev.wheelDelta==-120){
                if (downfun) {
                    downfun.call(obj,e);
                }
            }
        }
    },
    scroll:function(){
        this.scrollObj.css({top:0+"px"});
        this.tableObj.css({"margin-top":0+"px"});
        if(this.tableH<=this.boxH){
            this.scrollObj.parent().hide();
            return
        }else{
            this.scrollObj.parent().show();
        }
        this.scrollObj.height(this.scrollH);
        var that=this;
        var scrollObj;
        if(this.tableObj.parent().attr("class")=="conTable"){
            scrollObj=$(".body-con")[0];
        }else{
            scrollObj=this.tableObj.parent()[0];
        }
        this.mouseWheel(scrollObj,function(){
            if(that.scrollObj.parent().css("display")=="none"){
                return
            }
            that.int();
            that.v1-=10;
            if(that.v1<=10){
                that.v1=0;
            }
            that.SNum()
        },function(){
            if(that.scrollObj.parent().css("display")=="none"){
                return
            }
            that.int();
            that.v1+=10;
            if(that.v1>=that.boxH-that.scrollH){
                that.v1=that.boxH-that.scrollH;
            }
            that.SNum()
        });
    },
    SNum:function(){
        this.v2=-(this.tableH-this.boxH)*this.v1/(this.boxH-this.scrollH);
        this.scrollObj.css({top:this.v1+"px"});
        this.tableObj.css({"margin-top":this.v2+"px"});
        if(this.tableObj.parent().attr("class")=="conTable"){
            if($("#conBo").length!=0){
                $("#conBo .bo").css({"margin-top":this.v2+"px"})
            }
        }
    },
    drag:function(){
        var that=this;
        this.scrollObj.bind("mousedown",function(e){
            that.int();
            var oy=e.pageY;
            that.html.bind("mousemove",function(e){
                that.v1=that.v1+e.pageY-oy;
                oy=e.pageY;
                if(that.v1<=0){
                    that.v1=0;
                }
                if(that.v1>=that.boxH-that.scrollH){
                    that.v1=that.boxH-that.scrollH;
                }
                that.SNum()
            });
            that.html.bind("mouseup",function(){
                $("html").unbind("mousemove")
            })
        })
    }
};
//创建滚动条对象
function gundong(scroll,table){
    new scrollObj(scroll,table,$("html"));
}


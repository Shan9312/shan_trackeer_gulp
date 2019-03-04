/*辅助列表*/
var store = {
  comments_content: null // 用于渲染故障设备的备注信息
};
var assist = {
  /*获取条线*/
  getLine: function(is) {
    $.ajax({
      url: DOMAIN + "user/selectCategoryList",
      data: {
        token: Cookies.get("token")
      },
      success: function(data) {
        if (data.code == 10000) {
          assist.LineList=data.data;
          var str = '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="">全部</a></li>';
          $.each(data.data, function(i, n) {
            str += '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1"' +
             ' data-page="' + n.category_list + '"  data-value="'+n.value2+'">' + n.value2 + "</a></li>";
          });
          if ($(".line1").length > 0) {
            $(".line1 ul").html(str);
          }
          /*if (is == 1) {
            str += '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="isNull">非蓝牙</a></li>';
          }*/
          $(".line ul").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  LineList:[],
  statusList: ["派工", "维修", "特殊", "待" + "" + "反馈", "已完成"],
  statusColor: ["work", "common", "fault", "normal"]
};
var alertImg = {
  open: function(urlStr) {
    layer.open({
      type: 1,
      title: false,
      area: ["400px", "400px"],
      content: '<img src="' + urlStr + '" style="width:100%;height:100%"/>'
    });
  }
};
var login = {
  log: function() {
    var name = $("#login-username").val(),
      pass = $("#login-password").val();
    if (name == "") {
      layer.tips("登录名不能为空！", "#login-username", {
        tips: [2, "#50555C"]
      });
      return;
    }
    if (pass == "") {
      layer.tips("密码不能为空！", "#login-password", { tips: [2, "#50555C"] });
      return;
    }
    if (!/^(\w){6,20}$/.exec(pass)) {
      layer.tips("密码格式不正确！", "#login-password", {
        tips: [2, "#50555C"]
      });
      return;
    }
    $.ajax({
      url: DOMAIN + "user/login/web",
      data: {
        userName: name,
        password: hex_sha1(pass)
      },
      success: function(data) {
        if (data.code == 10000) {
          var date = new Date();
          date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
          Cookies.set("token", data.data.token, { expires: date });
          var rem = $("#remc");
          if (rem[0].checked) {
            date.setTime(date.getTime() + 30 * 24 * 60 * 60 * 1000);
            Cookies.set("remc", name + "&&" + pass, { expires: date });
          } else {
            Cookies.remove("remc");
          }
          localStorage.setItem(
            "userInfo",
            JSON.stringify({
              id: data.data.userId,
              userName: data.data.userName,
              icon: data.data.icon,
              accountId: data.data.accountId,
              projectId: data.data.projectId,
              roleId: data.data.roleId,
              isWorkerOrder: data.data.isWorkerOrder
            })
          );
          localStorage.setItem(
            "account_list",
            JSON.stringify(data.data.accountList)
          );
          localStorage.setItem(
            "permissionNameList",
            JSON.stringify(data.data.permissionNameList)
          );
          localStorage.setItem(
            "permissionList",
            JSON.stringify(data.data.permissionList)
          );
          location.href = "index.html";
        } else {
          errormsg(data);
        }
      }
    });
  },
  out: function() {
    Cookies.remove("token");
    parent.location.href = "../login.html";
  },
  rem: function() {
    var remc = Cookies.get("remc");
    if (remc) {
      $("#login-username").val(remc.split("&&")[0]);
      $("#login-password").val(remc.split("&&")[1]);
      $("#remc")[0].checked = true;
    }
    $(".main .btn-down").on("click", function() {
      $("html").addClass("fixed");
    });
    $(".codebox .code .icon-remove,.codebox .codebg").on("click", function() {
      $("html").removeClass("fixed");
    });
    $(".logo .login-a").on("click", function() {
      $(".login").slideToggle();
    });
  }
};
var order_alert = {
  //新增检修报告/同APP
  add: function(status) {
    this.index = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["610px", "494px"],
      closeBtn: false,
      content:
        '<div class="order_alert"><div class="title">' +
        (status == 9 ? "添加报告" : status == 4 ? "无法完成" : "完成工单") +
        '</div><div class="imgBox"><img src="../img/button_add.png"/><img src="../img/button_add.png" /><img src="../img/button_add.png"/><img src="../img/button_add.png" style="margin-right: 0;"/><div class="clearfix"></div><i>*最多可上传4张</i></div><div class="con"><textarea placeholder="请输入文字..." id="order_content"></textarea><button class="order_close_btn">关闭</button><button class="order_sure_btn">保存</button><div class="clearfix"></div></div></div>',
      success: function() {
        $(".order_alert .imgBox img").click(function() {
          upImg(this);
        });
        $(".order_close_btn").click(function() {
          layer.close(order_alert.index);
        });
        $(".order_sure_btn").click(function() {
          var Status = status;
          var date = new Date(),
            pic1 = $(".order_alert .imgBox img:eq(0)").attr("src"),
            pic2 = $(".order_alert .imgBox img:eq(1)").attr("src"),
            pic3 = $(".order_alert .imgBox img:eq(2)").attr("src"),
            pic4 = $(".order_alert .imgBox img:eq(3)").attr("src"),
            content = $("#order_content").val();
          /*if(pic1=="../img/button_add.png"&&pic2=="../img/button_add.png"&&pic3=="../img/button_add.png"&&pic4=="../img/button_add.png"){
                     layer.tips("请上传图片！",".imgBox",{tips:[2,"#50555C"]});
                     return;
                     }*/
          if (content == "") {
            layer.tips("请输入故障情况！", "#order_content", {
              tips: [2, "#50555C"]
            });
            return;
          }
          $.ajax({
            url: DOMAIN + "deviceOrder/report",
            data: {
              token: Cookies.get("token"),
              date: date.getTime(),
              order_id: GetQueryString("id"),
              action: Status,
              pic1: pic1 == "../img/button_add.png" ? undefined : pic1,
              pic2: pic2 == "../img/button_add.png" ? undefined : pic2,
              pic3: pic3 == "../img/button_add.png" ? undefined : pic3,
              pic4: pic4 == "../img/button_add.png" ? undefined : pic4,
              content: content
            },
            success: function(data) {
              if (data.code == 10000) {
                if (parent.$("table.order").length > 0) {
                  parent.Order.Page();
                }
                Order.one();
                layer.msg("操作成功！", { icon: 1, time: 2000 });
                layer.close(order_alert.index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  },
  /*statu=7时的完成工单*/
  suc7: function() {
    layer.confirm("确认完成吗？", { icon: 3, title: "提示" }, function(index) {
      var date = new Date();
      $.ajax({
        url: DOMAIN + "deviceOrder/report",
        data: {
          token: Cookies.get("token"),
          date: date.getTime(),
          order_id: GetQueryString("id"),
          action: 7
        },
        success: function(data) {
          if (data.code == 10000) {
            if (parent.$("table.order").length > 0) {
              parent.Order.Page();
            }
            Order.one();
            layer.msg("操作成功！", { icon: 1, time: 2000 });
            layer.close(index);
          } else {
            errormsg(data);
          }
        }
      });
    });
  },
  //查询可分配人员/同APP
  oldAssignIds: "",
  account: function() {
    $.ajax({
        type:'GET',
        url: DOMAIN + "api/user/order/assign?token="+ Cookies.get("token")+'&orderId='+ GetQueryString("id"), // 刘建平暂时更换改派工查询接口
      // url: DOMAIN + "deviceOrder/select/account",
      // data: {
      //   token: Cookies.get("token"),
      //   orderId: GetQueryString("id")
      // },
      success: function(data) {
        if (data.code == 10000) {
          var str = "",
            astr = "";
          order_alert.oldAssignIds = "";
          $.each(data.data, function(i, n) {
            str += "<tr>";
            if (n.isAssign == "YES") {
              astr +=
                "<span>" +
                n.name +
                '<i data-id="' +
                n.accountId +
                '">x</i></span>';
              str +=
                '<td><input type="checkbox" checked value="' +
                n.accountId +
                '"/></td>';
              order_alert.oldAssignIds += n.accountId + ",";
            } else {
              str +=
                '<td><input type="checkbox" value="' + n.accountId + '"/></td>';
            }
            str += "<td>" + n.name + "</td>";
            str += "<td>" + n.loginName + "</td>";
            str += "<td>" + n.roleName + "</td>";
            if (n.category.length < 0) {
              str += "<td>--</td>";
            } else {
              var cateStr = '';
              for (var s = 0; s < n.category.length; s++) {
                  cateStr += n.category[s].value2 + " ";
              }
              str += '<td title="'+cateStr+'">'+(cateStr.length>5?cateStr.substring(0,5)+'...':cateStr)+'</td>';
            }
            // str += "<td>" + n.projectName + "</td>";
            str += "</tr>";
          });
          $(".order_alert .spanBox").html(astr);
          $(".order_alert table tbody").html(str);

        // dom已经生成。 第一次点击进入 右边框限制时间 隐藏
        // 1。3小时，12小时，返回给我参数；2。维修中 是否超时，按时完成；
           // if ($(".spanBox span").length == 0) {
           //       $('.order_alert_rights.dropdown.status').hide();
           // };
          $.ajax({
            url: DOMAIN + "deviceOrder/select/byId",
            data: {
              token: Cookies.get("token"),
              orderId: GetQueryString("id")
            },
            success:function (data) {
              // 获取status，判断当前工单的状态
              if (data.code == '10000') {
                // console.dir(data1);
                if (!data.data) {
                  return;
                }
                if (data.data.status == 1) { // 未派工
                   // console.log('未派工');
                  $('[attr-id="ss-time-btn"]').html("添加限制时间");
                    //判断status==1，未派工 可修改备注
                } else {
                    // status不为1（未派工），则为二次进入，显示时间。
                  //  console.log('二次进入');
                    $('.addBtn .caret_span').hide();
                  if (data.data.EXPIRE_PERIOD_STR) {
                    switch (data.data.EXPIRE_PERIOD_STR) {
                        case '3小时':
                        case '12小时':
                        case '24小时':
                        case '48小时':
                        $('[attr-id="ss-time-btn"]').html("限制在"+ data.data.EXPIRE_PERIOD_STR + "小时内完成");
                        break;
                        case '一周':
                        $('[attr-id="ss-time-btn"]').html("限制在一周内完成");
                        break;
                        case '一个月':
                        $('[attr-id="ss-time-btn"]').html("限制在30天内完成");
                        break;
                        default:
                            $('[attr-id="ss-time-btn"]').html("未添加限制时间");

                    }
                  }else{
                      $('[attr-id="ss-time-btn"]').html("未添加限制时间");
                  };

                  $('.dropdown-toggle.addBtn').on('click',function (e) { // 第二次进入不能选取时间。
                    $(this).attr('data-toggle', 'null');
                  });

                }
              }
            }
          });
        } else {
          errormsg(data);
        }

      }
    });
  },
  work: function() {
    var time = null;
    this.index = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["610px", "520px"],
      closeBtn: false,
      content:
        '<div class="order_alert">' +
        '<div style="display: flex;align-items: center;justify-content: space-between;"><div class="title blue" style="padding-bottom: 0">已派遣人员列表</div>' +
        '<div class="order_alert_rights dropdown status">' +
        '<button class="dropdown-toggle addBtn" type="button" data-toggle="dropdown"><span attr-id="ss-time-btn">添加限制时间</span></span><span class="caret caret_span"></span><div class="ss-close">x</div></button> ' +
        '<ul class="dropdown-menu" role="menu" aria-labelledby="orderStatus" attr-id="ss-dropdown"><li data-time="3">3小时</li><li data-time="12">12小时</li><li data-time="24">24小时</li><li data-time="48">48小时</li><li data-time="168">一周</li><li data-time="720">30天内</li></ul></div></div>' +
        '<div class="spanBox"></div><div class="con" style="padding: 0;">' +
        '<table class="table text-center"><thead><tr><th></th><th>姓名</th><th>工号</th><th>职位</th><th>条线</th></tr></thead><tbody></tbody></table><button class="order_close_btn">关闭</button><button class="order_sure_btn">提交</button><div class="clearfix"></div></div></div>',
      success: function() {
        order_alert.account();
        $(".spanBox").delegate("span i", "click", function() {
          var that = this;
          $(that)
            .parent()
            .remove();
          $(".order_alert table td input").each(function(i, n) {
            if (n.value == $(that).attr("data-id") && n.checked) {
              n.checked = false;
            }
          });
        });
        $(".order_alert table").delegate("td input", "click", function() {
          var that = this;
          if (!that.checked) { // toggle checked
            that.checked = false;
            $(".spanBox span i[data-id=" + $(that).val() + "]")
              .parent()
              .remove();
          } else {
            if ($(".spanBox span").length >= 3000000) {
              that.checked = false;
              layer.msg("最多派工3人");
            } else {
              that.checked = true;
              if (
                $(".spanBox span i[data-id=" + $(that).val() + "]").length > 0
              ) {
                return;
              }
              $(".spanBox").append(
                "<span>" +
                  $(that)
                    .parent()
                    .next()
                    .html() +
                  '<i data-id="' +
                  $(that).val() +
                  '">x</i></span>'
              );
            }
          }
          // console.log($(".spanBox span").length);
          if ($(".spanBox span").length == 0) {
            $('.order_alert_rights .dropdown .status').hide();
          } else {
            $('.order_alert_rights .dropdown .status').show();
          }
        });
        $(".order_close_btn").click(function() { // 关闭按钮
          layer.close(order_alert.index);
        });
        //
        $(".order_sure_btn").click(function() { // 提交按钮 TODO: date变为选取的小时数。
          var date = new Date();
            newAssignIds = "";
          $(".spanBox span i").each(function() {
            newAssignIds += $(this).attr("data-id") + ",";
          });
          // 发送时间 点 进行倒计时
          $.ajax({
            url: DOMAIN + "deviceOrder/assigned",
            type:'post',
            data: {
              token: Cookies.get("token"),
              date: date.getTime(),
              deviceOrderId: GetQueryString("id"),
              expire_period:time,
              oldAssignIds: order_alert.oldAssignIds.substring(
                0,
                order_alert.oldAssignIds.length - 1
              ),
              newAssignIds: newAssignIds.substring(0, newAssignIds.length - 1)
            },
            success: function(data) {
            //  console.dir(data);
              if (data.code == 10000) {
                if (parent.$("table.order").length > 0) {
                  parent.Order.Page();
                }
                Order.one();
                layer.msg("派工成功！", { icon: 1, time: 2000 });
                layer.close(order_alert.index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      //点击下拉表 获取信息；
        $('[attr-id="ss-dropdown"]').on('click','li',function (e) {
            var event = window.event || e;
            var el = event.target;
            $(".order_alert_rights .ss-close").show();
            var value = $(el).html();
            time = $(el).attr('data-time');
         //   console.log(time);
            // console.log(value);
            $('[attr-id="ss-time-btn"]').html(value);
            $(".order_alert_rights .ss-close").click('[attr-id="ss-time-btn"]',function(){
                // alert(11);
                $('[attr-id="ss-time-btn"]').html("添加限制时间");
                $(".order_alert_rights .ss-close").hide();
            });

        });
      }
    });
  },
  shareList: function() {
    $.ajax({
      url: DOMAIN + "deviceOrder/select/orderCategory",
      data: {
        token: Cookies.get("token"),
        orderId: GetQueryString("id")
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "";
          $.each(data.data, function(i, n) {
            str +=
              "<label>" +
              n.value2 +
              '<input type="checkbox" value="' +
              n.param +
              '"/></label>';
          });
          if (data.orderSpecial == "YES") {
            str +=
              '<label  class="danger">无法解决，通报上级<input type="checkbox" value="-1"/></label>';
          }
          $(".order_alert .share").html(str);
          if (data.data.length == 0 && data.orderSpecial == "NO") {
            $(".order_sure_btn").hide();
          }
        } else {
          errormsg(data);
        }
      }
    });
  },
  share: function() {
    this.index = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["394px", "440px"],
      closeBtn: false,
      content:
        '<div class="order_alert"><div class="title blue">权限共享至</div><div class="imgBox share"></div><div class="con"><button class="order_close_btn">关闭</button><button class="order_sure_btn">提交</button><div class="clearfix"></div></div><div class="tpisB"><textarea placeholder="请输入信息"></textarea></div></div>',
      success: function() {
        order_alert.shareList();
        $(".order_close_btn").click(function() {
          layer.close(order_alert.index);
        });
        $(".order_alert .share").delegate("input", "click", function() {
          if (
            $(this)
              .parent()
              .hasClass("danger") &&
            this.checked
          ) {
            $(".order_alert .share input").each(function(i, n) {
              n.checked = false;
            });
            this.checked = true;
            var top = $(".share label").length;
            if (top > 4) {
              top = 3;
            }
            $(".tpisB")
              .css({
                top: (top + 1) * 61
              })
              .fadeIn()
              .children("textarea")
              .focus();
          } else {
            $(".order_alert .danger input")[0].checked = false;
            $(".tpisB")
              .fadeOut()
              .children("textarea")
              .val("");
          }
        });
        $(".order_sure_btn").click(function() {
          var date = new Date(),
            categoryIds = "",
            shareUrl = "";
          var data = {
            token: Cookies.get("token"),
            date: date.getTime(),
            deviceOrderId: GetQueryString("id")
          };
          $(".order_alert .share input").each(function() {
            if (this.checked) {
              categoryIds += $(this).val() + ",";
            }
          });
          categoryIds = categoryIds.substring(0, categoryIds.length - 1);
          if (categoryIds == "") {
            return;
          }
          if (categoryIds == "-1") {
            shareUrl = "deviceOrder/special";
            data.content = $(".tpisB textarea").val();
          } else {
            shareUrl = "deviceOrder/category/share";
            data.categoryIds = categoryIds;
          }
          $.ajax({
            url: DOMAIN + shareUrl,
            data: data,
            success: function(data) {
              if (data.code == 10000) {
                if (parent.$("table.order").length > 0) {
                  parent.Order.Page();
                }
                Order.one();
                layer.msg("分享成功！", { icon: 1, time: 2000 });
                layer.close(order_alert.index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  },
  del: function() {
    layer.confirm("确认删除吗？", { icon: 3, title: "提示" }, function(index) {
      $.ajax({
        url: DOMAIN + "deviceOrder/delete/order",
        data: {
          token: Cookies.get("token"),
          orderId: GetQueryString("id")
        },
        success: function(data) {
          if (data.code == 10000) {
            if (parent.$("table.order").length > 0) {
              parent.Order.Page();
            }
            Order.one();
            layer.msg("操作成功！", { icon: 1, time: 2000 });
            layer.close(index);
          } else {
            errormsg(data);
          }
        }
      });
    });
  },
  xinArr: ["工单完成正常", "工单完成良好", "工单完成优秀"],
  fan: function() {
    this.index = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["339px", "auto"],
      closeBtn: false,
      content:
        '<div class="order_alert"><div class="fan_tab"><span class="on"><i></i>维修完成</span><span><i></i>维修未完成</span></div><div class="fan_xin"><span>选择评价</span><div class="xin_box" data-xin="3"><i class="on"></i><i class="on"></i><i class="on"></i></div><p>工单完成优秀</p></div>' +
        '<div class="conBox"><span class="title">图片附件 <i>* 请最多上传4张图片</i></span><div class="imgbox con" data-num="0">' +
         '<img src="../img/button_add.png"><img src="../img/button_add.png"><img src="../img/button_add.png">' +
          '<img src="../img/button_add.png"></div></div>' +
         '<div class="fan_con"><textarea placeholder="请输入文字..." id="order_content"></textarea>' +
          '<button class="order_sure_btn">提交</button><button class="order_close_btn">关闭</button>' +
           '<div class="clearfix"></div></div></div>',
      success: function() {
        order_alert.shareList();
          $(".imgbox img").click(function() {
              upImg(this);
          });
        $(".order_close_btn").click(function() {
          layer.close(order_alert.index);
        });
        $(".fan_tab").on("click", "span", function() {
          $(".fan_tab .on").removeClass("on");
          $(this).addClass("on");
          if ($(this).index() > 0) {
            $(".fan_xin").hide();
            $(".fan_con").addClass("on");
          } else {
            $(".fan_xin").show();
            $(".fan_con").removeClass("on");
          }
        });
        $(".xin_box").on("click", "i", function() {
          var xinlist = $(".xin_box i").removeClass("on");
          var xin = $(this).index() + 1;
          $(".xin_box").attr("data-xin", xin);
          for (var s = 0; s < xin; s++) {
            xinlist.eq(s).addClass("on");
          }
          $(".fan_xin p").html(order_alert.xinArr[xin - 1]);
        });
        $(".order_sure_btn").click(function() {
            pic1 = $(".imgbox img:eq(0)").attr("src"),
            pic2 = $(".imgbox img:eq(1)").attr("src"),
            pic3 = $(".imgbox img:eq(2)").attr("src"),
            pic4 = $(".imgbox img:eq(3)").attr("src");
          var t = $(".fan_tab span.on").index() + 1;
          $.ajax({
            url: DOMAIN + "repair/orderFeedBack",
            data: {
              token: Cookies.get("token"),
              type: t,
              result: t < 2 ? $(".xin_box").attr("data-xin") : undefined,
              content: $("#order_content").val(),
              orderId: GetQueryString("id"),
              pic1: pic1 == "img/button_add.png" ? undefined : pic1,
              pic2: pic2 == "img/button_add.png" ? undefined : pic2,
              pic3: pic3 == "img/button_add.png" ? undefined : pic3,
              pic4: pic4 == "img/button_add.png" ? undefined : pic4,
            },
            success: function(data) {
              if (data.code == 10000) {
                if (parent.$("table.order").length > 0) {
                  parent.Order.Page();
                }
                Order.one();
                layer.msg("反馈成功！", { icon: 1, time: 2000 });
                layer.close(order_alert.index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  },
  yan: function() {
        this.index = layer.open({
            type: 1,
            title: false,
            shade: [0.1, "#000"],
            area: ["339px", "320px"],
            closeBtn: false,
            content:
                '<div class="order_alert"><div class="fan_tab"><span class="on on1  "><i></i>维修完成</span><span class="on2 "><i></i>维修未完成</span></div><div class="fan_xin"><div class="yan_box" data-xin="18"></div></div>' +
                 '<div class="conBox"><span class="title">图片附件 <i>* 请最多上传4张图片</i></span><div class="imgbox con" data-num="0"><img src="../img/button_add.png"><img src="../img/button_add.png"><img src="../img/button_add.png"><img src="../img/button_add.png"></div></div>' +
                  '<div class="fan_con"><textarea placeholder="请输入文字..." id="order_content"></textarea><button class="order_sure_btn">提交</button><button class="order_close_btn">关闭</button><div class="clearfix"></div></div></div>',
            success: function() {
                $(".imgbox img").click(function() {
              //  console.log(this,222,'this')
                    upImg(this);
                });
                order_alert.shareList();
                $(".order_close_btn").click(function() {
                    layer.close(order_alert.index);
                });
                $(".fan_tab").on("click", "span", function() {
                    $(".fan_tab .yan_on").removeClass("yan_on");
                    $(this).addClass("yan_on");

                    if ($(this).index() > 0) {

                        $(".fan_xin").hide();
                        $(".yan_box").attr("data-xin", 19);
                        $(".fan_con").addClass("yan_on");


                    } else {
                        $(".yan_box").attr("data-xin", 18);
                        $(".fan_xin").show();
                        $(".fan_con").removeClass("yan_on")
                        $(this).removeClass('on');
                    }
                });
                $(".yan_box").on("click", "i", function() {
                    var xinlist = $(".yan_box i").removeClass("yan_on");
                    var xin = $(this).index() + 1;
                    $(".yan_box").attr("data-xin", xin);
                    for (var s = 0; s < xin; s++) {
                        xinlist.eq(s).addClass("yan_on");
                    }
                    $(".fan_xin p").html(order_alert.xinArr[xin - 1]);
                });
                $(".order_sure_btn").click(function() {
                    pic1 = $(".imgbox img:eq(0)").attr("src"),
                    pic2 = $(".imgbox img:eq(1)").attr("src"),
                    pic3 = $(".imgbox img:eq(2)").attr("src"),
                    pic4 = $(".imgbox img:eq(3)").attr("src");
                    $.ajax({
                        url: DOMAIN + "deviceOrder/check/order?token="+ Cookies.get("token"),
                        contentType: "application/json",
                        data:JSON.stringify({
                                action:  $(".yan_box").attr("data-xin"),
                                content: $("#order_content").val(),
                                order_id: GetQueryString("id"),
                                pic1: pic1 == "img/button_add.png" ? undefined : pic1,
                                pic2: pic2 == "img/button_add.png" ? undefined : pic2,
                                pic3: pic3 == "img/button_add.png" ? undefined : pic3,
                                pic4: pic4 == "img/button_add.png" ? undefined : pic4,
                            }),
                        success: function(data) {
                            if (data.code == 10000) {
                                if (parent.$("table.order").length > 0) {
                                    parent.Order.Page();
                                }
                                Order.one();
                                layer.msg("验收成功！", { icon: 1, time: 2000 });
                                layer.close(order_alert.index);
                            } else {
                                errormsg(data);
                            }
                        }
                    });
                });
            }
        });
    },
  //查询工单性质列表
  labelList: function() {
    $.ajax({
      url: DOMAIN + "deviceOrder/getOrderTypeList",
      type: "get",
      data: {
        token: Cookies.get("token")
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "",
            order_type = $(".orderDetails")[0].order_type;
          $.each(data.data, function(i, n) {
            str += '<div class="it">';
            if (order_type == n.value1) {
              str +=
                '<input type="radio" name="OrderType" checked value="' +
                n.value1 +
                '">';
            } else {
              if (i == 0) {
                str +=
                  '<input type="radio" name="OrderType" checked value="' +
                  n.value1 +
                  '">';
              } else {
                str +=
                  '<input type="radio" name="OrderType" value="' +
                  n.value1 +
                  '">';
              }
            }
            str += "<a>" + n.value2 + "</a>";
            str += "</div>";
          });
          $(".order_alert .order_quality").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  label: function() {
    layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["400px", "360px"],
      closeBtn: false,
      content:
        '<div class="order_alert"><div class="title">工单状态 <font class="bubu"></font></div><div class=" labelBox"><div class="labelItem"><span>工单性质</span><div class="itlist order_quality"></div></div><div class="labelItem"><span>自定义性质</span><div class="itlist"><div class="it"><input type="checkbox" name="isVendor" value="1"><a>供应商工单</a></div></div></div></div><div class="fan_con" style="padding-top: 20px"><button class="order_sure_btn" style="margin-left: 57px">提交</button><button class="order_close_btn">关闭</button><div class="clearfix"></div></div></div>',
      success: function(a, index) {
        order_alert.labelList();
        var orderDetails = $(".orderDetails")[0];
        $(".order_alert .title .bubu").html(

          $(".orderDetails header>.con h3>.con-text")
            .html()
            .split("<")[0]
        );
        if (orderDetails.is_vendor) {
          $("input[name=isVendor]").attr("checked", "checked");
        }
        $(".order_close_btn").click(function() {
          layer.close(index);
        });
        $(".order_sure_btn").click(function() {
          $.ajax({
            url:
              DOMAIN +
              "deviceOrder/updateOrderType?token=" +
              Cookies.get("token"),
            contentType: "application/json",
            data: JSON.stringify({
              isVendor: Number($("input[name=isVendor]")[0].checked),
              oldIsVendor: orderDetails.is_vendor,
              oldOrderType: orderDetails.order_type,
              orderId: GetQueryString("id"),
              orderType: $(".order_quality input:checked").val()
            }),
            success: function(data) {
              if (data.code == 10000) {
                if (parent.$("table.order").length > 0) {
                  parent.Order.Page();
                }
                Order.one();
                layer.msg("反馈成功！", { icon: 1, time: 2000 });
                layer.close(index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  }
};
var Order = {
  statusList: ["未派工", "维修中", "待处理","待验收", "未反馈", "已完成"],
  stareTime:'',
  endTime:'',
  values_arr:[],
  int: function() {
      assist.getLine(1);
      Order.values_arr = [];
      localStorage.setItem("values_arr",null)
    // 日期格式
    setTimeout(function () {
	    $('.J-datepicker-range-day').datePicker({
		    hasShortcut: true,
		    format: 'YYYY-MM-DD',
		    isRange: true,
		    shortcutOptions: [{
			    name: '最近一周',
			    day: '-7,0'
		    }, {
			    name: '最近一个月',
			    day: '-30,0'
		    }, {
			    name: '最近三个月',
			    day: '-90, 0'
		    }]
	    });
    },100)
      var selStr ='';
      $.ajax({
          url: DOMAIN + "project/getOrderTypeList?token="+ Cookies.get("token"),
          type:'GET',
          async: false,
          success: function(data) {
              $.each(data.data, function(i, n) {
                  selStr +='<option value="'+n.id+'">'+n.name+'</option>'
              });
          },
      })
    //设置默认请选择全选全部选按钮名称
    $('#select-1').selectpicker({
        width : 120,//设置宽度
        selectedText: 'cat',
        header: '',
        noneSelectedText: '请选择',
        deselectAllText: '全不选',//不知道为啥中文设置不成功
        selectAllText: '全选'//不知道为啥中文设置不成功
    });
      //选中事件
      $('#select-1').html(selStr)
      $('#select-1').selectpicker('refresh');//相当于刷新数据，必须有
      //选中事件
      $("#select-1").change(function(){
          Order.values_arr= $("#select-1").val();//以数组形式获取值;
          // console.log(Order.values_arr)
      })
    var status = $(".header .title i.on").index();
    $(".header .title").delegate("i", "click", function() {
      $(".header .title i.on").removeClass("on");
      $(this).addClass("on");
        $(".order .dropdown button").attr("data-status", "");
        $(".order .dropdown button").attr("data-values", "");
       // console.log($(".ifm .dropdown ul>li>a"))
        $("#orderStatus").html("全部状态<span class=caret></span>");
        $("#orderLine").html("全部条线<span class=caret></span>");
        $("#createTime").html("最近创建时间<span class=caret></span>");
        $("#updataTime").html("最近更新时间<span class=caret></span>");
      Order.Page();
    });
    $(".ifm .dropdown ul").delegate("li a", "click", function() {
        var strElm = $(this)
            .parent()
            .parent()
            .prev();
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
        // hss 添加状态
        $(this).attr("data-page")? strElm.html($(this).attr("data-value")+"<span class=caret></span>") :
                       strElm.html('全部<span class=caret></span>')
      if (
        $(this)
          .parent()
          .parent()
          .parent()
          .hasClass("orderBy")
      ) {
        if (
          $(this)
            .parent()
            .parent()
            .prev()[0].id == "createTime"
        ) {
            $(this).attr("data-page") == 4? strElm.html('最近创建时间<span class=caret></span>') : strElm.html('最远创建时间<span class=caret></span>')
          $("#updataTime").attr("data-status", "");
        } else {
          $("#createTime").attr("data-status", "");
        }
      }
        if (
            $(this)
                .parent()
                .parent()
                .prev()[0].id == "updataTime"
        ) {
            $(this).attr("data-page") == 1? strElm.html('最近更新时间<span class=caret></span>') : strElm.html('最远更新时间<span class=caret></span>')
        }
      if ($(this).attr("data-txt")) {
          strElm.html($(this).attr("data-txt")+"<span class=caret></span>")
      }
      Order.Page();
    });
    $(".table")
      .delegate("td:nth-child(2)", "click", function() {
        if (status < 0) {
          parent.openHtml(
            "tpl/order_detail.html?id=" + $(this).attr("data-id"),
            "order"
          );
        } else {
          openHtml(
            "tpl/order_detail.html?id=" + $(this).attr("data-id"),
            "order"
          );
        }
      })
      .delegate("td:nth-child(4)", "click", function() {
        if ($(this).attr("data-id") == "-1") return;
        if (status < 0) {
          parent.openHtml(
            "tpl/device_detail.html?id=" + $(this).attr("data-id"),
            "device"
          );
        } else {
          openHtml(
            "tpl/device_detail.html?id=" + $(this).attr("data-id"),
            "device"
          );
        }
      })
      .delegate("td:nth-child(5)", "click", function() {
        if (status < 0) {
          parent.openHtml(
            "tpl/people_detail.html?id=" + $(this).attr("data-id"),
            "people"
          );
        } else {
          openHtml(
            "tpl/people_detail.html?id=" + $(this).attr("data-id"),
            "people"
          );
        }
      });
    $(".header .search")
      .delegate(".select-one", "change", function() {
          console.log('左侧s')
        //  新增 工单性质
         if ($(this).children(":selected").attr("data-tip") == 1) {
            $('.order-nature').show();
             $(".search input").hide();
             $('#select-1').selectpicker('val', '');
             Order.values_arr = null;
             localStorage.setItem("values_arr", JSON.stringify(Order.values_arr));
             $('#select-1').selectpicker('refresh');
            // $(this).next().attr("placeholder",$(this).children(":selected").attr("data-tip"));
         } else {
             $('.order-nature').hide();
             $(".search input").show();
             $(this).next().attr("placeholder",$(this).children(":selected").attr("data-tip"));
         }
      })
      .delegate(".search_tz", "click", function() {

        Order.startTime = $('.J-datepicker-range-day .datepicker-start').val();
        Order.endTime = $('.J-datepicker-range-day .datepicker-end').val();
        if (Order.stareTime || Order.endTime) {
            var obj = {
                startTime : Order.startTime,
                endTime : Order.endTime
            }
        }
        obj = JSON.stringify(obj);
        localStorage.setItem("dataTime",obj)
      // 存 工单性质的数据
        Order.values_arr = $('#select-1').val();
        if (Order.values_arr.length>0) {
          Order.values_arr = JSON.stringify(Order.values_arr);
          localStorage.setItem("values_arr",Order.values_arr);
        }
        openHtml("tpl/order_search.html", "order_search",obj);
          $('#select-1').selectpicker('deselectAll')
          $('#select-1').selectpicker('refresh');
      })
      .delegate(".search_cx", "click", function() {
          Order.values_arr = $('#select-1').val();
          Order.Page();
      });
    if (status < 0) {
      $(".search select").val(parent.$(".search select").val());
      $(".search input").val(parent.$(".search input").val()).attr("placeholder",parent.$(".search input").attr("placeholder"));
      parent.$(".search input").val("");
      setTimeout(function() {
        Order.Page();
      }, 10);
    } else {
      this.Page();
    }
    // this.addRemarks();
  },
  listPage: -1,
  Page: function() {
    Order.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Order.listPage > -1) {
        clearInterval(t);
      }
      if (Order.listPage <= 1) return;
      $(".order_box").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Order.listPage,
        current: 1,
        backFn: function(p) {
          Order.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    var sel = $(".search .select-one").val(),
      status = $(".header .title i.on").index();
    $.ajax({
      url: DOMAIN + "deviceOrder/select/all/web",
      data: {
        token: Cookies.get("token"),
        status: status < 0 ? 2 : status,
        deviceCategory: $("#orderLine").attr("data-status"),
        orderNo: sel == "0" ? $(".search input").val() : undefined,
        deviceName: sel == "1" ? $(".search input").val() : undefined,
        accountName: sel == "2" ? $(".search input").val() : undefined,
        placeName: sel == "3" ? $(".search input").val() : undefined,
        orderBy:
          $("#updataTime").attr("data-status") == ""
            ? $("#createTime").attr("data-status")
            : $("#updataTime").attr("data-status"),
        realStatus: $("#orderStatus").attr("data-status"),
        pageSize: 10,
        pageNo: pageNo,
        orderType: Order.values_arr != null? Order.values_arr.toString():'',
        begTime: $('.J-datepicker-range-day .datepicker-start-2').val(),
        endTime: $('.J-datepicker-range-day .datepicker-end-2').val(),
      },
      success: function(data) {
        store.comments_content = data.data.results;
        if (data.code == 10000) {
          Order.listPage = data.data.page.totalPage;
          $(".total_box").html("总数：" + data.data.page.totalCount);
          switch ($(".header .title i.on").index()) {
            case -1:
              $(".status ul").html(
                '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="" data-txt="全部">全部</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="1" data-txt="未派工">未派工</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="2" data-txt="维修中">维修中</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="3" data-txt="待处理">待处理</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="5" data-txt="未反馈">未反馈</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="6" data-txt="已完成">已完成</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="-1"data-txt="已删除" >已删除</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="4" data-txt="待验收">待验收</a></li>'
              );
              break;
            case 0:
              $(".status ul").html(
                '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="" data-txt="全部">全部</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="1" data-txt="未派工">未派工</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="2" data-txt="维修中">维修中</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="3" data-txt="待处理">待处理</a></li>'
              );
              break;
            case 1:
              $(".status ul").html(
                '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="" data-txt="全部">全部</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="4" data-txt="待验收">待验收</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="5" data-txt="未反馈">未反馈</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="6" data-txt="已完成">已完成</a></li><li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="-1" data-txt="已删除" >已删除</a></li>'
              );
              break;
          }
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              '<td><span class="order_status_' +
              n.status +
              '"></span>' +
              Order.statusList[Number(n.status) - 1] +
              "</td>";
            str += '<td data-id="' + n.id + '" title="'+n.place_name+'">' + n.order_no + "</td>";
            str +=
              "<td ><div title='"+n.category_name_list+"' style='width:40px;margin: auto;overflow: hidden;text-overflow: ellipsis;'>" +
                 (n.category_name_list == null ? "--"
                  : n.category_name_list.split(",").length >= 2
                      ? n.category_name_list.split(",")[0] + "..."
                      : n.category_name_list) +
              "</div></td>";
              if (n.patrol_id == null) {
                  n.content = n.content.replace(/\n/ig,"");
                  str +=
                      '<td  data-id="' + -1  +
                      '" style="cursor: default; min-width:50px">' +
                      '<div  data-toggle="tooltip" data-placement="right" style="overflow: hidden;text-overflow: ellipsis;width:110px" title= ' + n.content +' >' +
                      (n.patrol_id == null ? n.item_name : n.device_name) +
                      '</div>'+
                      "</td>";
              } else {
                  str +=
                      '<td  data-id="' +
                      n.device_id +
                      '"style="cursor: default; width:50px">'+
                      '<div  data-toggle="tooltip" data-placement="right" title=' + n.content + '>' +
                      (n.patrol_id == null ? n.item_name : n.device_name) +
                      '</div>'+
                      "</td>";
              }
              str +=
              '<td data-id="' + n.create_by +'">' + n.createByName + "</td>";
            str += "<td>" + ts2YmdHis(n.capture_at) + "</td>";
            str +=
              "<td>" +
              (n.all_accountName_list == null
                ? "--"
                : n.all_accountName_list.split(",").length >= 2
                  ? n.all_accountName_list.split(",")[0] + "..."
                  : n.all_accountName_list) +
              "</td>";
            str += "<td>" + ts2YmdHis(n.update_at) + "</td>";
            str += "</tr>";
          });
          $(".table tbody").html(str);
          $('[data-toggle="tooltip"]').tooltip();
        } else {
          errormsg(data);
        }
      }
    });
  },
    //点击添加工单
  add: function() {
    var addIndex = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["500px", "auto"],
      closeBtn: false,
      content:
        '<div class="addBox" id="orderAdd">' +
          '<div class="add_header">添加新工单<span class="project_icon"></span></div>' +
          '<div class="add_con" style="height:725px;padding-top: 10px;">' +
            '<div class="conBox"><span class="title">报修物件</span><div class="con"><input type="text" id="order-room" placeholder="报修物件" style="width:328px"></div></div>' +
            '<div class="conBox"><span class="title">所在位置</span><div class="con"><input type="text" id="order-repaired-name" placeholder="所在位置" style="width:328px" maxlength="15"></div></div>' +
            '<div class="conBox"><span class="title">选择条线</span><div class="con"><select id="order-category_id"></select></div></div>' +
            '<div class="conBox"><span class="title">故障情况</span><div class="con"><textarea id="order-fault-situation" placeholder="请输入故障情况"></textarea></div></div><div class="conBox"><span class="title">图片附件 <i>* 请最多上传4张图片</i></span><div class="imgbox con" data-num="0"><img src="img/button_add.png"><img src="img/button_add.png"><img src="img/button_add.png"><img src="img/button_add.png"></div></div>' +
             '<div class="conBox"><span class="title">相关工作联系单号</span><div class="con"><input type="text" id="order-worker_order_no" placeholder="请输入编号" style="width:328px" maxlength="15"></div></div>' +
            '<div class="conBox"><span class="title">报修人备注</span><div class="con"><input type="text" id="order-finder_name" placeholder="请输入报修人姓名" style="width:328px;margin-bottom: 20px;" maxlength="15"></div><div class="con"><input type="text" id="order-finder_phone" placeholder="请输入联系方式" style="width:328px" maxlength="11"></div></div>' +
            '<button class="confirm" style="left:159px">确认添加</button>' +
            '<button class="cancel" style="right:120px">取消</button>' +
          '</div>' +
        '</div>',
      success: function(layers) {
        if(Number(JSON.parse(localStorage.getItem('userInfo')).isWorkerOrder)){
            $("#order-worker_order_no").parent().parent().show();
            layers.find('.add_con').css('height','725px')
        }else{
            $("#order-worker_order_no").parent().parent().hide();
            layers.find('.add_con').css('height','670px');
            layers.find('.layui-layer-content').css('height','735px');
        }
        var castr='<option value="">所有条线</option>';
        for (var i=0;i<assist.LineList.length;i++){
          castr+='<option value="'+assist.LineList[i].category_list+'">'+assist.LineList[i].value2+'</option>'
        }
        $("#order-category_id").html(castr);
        $(".imgbox img").click(function() {
          upImg(this);
        });
        $(".cancel").click(function() {
          layer.close(addIndex);
        });
        $(".confirm").click(function() {
          var item_name = $("#order-room").val(),
            place_name = $("#order-repaired-name").val(),
            content = $("#order-fault-situation").val(),
            finder_name = $("#order-finder_name").val(),
            finder_phone = $("#order-finder_phone").val(),
            worker_order_no = $("#order-worker_order_no").val(),
            category_id = $("#order-category_id").val(),
            pic1 = $(".imgbox img:eq(0)").attr("src"),
            pic2 = $(".imgbox img:eq(1)").attr("src"),
            pic3 = $(".imgbox img:eq(2)").attr("src"),
            pic4 = $(".imgbox img:eq(3)").attr("src");
          if (item_name == "") {
            layer.tips("请输入报修物件描述！", "#order-room", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (place_name == "") {
            layer.tips("请输入所在位置！", "#order-repaired-name", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (content == "") {
            layer.tips("请输入故障情况！", "#order-fault-situation", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (finder_phone != "") {
            if(finder_phone.length!=8&&finder_phone.length!=11){
                layer.tips("请输入正确的联系方式！", "#order-finder_phone", {
                    tips: [2, "#50555C"]
                });
                return;
            }
          }
          /*if(pic1=="img/button_add.png"&&pic2=="img/button_add.png"&&pic3=="img/button_add.png"&&pic4=="img/button_add.png"){
                     layer.tips("请上传图片！",".imgbox",{tips:[2,"#50555C"]});
                     return;
                     }*/
          $.ajax({
            url: DOMAIN + "deviceOrder/createOtherOrder/new",
            data: {
              token: Cookies.get("token"),
              place_name: place_name,
              item_name: item_name,
              finder_name: finder_name,
              finder_phone: finder_phone,
              worker_order_no: worker_order_no,
              content: content,
              category_id:category_id,
              pic1: pic1 == "img/button_add.png" ? undefined : pic1,
              pic2: pic2 == "img/button_add.png" ? undefined : pic2,
              pic3: pic3 == "img/button_add.png" ? undefined : pic3,
              pic4: pic4 == "img/button_add.png" ? undefined : pic4,
              come_from: 2
            },
            success: function(data) {
              if (data.code == 10000) {
                Order.Page();
                layer.msg("添加成功！", { icon: 1, time: 2000 });
                layer.close(addIndex);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  },
  remarkList: [],
  level: -1,
  content: "",
  isEditStatus:{},
    // 看完成订单返回数据 是 完成还是 超时完成---sss
  one: function() {
    var _this=this;
    $.ajax({
      url: DOMAIN + "deviceOrder/select/byId",//
      data: {
        token: Cookies.get("token"),
        orderId: GetQueryString("id")
      },
      success: function(data) {
          Order.isEditStatus = {
              device_id: data.data.device_id,
              patrol_id: data.data.patrol_id,
          }
         // console.log(data,Order.isEditStatus,'11')
        window.sessionStorage.setItem('ss_order_content', JSON.stringify(data.data)); // 工单信息，用于二次编辑等
        var time2=data.data.ORDER_TIME_OUT;
        var time1=data.data.ASSIGN_AT;
        var times=0;
        var bool = (Date.parse(time2) - Date.parse(time1)) > times; // true => 超时 false=>按时
          if (data.data.EXPIRE_PERIOD_STR) {
              switch (data.data.EXPIRE_PERIOD_STR) {
                  case '3小时':
                      times=Number(10008000);
                      break;
                  case '12小时':
                      times=Number(43200000);
                      break;
                  case '24小时':
                      times=Number(86400000);
                      break;
                  case '48小时':
                      times=Number(172800000);
                      break;
                  case '一周':
                      times=Number(604800000);
                      break;
                  case '一个月':
                      times=Number(2592000000);
                      break;
                  default: times;
              }
          };
        var msg='';
        var msg2='';
        if(data.data.EXPIRE_PERIOD_STR){
          msg2=time2+'按时';
        }else{
            msg2='非蓝牙设备';
        }
        if(bool){
           msg=time2 +'超时';
        }else{
          msg=time2 +'按时';
        }
        if (data.code == 10000) {
          Order.remarkList =
            data.data.fault_remark == null
              ? []
              : data.data.fault_remark.split("-");
          Order.level = data.data.level;
          Order.content = data.data.content;
          var orderDetails = $(".orderDetails")[0];
          orderDetails.is_vendor = data.data.is_vendor;
          orderDetails.order_type = data.data.order_type;
          if (Order.level == 0) {
            $(".orderDetails header").attr("class", "order_status_6");
            $(".orderDetails header .box:eq(0) .icon_order").attr(
              "src",
              "../img/one/order_status_6.png"
            );
            $(".orderDetails header .con h3").html(
              "已作废" +
                "<i>" +
                (msg == null
                  ? msg2  //'之前是 非蓝牙设备'
                  : msg) +
                "</i>"

            );
          } else {
            // console.log('time');
            $(".orderDetails header").attr(
              "class",
              "order_status_" + data.data.status
            );
            $(".orderDetails header .box:eq(0) .icon_order").attr(
              "src",
              "../img/one/order_status_" + data.data.status + ".png"
            );
            $(".orderDetails header .con h3>i:eq(0)").html(
              Order.statusList[Number(data.data.status) - 1]
            );
              $(".orderDetails header .con h3>i:eq(1)").html(
                  (data.data.status != 5
                      ? msg2
                      : msg)
              );
          //  判断i样式
            //  console.log('msg',msg);
              if (data.data.status == 5) {
                  if(!bool){
                      $(".orderDetails header .con h3>span").css({"background-color":"#9c9c9c"});
                      $(".orderDetails header .con h3>span>i").css({"background-color":"#9c9c9c"});
                  }else{
                      $(".orderDetails header .con h3>span>i").css({
                          'background-color':"red"});
                  }
              }
          }
          $(".orderDetails header .con span:nth-child(2) i").html(
            data.data.order_no
          );
          $(".orderDetails header .box-right-place .box-p-one").html(
            // data.data.beacon_name == null ? "--" : data.data.beacon_name
            '<div  data-toggle="tooltip" data-placement="right" style="overflow: hidden;text-overflow: ellipsis;width:110px" title= ' +  data.data.beacon_name +' >' +
            ( data.data.beacon_name == null ? '--' :  data.data.beacon_name) +
            '</div>'
          );

          $(".orderDetails header .box-right-place .box-p-two").html(
            // data.data.device_name == null ? "--" : data.data.device_name
              '<div  data-toggle="tooltip" data-placement="right" style="overflow: hidden;text-overflow: ellipsis;width:110px" title= ' +  data.data.device_name +' >' +
              ( data.data.device_name == null ? '--' :  data.data.device_name) +
            '</div>'
          );
          Order.repair();
        } else {
          errormsg(data);
        }

      }
    });
  },

  // 判读是否显示入口 修改-hss
  isShowRdit:function(isEditable,msg,action,id){
      var str = '';
          if (isEditable == 1 || isEditable==2) {
              str += "<p>";
              if (action == 18) {
                   str += '<img class="imgs" src="../img/one/status_h1.png"/>'
              }
              str += "<span>"+msg+"</span><span data-btn='ss-btn' data-id="+id+" data-isEditable='"+isEditable+"' data-action='"+action+"' style='color:#428bca;cursor:pointer;position: relative;top:0px;left:80px;'><img src='../img/icon_pen.png' style='margin-right:10px;'/>修改</span></p>";
          } else {
              str += "<p>";
              if (action == 18) {
                  str += '<img class="imgs" src="../img/one/status_h1.png"/>'
                }
              str += "<span>"+msg+"</span></p>";

          }
          return str;
  },

  //根据工单Id获取维修列表
  repair: function() {
      var s_content=null,
          s_item_name=null,
          s_order_id=null,
          s_palce_name=null;
    $.ajax({
      url: DOMAIN + "repair/selectByOrderId",
      data: {
        token: Cookies.get("token"),
        orderId: GetQueryString("id"),
        isCheck: 1
      },
      success: function(data) {
        window.sessionStorage.setItem('ss_order_data', JSON.stringify(data.data));
        // var ss_arr_data = [];

        if (data.code == 10000) {
         if (data.MAINTANCE_REPORT == "NO" && data.CANT_FIX == "NO" && data.FIX == "NO" && data.ORDER_CLOSE == "NO") {
            $(".order_fun_add a").hide();
          } else {
              $(".order_fun_add a").show();

             //新增报告
              if (data.MAINTANCE_REPORT == "NO") {
              $(".order_fun_add .dropdown-menu li.oa_9").hide();
            } else {
              $(".order_fun_add .dropdown-menu li.oa_9").show();
            }
            // 无法完成
            if (data.CANT_FIX == "NO") {
              $(".order_fun_add .dropdown-menu li.oa_4").hide();
            } else {
              $(".order_fun_add .dropdown-menu li.oa_4").show();
            }
            // 检修完成
            if (data.FIX == "NO") {
              $(".order_fun_add .dropdown-menu li.oa_3").hide();
            } else {
              $(".order_fun_add .dropdown-menu li.oa_3").show();
            }
            // 订单完成
           if (data.ORDER_CLOSE == "NO") {
               $(".order_fun_add .dropdown-menu li.oa_7").hide();
           } else {
               $(".order_fun_add .dropdown-menu li.oa_7").show();
           }
          }
          // 派工和权限分享
          if (data.ORDERASSIGN == "YES") {
            $(".order_fun_pa").show();
          } else {
            $(".order_fun_pa").hide();
          }
          // 派工 和 标签权限
          if (data.ORDERASSIGN == "NO" && data.LABEL == "NO") {
            $(".order_fun_redact a").hide();
          } else {
            $(".order_fun_redact a").show();
            if (data.ORDERASSIGN == "YES") {
              $(".order_fun_redact .dropdown-menu li.red_share").show();
            } else {
              $(".order_fun_redact .dropdown-menu li.red_share").hide();
            }
            if (data.LABEL == "YES") {
              $(".order_fun_redact .dropdown-menu li.red_label").show();
            } else {
              $(".order_fun_redact .dropdown-menu li.red_label").hide();
            }
          }
          if (data.ORDER_DELETE == "YES") {
            $(".peopleDel").show();
          } else {
            $(".peopleDel").hide();
          }
          // 反馈按钮
          if (data.FEEDBACK == "YES") {
            $(".icon_order_fan").show();
          } else {
            $(".icon_order_fan").hide();
          }
          // hss_ 添加 验收按钮是否显示
          if (data.ORDER_CHECK == 'YES') {
              $('.icon_order_yan').show();
          } else {
              $('.icon_order_yan').hide();
          }
          var str = "";
          $.each(data.data, function(i, n) {
              s_content=n.content;
              s_item_name=n.item_name;
              s_order_id=n.order_id;
              s_palce_name=n.palce_name;
              n.indexId = i;
            str += "<li>";
            str += '<div class="left">';
            str +=
              '<div><img src="../img/one/status_' +
              n.action +
              (n.valid == 1 ? "" : "_1") +
              '.png" ></div>';
            str +=
              "<div><span>" +
              n.actionName +
              "</span><i>" +
              ts2YmdHis(n.capture_at) +
              "</i></div>";
            str += "</div>";
            str += '<div class="right">';
            var orange = "";
            if (n.categoryList && n.categoryList.length > 0) {
              orange = '<i class="orange">' + n.categoryList[0].value2 + "</i>";
            }
            switch (n.action) {
              case 1: //创建工单
                str +=
                  "<span>巡视人员：" +
                  n.createBy_name +
                  "</span><span class='falutCon'>故障情况:</span>";
                str += "<ul>";
                $.each(Order.remarkList, function(j, m) {
                  str += "<li>" + m + "</li>";
                });
                str += "</ul>";
                // 只可修改自己创建的工单
                var ss_userInfo = window.localStorage.getItem('userInfo');  //获取当前用户的id
                str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
                if (Order.level == 0) {
                  str += '<ul class="note"><li>' + Order.content + "</li></ul>";
                  str += '<ul class="note tixiang">';
                  $.each(n.content.split("-"), function(k, o) {
                    str += "<li>" + o + "</li>";
                  });
                  str += "</ul>";
                } else {
                  str +=
                    '<ul class="note"><li>' +
                    (n.content == null ? "--" : n.content) +
                    "</li></ul>";
                }
                if (n.worker_order_no) str += "<span>相关工作联系单：" + n.worker_order_no + "</span>";
                if (n.finder_name) str += "<span>报修人备注：" + n.finder_name + "</span>";
                if (n.finder_phone) str += "<span>联系方式：" + n.finder_phone + "</span>";
                break;
              case 2: //人员变更
                  var i_html='';
                  if(data.EXPIRE_PERIOD_STR){
                     i_html="限制"+data.EXPIRE_PERIOD_STR +"完成";
                  }else{
                    i_html='';
                  }
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  '</i><i class="assign">任务指派到</i><i>';
                $.each(n.ownerList, function(j, m) {
                  str += m.name + " ";
                });
                str += "</i><i>"+i_html+"</i>" +
                    "</span>";
                str +=Order.isShowRdit(n.isEditable,'',n.action,n.id);
                break;
              case 3: // 订单完成
                  // ss_arr_data.push(n)
                str +=
                  "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                // str += "<span>检修情况：</span>";
                  str +=Order.isShowRdit(n.isEditable,'检修情况:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 4: // 无法完成
                  // ss_arr_data.push(n)
                str +=
                  "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                // str += "<span>检修情况：<span data-btn='ss-btn-report' data-index='"+i+"' data-action='"+n.action+"' style='color:#428bca;cursor:pointer;position: relative;top:-40px;left:80px;'><img src='../img/icon_pen.png' style='margin-right:10px;'/>修改备注</span></span>";
                  str +=Order.isShowRdit(n.isEditable,'检修情况:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 5: //更新工单
                str +=
                  "<span>巡视人员：" +
                  n.createBy_name +
                  "</span>";
                  // str+="<span>故障情况：</span>";
                  str +=Order.isShowRdit(n.isEditable,'故障情况:',n.action,n.id);
                  str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 7: // 订单完成
                  // ss_arr_data.push(n)
                str +=
                  "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                // str += "<span>检修情况：<span data-btn='ss-btn-report' data-index='"+i+"' data-action='"+n.action+"'  style='color:#428bca;cursor:pointer;position: relative;top:-40px;left:80px;'><img src='../img/icon_pen.png' style='margin-right:10px;'/>修改备注</span></span>";
                  str +=Order.isShowRdit(n.isEditable,'检修情况:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                str += "<span>工单消费：</span>";
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 9: //提交检修报告
                str +=
                  "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                // str += "<span>检修情况：<span data-btn='ss-btn-report' data-index='"+i+"' data-action='"+n.action+"'  style='color:#428bca;cursor:pointer;position: relative;top:-40px;left:80px;'><img src='../img/icon_pen.png' style='margin-right:10px;'/>修改备注</span></span>";
                  str +=Order.isShowRdit(n.isEditable,'检修情况:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 10: //权限共享
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  '</i><i class="share">权限分享到</i>';
                $.each(n.lineList, function(j, m) {
                  str += "<i>" + m.value2 + "</i>";
                });
                str += "</span>";
                break;
              case 11: //特殊工单
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  "</i><i>将工单升级为特殊工单</i></span>";
                // str += "<span>备注：</span>";
                  str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 12: //移除人员
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  "</i><i>从工单中移除</i>";
                $.each(n.ownerList, function(j, m) {
                  str += "<i>" + m.name + "</i>";
                });
                str += "</span>";
                break;
              case 13: //删除工单
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  "</i><i>将工单删除</i></span>";
                $.each(n.ownerList, function(j, m) {
                  str += "<i>" + m.name + "</i>";
                });
                str += "</span>";
                break;
              case 14:
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  "</i></span>";
                str += "<p>";
                for (var s = 0; s < n.action_result; s++) {
                  str += '<i class="star"></i>';
                }
                str +=
                  order_alert.xinArr[Number(n.action_result) - 1] + "</p>";
                // str += "<span>备注：</span>";
                  str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 15:
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  "</i></span>";
                str += "<span>工单未完成</span>";

                  str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 16:
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  '</i><i class="assign" style="width: 120px;">标签更新</i></span>';
                // str += "<span>备注：</span>";
                  str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
                str +=
                  '<ul class="note"><li>' +
                  (n.content == null ? "--" : n.content) +
                  "</li></ul>";
                break;
              case 17://抢单
                str +=
                  "<span>" +
                  orange +
                  "<i>" +
                  n.createBy_roleName +
                  "：" +
                  n.createBy_name +
                  '</i><i>'+(n.content == null ? "--" : n.content)+'</i></span>';
                  break;
              case 18: // 验收成功
                  str +=
                      "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                  str +=Order.isShowRdit(n.isEditable,'工单完成优秀:',n.action,n.id);
                  str +=
                      '<ul class="note"><li>' +
                      ( n.content == null ? "--" : n.content ) +
                      "</li></ul>";
                  break;
              case 19: // 验收失败
                  str += "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
                  str +=Order.isShowRdit(n.isEditable,'工单未完成:',n.action,n.id);
                  str +=
                      '<ul class="note"><li>' +
                      (n.content == null ? "--" : n.content) +
                      "</li></ul>";
                  break;
	            case 20: // 评价成功
		            str +=
			            "<span>" +
			            orange +
			            "<i>" +
			            n.createBy_roleName +
			            "：" +
			            n.createBy_name +
			            "</i></span>";
		            str += "<p>";
		            var stars1Str = '', stars2Str = '';
		            for (var s = 0; s < 3; s++) {
		            	if (n.stars1 > s) {
				            stars1Str += '<i class="star"></i>';
		            	} else {
				            stars1Str += '<i class="nor"></i>';
		            }
		            }
		            for (var s = 0; s < 3; s++) {
			            if (n.stars2 > s) {
				            stars2Str += '<i class="star"></i>';
			            } else {
				            stars2Str += '<i class="nor"></i>';
			            }
		            }
		            str += "<div class='rater'><span class='title'>报修任务  </span><span>"+ stars1Str +"</span><span class='title'>人员服务  </span><span>"+ stars2Str +"</span></div>";
		            str +=Order.isShowRdit(n.isEditable,'备注:',n.action,n.id);
		            str +=
			            '<ul class="note"><li>' +
			            (n.content == null ? "--" : n.content) +
			            "</li></ul>";
		            break;
	            case 21: // 评价未完成失败
		            str += "<span>" + orange + "<i>" + n.createBy_name + "</i></span>";
		            str +=Order.isShowRdit(n.isEditable,'工单未完成:',n.action,n.id);
		            str +=
			            '<ul class="note"><li>' +
			            (n.content == null ? "--" : n.content) +
			            "</li></ul>";
		            break;
            }
              // window.sessionStorage.setItem('ss_arr_data', JSON.stringify(ss_arr_data));
            $.each(n.consume_list, function(q, w) {
              switch (w.consume_type) {
                case "1":
                  str +=
                    '<div class="feeClass">实收费用：<em>' +
                    (w.fee / 100).toFixed(2) +
                    "</em>";
                  str +=
                    '<div class="sett"><font color="#14d23d">' +
                    (w.payment_at == " " ? "未结" : "已结") +
                    "</font>" +
                    w.payment_at +
                    "</div>";
                  str += "</div>";
                  break;
                case "2":
                  str +=
                    '<div class="feeClass">消耗物件：<font color="#666">' +
                    w.name +
                    "</font><em>" +
                    (w.fee / 100).toFixed(2) +
                    "</em></div>";
                  break;
                case "3":
                  str +=
                    '<div class="feeClass">维修费用：<font color="#666">' +
                    w.name +
                    "</font><em>" +
                    (w.fee / 100).toFixed(2) +
                    "</em></div>";
                  break;
              }
            });
            str += "</div>";
            str += '<div class="imgBox">';
            for (var q = 1; q < 5; q++) {
              if (n["pic" + q] != null && n["pic" + q] != "../img/button_add.png" && n["pic" + q] != '') {
                str += '<img src="' + n["pic" + q] + '">';
              }
            }
            str += "</div>";
            str += "</li>";
          });
          $(".details ul").html(str);
          $('[data-btn="ss-btn"]').on('click',function () {
                var iseditable = $(this).attr('data-iseditable');
                var action = $(this).attr('data-action');
                var id = $(this).attr('data-id');
                //
              if (action == '1') {
                  Order.repaireOrder(iseditable,action,id);
              } else {
                  Order.editReport(iseditable,action,id);
              }


            })
        } else {
          errormsg(data);
        }
      }
    });
  },
  //时间戳转换
  getNowDate:function(time) {
          var date =  new Date(time);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
          Y = date.getFullYear() + '-';
          M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
          D = date.getDate() + ' ';
          h = date.getHours() + ':';
          m = date.getMinutes() + ':';
          s = date.getSeconds();
          return Y+M+D+h+m+s;
      },
  /**
   * 创建工单页面
   * **/
  repaireOrder:function(iseditable,action,id,obj){
      /**
       * 获取备注详情
       * **/
      var data = window.sessionStorage.getItem('ss_order_content') || {};
      var data_imgs = JSON.parse(window.sessionStorage.getItem('ss_order_data')) || {};
      data = JSON.parse(data);
      var List = [];
     // console.log(data,Order.isEditStatus,'22222')
      /**
       * 获取历史详情
       * **/
      $.ajax({
          url: DOMAIN + "api/orderChange/list/orderChange?token=" + Cookies.get("token"),
          async: false,
          type: 'POST',
          contentType: "application/json",
          data:JSON.stringify({
              actionId:id,
              pageNo:1,
              pageSize:99999,
          }),
          success: function(data) {
            if (data.code == '10000') {
                List = data.data.results;
            }
           }
          });
      var str='<div class="addBox" id="orderAdd"><div class="add_header" style="text-align: center;">信息修改与历史内容<span class="project_icon_2 "><img src="../img/gg_03.jpg" alt=""></span></div>' +
       '<div class="add_con_s add_con" style="padding-top: 10px;"><div class="conBox"><span class="title">报修物件名称:</span><div class="con"><input type="text" id="order-room" ' +
      'placeholder="报修物件" style="width:300px" value= '+data.device_name+ ' /></div></div><div class="conBox">' +
      '<span class="title">所在房间:</span><div class="con"><input type="text" id="order-repaired-name" placeholder="所在房间:" style="width:300px" maxlength="15" value= ' + data.beacon_name + '></div></div>' +
      '<div class="conBox"><span class="title">故障描述:</span><div class="con"><textarea id="order-fault-situation" style="height:120px" placeholder="请输入故障情况">' + data.content + '</textarea></div></div>';
      if (iseditable == '2' ) {
          str+='';
          $('#order-room').attr("disabled",true);
      } else {
          str+='<button class="confirm" style="left:159px">完成</button>';
      }
      str+='</div><div class="right_content"><div class="rg_item_content">';
      if (List.length) {
          $.each(List, function(i, n) {
              n.updateAt = Order.getNowDate(n.updateAt)
              str +=  '<div class="rg_item_box" style="position:relative"><div ><p class="rg_name">'
              + n.lastUpdateByName+'</p><ul class="rg_box"><li>'+n.lastUpdateByLinesName +'</li></ul></div><div class="accordion-group"><div class="accordion-heading"><span style="padding-left: 50px;padding-right: 10px;">'+n.updateAt+'</span><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse'+i+'" style="float;right;margin-right:10px"><img src="../img/gg_07.png" alt=""></a></div><div id="collapse'+i+'" class="accordion-body collapse" style="height: 0px;    border: 1px solid #e4e4e4; "><div class="accordion-inner" style="padding:5px">  '+
           "<p><span class='head-title'>报修物件名称:</span>"+n.itemName +"</p><p><span  class='head-title'>所在房间:</span>"+n.placeName +"</p><p><span class='head-title'>故障描述:</span>" +  n.content+'</p></div></div></div></div>'
          });
      } else {
          str +=  '<div class="rg_item_box" style="position:relative"><div style="overflow: hidden;">暂无历史数据</div></div>'
      }
        str+= '</div></div></div>';
      var addIndex = layer.open({
              type: 1,
              title: false,
              shade: [0.1, "#000"],
              area: ["740px", "460px"],
              closeBtn: false,
              content:str,
              success: function() {
                  $(".imgbox img").css('cursor','not-allowed');
                  $(".imgbox img").click(function() {
                      // upImg(this);
                  });

                  if (iseditable == '2' ) {
                      // $('#order-room').attr("disabled",true);
                      $('#order-room').css('cursor','not-allowed');
                      $('#order-repaired-name').css('cursor','not-allowed');
                      $('#order-fault-situation').css('cursor','not-allowed');
                      $('#order-room').attr('disabled',true);
                      $('#order-repaired-name').attr('disabled',true);
                      $('#order-fault-situation').attr('disabled',true);
                   } else if (Order.isEditStatus.device_id != null || Order.isEditStatus.patrol_id != null) {
                      $('#order-room').css('cursor','not-allowed');
                      $('#order-repaired-name').css('cursor','not-allowed');
                      $('#order-room').attr('disabled',true);
                      $('#order-repaired-name').attr('disabled',true);
                   } else {
                      $('#order-room').css('cursor','');
                      $('#order-repaired-name').css('cursor','');
                      $('#order-fault-situation').css('cursor','');
                  }
                  $(".project_icon_2").click(function() {
                      layer.close(addIndex);
                  });
                  $(".confirm").click(function() {
                      var place_name = $("#order-repaired-name").val(),
                          item_name = $("#order-room").val(),
                          content = $("#order-fault-situation").val(),
                          pic1 = $(".imgbox img:eq(0)").attr("src"),
                          pic2 = $(".imgbox img:eq(1)").attr("src"),
                          pic3 = $(".imgbox img:eq(2)").attr("src"),
                          pic4 = $(".imgbox img:eq(3)").attr("src");
                      if (item_name == "") {
                          layer.tips("请输入报修物件描述！", "#order-room", {
                              tips: [2, "#50555C"]
                          });
                          return;
                      }
                      if (place_name == "") {
                          layer.tips("请输入所在位置！", "#order-repaired-name", {
                              tips: [2, "#50555C"]
                          });
                          return;
                      }
                      if (content == "") {
                          layer.tips("请输入故障情况！", "#order-fault-situation", {
                              tips: [2, "#50555C"]
                          });
                          return;
                      }
                      $.ajax({
                          url: DOMAIN + "api/orderChange/insert/orderChange?token=" + Cookies.get("token"),
                          type: 'POST',
                          contentType: "application/json",
                          data: JSON.stringify(
                            {
                              action: action,
                              actionId: id,
                              content: content,
                              itemName:item_name,
                              placeName:place_name,
                            }
                          ),
                          success: function(data1) {
                              data.beacon_name = place_name
                              data.device_name = item_name
                              data.content = content
                              window.sessionStorage.setItem('ss_order_content', JSON.stringify(data));
                              if (data1.code == 10000) {
                                  Order.Page();
                                  Order.repair();
                                  layer.msg("添加成功！", { icon: 1, time: 2000 });
                                  layer.close(addIndex);
                              } else {
                                  errormsg(data1);
                              }
                          }
                      });
                  });
              }
          });
  },
  /**
   * 除创建工单其他状态的页面详情
   * **/
  editReport: function(iseditable,action,id) {
      var List = [];
      /**
       * 获取备注详情
       * **/
      $.ajax({
          url: DOMAIN + "api/orderChange/list/orderChange?token=" + Cookies.get("token"),
          type: 'POST',
          async: false,
          contentType: "application/json",
          data:JSON.stringify({
              actionId:id,
              pageNo:1,
              pageSize:99999,
          }),
          success: function(data) {
              if (data.code == '10000') {
                  List = data.data.results;
              }
          }
      });
      /**
       * 获取备注详情
       * **/
      var data = {};
      var arrData = window.sessionStorage.getItem('ss_order_data') || [];
      arrData = JSON.parse(arrData)
      if (arrData.length) {
          $.each(arrData,function(index,obj){
              if (action == obj.action && id == obj.id) {
                  data= obj;
              }
          })
      }
      var str='<div class="addBox" id="orderAdd"><div class="add_header" style="text-align: center;">信息修改与历史内容<span class="project_icon_2 "><img src="../img/gg_03.jpg" alt=""></span></div>' +
          '<div class="add_con_s add_con" style="padding-top: 10px;">' +
          '<div class="conBox"><span class="title">备注修改:</span><div class="con"><textarea id="order-fault-situation" placeholder="请输入故障情况" style="height:260px;">' + data.content + '</textarea></div></div>';
      if (iseditable == '2') {
          str+='';
      } else {
          str+='<button class="confirm" style="left:159px">完成</button>';
      }
      str+='</div><div class="right_content"><div class="rg_item_content">';
      if (List.length) {
          $.each(List, function(i, n) {
              n.updateAt = Order.getNowDate(n.updateAt)
              str +=  '<div class="rg_item_box" style="position:relative"><div ><p class="rg_name">'
                  + n.lastUpdateByName +'</p><ul class="rg_box"><li>'+n.lastUpdateByLinesName+'</li></ul></div><div class="accordion-group"><div class="accordion-heading"><span style="padding-left: 50px;padding-right: 10px;">'+n.updateAt+'</span><a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion2" href="#collapse'+i+'" style="float;right;margin-right:10px"><img src="../img/gg_07.png" alt=""></a></div><div id="collapse'+i+'" class="accordion-body collapse" style="height: 0px;    border: 1px solid #e4e4e4; "><div class="accordion-inner" style="padding:5px"><span style="font-weight:600;padding-right: 8px;">备注:</span>  '+n.content+'</div></div></div></div>'
          });
      } else {
          str +=  '<div class="rg_item_box" style="position:relative"><div style="overflow: hidden;">暂无历史数据</div></div>'
      }
      str+= '</div></div></div>';
      var addIndex = layer.open({
              type: 1,
              title: false,
              shade: [0.1, "#000"],
              area: ["740x", "460px"],
              closeBtn: false,
              content: str,
              success: function() {
                  $(".order_alert .imgBox img").click(function() {
                      upImg(this);
                  });
                  $(".project_icon_2").click(function() {
                      layer.close(addIndex);
                  });
                  if (iseditable == '2') {
                      $('#order-fault-situation').css('cursor','not-allowed');
                  } else {
                      $('#order-fault-situation').css('cursor','');
                  }
                  $(".confirm").click(function() {
                      var Status = status;
                      var date = new Date(),
                          // pic1 = $(".order_alert .imgBox img:eq(0)").attr("src"),
                          // pic2 = $(".order_alert .imgBox img:eq(1)").attr("src"),
                          // pic3 = $(".order_alert .imgBox img:eq(2)").attr("src"),
                          // pic4 = $(".order_alert .imgBox img:eq(3)").attr("src"),
                          content = $("#order-fault-situation").val();
                      if (content == "") {
                          layer.tips("请输入备注修改！", "#order-fault-situation", {
                              tips: [2, "#50555C"]
                          });
                          return;
                      }
                      $.ajax({
                          url: DOMAIN + "api/orderChange/insert/orderChange?token=" + Cookies.get("token"),
                          type: 'POST',
                          contentType: "application/json",
                          data: JSON.stringify(
                              {
                                  action: action,
                                  actionId: id,
                                  content: content,
                              }
                          ),
                          success: function(data1) {
                              data.content = content
                              window.sessionStorage.setItem('ss_order_data', JSON.stringify(data));
                              if (data1.code == 10000) {
                                  Order.Page();
                                  Order.repair();
                                  layer.msg("添加成功！", { icon: 1, time: 2000 });
                                  layer.close(addIndex);
                              } else {
                                  errormsg(data1);
                              }
                          }
                      });
                  });
              }
          });
    },
  excel: function() {
    var sel = $(".search select").val(),
      status = $(".header .title i.on").index();
    parent.location.href =
      DOMAIN +
      "excel/order?token=" +
      Cookies.get("token") +
      "&status=" +
      (status < 0 ? 2 : status) +
      "&deviceCategory=" +
      $("#orderLine").attr("data-status") +
      (sel == "0" ? "&orderNo=" + $(".search input").val() : "") +
      (sel == "1" ? "&deviceName=" + $(".search input").val() : "") +
      (sel == "2" ? "&accountName=" + $(".search input").val() : "") +
      (sel == "3" ? "&placeName=" + $(".search input").val() : "") +
      "&orderBy=" +
      ($("#updataTime").attr("data-status") == ""
        ? $("#createTime").attr("data-status")
        : $("#updataTime").attr("data-status")) +
      "&realStatus=" +
      $("#orderStatus").attr("data-status")+
      "&orderType=" + (Order.values_arr.length>0? Order.values_arr.toString():'') +
      "&begTime=" +  $('.J-datepicker-range-day .datepicker-start-2').val() +
      '&endTime=' +  $('.J-datepicker-range-day .datepicker-end-2').val();
  },

};
var mine = {
  int: function() {
    this.info();
  },
  getName: function() {
    var user = JSON.parse(localStorage.getItem("userInfo"));
    $(".bodyLeft nav .face img").attr("src", user && user.icon);
    $(".bodyLeft nav .name").html(user && user.userName);
  },
  info: function() {
    $.ajax({
      type: "GET",
      url:
        url +
        "user/" +
        JSON.parse(localStorage.getItem("userInfo")).id +
        "?token=" +
        Cookies.get("token"),
      contentType: "application/json",
      success: function(data) {
        if (data.code == "10000") {
          $(".userInfo .infoBox .pc img").attr("src", data.data.icon);
          $(".userInfo .infoBox .info .nam").html(data.data.name);
          $(".userInfo .infoBox .info .icon_job").html(data.data.role_name_cn);
          $(".userInfo .infoBox .info .icon_person i").html(data.data.code_no);
          $(".userInfo .infoBox .info .icon_mail i").html(data.data.email);
          $(".userInfo .infoBox .info .icon_phone i").html(data.data.phone);
          var area = $(".managerArea"),
            pro = $(".managerProject");
        } else {
          errormsg(data);
        }
      }
    });
  },
  editPass: function() {
    var Index = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["410px", "425px"],
      closeBtn: false,
      content:
        '<div class="addBox" id="editPass"><div class="add_header">修改密码<span class="icon_job"></span></div>' +
         '<div class="add_con" style="height:363px;"><div class="conBox"><span class="title">旧密码</span><div class="con"><span class="Init">*</span><input type="text" id="ed-old-pass"></div></div><div class="conBox"><span class="title">新密码</span><div class="con"><span class="Init">*</span><input type="password" id="ed-new-pass"></div></div><button class="confirm"  style="left:100px;">确认修改</button><span class="notes" style="right:85px;">确认前请仔细核对信息，确保无误！</span><button class="cancel" style="right:80px;">取消</button></div>' +
          '</div>',
      success: function() {
        $("#ed-old-pass").click(function() {
          //layer.close(Index)
        });
        $(".cancel").click(function() {
          layer.close(Index);
        });
        $(".confirm").click(function() {
          var oldPass = $("#ed-old-pass").val(),
            newPass = $("#ed-new-pass").val();
          /*console.log(hex_sha1(oldPass));
                     return;*/
          if (oldPass == "") {
            layer.tips("请输入旧密码！", "#ed-old-pass", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (newPass == "") {
            layer.tips("请输入新密码！", "#ed-new-pass", {
              tips: [2, "#50555C"]
            });
            return;
          }
          $.ajax({
            type: "POST",
            url: url + "user/password?token=" + Cookies.get("token"),
            contentType: "application/json",
            data: JSON.stringify({
              old_password: hex_sha1(oldPass),
              new_password: hex_sha1(newPass)
            }),
            success: function(data) {
              if (data.code == "10000") {
                layer.alert(
                  "修改成功，请重新登录",
                  {
                    closeBtn: false
                  },
                  function(index) {
                    location.href = "login.html";
                    layer.close(index);
                  }
                );
                layer.close(Index);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  },
  editData: function() {
    var addIndex = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["410px", "510px"],
      closeBtn: false,
      content:
        '<div class="addBox"><div class="add_header">修改人员资料<span class="project_icon"></span></div><div class="add_con"><div class="conBox"><span class="title">人员名称</span><div class="con"><input type="text" id="edit-people-name" > </div></div><div class="conBox"><span class="title">联系电话</span><div class="con"><input type="text" style="text-indent: 55px;text-align: left" maxlength="11" id="edit-people-call" placeholder="13812341234"><span class="areaCode">+86</span></div></div><div class="conBox"><span class="title">邮箱地址</span><div class="con"><input type="text" id="edit-people-email"></div></div><div class="conBox"><span class="title">照片</span><div class="con"><img src="../img/gravatar.png" class="headIcon"></div></div><button class="confirm" style="left:100px">确认修改</button><button class="cancel" style="right:80px">取消</button></div></div>',
      success: function() {
        var user = mineDetails.$("#info");
        $("#edit-people-name").val(user.find(".info .nam").html());
        $("#edit-people-call").val(user.find(".info .icon_phone i").html());
        $("#edit-people-email").val(user.find(".info .icon_mail i").html());
        $(".addBox .headIcon").attr("src", user.find(".pc img").attr("src"));
        $(".headIcon").click(function() {
          upImg(this);
        });
        $(".cancel").click(function() {
          layer.close(addIndex);
        });
        $(".confirm").click(function() {
          var name = $("#edit-people-name").val(),
            phone = $("#edit-people-call").val(),
            email = $("#edit-people-email").val(),
            icon = $(".addBox .headIcon").attr("src");
          if (name == "") {
            layer.tips("请输入人员姓名！", "#edit-people-name", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (phone == "") {
            layer.tips("请输入联系方式！", "#edit-people-call", {
              tips: [2, "#50555C"]
            });
            return;
          }
          if (email == "") {
            layer.tips("请输入联系邮箱！", "#edit-people-email", {
              tips: [2, "#50555C"]
            });
            return;
          }
          $.ajax({
            type: "POST",
            url:
              url +
              "user/" +
              JSON.parse(localStorage.getItem("userInfo")).id +
              "?token=" +
              Cookies.get("token"),
            contentType: "application/json",
            data: JSON.stringify({
              name: name,
              phone: phone,
              email: email,
              icon: icon
            }),
            success: function(data) {
              if (data.code == "10000") {
                var userIfo = JSON.parse(localStorage.getItem("userInfo"));
                userIfo.userName = data.data.name;
                userIfo.icon = data.data.icon;
                localStorage.setItem("userInfo", JSON.stringify(userIfo));
                mineDetails.mine.info();
                mine.getName();
                layer.msg("修改成功！", { icon: 1, time: 2000 });
                layer.close(addIndex);
              } else {
                errormsg(data);
              }
            }
          });
        });
      }
    });
  }
};
var Project = {
  int: function() {
    //this.Page();
    this.list(1);
    $(".table")
      .delegate("td:nth-child(1)", "click", function() {
        openHtml(
          "tpl/project_detail.html?id=" + $(this).attr("data-id"),
          "project"
        );
      })
      .delegate("td:nth-child(4)", "click", function() {
        Project.offline(
          $(this)
            .parent()
            .children("td:eq(0)")
            .attr("data-id")
        );
      });
  },
  listPage: -1,
  Page: function() {
    this.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Project.listPage > -1) {
        clearInterval(t);
      }
      if (Project.listPage <= 1) return;
      $(".bodyRight").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Project.listPage,
        current: 1,
        backFn: function(p) {
          Project.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    $.ajax({
      url: DOMAIN + "device/selectProject",
      data: {
        token: Cookies.get("token")
      },
      success: function(data) {
        if (data.code == 10000) {
          //Project.listPage=data.data.page.totalPage;
          var str = "";
          $.each(data.data, function(i, n) {
            str += "<tr>";
            str += "<td data-id='" + n.project_id + "'>" + n.name + "</td>";
            str += "<td><div style='width: 284px;overflow-x: auto'>" + n.address + "</div></td>";
            str += "<td>" + /*n.manager_name*/ "--" + "</td>";
            str += "<td>生成设备离线包</td>";
            str += "</tr>";
          });
          $(".project tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  oneInt: function() {
    this.one();
  },
  one: function() {
    $.ajax({
      type: "GET",
      url:
        url +
        "project/" +
        GetQueryString("id") +
        "?token=" +
        Cookies.get("token"),
      contentType: "application/json",
      success: function(data) {
        if (data.code == "10000") {
          $(".project .title").html(data.data.name);
          $(".project .basic").html(
            "<td>" +
              data.data.name +
              "</td><td>" +
              data.data.address +
              "</td><td>" +
              data.data.manager_name +
              "</td>"
          );
          $(".project .describe").text(data.data.remark);
          $(".project .pic img:eq(0)").attr("src", data.data.pic1);
          $(".project .pic img:eq(1)").attr("src", data.data.pic2);
          $(".project .pic img:eq(2)").attr("src", data.data.pic3);
        } else {
          errormsg(data);
        }
      }
    });
  },
  add: function() {},
  //生成设备离线包
  offline: function(id) {
    $.ajax({
      url: DOMAIN + "package/appPackage",
      data: {
        token: Cookies.get("token"),
        projectId: id
      },
      success: function(data) {
        if (data.code == "10000") {
          layer.msg("操作成功！", { icon: 1, time: 2000 });
        } else {
          errormsg(data);
        }
      }
    });
  }
};
var People = {
  int: function() {
    this.range();
    this.Page();
	  var roleId = JSON.parse(localStorage.getItem("userInfo")).roleId;
	  if (roleId === 1 || roleId === 2 || roleId === 3 || roleId === 4 || roleId === 14 || roleId === 15 ) {
		  $(".addFun").show();
	  } else {
		  $(".addFun").hide();
	  }
	  $(".table").delegate("td:nth-child(1)", "click", function() {
      openHtml(
        "tpl/people_detail.html?id=" + $(this).attr("data-id"),
        "people"
      );
    });
    $(".ifm .dropdown ul").delegate("li a", "click", function() {
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
      People.Page();
    });
    $(".header .search i").click(function() {
      People.Page();
    });
  },
  range: function() {
    $.ajax({
	    type: "POST",
	    url:
	    DOMAIN +
	    "api/user/manage/list/role?token=" +
	    Cookies.get("token"),
	    contentType: "application/json",
      success: function(data) {
        if (data.code == 10000) {
          var s =
              '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="null">全部</a></li>',
            str = "";
          var category_list = data.data;
	        var arr = [4,15,14,5,6,13,8,9,10,11];
          $.each(category_list, function(i, n) {
            str +=
              '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="' +
              n.id +
              '">' +
              n.nameCn +
              "</a></li>";
          });
          $(".role ul").html(s + str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  listPage: -1,
  Page: function() {
    People.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (People.listPage > -1) {
        clearInterval(t);
      }
      if (People.listPage <= 1) return;
      $(".bodyRight").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: People.listPage,
        current: 1,
        backFn: function(p) {
          People.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    var sec = $(".search input").val();
    if (sec == "") {
      sec = null;
    }
    var inputType = $(".search select").val(),
      dataobj = {
	      pageNo:pageNo,
	      pageSize:10,
	      projectId:100,
        roleId:$("#people-position").attr("data-status") === ''?null:$("#people-position").attr("data-status")
      };
      dataobj[inputType] = sec
    $.ajax({
      type: "POST",
      url:
      DOMAIN +
        "api/user/manage/list?token=" +
        Cookies.get("token"),
      contentType: "application/json",
	    data: JSON.stringify(dataobj),
      success: function(data) {
        if (data.code == 10000) {
          People.listPage = data.data.pages;
          var allStr = "";
          $.each(data.data.list, function(i, n) {
            allStr += "<tr>";
            allStr += "<td data-id='" + n.accountId + "'>" + n.name + "</td>";
            allStr += "<td>" + n.codeNo + "</td>";
            allStr += "<td>" + n.roleName + "</td>";
            /*allStr+="<td>"+(n.project_name==null?"--":n.project_name)+"</td>";*/
            allStr +=
              "<td style='cursor: default; max-width:100px'>" +
               '<div  data-toggle="tooltip" data-placement="right" ' +
                'style="overflow: hidden;text-overflow: ellipsis;width:110px; display: inline-block;"' +
                '} ' +
                'title= ' + n.lineNames.join('-') +' >' +
              (n.lineNames === []
                ? "--"
                : n.lineNames.join('-')) +
              "</div></td>";
            allStr += "</tr>";
          });
          $("table.people tbody").html(allStr);
        } else {
          errormsg(data);
        }
      }
    });
  },
  add: function() {
    var addIndex = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["824px", "643px"],
      closeBtn: false,
      content:
        '<div class="addBox" id="peopleAdd">' +
        '<div class="add_header">添加新人员<span class="project_icon"></span></div>' +
        '<div class="add_con">' +
        '<div class="add_con_left">' +
        '<div class="conBox">' +
        '<span class="title">姓名</span>' +
        '<div class="con"><input type="text" id="people-name" > </div></div>' +
        '<div class="conBox"><span class="title">工号</span><div class="con"><input type="number" id="people-num" ></div>' +
        '</div>' +
        '<div class="conBox"><span class="title">联系电话</span>' +
        '<div class="con"><input type="number" style="text-indent: 55px;text-align: left" maxlength="11" id="people-call" placeholder="选填">' +
        '</div></div>' +
        '<div class="conBox"><span class="title">预设密码</span>' +
        '<div class="con"><input type="text" style="text-indent: 55px;text-align: left" maxlength="11" id="people-psw" placeholder="">' +
        '</div></div>' +
        '</div>' +
        '<div class="add_con_right">' +
        '<div class="conBox"><span class="title">邮箱地址</span><div class="con"><input type="text" id="people-email" placeholder="选填"></div></div>' +
        '<div class="conBox"><span class="title">条线</span><div class="con"><div class="strip-line"><div class="it"><input type="checkbox" name="lineInput" value=""><a></a></div></div></div></div>' +
        '<div class="conBox"><span class="title">角色</span><div class="con"><select id="order-category_id"></select></div></div>'+
        '<span class="notes">确认前请仔细核对信息，确保无误！</span></div></div>'+
	      '<div class="btn-group-model"><button class="confirm">确认添加</button><button class="cancel">取消</button></div>',
      success: function() {
	      var typeName = false, typeNum = false;
	      $(".cancel").click(function() {
          layer.close(addIndex);
        });
	      $.ajax({
		      type: "GET",
		      url:
		      DOMAIN +
		      "/sysDict/getSysDict?token=" +
		      Cookies.get("token")+"&name=DEVICE_CATEGORY",
		      contentType: "application/json",
		      success: function(data) {
			      var str =''
			      $.each(data.data, function(i, n) {
				      str +='<div class="it"><input type="checkbox" name="lineInput" value="'+n.param+'"><a>'+
                n.value2 +
                '</a></div>';
			      });
			      $(".strip-line").html(str);
		      }
	      }); // 获取条线
	      $.ajax({
		      type: "POST",
		      url:
		      DOMAIN +
		      "api/user/manage/list/role?token=" +
		      Cookies.get("token"),
		      contentType: "application/json",
		      success: function(data) {
			      var castr= '',
                arr = [4,15,14,5,6,13,8,9,10,11];
			      $.each(data.data, function(i, n) {
			        if (arr.indexOf(n.id) !== -1 ) {
				        castr+='<option value="'+n.id+'">'+n.nameCn+'</option>'
			        }
			      });
			      $("#order-category_id").html(castr);
			      $("#people-name").change(function(){
			     //   console.log(this)
			      });
			      $('#people-name').bind('input propertychange', function()
			      {
              $.ajax({
	              type: "GET",
	              url:
	              DOMAIN +
	              "api/user/manage/count?token=" +
	              Cookies.get("token"),
	              data:{name: $(this).val(),
		              projectId:100,},
	              contentType: "application/json",
                success: function (data) {
                  if (data.code = 110000) {
                    if (data.data === 0) {
	                      typeName = true
                    }else {
                      typeName = false
                    }
                  }
                }
              })
			      })
			      $('#people-num').bind('input propertychange', function()
			      {
				      $.ajax({
					      type: "GET",
					      url:
					      DOMAIN +
					      "api/user/manage/count?token=" +
					      Cookies.get("token"),
					      data:{loginName: $(this).val(),
						      projectId:100,},
					      contentType: "application/json",
					      success: function (data) {
						      if (data.code = 110000) {
							      if (data.data === 0) {
								      typeNum = true
							      }else {
								      typeNum = false
							      }
						      }
					      }
				      })
			      })
		      }
	      }); // 获取角色
	      $("#peopleAdd .confirm").click(function() {
		      var name = $("#people-name").val(), // 姓名
			      nums = $("#people-num").val(), // 工号
			      tel = $("#people-call").val(), // 联系电话
			      psw = $("#people-psw").val(), // 预设密码
			      categoryId = $("#order-category_id").val(), // 角色
		        email = $("#people-email").val(), // 邮箱
			      stripLine = [];
		      $('input[name="lineInput"]:checked').each(
		        function(){
			        stripLine.push(this.value)
		        })
		      if (name == "") {
			      layer.tips("请输入人员名称！", "#people-name", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      if (!typeName) {
			      layer.tips("人员名称重复！", "#people-name", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      if (nums == "") {
			      layer.tips("请输入工号！", "#people-num", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      if (!typeNum) {
			      layer.tips("人员工号重复！", "#people-num", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      // if (tel == "") {
			     //  layer.tips("请输入电话号码！", "#people-call", {
				   //    tips: [2, "#50555C"]
			     //  });
			     //  return;
		      // }
		      if (psw == "") {
			      layer.tips("请输入预设密码！", "#people-psw", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      // if (email == "") {
			     //  layer.tips("请输入邮箱！", "#people-email", {
				   //    tips: [2, "#50555C"]
			     //  });
			     //  return;
		      // }
		      if (stripLine.length === 0) {
			      layer.tips("请选择条线！", ".strip-line", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      $.ajax({
			      url: DOMAIN + "api/user/manage/upsert?token="+Cookies.get("token"),
			      contentType: "application/json",
			      data: JSON.stringify({
				      name: name,
				      loginName: nums,
				      email: email,
              password:hex_sha1(psw),
				      lineIds: stripLine,
				      phone: tel,
				      projectId:100,
				      roleId: categoryId,
			      }),
			      success: function(data) {
				      if (data.code == 10000) {
					      People.int();
					      layer.msg("操作成功！", { icon: 1, time: 2000 });
					      layer.close(addIndex);
				      } else {
					      errormsg(data);
				      }
			      }
		      });
	      });

      }
    });
  },
  edit: function(accountId,id) {
    var addIndex = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["824px", "643px"],
      closeBtn: false,
      content:
      '<div class="addBox" id="peopleAdd">' +
      '<div class="add_header">修改人员资料<span class="project_icon"></span></div>' +
      '<div class="add_con">' +
      '<div class="add_con_left">' +
      '<div class="conBox">' +
      '<span class="title">姓名</span>' +
      '<div class="con"><input type="text" id="people-name" > </div></div>' +
      '<div class="conBox"><span class="title">工号</span><div class="con"><input type="number" disabled id="people-num" ></div>' +
      '</div>' +
      '<div class="conBox"><span class="title">联系电话</span>' +
      '<div class="con"><input type="number" style="text-indent: 55px;text-align: left" maxlength="11" id="people-call" placeholder="选填">' +
      '</div></div>' +
      '<div class="conBox"><span class="title">密码</span>' +
      '<div class="con"><div class="reset-btn">重置密码</div>' +
      '</div></div>' +
      '</div>' +
      '<div class="add_con_right">' +
      '<div class="conBox"><span class="title">邮箱地址</span><div class="con"><input type="text" id="people-email" placeholder="选填"></div></div>' +
      '<div class="conBox"><span class="title">条线</span><div class="con"><div class="strip-line"><div class="it"><input type="checkbox" name="lineInput" value=""><a></a></div></div></div></div>' +
      '<div class="conBox"><span class="title">角色</span><div class="con"><select id="order-category_id"></select></div></div>'+
      '<span class="notes">确认前请仔细核对信息，确保无误！</span></div></div>'+
      '<div class="btn-group-model"><button class="confirm">确认修改</button><button class="cancel">取消</button></div>',
      success: function() {
	      var typeName = true;
	      $(".cancel").click(function() {
		      layer.close(addIndex);
	      });
	      $.ajax({
		      type: "GET",
		      url:
		      DOMAIN +
		      "/sysDict/getSysDict?token=" +
		      Cookies.get("token")+"&name=DEVICE_CATEGORY",
		      contentType: "application/json",
		      success: function(data) {
			      var str =''
			      $.each(data.data, function(i, n) {
				      str +='<div class="it"><input type="checkbox" name="lineInput" value="'+n.param+'"><a>'+
					      n.value2 +
					      '</a></div>';
			      });
			      $(".strip-line").html(str);
		      }
	      }); // 获取条线
	      $.ajax({
		      type: "POST",
		      url:
		      DOMAIN +
		      "api/user/manage/list/role?token=" +
		      Cookies.get("token"),
		      contentType: "application/json",
		      success: function(data) {
			      var castr= '',
				      arr = [4,15,14,5,6,13,8,9,10,11];
			      $.each(data.data, function(i, n) {
				      if (arr.indexOf(n.id) !== -1 ) {
					      castr+='<option value="'+n.id+'">'+n.nameCn+'</option>'
				      }
			      });
			      $("#order-category_id").html(castr);
			      $('#people-name').bind('input propertychange', function() {
				      $.ajax({
					      type: "GET",
					      url:
					      DOMAIN +
					      "api/user/manage/count?token=" +
					      Cookies.get("token"),
					      data:{name: $(this).val(),
						      userId:id,
						      projectId:100,},
					      contentType: "application/json",
					      success: function (data) {
						      if (data.code = 110000) {
							      if (data.data === 0) {
								      typeName = true
							      }else {
								      typeName = false
							      }
						      }
					      }
				      })
			      });
			      $.ajax({
				      type: "GET",
				      url:
				      DOMAIN +
				      "api/user/manage/get"+
				      "?token=" +
				      Cookies.get("token")+
				      "&accountId="+accountId,
				      contentType: "application/json",
				      success: function(data) {
					      if (data.code == 10000) {
						    //  console.log(data.data)
                  var userData = data.data;
						      $('#people-name').val(userData.name)
						      $('#people-num').val(userData.code_no)
						      $('#people-call').val(userData.phone)
						      $('#people-psw').val(userData.password)
						      $('#people-email').val(userData.email)
                  var lines = userData.category_list.split(','),arr = [];
						      $.each(lines,function (i,n) {
							      if (n) {
								      arr.push(Number(n))
							      }
						      })
                  $.each($('.strip-line .it'),function (i,item) {
                    if (arr.indexOf(Number($(item).children().val())) !== -1) {
	                    $(item).children().attr('checked',true)
                    }
                  })
						      $("#order-category_id").val(userData.role_id);
					      } else {
						      errormsg(data);
					      }
				      }
			      });
		      }
	      }); // 获取角色
	      $("#peopleAdd .confirm").click(function() {
		      var name = $("#people-name").val(), // 姓名
			      nums = $("#people-num").val(), // 工号
			      tel = $("#people-call").val(), // 联系电话
			      psw = $("#people-psw").val(), // 预设密码
			      categoryId = $("#order-category_id").val(), // 角色
			      email = $("#people-email").val(), // 邮箱
			      stripLine = [];
		      $('input[name="lineInput"]:checked').each(
			      function(){
				      stripLine.push(this.value)
			      })
		      if (name == "") {
			      layer.tips("请输入人员名称！", "#people-name", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      if (!typeName) {
			      layer.tips("人员名称重复！", "#people-name", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      // if (tel == "") {
			     //  layer.tips("请输入电话号码！", "#people-call", {
				   //    tips: [2, "#50555C"]
			     //  });
			     //  return;
		      // }
		      // if (email == "") {
			     //  layer.tips("请输入邮箱！", "#people-email", {
				   //    tips: [2, "#50555C"]
			     //  });
			     //  return;
		      // }
		      if (stripLine.length === 0) {
			      layer.tips("请选择条线！", ".strip-line", {
				      tips: [2, "#50555C"]
			      });
			      return;
		      }
		      $.ajax({
			      url: DOMAIN + "api/user/manage/upsert?token="+Cookies.get("token"),
			      contentType: "application/json",
			      data: JSON.stringify({
				      name: name,
				      loginName: nums,
				      email: email,
				      lineIds: stripLine,
				      phone: tel,
				      projectId:100,
              id:id,
				      roleId: categoryId,
			      }),
			      success: function(data) {
				      if (data.code == 10000) {
					      peopleDetails.People.one(accountId);
					      layer.msg("操作成功！", { icon: 1, time: 2000 });
					      layer.close(addIndex);
				      } else {
					      errormsg(data);
				      }
			      }
		      });
	      });
	      // 重置密码
        $('.reset-btn').click(function () {
	        layer.confirm("密码会重置为123456", { icon: 3, title: false }, function(index) {
		        $.ajax({
			        url: DOMAIN + "api/user/manage/upsert?token="+Cookies.get("token"),
			        contentType: "application/json",
			        data: JSON.stringify({
				        id:id,
                password:123456
			        }),
			        success: function(data) {
				        if (data.code == 10000) {
					        layer.msg("操作成功！", { icon: 1, time: 2000 });
				        } else {
					        errormsg(data);
				        }
			        }
		        });
	        });
        })
      }
    });
  },
  del: function(id) {
    layer.confirm("确认删除吗？", { icon: 3, title: false }, function(index) {
	    $.ajax({
		    url: DOMAIN + "api/user/manage/delete",
		    data: {
			    token: Cookies.get("token"),
			    id:id
		    },
		    success: function(data) {
			    if (data.code == 10000) {
				    People.int();
				    layer.msg("操作成功！", { icon: 1, time: 2000 });
				    layer.close(addIndex);
			    } else {
				    errormsg(data);
			    }
		    }
	    });
    });
  },
  oneInt: function() {
    assist.getLine(1);
    People.one();
    var roleId = JSON.parse(localStorage.getItem("userInfo")).roleId;
    if (roleId === 1 || roleId === 2 || roleId === 3 || roleId === 4 || roleId === 14 || roleId === 15) {
      $(".peopleEdit").show();
      $(".peopleDel").show();
    } else {
      $(".peopleEdit").hide();
      $(".peopleDel").hide();
    }
    var permissionList = localStorage.getItem("permissionList").split(",");
    if (
      GetQueryString("id") !=
      JSON.parse(localStorage.getItem("userInfo")).accountId
    ) {
      if (
        $.inArray("32", permissionList) != -1 ||
        $.inArray("33", permissionList) != -1
      ) {
        People.peoPage();
      }
    } else {
      People.peoPage();
    }
    $(".table.peopleOne").delegate("td:nth-child(1)", "click", function() {
      parent.openHtml(
        "tpl/order_detail.html?id=" + $(this).attr("data-id"),
        "order"
      );
    });
    // 添加 事件记录——hss
    $(".table.peoplePatrol").delegate("td  span", "click", function() {
        if ($(this).attr("data-status") == '2') {
            parent.Patrol.fault($(this).attr("data-id"));
        }else {
            parent.Patrol.fault_nomal($(this).attr("data-id"));
        }
    });

    $(".ifm .dropdown ul").delegate("li a", "click", function() {
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
      if (
        $(this)
          .parentsUntil(".peopleOne")
          .parent()
          .hasClass("peopleOne")
      ) {
        People.peoPage();
      } else {
        People.pepPage();
      }
    });
    $(".tableTab").delegate("span", "click", function() {
      $(".tableTab span.on").removeClass();
      var index = $(this)
        .addClass("on")
        .index();
      $(".peopleDetails table")
        .hide()
        .eq(index)
        .fadeIn();
      if (index == 0) {
        if (
          GetQueryString("id") !=
          JSON.parse(localStorage.getItem("userInfo")).accountId
        ) {
          if (
            $.inArray("32", permissionList) != -1 ||
            $.inArray("33", permissionList) != -1
          ) {
            People.peoPage();
          }
        } else {
          People.peoPage();
        }
      } else {
        if (
          GetQueryString("id") !=
          JSON.parse(localStorage.getItem("userInfo")).accountId
        ) {
          if ($.inArray("39", permissionList) != -1) {
            People.pepPage();
          }
        } else {
          People.pepPage();
        }
      }
    });
    $(".peopleEdit").click(function() {
	    parent.People.edit(
	    $(this).parent().attr("data-account"),
	     $(this).parent().attr("data-id"));
    });
  },
  one: function(id) {
    var postID ;
    if (id) {
      postID = id
    }else {
      postID = GetQueryString("id")
    }
    $.ajax({
      type: "GET",
      url:
        DOMAIN +
        "api/user/manage/get"+
        "?token=" +
        Cookies.get("token")+
      "&accountId="+postID,
      contentType: "application/json",
      success: function(data) {
        if (data.code == 10000) {
        //  console.log(data.data.name)
          $(".peopleDetails header .con .face").attr("src", data.data.icon);
          $(".peopleDetails header .ziliao .boxcon1 .name-span").html(
	          data.data.name
          );
          $(".peopleDetails header .ziliao .boxcon1 .line").text(
            (data.data.category_name_cn_list == null
              ? " "
              : data.data.category_name_cn_list + " 部门 ") +
              data.data.role_name_cn
          );
          $(".peopleDetails header .ziliao .boxcon2 span:eq(0) i").html(
            data.data.code_no
          );
          $(".peopleDetails header .ziliao .boxcon2 span:eq(1) i").html(
            data.data.phone
          );
          $(".peopleDetails header .ziliao .boxcon2 span:eq(2) i").html(
            data.data.email
          );
          $(".peopleDetails header .operation").attr(
            "data-id",
            data.data.user_id
          );
	        $(".peopleDetails header .operation").attr(
		        "data-account",
		        data.data.id
	        );
	        $('.peopleDetails header .update-user-info span').html(data.data.updateInfo.userVO.name)
          $(".peopleDetails header .operation .peopleDel").click(function () {
            var id = $(this).parent().attr('data-id')
              People.del(id)
          })
        } else {
          errormsg(data);
        }
      }
    });
  },
  //设备详情-工单记录
  peoP: -1,
  peoPage: function() {
    People.peoP = -1;
    this.pe_order(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (People.peoP > -1) {
        clearInterval(t);
      }
      if (People.peoP <= 1) {
        return;
      }
      $(".ifm").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: People.peoP,
        current: 1,
        backFn: function(p) {
          People.pe_order(p);
        }
      });
    }, 80);
  },
  pe_order: function(pageNo) {
    $.ajax({
      url: DOMAIN + "repair/selectByAccountId",
      data: {
        token: Cookies.get("token"),
        accountId: GetQueryString("id"),
        category: $("#people-one-line").attr("data-status"),
        pageSize: 6,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          People.peoP = data.data.page.totalPage;
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              '<td data-id="' +
              n.order_id +
              '">' +
              (n.order_no == null ? "--" : n.order_no) +
              "</td>";
            str +=
              "<td><div style='width:250px;overflow-x:scroll;text-aligin:center;margin:0 auto;'>" +
              (n.device_category_name == null ? "--" : n.device_category_name) +
              "</div></td>";
            str +=
              "<td>" +
              ts2YmdHis(n.capture_at == null ? "" : n.capture_at) +
              "</td>";
            str += "<td>";
            switch (n.action) {
              case 1:
                str += "创建工单";
                break;
              case 2:
                str += "任务指派 ";
                $.each(n.ownerList, function(j, m) {
                  str += m.name + " ";
                });
                break;
              case 3:
                str += "完成工单";
                break;
              case 4:
                str += "提交无法完成";
                break;
              case 5:
                str += "更新工单记录";
                break;
              case 7:
                str += "完成工单";
                break;
              case 9:
                str += "提交检修报告";
                break;
              case 10:
                str += "权限共享给";
                $.each(n.lineList, function(j, m) {
                  str += m.value2 + " ";
                });
                break;
              case 11:
                str += "将工单变为特殊";
                break;
              case 12:
                str += "将 ";
                $.each(n.ownerList, function(j, m) {
                  str += m.name + " ";
                });
                str += "移除";
                break;
              case 13:
                str += "将该工单删除";
                break;
            }
            str += "</td>";
            str +=
              "<td>" + (n.device_name == null ? "--" : n.device_name) + "</td>";
            str += "</tr>";
          });
          $(".table.peopleOne tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  //抄表数据-查询设备的抄表详细数据/同APP
  pepP: -1,
  pepPage: function() {
    People.pepP = -1;
    this.pe_patrol(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (People.pepP > -1) {
        clearInterval(t);
      }
      if (People.pepP <= 1) return;
      $(".ifm").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: People.pepP,
        current: 1,
        backFn: function(p) {
          People.pe_patrol(p);
        }
      });
    }, 80);
  },
  pe_patrol: function(pageNo) {
    $.ajax({
      url: DOMAIN + "patrol/select/patrolByAccount",
      data: {
        token: Cookies.get("token"),
        dateDay: "",
        accountId: GetQueryString("id"),
        category: $("#people-one--roomline").attr("data-status"),
        beaconStatus: $("#roomSpecific").attr("data-status"),
        pageSize: 6,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          People.pepP = data.data.page.totalPage;
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str += "<td>" + (n.name == null ? "--" : n.name) + "</td>";
            str +=
              "<td><div style='width:250px;overflow-x:scroll;text-aligin:center;margin:0 auto;'>" +
              (n.categoryName == null ? "--" : n.categoryName) +
              "</div></td>";
            str +=
              "<td>" +
              ts2YmdHis(n.capture_at == null ? "" : n.capture_at) +
              "</td>";
              if (n.beaconStatus == 1 && n.eventStatus == 2) {
                str += '<td class="normal"><span class="normol_img"></span>正常 <span class="watch"></span></td>'
              } else if (n.beaconStatus == 1 && n.eventStatus == 1) {
                str += '<td class="normal"><img src="../img/icon_88.png" alt=" " class="status77">正常 <span data-id='+n.uuid+' data-status="1"' +
                 '   data-eventStatus="'+ n.eventStatus + '">查看</span></td>'
              }else if (n.beaconStatus != 1 && n.eventStatus == 1) {
                  str += '<td class="fault"><img src="../img/icon_88.png" alt=" " class="status77">有故障<span data-id=' + n.uuid +'   data-status= "2" ' +
                      '  data-eventStatus = "'+ n.eventStatus + '">查看</span></td>';
              }else {
               str += '<td class="fault"><span class="normol_img"></span>有故障<span  data-id="' + n.uuid + '"      data-status="2"   data-eventStatus=' + n.eventStatus + '>查看</span></td>';
              }
            str += "</tr>";
          });
          $(".table.peoplePatrol tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  }
};
//资产
var Device = {
  int: function() {
    assist.getLine();
    $('.AssetsBox .dev').show();
    $('.AssetsBox .mat').hide();
    this.Page();
    $(".ifm .dev .dropdown ul").delegate("li a", "click", function() {
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
      Device.Page();
    });
    $(".table.dev").delegate("td:nth-child(1)", "click", function() {
      openHtml(
        "tpl/device_detail.html?id=" + $(this).attr("data-id"),
        "device"
      );
    });
    $(".header .search.dev i").click(function() {
      Device.Page();
    });
  },
  listPage: -1,
  Page: function() {
    this.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page.dev").remove();
      if (Device.listPage > -1) {
        clearInterval(t);
      }
      if (Device.listPage <= 1) return;
      //console.log(Device.listPage)
      $(".AssetsBox").append("<div class='page dev'></div>");
      $(".page.dev").createPage({
        pageCount: Device.listPage,
        current: 1,
        backFn: function(p) {
          Device.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    var deviceNo = "",
      deviceName = "",
      beaconName = "",
      search = $(".search.dev input").val();
    switch ($(".search.dev select").val()) {
      case "1":
        deviceNo = search;
        break;
      case "2":
        deviceName = search;
        break;
      case "3":
        beaconName = search;
        break;
    }
    $.ajax({
      url: DOMAIN + "device/select/all",
      data: {
        token: Cookies.get("token"),
        status: $("#device_statu").attr("data-status"),
        category: $("#device_line").attr("data-status"),
        deviceNo: deviceNo,
        deviceName: deviceName,
        beaconName: beaconName,
        pageSize: 10,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          Device.listPage = data.data.page.totalPage;
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              '<td data-id="' +
              n.id +
              '">' +
              (n.device_no == null ? "--" : n.device_no) +
              "</td>";
            str +=
              "<td>" + (n.device_name == null ? "" : n.device_name) + "</td>";
            str +=
              "<td>" + (n.beacon_name == null ? "" : n.beacon_name) + "</td>";
            str +=
              "<td>" + (n.categoryName == null ? "" : n.categoryName) + "</td>";
            str +=
              n.status == 1
                ? '<td class="normal">正常</td>'
                : '<td class="fault">故障</td>';
            str += "</tr>";
          });
          $(".table.dev tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  oneInt: function() {
    assist.getLine();
    Device.one();
    Device.dvoPage();
    $(".table.peopleOne").delegate("td:nth-child(1)", "click", function() {
      parent.openHtml(
        "tpl/order_detail.html?id=" + $(this).attr("data-id"),
        "order"
      );
    });
    $(".dropdown ul").delegate("li a", "click", function() {
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
      Device.dvoPage();
    });
    $(".tableTab").delegate("span", "click", function() {
      $(".tableTab span.on").removeClass();
      var index = $(this)
        .addClass("on")
        .index();
      $(".peopleDetails table")
        .hide()
        .eq(index)
        .fadeIn();
      if (index == 0) {
        Device.dvoPage();
        $(".tableTab .tabledata").hide();
      } else {
        Device.dvpPage();
        $(".tableTab .tabledata").fadeIn();
      }
    });
    var statuStr =
      '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="" >全部</a></li>';
    $.each(assist.statusList, function(i, n) {
      statuStr +=
        '<li role="presentation"><a href="javascript:;" role="menuitem" tabindex="-1" data-page="' +
        (i + 1) +
        '" >' +
        n +
        "</a></li>";
    });
    $(".status ul").html(statuStr);
    var data = new Date();
    for (var q = 0; q < Number(data.getFullYear() - 2017 + 1); q++) {
      $(".tableTab .tabledata select:eq(0)")[0].add(
        new Option(data.getFullYear() - q, data.getFullYear() - q)
      );
    }
    for (var w = 1; w < 13; w++) {
      var e = w > 9 ? w : "0" + w;
      $(".tableTab .tabledata select:eq(1)")[0].add(new Option(e, e));
    }
    $(".tableTab .tabledata select:eq(1)").val(
      data.getMonth() + 1 > 9
        ? data.getMonth() + 1
        : "0" + (data.getMonth() + 1)
    );
    $(".tableTab .tabledata select").change(function() {
      Device.dvpPage();
    });
  },
  one: function() {
    $.ajax({
      url: DOMAIN + "device/select/byId",
      data: {
        token: Cookies.get("token"),
        deviceId: GetQueryString("id")
      },
      success: function(data) {
        if (data.code == 10000) {
          $(".ziliao .boxcon1 span:eq(0)").html(
            data.data.device_no == null ? "--" : data.data.device_no
          );
          $(".ziliao .boxcon1 span:eq(1)").html(
            data.data.device_name == null ? "--" : data.data.device_name
          );
          $(".ziliao .boxcon2 span:eq(0) i").html(
            data.data.categoryName == null ? "--" : data.data.categoryName
          );
          $(".ziliao .boxcon2 span:eq(1) i").html(
            data.data.beacon_name == null ? "--" : data.data.beacon_name
          );
          $(".ziliao .boxcon2 span:eq(2) i").html(
            (data.data.floor_name == null ? "--" : data.data.floor_name) +
              (data.data.building_name == null ? "--" : data.data.building_name)
          );
        } else {
          errormsg(data);
        }
      }
    });
  },
  //设备详情-工单记录
  dvoP: -1,
  dvoPage: function() {
    Device.dvoP = -1;
    this.dv_order(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Device.dvoP > -1) {
        clearInterval(t);
      }
      if (Device.dvoP <= 1) {
        return;
      }
      $(".ifm").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Device.dvoP,
        current: 1,
        backFn: function(p) {
          Device.dv_order(p);
        }
      });
    }, 80);
  },
  dv_order: function(pageNo) {
    $.ajax({
      url: DOMAIN + "device/select/byOrder",
      data: {
        token: Cookies.get("token"),
        deviceId: GetQueryString("id"),
        category: $("#device-one-line").attr("data-status"),
        status: $("#Specific").attr("data-status"),
        orderBy: $("#deviceTime").attr("data-status"),
        pageSize: 6,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          Device.dvoP = data.data.page.totalPage;
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              '<td data-id="' +
              n.id +
              '">' +
              (n.order_no == null ? "--" : n.order_no) +
              "</td>";
            str += "<td>" + (n.value2 == null ? "" : n.value2) + "</td>";
            str +=
              "<td>" +
              ts2YmdHis(n.capture_at == null ? "" : n.capture_at) +
              "</td>";
            str +=
              '<td class="' +
              assist.statusColor[n.status - 1] +
              '">' +
              assist.statusList[Number(n.status) - 1] +
              "</td>";
            str += "</tr>";
          });
          $(".table.peopleOne tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  //抄表数据-查询设备的抄表详细数据/同APP
  dvpP: -1,
  dvpPage: function() {
    Device.dvpP = -1;
    this.dv_param(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Device.dvpP > -1) {
        clearInterval(t);
      }
      if (Device.dvpP <= 1) return;
      $(".ifm").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Device.dvpP,
        current: 1,
        backFn: function(p) {
          Device.dv_param(p);
        }
      });
    }, 80);
  },
  dv_param: function(pageNo) {
    $.ajax({
      url: DOMAIN + "deviceData/select/isParam",
      data: {
        token: Cookies.get("token"),
        deviceId: GetQueryString("id"),
        month:
          $(".tabledata select:eq(0)").val() +
          "-" +
          $(".tabledata select:eq(1)").val(),
        pageSize: 3,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          Device.dvpP = data.data.page.totalPage;
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              "<td>" +
              ts2YmdHis(n.capture_at == null ? "" : n.capture_at) +
              "</td>";
            str += '<td class="jilu">';
            $.each(n.data, function(j, m) {
              str +=
                "<span>" +
                m.name +
                " <i>" +
                m.value +
                "</i> " +
                (m.unit == null ? "" : m.unit) +
                "</span>";
            });
            str += "</td>";
            str += "</tr>";
          });
          $(".table.cahobiao tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  }
};
//物料
var Materiel = {
  int:function(){
    $('.AssetsBox .dev').hide();
    $('.AssetsBox .mat').show();
    var btn = $('.AssetsBox button.OrderBox.mat');
    var manue=localStorage.getItem("permissionNameList");
    if(manue.indexOf('Material_Update_Grant')>-1){
        btn.click(function(){
            openHtml("tpl/materiel_people.html", "Materiel_people");
        }).show();
    }else{
        btn.hide()
    }
    if(manue.indexOf('Material_Update')>-1){
        $('.AssetsBox').removeClass('noMaterial_Update')
    }else{
        $('.AssetsBox').addClass('noMaterial_Update')
    }
    this.Page();
    $(".header .search.mat i").click(function() {
        Materiel.Page();
    });
    $(".table.mat").delegate("td .look", "click", function() {
        openHtml("tpl/materiel_record.html?id=" + $(this).parent().parent()[0]._data.id, "Materiel");
        localStorage.setItem('materielName',$(this).parent().parent()[0]._data.name)
    }).delegate("td .del", "click", function() {
        Materiel.del($(this).parent().parent()[0]._data)
    }).delegate("td .edit", "click", function() {
        Materiel.edit($(this).parent().parent()[0]._data)
    }).delegate("td .set", "click", function() {
        Materiel.set($(this).parent().parent()[0]._data)
    });
  },
  listPage: -1,
  Page: function() {
      this.listPage = -1;
      this.list(1);
      var t = setInterval(function() {
          $(".page.mat").remove();
          if (Materiel.listPage > -1) {
              clearInterval(t);
          }
          if (Materiel.listPage <= 1) return;
          $(".AssetsBox").append("<div class='page mat'></div>");
          $(".page.mat").createPage({
              pageCount: Materiel.listPage,
              current: 1,
              backFn: function(p) {
                  Materiel.list(p);
              }
          });
      }, 80);
  },
  list: function(pageNo) {
      var search = $(".search.mat input").val();
      $.ajax({
          url: DOMAIN + "material/getMaterialList",
          type:'get',
          data: {
              token: Cookies.get("token"),
              name:search,
              pageSize: 10,
              pageNo: pageNo
          },
          success: function(data) {
              if (data.code == 10000) {
                  Materiel.listPage = data.data.page.totalPage;
                  var Table = $(".table.mat tbody").html('')[0];
                  $.each(data.data.results, function(i, n) {
                    var tr = document.createElement('tr');
                    tr._data=n;
                    var str='';
                    str += '<td>' + (n.name == null ? "--" : n.name) + "</td>";
                    str += "<td>" + (n.categoryName == null ? "" : n.categoryName) + "</td>";
                    str += "<td class='"+(Number(n.nums)<Number(n.alarm_nums)?'fault':'')+"'>" + (n.nums == null ? "" : n.nums) + "</td>";
                    str += "<td>" + (n.alarm_nums == null ? "" : n.alarm_nums) + "</td>";
                    str += "<td>" + '<a class="btn_handle set">设置</a>' + '<a  class="btn_handle edit">编辑</a>' + '<a  class="btn_handle del">删除</a>' + '<a class="btn_handle look">查看</a>' + "</td>";
                    $(tr).html(str).appendTo(Table);
                  });
              } else {
                  errormsg(data);
              }
          }
      });
  },
  add:function(){
    layer.open({
        type: 1,
        title: false,
        shade: [0.1, "#000"],
        area: ["500px", "460px"],
        closeBtn: false,
        content:
        '<div class="addBox MaterielAdd">' +
          '<div class="add_header">添加物料<span class="project_icon"></span></div>' +
          '<div class="add_con" style="height:400px;padding-top: 10px;">' +
            '<div class="conBox"><span class="title">物料名称</span><div class="con"><input type="text" id="materiel-name" placeholder="物料名称" style="width:328px"></div></div>' +
            '<div class="conBox"><span class="title">物料数量</span><div class="con"><input type="number" id="materiel-num" placeholder="物料数量" style="width:328px" maxlength="15"></div></div>' +
            '<div class="conBox"><span class="title">选择条线</span><div class="con"><select id="materiel-category"></select></div></div>' +
            '<div class="conBox"><span class="title">警戒线</span><div class="con"><input type="number" id="materiel-warn" placeholder="警戒线" style="width:328px" maxlength="15"></div></div>' +
            '<button class="confirm" style="left:159px">确认添加</button>' +
            '<button class="cancel" style="right:120px">取消</button>' +
          '</div>' +
        '</div>',
        success: function(lay,index) {
            var castr='';
            for (var i=0;i<assist.LineList.length;i++){
                castr+='<option value="'+assist.LineList[i].category_list+'">'+assist.LineList[i].value2+'</option>'
            }
            $("#materiel-category").html(castr);
            $(".MaterielAdd .cancel").click(function() {
                layer.close(index);
            });
            $(".MaterielAdd .confirm").click(function() {
                var name = $("#materiel-name").val(),
                    nums = $("#materiel-num").val(),
                    alarm_nums = $("#materiel-warn").val();
                if (name == "") {
                    layer.tips("请输入物料名称！", "#materiel-name", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                if (nums == "") {
                    layer.tips("请输入物料数量！", "#materiel-num", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                if (alarm_nums == "") {
                    layer.tips("请输入警戒线！", "#materiel-warn", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                $.ajax({
                    url: DOMAIN + "material/addMaterial?token="+Cookies.get("token"),
                    contentType: "application/json",
                    data: JSON.stringify({
                        name: name,
                        nums: nums,
                        alarm_nums: alarm_nums,
                        category: $('#materiel-category').val()
                    }),
                    success: function(data) {
                        if (data.code == 10000) {
                            Materiel.Page();
                            layer.msg("操作成功！", { icon: 1, time: 2000 });
                            layer.close(index);
                        } else {
                            errormsg(data);
                        }
                    }
                });
            });
        }
    });
  },
  edit:function(data){
    layer.open({
        type: 1,
        title: false,
        shade: [0.1, "#000"],
        area: ["500px", "400px"],
        closeBtn: false,
        content:
        '<div class="addBox MaterielAdd">' +
          '<div class="add_header">修改物料<span class="project_icon"></span></div>' +
          '<div class="add_con" style="height:324px;padding-top: 10px;">' +
            '<div class="conBox"><span class="title">物料名称</span><div class="con"><span>'+data.name+'</span></div></div>' +
            '<div class="conBox"><span class="title">选择条线</span><div class="con"><select id="materiel-category"></select></div></div>' +
            '<div class="conBox"><span class="title">警戒线</span><div class="con"><input type="number" id="materiel-warn" placeholder="警戒线" style="width:328px" maxlength="15" value="'+data.alarm_nums+'"></div></div>' +
            '<button class="confirm" style="left:159px">确认修改</button>' +
            '<button class="cancel" style="right:120px">取消</button>' +
          '</div>' +
        '</div>',
        success: function(lay,index) {
            var castr='';
            for (var i=0;i<assist.LineList.length;i++){
                castr+='<option value="'+assist.LineList[i].category_list+'">'+assist.LineList[i].value2+'</option>'
            }
            $("#materiel-category").html(castr).val(data.categoryID);
            $(".MaterielAdd .cancel").click(function() {
                layer.close(index);
            });
            $(".MaterielAdd .confirm").click(function() {
                var alarm_nums = $("#materiel-warn").val();
                if (alarm_nums == "") {
                    layer.tips("请输入警戒线！", "#materiel-warn", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                $.ajax({
                    url: DOMAIN + "material/updateMaterial?token="+Cookies.get("token"),
                    data:{
                        materialID: data.id,
                        alarm_nums: alarm_nums,
                        categoryID: $('#materiel-category').val()
                    },
                    success: function(data) {
                        if (data.code == 10000) {
                            Materiel.Page();
                            layer.msg("操作成功！", { icon: 1, time: 2000 });
                            layer.close(index);
                        } else {
                            errormsg(data);
                        }
                    }
                });
            });
        }
    });
  },
  del:function(data){
      layer.confirm("是否确认删除物料"+data.name+"吗？", { icon: 3, title: "提示" }, function(index) {
          $.ajax({
              url: DOMAIN + "material/deleteMaterial",
              data: {
                  token: Cookies.get("token"),
                  id: data.id
              },
              success: function(data) {
                  if (data.code == 10000) {
                      Materiel.Page();
                      layer.msg("操作成功！", { icon: 1, time: 2000 });
                      layer.close(index);
                  } else {
                      errormsg(data);
                  }
              }
          });
      });
  },
  set:function(data){
    layer.open({
        type: 1,
        title: false,
        shade: [0.1, "#000"],
        area: ["500px", "430px"],
        closeBtn: false,
        content:
        '<div class="addBox MaterielAdd">' +
          '<div class="add_header">物料设置<span class="project_icon"></span></div>' +
          '<div class="add_con" style="height:353px;padding-top: 10px;">' +
            '<div class="conBox"><span class="title">物料名称</span><div class="con"><span>'+data.name+'</span></div></div>' +
            '<div class="conBox" ><span class="title">物料数量</span><div class="con AddNum" style="width:387px"><button class="numDel"></button><input type="number" id="materiel-num" placeholder="物料数量"  value="'+data.nums+'"><button class="numAdd"></button></div></div>' +
            '<div class="conBox"><span class="title">备注</span><div class="con"><textarea id="materiel-remark" placeholder="请填写备注内容"></textarea></div></div>' +
            '<button class="confirm" style="left:159px">确认修改</button>' +
            '<button class="cancel" style="right:120px">取消</button>' +
          '</div>' +
        '</div>',
        success: function(lay,index) {
            var nums=$('#materiel-num');
            $('.MaterielAdd .AddNum .numDel').click(function(){
                var val=Number(nums.val());
                val--;
                if(val<0){
                  val=0
                }
                nums.val(val)
            });
            $('.MaterielAdd .AddNum .numAdd').click(function(){
                var val=Number(nums.val());
                val++
                nums.val(val)
            });
            $(".MaterielAdd .cancel").click(function() {
                layer.close(index);
            });
            $(".MaterielAdd .confirm").click(function() {
                var num = nums.val(),
                    remark=$('#materiel-remark').val();
                if (num == "") {
                    layer.tips("请输入物料数量！", "#materiel-num", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                if (remark == "") {
                    layer.tips("请输入备注！", "#materiel-remark", {
                        tips: [2, "#50555C"]
                    });
                    return;
                }
                $.ajax({
                    url: DOMAIN + "material/setNumsByID",
                    data: {
                        token: Cookies.get("token"),
                        id: data.id,
                        nums: num,
                        remark: remark
                    },
                    success: function(data) {
                        if (data.code == 10000) {
                            Materiel.Page();
                            layer.msg("操作成功！", { icon: 1, time: 2000 });
                            layer.close(index);
                        } else {
                            errormsg(data);
                        }
                    }
                });
            });
        }
    });
  },
  look:function(){
      var name=localStorage.getItem('materielName');
      $('.matLookName').html(name);
      localStorage.removeItem('materielName');
      Materiel.trackingPage();
      $(".header.matLook .title").delegate("i", "click", function() {
          $(this).addClass("on").siblings('i').removeClass("on");
          $('.matLookList table').eq($(this).index()).show().siblings('table').hide();
          var tra=$('.matLookBox .tra'),sto=$('.matLookBox .sto');
          switch ($(this).index()) {
              case 0:
                  Materiel.trackingPage();
                  tra.show();
                  sto.hide();
                  break;
              case 1:
                  Materiel.stockPage();
                  tra.hide();
                  sto.show();
                  break;
          }
      });
  },
  trackingListPage: -1,
  trackingPage: function() {
      this.trackingListPage = -1;
      this.trackingList(1);
      var t = setInterval(function() {
          $(".page.tra").remove();
          if (Materiel.trackingListPage > -1) {
              clearInterval(t);
          }
          if (Materiel.trackingListPage <= 1) return;
          $(".matLookBox").append("<div class='page tra'></div>");
          $(".page.tra").createPage({
              pageCount: Materiel.trackingListPage,
              current: 1,
              backFn: function(p) {
                  Materiel.trackingList(p);
              }
          });
      }, 80);
  },
  trackingList: function(pageNo) {
      $.ajax({
          url: DOMAIN + "material/getRecord",
          type:'get',
          data: {
              token: Cookies.get("token"),
              material_id: GetQueryString('id'),
              type: 0,
              pageSize: 10,
              pageNo: pageNo
          },
          success: function(data) {
              if (data.code == 10000) {
                  Materiel.trackingListPage = data.data.page.totalPage;
                  var str = "";
                  $.each(data.data.results, function(i, n) {
                      str += "<tr>";
                      str += '<td>' + (n.order_no == null ? "--" : n.order_no) + "</td>";
                      str += "<td>" + (n.change_nums == null ? "" : n.change_nums) + "</td>";
                      str += "<td>" + (n.remain_nums == null ? "" : n.remain_nums) + "</td>";
                      str += "<td>" + (n.item_name == null ? "" : n.item_name) + "</td>";
                      str += "<td>" + (n.name == null ? "" : n.name) + "</td>";
                      str += "<td>" + ts2YmdHis(n.create_at,'yyyy-dd-mm') + "</td>";
                      str += "</tr>";
                  });
                  $(".table.tracking tbody").html(str);
              } else {
                  errormsg(data);
              }
          }
      });
  },
  stockListPage: -1,
  stockPage: function() {
      this.stockListPage = -1;
      this.stockList(1);
      var t = setInterval(function() {
          $(".page.sto").remove();
          if (Materiel.stockListPage > -1) {
              clearInterval(t);
          }
          if (Materiel.stockListPage <= 1) return;
          $(".matLookBox").append("<div class='page sto'></div>");
          $(".page.sto").createPage({
              pageCount: Materiel.stockListPage,
              current: 1,
              backFn: function(p) {
                  Materiel.stockList(p);
              }
          });
      }, 80);
  },
  stockList: function(pageNo) {
      $.ajax({
          url: DOMAIN + "material/getRecord",
          type:'get',
          data: {
              token: Cookies.get("token"),
              material_id: GetQueryString('id'),
              type: 1,
              pageSize: 10,
              pageNo: pageNo
          },
          success: function(data) {
              if (data.code == 10000) {
                  Materiel.stockListPage = data.data.page.totalPage;
                  var str = "";
                  $.each(data.data.results, function(i, n) {
                      str += "<tr>";
                      str += '<td>' + (n.change_nums == null ? "--" : n.change_nums) + "</td>";
                      str += "<td>" + (n.name == null ? "" : n.name) + "</td>";
                      str += "<td>" + ts2YmdHis(n.create_at,'yyyy-dd-mm') + "</td>";
                      str += "<td>" + (n.remark == null ? "" : n.remark) + "</td>";
                      str += "</tr>";
                  });
                  $(".table.stock tbody").html(str);
              } else {
                  errormsg(data);
              }
          }
      });
  },
  peopleInt:function(){
    this.peopleList();
    $('.matSelect.sele').delegate('i','click',function(){
        Materiel.delSelect($(this).parent().attr('data-id'))
    });
    $('.matSelect.nose').delegate('.selectItem','click',function(){
        Materiel.addSelect($(this).attr('data-id'))
    });
  },
  peopleList: function() {
    $.ajax({
        url: DOMAIN + "material/getUserList",
        type:'get',
        data: {
            token: Cookies.get("token")
        },
        success: function(data) {
            if (data.code == 10000) {
                var str_no = "",str_se = "";
                $.each(data.data.noPer, function(i, n) {
                    str_no += '<div class="selectItem" data-id="'+n.id+'"><span>'+n.name+'</span><span>'+n.code_no+'</span></div>';
                });
                $.each(data.data.hasPer, function(i, n) {
                    str_se += '<div class="selectItem" data-id="'+n.id+'"><span>'+n.name+'</span><span>'+n.code_no+'</span><i></i></div>';
                });
                $(".matSelect.nose").html(str_no);
                $(".matSelect.sele").html(str_se);
            } else {
                errormsg(data);
            }
        }
    });
  },
  delSelect:function(id){
      layer.confirm("是否取消该人员物料设置权限？", { icon: 3, title: "提示" }, function(index) {
          $.ajax({
              url: DOMAIN + "material/deleteUserPermission",
              data: {
                  token: Cookies.get("token"),
                  account_id: id
              },
              success: function(data) {
                  if (data.code == 10000) {
                      Materiel.peopleList();
                      layer.msg("操作成功！", { icon: 1, time: 2000 });
                      layer.close(index)
                  } else {
                      errormsg(data);
                  }
              }
          });
      });
  },
  addSelect:function(id){
      $.ajax({
          url: DOMAIN + "material/addUserPermission",
          data: {
              token: Cookies.get("token"),
              account_id: id
          },
          success: function(data) {
              if (data.code == 10000) {
                  Materiel.peopleList();
                  layer.msg("操作成功！", { icon: 1, time: 2000 });
              } else {
                  errormsg(data);
              }
          }
      });
  }
};
var Patrol = {
  int: function() {
    $(".patrol_date_time").delegate("li", "click", function() {
      $(".patrol_date_time .on").removeClass("on");
      var tot = $(this)
        .addClass("on")
        .children("span")
        .html()
        .split("/");
      $(".patrol_header h3 span").html(tot[0]);
      $(".patrol_header h3 i").html(tot[1]);
      Patrol.beaconHistory();
    });
    var nowdate = new Date();
    for (var i = 2016; i <= nowdate.getFullYear(); i++) {
      var op = new Option(i, i);
      if (i == nowdate.getFullYear()) {
        op.selected = true;
      }
      $(".patrol_date_select select:eq(0)")[0].options.add(op);
    }
    for (var u = 1; u <= 12; u++) {
      var op1 = new Option(u > 9 ? u : "0" + u, u > 9 ? u : "0" + u);
      if (u == nowdate.getMonth() + 1) {
        op1.selected = true;
      }
      $(".patrol_date_select select:eq(1)")[0].options.add(op1);
    }
    $(".patrol_date_select")
      .delegate("button", "click", function() {
        $(this).toggleClass("on");
        Patrol.history();
      })
      .delegate("select", "change", function() {
        Patrol.history();
      });
    this.history();
    $(".patrol_list").delegate("td:nth-child(1)", "click", function() {
      openHtml(
        "tpl/patrol_detail.html?id=" +
          $(this).attr("data-id") +
          "&time=" +
          $(".patrol_date_time ul li.on h6").html(),
        "patrol"
      );
    });
  },
  listPage: -1,
  Page: function() {
    this.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Patrol.listPage > -1) {
        clearInterval(t);
      }
      if (Patrol.listPage <= 1) return;
      $(".patrolDetails").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Patrol.listPage,
        current: 1,
        backFn: function(p) {
          Patrol.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    var data = new Date();
    $.ajax({
      url: DOMAIN + "patrol/select/patrolByAccount",
      data: {
        token: Cookies.get("token"),
        dateDay:
          data.getFullYear() +
          "-" +
          (data.getMonth() + 1 > 9
            ? data.getMonth() + 1
            : "0" + (data.getMonth() + 1)) +
          "-" +
          (data.getDate() > 9 ? data.getDate() : "0" + data.getDate()),
        category: $("#patrolLine").attr("data-status"),
        beaconStatus: $("#patrolStatus").attr("data-status"),
        pageSize: 8,
        pageNo: pageNo,
        accountId: ""
      },
      success: function(data) {
        if (data.code == 10000) {
          Patrol.listPage = data.data.page.totalPage;
          $(".patrol_header h2 span").html(data.patrolNum);
          $(".patrol_header h3 span").html(data.patrolNum);
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<tr>";
            str +=
              '<td data-id="' +
              n.create_by +
              '">' +
              (n.create_name == null ? "--" : n.create_name) +
              "</td>";
            str +=
              "<td>" +
              (n.categoryName == null ? "--" : n.categoryName) +
              "</td>";
            str += "<td>" + (n.name == null ? "--" : n.name) + "</td>";
            str +=
              "<td>" +
              ts2YmdHis(n.capture_at == null ? "" : n.capture_at) +
              "</td>";
            str +=
              n.beaconStatus == 1
                ? '<td class="normal">正常</td>'
                : '<td class="fault">有故障<span  data-id="' +
                  n.uuid +
                  '">查看</span></td>';
            str += "</tr>";
          });
          $(".patrol tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  //根据巡视uuid查询工单列表
  uuidList: function(uuid,type) {
    $.ajax({
      url: DOMAIN + "deviceOrder/select/byPUuid",
      data: {
        token: Cookies.get("token"),
        uuid: uuid
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "";
        //  console.log(type,'action09999')
          if (type == 2) {
              $.each(data.data, function(i, n) {
                  str += "<tr>";
                  str +=
                      '<td data-id="' +
                      n.orderId +
                      '">' +
                      (n.order_no == null ? "--" : n.order_no) +
                      "</td>";
                  str +=
                      "<td>" + (n.device_no == null ? "--" : n.device_no) + "</td>";
                  str +=
                      "<td>" + (n.device_name == null ? "--" : n.device_name) + "</td>";
                  str += "</tr>";
              });
              $(".faultBox table tbody").html(str);
              var strContent = '';
              if (data.record != null) {
                  strContent += '<span class="title" style="color:#000">事件记录报告</span><div class="item_box">' +
                   '<span class="lf_title">创建时间</span> ' +
                      '<span class="rg_txt">'+ts2YmdHis(data.record.create_at)+'</span></div>' +
                      '<div class="item_box"><span class="lf_title">巡视人员</span> <span class="rg_txt">'+data.record.user_name+'</span></div>'+
                      '<div class="item_box"><span class="lf_title">备注信息</span> <span class="rg_txt">'+data.record.content+'</span></div>'+
                      '<div class="item_box"><span class="lf_title">相关图片</span><p class="img_box">';
                      strContent += data.record.pic1?'<img src="'+data.record.pic1+'" />':'';
                      strContent += data.record.pic2?'<img src="'+data.record.pic2+'" />':'';
                      strContent += data.record.pic3?'<img src="'+data.record.pic3+'" />':'';
                      strContent += data.record.pic4?'<img src="'+data.record.pic4+'" />':'';
                  strContent +='</p></div>';
                  $(".faultBox .normalBox").html(strContent);
              } else {
                  $(".faultBox .normalBox").html(strContent);
              }
          } else {
            // console.log(data.record,'data.record')
      str += '<span class="title" style="color:#000">事件记录报告</span><div class="item_box"><span class="lf_title">创建时间</span> ' +
       '<span class="rg_txt">'+ ts2YmdHis(data.record.create_at) +'</span></div>' +
              '<div class="item_box"><span class="lf_title">巡视人员</span> <span class="rg_txt">'+data.record.user_name+'</span></div>'+
              '<div class="item_box"><span class="lf_title">备注信息</span> <span class="rg_txt">'+data.record.content+'</span></div>'+
              '<div class="item_box"><span class="lf_title">相关图片</span><p class="img_box">';
                str += data.record.pic1?'<img src="'+data.record.pic1+'" />':'';
                str += data.record.pic2?'<img src="'+data.record.pic2+'" />':'';
                str += data.record.pic3?'<img src="'+data.record.pic3+'" />':'';
                str += data.record.pic4?'<img src="'+data.record.pic4+'" />':'';
              str +='</p></div>';
              $(".normalBox").html(str);
          }

        } else {
          errormsg(data);
        }
      }
    });
  },
  fault: function(uuid) {
    var addIndex = layer.open({
      type: 1,
      title: false,
      shade: [0.1, "#000"],
      area: ["433px", "360px"],
      content:
        '<div class="faultBox"><span class="title" style="color:#333!important;font-size:14px;font-weight:600;">故障列表</span><table class="table text-center"><thead><tr><th>工单号</th><th>设备号</th><th>设备名称</th></tr></thead><tbody></tbody></table>' +
         '<div class="normalBox"></div>'+
          '</div>',
      success: function() {
        Patrol.uuidList(uuid,2);
          $(".faultBox").delegate(".img_box img","click",function(){
              alertImg.open($(this).attr("src"))
          })
        $(".faultBox table").delegate("td:nth-child(1)", "click", function() {
          layer.close(addIndex);
          parent.openHtml(
            "tpl/order_detail.html?id=" + $(this).attr("data-id"),
            "order"
          );
        });
      }
    });
  },
  fault_nomal: function(uuid) {
      var addIndex = layer.open({
          type: 1,
          title: false,
          shade: [0.1, "#000"],
          area: ["433px", "320px"],
          content:'<div class="normalBox"></div>',
          success: function() {
              $(".normalBox").delegate(".img_box img","click",function(){
                  alertImg.open($(this).attr("src"))
              })
              Patrol.uuidList(uuid,1);
          }
      });
  },
  history: function() {
    var date = new Date();
    var now =
      date.getFullYear() +
      "-" +
      (date.getMonth() + 1 > 9
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)) +
      "-" +
      (date.getDate() > 9 ? date.getDate() : "0" + date.getDate());
    $.ajax({
      url: DOMAIN + "patrol/select/patrolHistory",
      type: "get",
      data: {
        token: Cookies.get("token"),
        month:
          $(".patrol_date_select select:eq(0)").val() +
          "-" +
          $(".patrol_date_select select:eq(1)").val(),
        selectBy:
          $(".patrol_date_select button")[0].className.indexOf("on") < 0 ? 0 : 1
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "";
          $.each(data.data, function(i, n) {
            if (i == 0) {
              str += '<li class="on">';
            } else {
              str += "<li>";
            }
            str +=
              "<h6>" +
              n.capture_at +
              "</h6><span>" +
              n.patrolBeacon +
              "/" +
              n.beaconId +
              "</span>";
            if (n.capture_at == now) {
              str += '<i class="fault">今日</i>';
            }
            str += "</li>";
          });
          $(".patrol_date_time ul").html(str);
          var tot = $(".patrol_date_time ul .on")
            .children("span")
            .html();
          if (tot) {
            tot = tot.split("/");
          } else {
            tot = [0, 0];
          }
          $(".patrol_header h3 span").html(tot[0]);
          $(".patrol_header h3 i").html(tot[1]);
          Patrol.beaconHistory();
        } else {
          errormsg(data);
        }
      }
    });
  },
  beaconHistory: function() {
    $.ajax({
      url: DOMAIN + "patrol/select/beaconHistory",
      type: "get",
      data: {
        token: Cookies.get("token"),
        date: $(".patrol_date_time ul li.on h6").html()
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "",
            num = 0;
          $.each(data.data, function(i, n) {
            str += "<tr>";
            str += '<td data-id="' + n.id + '">' + n.name + "</td>";
            str += "<td>" + n.count_patrol + "次</td>";
            str +=
              n.count_patrol > 0
                ? '<td class="work">已巡</td>'
                : "<td>未巡</td>";
            str += "</tr>";
            num += Number(n.count_patrol);
          });
          $(".patrol_list table tbody").html(str);
          $(".patrol_header h2 span").html(num);
        } else {
          errormsg(data);
        }
      }
    });
  },
  enable: [],
  disable: [],
  flatpickr: null,
  oneInt: function() {
    $(".ifm .dropdown ul").delegate("li a", "click", function() {
      $(this)
        .parent()
        .parent()
        .prev()
        .attr("data-status", $(this).attr("data-page"));
      Patrol.onelist();
    });
    $(".table")
      .delegate("td:nth-child(1)", "click", function() {
        parent.openHtml(
          "tpl/people_detail.html?id=" + $(this).attr("data-id"),
          "people"
        );
      })
      .delegate("td  span", "click", function() {
     // console.log($(this).attr("data-status"),'pppppppppppp')
        if ($(this).attr("data-status") == 2) {
            Patrol.fault($(this).attr("data-id"));
        }else {
           Patrol.fault_nomal($(this).attr("data-id"));
        }

      });
    Flatpickr.l10n.weekdays.shorthand = [
      "日",
      "一",
      "二",
      "三",
      "四",
      "五",
      "六"
    ];
    Flatpickr.l10n.months.longhand = [
      "一月",
      "二月",
      "三月",
      "四月",
      "五月",
      "六月",
      "七月",
      "八月",
      "九月",
      "十月",
      "十一月",
      "十二月"
    ];
    this.flatpickr = $("#J-xl").flatpickr({
      altFormat: "yyyy-mm-dd",
      defaultDate: GetQueryString("time"),
      maxDate: "today",
      onChange: function(dateObj, dateStr, instance) {
        if ($("#J-xl").val() != "") {
          Patrol.onelist();
        }
      },
      monthmove: Patrol.patrolDate
    });
    var t = setInterval(function() {
      if ($("#J-xl").val() != "") {
        Patrol.onelist();
        clearInterval(t);
      }
    }, 80);
    this.patrolDate(0);
    $(".patrolDetails header span").html(
      parent
        .$(
          ".patrol_list tbody td:nth-child(1)[data-id=" +
            GetQueryString("id") +
            "]"
        )
        .html()
    );
  },
  //蓝牙当月有巡视的日期
  patrolDate: function(type, p) {
    var mm = Patrol.flatpickr.currentMonth + 1;
    if (typeof type != "string") {
      mm += type;
    }
    var month = Patrol.flatpickr.currentYear + "-" + (mm > 9 ? mm : "0" + mm);
    $.ajax({
      url: DOMAIN + "patrol/select/patrolDateByBeacon",
      type: "get",
      data: {
        token: Cookies.get("token"),
        month: month,
        beaconId: GetQueryString("id")
      },
      success: function(data) {
        if (data.code == 10000) {
          (Patrol.enable = []), (Patrol.disable = []);
          $.each(data.data, function(i, n) {
            Patrol.enable.push(n.captureAt);
          });
          if (Patrol.enable.length < 1) {
            Patrol.disable = [
              {
                from: month + "-01",
                to:
                  month +
                  "-" +
                  new Date(Patrol.flatpickr.currentYear, mm, 0).getDate()
              }
            ];
          }
          Patrol.flatpickr.config.enable = Patrol.enable;
          Patrol.flatpickr.config.disable = Patrol.disable;
          if (type == 1 || type == -1) return p(type);
          else if (type == 0)
            Patrol.flatpickr.set("enable", Patrol.enable),
              Patrol.flatpickr.set("disable", Patrol.disable);
          else if (type == "Y") p();
        } else {
          errormsg(data);
        }
      }
    });
  },
  onelist: function() {
    var data = new Date();
    $.ajax({
      url: DOMAIN + "patrol/select/patrolInfoByBeacon",
      type: "get",
      data: {
        token: Cookies.get("token"),
        date: $("#J-xl").val(),
        beaconId: GetQueryString("id")
      },
      success: function(data) {
        if (data.code == 10000) {
          var str = "";
          $.each(data.data, function(i, n) {
            str += "<tr>";
            str +=
              '<td data-id="' +
              n.user_id +
              '">' +
              (n.user_name == null ? "--" : n.user_name) +
              "</td>";
            str +=
              "<td>" + (n.role_name == null ? "--" : n.role_name) + "</td>";
            str += "<td>" + (n.time == null ? "" : n.time) + "</td>";
            //
              if (n.patrol_status == 1 && n.eventStatus == 2) {
                  str += '<td class="normal">正  常</td>'
              } else if (n.patrol_status == 1 && n.eventStatus == 1) {
                  str += '<td class="normal"><img src="../img/status_77.png" alt=" " class="status77">正  常 <span data-id='+n.uuid+ '  data-status = "1" ' +
                      'data-eventStatus= "'+n.eventStatus+'">查看</span></td>'
              } else if (n.patrol_status != 1 && n.eventStatus == 1) {
                  str += '<td class="fault"><img src="../img/status_77.png" alt=" " class="status77">有故障<span data-id=' + n.uuid +'   data-status= "2" ' +
                      '  data-eventStatus = "'+ n.eventStatus + '">查看</span></td>';
              } else{
                  str += '<td class="fault">有故障<span data-id=' + n.uuid +'   data-status= "2" ' +
                  '  data-eventStatus = "'+ n.eventStatus + '">查看</span></td>';
              }
              str += "</tr>";

          });
          $(".patrol_table tbody").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  }
};
var Wait = {
  int: function() {
    this.Page();
    $(".waitBox .wait_con").delegate(".c2 i", "click", function() {
      Wait.del($(this).attr("data-id"));
    });
    $(".wait_head button").click(function() {
      Wait.del("");
    });
  },
  listPage: -1,
  Page: function() {
    this.listPage = -1;
    this.list(1);
    var t = setInterval(function() {
      $(".page").remove();
      if (Wait.listPage > -1) {
        clearInterval(t);
      }
      if (Wait.listPage <= 1) return;
      $(".bodyRight").append("<div class='page'></div>");
      $(".page").createPage({
        pageCount: Wait.listPage,
        current: 1,
        backFn: function(p) {
          Wait.list(p);
        }
      });
    }, 80);
  },
  list: function(pageNo) {
    $.ajax({
      url: DOMAIN + "user/selectMessage",
      data: {
        token: Cookies.get("token"),
        pageSize: 4,
        pageNo: pageNo
      },
      success: function(data) {
        if (data.code == 10000) {
          Wait.listPage = data.data.page.totalPage;
          $(".wait_head .title i").html(data.data.page.totalCount);
          var str = "";
          $.each(data.data.results, function(i, n) {
            str += "<li>";
            str += '<div class="c1">';
            str +=
              '<span class="icon_wait_xt">' +
              (n.sender_name == null ? "系统" : n.sender_name) +
              "</span><i>" +
              ts2YmdHis(n.create_at) +
              "</i>";
            if (n.read_at == null) {
              str += "<b>[新]</b>";
            }
            str += "</div>";
            str +=
              '<span class="c2">' +
              n.content +
              '<i data-id="' +
              n.id +
              '"></i></span>';
            str += "</li>";
          });
          $(".waitBox .wait_con ul").html(str);
        } else {
          errormsg(data);
        }
      }
    });
  },
  del: function(id) {
    layer.confirm("确认删除消息?", { icon: 3, title: "提示" }, function(index) {
      $.ajax({
        url: DOMAIN + "user/deleteUserMsg",
        data: {
          token: Cookies.get("token"),
          id: id
        },
        success: function(data) {
          if (data.code == 10000) {
            Wait.Page();
            layer.msg("删除成功！", { icon: 1, time: 2000 });
            layer.close(index);
          } else {
            errormsg(data);
          }
        }
      });
    });
  }
};
function good() {
  var top = document.documentElement.scrollTop
    ? document.documentElement.scrollTop
    : document.body.scrollTop;
  var t = setInterval(function() {
    top += 10;
    document.body.scrollTop = top;
    document.documentElement.scrollTop = top;
    if (top >= 1800) {
      clearInterval(t);
    }
  }, 6);
}

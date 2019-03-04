angular.module("mydata", [])
	.factory("logo", function () {
		return "img/logo.png"
	})
	.factory("navList", function () {
		return [
			//空 0
			{
				isTracker: false,
				nav: []
			},
			//管理员 1
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "project",
						cn: "项目"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//总经理 2
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//区域经理 3
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//项目经理 4
			{
				isTracker: true,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//主管 5
			{
				isTracker: true,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//巡视 6
			{
				isTracker: true,
				nav: [
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//检修 7
			{
				isTracker: false,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//巡修员 8
			{
				isTracker: true,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//前台 9
			{
				isTracker: false,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					}
				]
			},
			//业主 10
			{
				isTracker: false,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					}
				]
			},
			//高级业主 11
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//主管代理 12
			{
				isTracker: false,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					}
				]
			},
			//供应商 13
			{
				isTracker: false,
				nav: [
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			}
			,//值班经理 14
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			},
			//部门经理 15
			{
				isTracker: false,
				nav: [
					// {
					// 	name: "admin",
					// 	cn: "总览"
					// },
					{
						name: "order",
						cn: "工单"
					},
					{
						name: "people",
						cn: "人员"
					},
					{
						name: "device",
						cn: "资产"
					},
					{
						name: "patrol",
						cn: "巡视"
					},
					{
						name: "ppm",
						cn: "PPM"
					}
				]
			}
		]
	})
	.factory("patrolNum", function () {
		return {}
	});

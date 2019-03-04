angular.module("mydirective",[])
.directive("mine",function(){
    return {
        restrict:"A",
        templateUrl:"tpl/mine.html",
        scope:{},
        link:function(scope){

        }
    }
});
var components = []
angular.module('ui').directive('uiCompile', ['$compile', '$rootScope', 'UiEvents',
    function ($compile, $rootScope, events) {
        function createInnerScope(id) {
            var innerScope = $rootScope.$new();
            innerScope.send = function(msg) {
                events.emit({id: id, msg: msg});
            };
            innerScope.getSend = function(d, cb) {
                console.log("test",cb)
                //return cb(events)
                //events.emit({id: id, msg: msg});
            };
            return innerScope;
        }
        
        return function(scope, element, attrs) {
            var id = scope.$eval('me.item.id');
            var name = JSON.stringify(scope.$eval('me'))
            var innerScope;
            
            scope.$watch(attrs.uiCompile,
                function(value) {
                    if (innerScope) innerScope.$destroy();
                    innerScope = createInnerScope(id); 
                    components.push({id: id, element: element, send: innerScope.send})
                    window.scope = innerScope;
                    var port = '<input portId="'+id+'" style="display:none" ng-bind="payload" ng-model="payload" type="text"/>\r\n'
                    var portScript = '<script>var sendit; $("[portId=\''+id+'\']").on("change", function(){if (!perform'+id.split('.')[0]+') {perform'+id.split('.')[0]+' = function(val){}}; var payload = $("[portId=\''+id+'\']"); return perform'+id.split(".")[0]+'(payload.val())})</script>\r\n'
                    value = value.replace(new RegExp(escapeRegExp('send({'), 'g'),"components.filter(function(component){return component.id === \""+id+"\"})[0].send({")
                    value = value.replace(new RegExp(escapeRegExp('perform('), 'g'),"perform"+id.split('.')[0]+"(")
                    element.html(port + portScript + value)
                    delete window.scope;
                    $compile(element.contents())(innerScope);
                }
            );
            
            scope.$watch('me.item.msg', function (value) {
                if (innerScope) {
                    innerScope.msg = value;
                }
            });
            
            scope.$on('$destroy', function() {
                if (innerScope)
                    innerScope.$destroy();
            });
        };
    }]);
    
function escapeRegExp(str) {
    return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}    
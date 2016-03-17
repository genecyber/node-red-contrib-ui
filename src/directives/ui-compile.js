var components = []
angular.module('ui').directive('uiCompile', ['$compile', '$rootScope', 'UiEvents',
    function ($compile, $rootScope, events) {
        function createInnerScope(id) {
            var innerScope = $rootScope.$new();
            innerScope.send = function(msg) {
                events.emit({id: id, msg: msg});
            };
            return innerScope;
        }
        
        return function(scope, element, attrs) {
            var id = scope.$eval('me.item.id');
            var innerScope;
            
            scope.$watch(attrs.uiCompile,
                function(value) {
                    if (innerScope) innerScope.$destroy();
                    innerScope = createInnerScope(id);
                    //console.log("ID", id, "element", element)
                    components.push({id: id, element: element})
                    window.scope = innerScope;
                    var port = '<input portId="'+id+'" style="display:none" ng-model="payload" type="text"/>\r\n'
                    //var portScript = '$("[portId=\''+id+'\']").on("change", function() {if (!perform) {perform = function(val){}}var payload = $("[portId=\''+id+'\']").val();return perform(payload)})'
                    //var portScript = '<script>var payload = $("[portId=\''+id+'\']")</script>\r\n'
                    var portScript = '<script>$("[portId=\''+id+'\']").on("change", function(){if (!perform) {perform = function(val){}}; var payload = $("[portId=\''+id+'\']"); return perform(payload.val())})</script>\r\n'
                    element.html(port + portScript + value);
                    //console.log("triggering change", element, value)
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
    
    
angular.module('ui').service('UiEvents', ['$timeout',
    function ($timeout) {
        var updateValueEventName = 'update-value';
        
        this.connect = function(onuiloaded, replaydone) {
            var socket = io({path: location.pathname + 'socket.io'});
            
            this.emit = function (event, msg) {
                if (typeof msg === 'undefined') {
                    msg = event;
                    event = updateValueEventName;
                }
                socket.emit(event, msg);
            };
            
            this.on = function(event, handler) {
                if (typeof handler === 'undefined') {
                    handler = event;
                    event = updateValueEventName;
                }
                
                var socketHandler = function(data) {
                    //console.log("data", data)
                    var element = components.filter(function(component){return component.id === data.id})
                    try {
                        try {
                            $(element[0].element[0]).trigger("change")

                            $($(element[0].element[0]).find("[ng-model='payload']")[0]).val(data.msg.payload)

                            $($(element[0].element[0]).find("[ng-model='payload']")[0]).trigger("change")
                        } catch(e){
                            //console.log("trigger error", e, element[0].element[0])
                        }
                    } catch(ex){}
                    $timeout(function() {
                        //console.log("handler",JSON.stringify(handler))
                        handler(data);
                    }, 0);
                };
                socket.on(event, socketHandler);
                return function() {
                    socket.removeListener(event, socketHandler);
                };
            };
            
            socket.on('ui-controls', function (data) {
                $timeout(onuiloaded(data, function() {
                    socket.emit('ui-replay-state');
                }), 0);
            });
            
            socket.on('ui-replay-done', function() {
                $timeout(replaydone, 0);
            });
        };
    }]);
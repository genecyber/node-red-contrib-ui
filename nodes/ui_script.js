module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ScriptNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;       
        //var done = ui.addScript(config.name, config.link, config.icon, config.order)    
        var done = ui.add({
            forwardInputMessages: true,
            storeFrontEndInputAsState: true,
            emitOnlyNewValues: false,
            node: node, 
            tab: tab, 
            group: config.group, 
            control: {
                type: 'script',
                order: config.order,
                format: config.format
            },
            beforeEmit: function(msg, value) {
                var properties = Object.getOwnPropertyNames(msg).filter(function (p) {return p[0] != '_';});
                var clonedMsg = { };
                
                for (var i=0; i<properties.length; i++) {
                    var property = properties[i];
                    clonedMsg[property] = msg[property];
                }
                
                return { msg: clonedMsg };
            },
            beforeSend: function (msg, original) {
                if (original)
                    return original.msg;
            }
        }); 
        node.on("close", done);
    }

    RED.nodes.registerType("ui_script", ScriptNode);
};
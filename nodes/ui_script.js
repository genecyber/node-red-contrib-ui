module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function ScriptNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;       
        var done = ui.addScript(config.name, config.link, config.icon, config.order)        
        node.on("close", done);
    }

    RED.nodes.registerType("ui_script", ScriptNode);
};
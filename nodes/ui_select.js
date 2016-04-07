module.exports = function(RED) {
    var ui = require('../ui')(RED);

    function SelectNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        var tab = RED.nodes.getNode(config.tab);
        if (!tab) return;

        var done = ui.add({
            forwardInputMessages: false,
            storeFrontEndInputAsState: false,
            node: node,
            tab: tab,
            group: config.group,
            control: {
                type: 'select',
                label: config.name,
                topic: config.topic,
                mode:  config.mode,
                delay: config.delay,
                format: config.format,
                order: config.order,
                value: ''
            },
            beforeSend: function (msg) {
                msg.topic = config.topic;
            },
        });

        node.on("close", done);
    }

    RED.nodes.registerType("ui_select", SelectNode);
};

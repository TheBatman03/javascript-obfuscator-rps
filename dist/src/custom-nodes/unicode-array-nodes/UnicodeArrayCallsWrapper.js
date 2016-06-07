"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var esprima = require('esprima');
var AppendState_1 = require("../../enums/AppendState");
var Node_1 = require('../Node');
var NodeUtils_1 = require("../../NodeUtils");
var Utils_1 = require("../../Utils");

var UnicodeArrayCallsWrapper = function (_Node_1$Node) {
    _inherits(UnicodeArrayCallsWrapper, _Node_1$Node);

    function UnicodeArrayCallsWrapper(unicodeArrayCallsWrapperName, unicodeArrayName, unicodeArray) {
        var options = arguments.length <= 3 || arguments[3] === undefined ? {} : arguments[3];

        _classCallCheck(this, UnicodeArrayCallsWrapper);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(UnicodeArrayCallsWrapper).call(this, options));

        _this.appendState = AppendState_1.AppendState.AfterObfuscation;
        _this.unicodeArrayCallsWrapperName = unicodeArrayCallsWrapperName;
        _this.unicodeArrayName = unicodeArrayName;
        _this.unicodeArray = unicodeArray;
        _this.node = _this.getNodeStructure();
        return _this;
    }

    _createClass(UnicodeArrayCallsWrapper, [{
        key: "appendNode",
        value: function appendNode(blockScopeNode) {
            NodeUtils_1.NodeUtils.insertNodeAtIndex(blockScopeNode.body, this.getNode(), 1);
        }
    }, {
        key: "getNodeIdentifier",
        value: function getNodeIdentifier() {
            return this.unicodeArrayCallsWrapperName;
        }
    }, {
        key: "getNode",
        value: function getNode() {
            if (!this.unicodeArray.length) {
                return;
            }
            this.updateNode();
            return _get(Object.getPrototypeOf(UnicodeArrayCallsWrapper.prototype), "getNode", this).call(this);
        }
    }, {
        key: "getNodeStructure",
        value: function getNodeStructure() {
            var keyName = Utils_1.Utils.getRandomVariableName(),
                node = void 0;
            node = esprima.parse("\n            var " + this.unicodeArrayCallsWrapperName + " = function (" + keyName + ") {\n                return " + this.unicodeArrayName + "[parseInt(" + keyName + ", 0x010)];\n            };\n        ");
            NodeUtils_1.NodeUtils.addXVerbatimPropertyToLiterals(node);
            return NodeUtils_1.NodeUtils.getBlockScopeNodeByIndex(node);
        }
    }]);

    return UnicodeArrayCallsWrapper;
}(Node_1.Node);

exports.UnicodeArrayCallsWrapper = UnicodeArrayCallsWrapper;

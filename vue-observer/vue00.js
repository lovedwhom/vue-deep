
    function myVue(options) {
        this._init(options);
    }

myVue.prototype._init = function (options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods = options.methods;

    this._binding = {};
    this._obverse(this.$data);
    this._complie(this.$el);
}

myVue.prototype._obverse = function (obj) {
    var _this = this;
    Object.keys(obj).forEach(function (key) {
        if (obj.hasOwnProperty(key)) {
            _this._binding[key] = {
                _directives: []
            };
            console.log(_this._binding[key])
            var value = obj[key];
            if (typeof value === 'object') {
                _this._obverse(value);
            }
            var binding = _this._binding[key];
            Object.defineProperty(_this.$data, key, {
                enumerable: true,
                configurable: true,
                get: function () {
                    console.log(`${key}获取${value}`);
                    return value;
                },
                set: function (newVal) {
                    console.log(`${key}更新${newVal}`);
                    if (value !== newVal) {
                        value = newVal;
                        binding._directives.forEach(function (item) {
                            item.update();
                        })
                    }
                }
            })
        }
    })
}

myVue.prototype._complie = function (root) {
    var _this = this;
    var nodes = root.children;
    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.children.length) {
            this._complie(node);
        }

        if (node.hasAttribute('v-click')) {
            node.onclick = (function () {
                var attrVal = nodes[i].getAttribute('v-click');
                return _this.$methods[attrVal].bind(_this.$data);
            })();
        }

        if (node.hasAttribute('v-model') && (node.tagName = 'INPUT' || node.tagName == 'TEXTAREA')) {
            node.addEventListener('input', (function(key) {
                var attrVal = node.getAttribute('v-model');
                _this._binding[attrVal]._directives.push(new Watcher(
                    'input',
                    node,
                    _this,
                    attrVal,
                    'value'
                ))

                return function() {
                    _this.$data[attrVal] =  nodes[key].value;
                }
            })(i));
        }

        if (node.hasAttribute('v-bind')) {
            var attrVal = node.getAttribute('v-bind');
            _this._binding[attrVal]._directives.push(new Watcher(
                'text',
                node,
                _this,
                attrVal,
                'innerHTML'
            ))
        }
    }
}

function Watcher(name, el, vm, exp, attr) {
    this.name = name;         //指令名称，例如文本节点，该值设为"text"
    this.el = el;             //指令对应的DOM元素
    this.vm = vm;             //指令所属myVue实例
    this.exp = exp;           //指令对应的值，本例如"number"
    this.attr = attr;         //绑定的属性值，本例为"innerHTML"

    this.update();
}

Watcher.prototype.update = function () {
    this.el[this.attr] = this.vm.$data[this.exp];
}

window.onload = function() {
        var app = new myVue({
            el:'#app',
            data: {
                number: 0,
                count: 0,
            },
            methods: {
                increment: function() {
                    this.number ++;
                },
                incre: function() {
                    this.count ++;
                }
            }
        })
    }
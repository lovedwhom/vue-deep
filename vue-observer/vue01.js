function Vue(options) {
    this._init(options)
}

Vue.prototype._init = function (options) {
    this.$options = options;
    this.$el = document.querySelector(options.el);
    this.$data = options.data;
    this.$methods= options.methods;

    this._binding = {}
    this._observe (this.$data)

    this._complie(this.$el)
}

Vue.prototype._observe = function (obj) {
    var _this = this;
    Object.keys(obj).forEach(function (key) {

        if(obj.hasOwnProperty(key)){
            _this._binding[key] ={
                _directives:[]
            }
            var value = obj[key]
            if(typeof value === "object"){
                _this._observe(value)
            }
            var binding = _this._binding[key]
            Object.defineProperty(_this.$data,key,{
                enumerable:true,
                configurable:true,

                get:function () {
                    console.log(`${key}获取${value}`);
                    return value
                },
                set:function (newValue) {
                    console.log(`${key}更新${newValue}`);
                    if(value !== newValue){
                        value = newValue
                        binding._directives.forEach(function (item) {
                            item.update()
                        })
                    }
                }
            })
        }
    })
}

function Watcher(name,el,vm,exp,attr) {
    this.name = name
    this.el = el
    this.vm = vm        //指令所属vue实例
    this.exp = exp;     //绑定得值
    this.attr = attr;

    this.update()
}

Watcher.prototype.update = function () {
    this.el[this.attr] = this.vm.$data[this.exp]
}


Vue.prototype._complie = function (root) {
    var _this = this
    var nodes = root.children

    for (var i = 0; i<nodes.length;i++){
        var node = nodes[i];
        if (node.children.length) {
            this._complie(node)
        }

        if (node.hasAttribute('v-click')) {
            node.addEventListener('click',(function (key) {
                var attrVal = nodes[key].getAttribute('v-click')
                return _this.$methods[attrVal].bind(_this.$data)
            })(i))
        }

        if (node.hasAttribute('v-model')&& (node.tagName == 'INPUT' || node.tagName == 'TEXTAREA')) {
            node.addEventListener('input',(function (key) {
                var attrVal = nodes[key].getAttribute('v-model')
                _this._binding[attrVal]._directives.push(new Watcher(
                    'input',
                    node,
                    _this,
                    attrVal,
                    'value'
                ))

                return function () {
                    _this.$data[attrVal] = nodes[key].value
                }
            })(i))
        }

        if (node.hasAttribute('v-bind')) {
            var attrVal = node.getAttribute('v-bind')
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

window.onload =function () {
    new Vue({
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

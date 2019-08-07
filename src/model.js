import f from './f.js'
import extend from './extend.js'

function Model(obj) {
  f.call(this, obj)
}

Model.prototype = extend(f.prototype)

Model.prototype.constructor = Model

Model.prototype.update = function(o, e) {
  return !(o.end < e) && ((o.K = o.x), (o.L = o.y), true)
}

export default Model

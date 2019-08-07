function extend(prototype) {
  function ctor() {}
  ctor.prototype = prototype

  return new ctor()
}

export default extend

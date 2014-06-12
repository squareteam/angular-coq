'use strict';


function ResourceMock() {
  this.$$routeVariables = [];
}


function getResourceMock () {
  return new ResourceMock();
}

(function() {

  ResourceMock.prototype.addCustomMethod = function(method) {
    ResourceMock.prototype[method] = function(params, cb, errb) {
      return angular.isFunction(params) ? this.behavior.call(this, params, cb) : this.behavior.call(this, cb, errb);
    };
  };

  ResourceMock.prototype.shouldSucceed = function() {
    this.behavior = function(cb) {
      cb();
    };
  };

  ResourceMock.prototype.shouldFail = function() {
    this.behavior = function(cb, errb) {
      errb();
    };
  };

  angular.forEach(['get', 'query', 'save','remove','delete'], function(method) {
    ResourceMock.prototype[method] = function(params, cb, errb) {
      return angular.isFunction(params) ? this.behavior.call(this, params, cb) : this.behavior.call(this, cb, errb);
    };
  });


})();
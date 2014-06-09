'use strict';
angular.module('coq', [
  'ngResource',
  'ngSanitize'
]);
angular.module('coq').config([
  '$provide',
  function ($provide) {
    $provide.decorator('$resource', function ($delegate) {
      var $wrapper = function resourceWrapper() {
        var url = arguments[0], variables = [], inst = $delegate.apply(arguments);
        angular.forEach(url.split(/\W/), function (param) {
          if (param && new RegExp('(^|[^\\\\]):' + param + '\\W').test(url)) {
            variables.push(param);
          }
        });
        inst.$$routeVariables = variables;
        return inst;
      };
      return $wrapper;
    });
  }
]);
/* globals extend */
'use strict';
angular.module('coq').provider('Coq', function () {
  function conditionBuilder(queryObject, ModelClass) {
    if (!angular.isObject(queryObject) && ModelClass.prototype.$resource.$$routeVariables.length === 1) {
      var attribute = false, query = {};
      angular.forEach(ModelClass.prototype.$resource.$$routeVariables, function (variableName) {
        angular.forEach(ModelClass.$attributesDefinition, function (_, attrName) {
          if (variableName === attrName) {
            attribute = attrName;
          }
        });
      });
      if (attribute) {
        query[attribute] = queryObject;
        return query;
      } else {
        return queryObject;
      }
    } else {
      return queryObject;
    }
  }
  this.$conditionBuilder = conditionBuilder;
  // this.$valueValidator = function(value) {
  //   return  angular.isString(value) || angular.isNumber(value) ||
  //           angular.isBoolean(value) || angular.isObject(value) || angular.isArray(value);
  // };
  this.$get = [
    '$q',
    function ($q) {
      var RESERVED_PROPS = [
          '$resource',
          '$attributes',
          '$statics'
        ], RESERVED_STATICS = [
          'find',
          'all'
        ], self = this;
      function CoqModel(resourceInstance) {
        angular.forEach(resourceInstance, function (value, key) {
          if (!angular.isFunction(value) && key[0] !== '$' && Object.keys(this.constructor.$attributesDefinition).indexOf(key) !== -1) {
            this.$attributes[key] = value;
          }
        }, this);
        this.save = function () {
          return this.$resource.$save(this.$attributes).$promise;
        };
        this.destroy = function () {
          return this.$resource.$destroy(this.$attributes).$promise;
        };
        this.update = function () {
          return this.$resource.$update(this.$attributes).$promise;
        };
      }
      ///////////////////
      // Model helpers //
      ///////////////////
      function addCustomMethods(modelClass, config) {
        angular.forEach(config, function (method, key) {
          if (RESERVED_PROPS.indexOf(key) === -1) {
            modelClass.prototype[key] = method;
          }
        });
        angular.forEach(config.$statics, function (method, key) {
          if (RESERVED_STATICS.indexOf(key) === -1) {
            modelClass[key] = method;
          }
        });
      }
      /////////////////////////////
      // Resource object helpers //
      /////////////////////////////
      function addResourceObject(ModelClass, config) {
        if (!config.$resource || !config.$resource.$$routeVariables) {
          throw new Error('model declaration : resource object invalid');
        } else {
          ModelClass.prototype.$resource = config.$resource;
        }
      }
      ////////////////////////////
      // Finder methods helpers //
      ////////////////////////////
      function addFinders(Model, resource) {
        Model.find = function CoqFinder(queryObject) {
          var defer = $q.defer();
          queryObject = self.$conditionBuilder(queryObject, Model);
          resource(queryObject, function (resourceInstance) {
            defer.resolve(new Model(resourceInstance));
          }, defer.reject);
          return defer.promise;
        };
        Model.all = function () {
          var defer = $q.defer();
          resource.query(function (resourceInstances) {
            var modelInstances = [];
            angular.forEach(resourceInstances, function (resourceInstance) {
              modelInstances.push(new Model(resourceInstance));
            });
            defer.resolve(modelInstances);
          }, defer.reject);
          return defer.promise;
        };
      }
      ///////////////////////
      // Callbacks helpers //
      ///////////////////////
      function CoqModelFactory(config) {
        if (!angular.isObject(config)) {
          throw new Error('config parameter missing');
        }
        function ModelClass() {
          ModelClass.superconstructor.apply(this, arguments);
        }
        extend(ModelClass, CoqModel);
        addResourceObject(ModelClass, config);
        addFinders(ModelClass, ModelClass.prototype.$resource);
        addCustomMethods(ModelClass, config);
        ModelClass.$attributesDefinition = config.$attributes || {};
        ModelClass.prototype.$attributes = {};
        return ModelClass;
      }
      return { factory: CoqModelFactory };
    }
  ];
});
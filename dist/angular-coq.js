'use strict';
angular.module('coq', [
  'ngResource',
  'ngSanitize'
]);
angular.module('coq').config([
  '$provide',
  function ($provide) {
    // Add $$routeVariables to every $resource instance
    //  > Because resourceFactory keep route object, make it
    //    unreachable outside the $resource instance
    //    
    //  Route class is also unreachable outside the $resource service,
    //  that's why this snippet is used here
    $provide.decorator('$resource', function ($delegate) {
      var $wrapper = function resourceWrapper() {
        var url = arguments[0], variables = [], parts = url.split('/'), inst = $delegate.apply($delegate, arguments);
        angular.forEach(parts, function (param) {
          if (param[0] === ':') {
            variables.push(param.substr(1));
          }
        });
        inst.$$routeVariables = variables;
        return inst;
      };
      return $wrapper;
    });
  }
]);
'use strict';
angular.module('coq').directive('CoqModel', function () {
  return {
    scope: {
      forUsers: '=',
      redirectPath: '@'
    },
    restrict: 'A'
  };
});
/* globals extend */
'use strict';
angular.module('coq').provider('Coq', function () {
  // Used to generate params to pass to $resource instance when
  // trying to load a record via `find()`
  function conditionBuilder(queryObject, ModelClass) {
    if (!angular.isObject(queryObject) && ModelClass.$resource.$$routeVariables.length === 1) {
      var attribute = false, query = {};
      angular.forEach(ModelClass.$resource.$$routeVariables, function (variableName) {
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
  // $conditionBuilder is customizable
  this.$conditionBuilder = conditionBuilder;
  // this.$valueValidator = function(value) {
  //   return  angular.isString(value) || angular.isNumber(value) ||
  //           angular.isBoolean(value) || angular.isObject(value) || angular.isArray(value);
  // };
  this.$get = [
    '$q',
    function ($q) {
      var IGNORE_CONFIG_KEYS = [
          '$attributes',
          '$statics'
        ], RESERVED_STATICS = [
          'find',
          'all'
        ], self = this;
      // Parent class of all CoqModel
      //  Provide $attributes + CRUD method for current record
      function CoqModel(attributes) {
        if (angular.isObject(attributes)) {
          angular.forEach(attributes, function (value, key) {
            if (!angular.isFunction(value) && key[0] !== '$' && Object.keys(this.constructor.$attributesDefinition).indexOf(key) !== -1) {
              console.log('add', key, value);
              this[key] = value;
            }
          }, this);
        }
        this.save = function () {
          return this.$resource.save(this.$toObject()).$promise;
        };
        this.destroy = function () {
          return this.$resource['delete'](this.$toObject()).$promise;
        };
        // $resource does not provide PUT action by default
        if (angular.isFunction(this.$resource.update)) {
          this.update = function () {
            return this.$resource.$update({}, this.$toObject()).$promise;
          };
        }
        this.$toObject = function () {
          var values = {};
          angular.forEach(this, function (value, key) {
            if (!angular.isFunction(value) && this.hasOwnProperty(key) && Object.keys(this.constructor.$attributesDefinition).indexOf(key) !== -1) {
              values[key] = value;
            }
          }, this);
          return values;
        };
      }
      ////////////////////////////
      // Finder methods helpers //
      ////////////////////////////
      // Add `find()` and `all()` methods to `ModelClass`
      function addFinders(ModelClass, resource) {
        ModelClass.find = function CoqFinder(queryObject) {
          var defer = $q.defer();
          queryObject = self.$conditionBuilder(queryObject, ModelClass);
          resource.get(queryObject, function (resourceInstance) {
            var model = new ModelClass(resourceInstance);
            model.$resource = resource;
            defer.resolve(model);
          }, defer.reject);
          return defer.promise;
        };
        ModelClass.all = function () {
          var defer = $q.defer();
          resource.query(function (resourceInstances) {
            var modelInstances = [];
            angular.forEach(resourceInstances, function (resourceInstance) {
              var model = new ModelClass(resourceInstance);
              model.$resource = resource;
              modelInstances.push(model);
            });
            defer.resolve(modelInstances);
          }, defer.reject);
          return defer.promise;
        };
      }
      ///////////////////////
      // Callbacks helpers //
      ///////////////////////
      // Given a `config` return a class that inherit from `CoqModel`
      function CoqModelFactory(config) {
        if (!angular.isObject(config)) {
          throw new Error('config parameter missing');
        }
        if (!config.$resource || !config.$resource.$$routeVariables) {
          throw new Error('model declaration : resource object invalid');
        }
        function ModelClass() {
          ModelClass.superconstructor.apply(this, arguments);
        }
        extend(ModelClass, CoqModel);
        // augment model instance properties/methods
        var addToPrototype = angular.copy(config);
        angular.forEach(config, function (value, key) {
          if (IGNORE_CONFIG_KEYS.indexOf(key) !== -1) {
            delete addToPrototype[key];
          }
        });
        angular.extend(ModelClass.prototype, addToPrototype);
        // augment model static properties/methods
        var addToStatics = {};
        if (angular.isObject(config.$statics)) {
          angular.forEach(config.$statics, function (value, key) {
            if (RESERVED_STATICS.indexOf(key) === -1) {
              addToStatics[key] = value;
            }
          });
          angular.extend(ModelClass, addToStatics);
        }
        ModelClass.$resource = config.$resource;
        addFinders(ModelClass, ModelClass.$resource);
        ModelClass.$attributesDefinition = config.$attributes || {};
        return ModelClass;
      }
      return { factory: CoqModelFactory };
    }
  ];
});
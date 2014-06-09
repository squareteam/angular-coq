/* globals extend */

'use strict';

angular.module('coq').provider('Coq', function() {

  // Used to generate params to pass to $resource instance when
  // trying to load a record via `find()`
  function conditionBuilder (queryObject, ModelClass) {
    
    if (!angular.isObject(queryObject) && ModelClass.$resource.$$routeVariables.length === 1) {
      var attribute = false,
          query = {};

      angular.forEach(ModelClass.$resource.$$routeVariables, function(variableName) {
        angular.forEach(ModelClass.$attributesDefinition, function(_, attrName) {
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

  this.$get = function($q) {

    var RESERVED_PROPS    = ['$resource', '$attributes', '$statics'],
        RESERVED_STATICS  = ['find', 'all'],
        self = this;


    // Parent class of all CoqModel
    //  Provide $attributes + CRUD method for current record
    function CoqModel (resourceInstance) {
      
      this.$resource = resourceInstance;

      angular.forEach(this.$resource, function(value, key) {
        if (!angular.isFunction(value) && key[0] !== '$' && Object.keys(this.constructor.$attributesDefinition).indexOf(key) !== -1) {
          this.$attributes[key] = value;
        }
      }, this);

      this.save = function() {
        return this.constructor.$resource.save(this.$attributes).$promise;
      };

      this.destroy = function() {
        return this.constructor.$resource['delete'](this.$attributes).$promise;
      };
      
      // this.update = function() {
      //   return this.$resource.$update({}, this.$attributes).$promise;
      // };

    }

    ///////////////////
    // Model helpers //
    ///////////////////

    // Attach custom instance/statics methods to `modelClass`
    // using given `config`
    function addCustomMethods (modelClass, config) {
      angular.forEach(config, function(method, key) {
        if (RESERVED_PROPS.indexOf(key) === -1) {
          modelClass.prototype[key] = method;
        }
      });

      angular.forEach(config.$statics, function(method, key) {
        if (RESERVED_STATICS.indexOf(key) === -1) {
          modelClass[key] = method;
        }
      });
    }

    /////////////////////////////
    // Resource object helpers //
    /////////////////////////////

    // Validate $resource instance passed to `config`
    function validateResourceObject (config) {
      if (!config.$resource || !config.$resource.$$routeVariables) {
        throw new Error('model declaration : resource object invalid');
      }
    }


    ////////////////////////////
    // Finder methods helpers //
    ////////////////////////////

    // Add `find()` and `all()` methods to `ModelClass`
    function addFinders (ModelClass, resource) {

      ModelClass.find = function CoqFinder(queryObject) {
        var defer = $q.defer();

        queryObject = self.$conditionBuilder(queryObject, ModelClass);

        resource.get(queryObject, function(resourceInstance) {
          defer.resolve(new ModelClass(resourceInstance));
        }, defer.reject);

        return defer.promise;
      };

      ModelClass.all = function() {
        var defer = $q.defer();

        resource.query(function(resourceInstances) {
          var modelInstances = [];
          angular.forEach(resourceInstances, function(resourceInstance) {
            modelInstances.push(new ModelClass(resourceInstance));
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

      function ModelClass() {
        ModelClass.superconstructor.apply(this, arguments);
      }

      extend(ModelClass, CoqModel);

      validateResourceObject(config);

      ModelClass.$resource = config.$resource;

      addFinders(ModelClass, ModelClass.$resource);

      addCustomMethods(ModelClass, config);

      ModelClass.$attributesDefinition = config.$attributes || {};

      ModelClass.prototype.$attributes = {};

      return ModelClass;
    }


    return {
      factory : CoqModelFactory
    };
  };

});
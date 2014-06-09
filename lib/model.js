/* globals extend */

'use strict';

angular.module('coq').provider('Coq', function() {

  function conditionBuilder (queryObject, ModelClass) {
    
    if (!angular.isObject(queryObject) && ModelClass.prototype.$resource.$$routeVariables.length === 1) {
      var attribute = false,
          query = {};

      angular.forEach(ModelClass.prototype.$resource.$$routeVariables, function(variableName) {
        angular.forEach(ModelClass.prototype.$attributes, function(_, attrName) {
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

  this.$valueValidator = function(value) {
    return  angular.isString(value) || angular.isNumber(value) ||
            angular.isBoolean(value) || angular.isObject(value) || angular.isArray(value);
  };

  this.$get = function($q) {

    var RESERVED_PROPS    = ['$resource', '$attributes', '$statics'],
        RESERVED_STATICS  = ['find', 'all'],
        self = this;

    function CoqModel () {
      
      this.save = function() {};
      this.destoy = function() {};
      this.save = function() {};

    }

    ///////////////////
    // Model helpers //
    ///////////////////

    function addCustomMethods (modelClass, config) {
      angular.forEach(config, function(method, key) {
        if (RESERVED_PROPS.indexOf(key) === -1) {
          modelClass.prototype[key] = method;
        }
      });

      angular.forEach(config.$statics, function(method, key) {
        if (RESERVED_STATICS.indexOf(key) === -1) {
          modelClass.prototype[key] = method;
        }
      });
    }

    /////////////////////////////
    // Resource object helpers //
    /////////////////////////////

    function addResourceObject (ModelClass, config) {
      if (!config.$resource || !config.$resource.$$routeVariables) {
        throw new Error('model declaration : resource object invalid');
      } else {
        ModelClass.prototype.$resource = config.$resource;
      }
    }


    ////////////////////////////
    // Finder methods helpers //
    ////////////////////////////

    function addFinders (Model, resource) {

      Model.find = function CoqFinder(queryObject) {
        var defer = $q.defer();

        queryObject = self.$conditionBuilder(queryObject, Model);

        resource(queryObject, function(response) {
          defer.resolve(new Model(response));
        }, defer.reject);

        return defer.promise;
      };

      Model.all = function() {
        var defer = $q.defer();

        resource.query(function(response) {
          defer.resolve(new Model(response));
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
        ModelClass.superconstructor.call(this, arguments);
      }

      extend(ModelClass, CoqModel);

      addResourceObject(ModelClass, config);

      addFinders(ModelClass, ModelClass.prototype.$resource);

      addCustomMethods(ModelClass, config);

      ModelClass.prototype.$attributes = config.$attributes;

      return ModelClass;
    }


    return {
      factory : CoqModelFactory
    };
  };

});
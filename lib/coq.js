/* globals extend */

'use strict';

angular.module('coq').provider('Coq', function() {

  // Used to generate params to pass to $resource instance when
  // trying to load a record via `find()`
  function conditionBuilder (queryObject /*, ModelClass*/) {
    return queryObject;
  }

  // $conditionBuilder is customizable
  this.$conditionBuilder = conditionBuilder;

  this.$get = function($q) {

    var IGNORE_CONFIG_KEYS    = ['$attributes', '$statics', '$primaryKey'],
        RESERVED_STATICS      = ['find', 'all'],
        CALLBACKS_JOINPOINTS  = [
        '$beforeSave',
        '$afterSave',
        '$beforeDestroy',
        '$afterDestroy',
        '$beforeUpdate',
        '$afterUpdate'
      ];


    // Parent class of all CoqModel
    //  Provide $attributes + CRUD method for current record
    function CoqModel (attributes) {

      if (angular.isObject(attributes)) {
        angular.forEach(attributes, function(value, key) {
          if (!angular.isFunction(value) && key[0] !== '$' && Object.keys(this.constructor.$attributesDefinition).indexOf(key) !== -1) {
            this[key] = value;
          }
        }, this);
      }

      // TODO : allow to create custom joinpoints

      var actions =  {
        'save'    : 'save',
        'destroy' : 'delete'
      };

      // $resource does not provide PUT action by default
      if (angular.isFunction(this.$resource.update)) {
        actions.update = 'update';
      }

      function callResource (action) {
        return this.$resource[action](this.$toObject()).$promise;
      }

      function callCallbacks (name, type) {
        return $q.pipeline(this.callbacks['$' + type + name]);
      }

      angular.forEach(actions, function(action, name) {
        var nameCapitalize = name[0].toUpperCase() + name.substr(1);

        this[name] = function() {
          var defer = $q.defer();
          callCallbacks.call(this, nameCapitalize, 'before').then(
            angular.bind(this, callResource, action),
            defer.reject
          )
          .then(angular.bind(this, callCallbacks, nameCapitalize, 'after'), defer.reject)
          .then(defer.resolve, defer.reject);

          return defer.promise;
        };
      }, this);

      this.$toObject = function() {
        var values = {};
        angular.forEach(this, function(value, key) {
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

    // Add `find()`, `all()` and `where()` methods to `ModelClass`
    function addFinders (ModelClass, resource) {

      ModelClass.find = function CoqFinder(value) {
        var defer = $q.defer(),
            query = {};

        if (!ModelClass.$primaryKey && ModelClass.$resource.$$routeVariables.length === 1) {
          var attribute = false;

          angular.forEach(ModelClass.$resource.$$routeVariables, function(variableName) {
            angular.forEach(ModelClass.$attributesDefinition, function(_, attrName) {
              if (variableName === attrName) {
                attribute = attrName;
              }
            });
          });

          if (attribute) {

            query[attribute] = value;

          }

        } else if (ModelClass.$primaryKey) {
          query[ModelClass.$primaryKey] = value;
        }

        if (Object.keys(query).length) {
          resource.get(query, function(resourceInstance) {
            var model = new ModelClass(resourceInstance);
            model.$resource = resource;
            defer.resolve(model);
          }, defer.reject);
        } else {
          defer.reject(new Error('unable to locate primary key'));
        }

        return defer.promise;
      };

      ModelClass.where = function(queryObject) {
        var defer = $q.defer();

        resource.query(queryObject, function(resourceInstances) {
          var modelInstances = [];
          angular.forEach(resourceInstances, function(resourceInstance) {
            var model = new ModelClass(resourceInstance);
            model.$resource = resource;
            modelInstances.push(model);
          });
          defer.resolve(modelInstances);
        }, defer.reject);

        return defer.promise;
      };

      ModelClass.all = function() {
        return ModelClass.where({});
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

      var callbacksDefault = {};
      angular.forEach(CALLBACKS_JOINPOINTS, function(callbackJoinpoint) {
        callbacksDefault[callbackJoinpoint] = [];
      });
      ModelClass.prototype.callbacks = callbacksDefault;

      // augment model instance properties/methods
      var addToPrototype = {};
      angular.forEach(config, function(value, key) {
        if (CALLBACKS_JOINPOINTS.indexOf(key) !== -1) {
          ModelClass.prototype.callbacks[key] = angular.isArray(value) ? value : [value];
        } else if (IGNORE_CONFIG_KEYS.indexOf(key) === -1) {
          addToPrototype[key] = value;
        }
      });

      angular.extend(ModelClass.prototype, addToPrototype);

      // augment model static properties/methods
      var addToStatics = {};
      if (angular.isObject(config.$statics)) {
        angular.forEach(config.$statics, function(value, key) {
          if (RESERVED_STATICS.indexOf(key) === -1) {
            addToStatics[key] = value;
          }
        });
        angular.extend(ModelClass, addToStatics);
      }

      ModelClass.$resource = config.$resource;

      addFinders(ModelClass, ModelClass.$resource);

      ModelClass.$attributesDefinition = config.$attributes || {};

      if (config.$primaryKey) {
        if (Object.keys(ModelClass.$attributesDefinition).indexOf(config.$primaryKey) !== -1) {
          ModelClass.$primaryKey = config.$primaryKey;
        } else {
          throw new Error('$primaryKey "' + config.$primaryKey + '" not in $attributes');
        }
      }

      return ModelClass;
    }


    return {
      factory : CoqModelFactory
    };
  };

});

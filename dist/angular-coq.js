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
/* globals extend */
'use strict';
angular.module('coq').provider('Coq', function () {
  // Used to generate params to pass to $resource instance when
  // trying to load a record via `find()`
  function conditionBuilder(queryObject) {
    return queryObject;
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
          '$statics',
          '$primaryKey'
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
      // Add `find()`, `all()` and `where()` methods to `ModelClass`
      function addFinders(ModelClass, resource) {
        ModelClass.find = function CoqFinder(value) {
          var defer = $q.defer(), query = {};
          if (!ModelClass.$primaryKey && ModelClass.$resource.$$routeVariables.length === 1) {
            var attribute = false;
            angular.forEach(ModelClass.$resource.$$routeVariables, function (variableName) {
              angular.forEach(ModelClass.$attributesDefinition, function (_, attrName) {
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
            resource.get(query, function (resourceInstance) {
              var model = new ModelClass(resourceInstance);
              model.$resource = resource;
              defer.resolve(model);
            }, defer.reject);
          } else {
            defer.reject(new Error('unable to locate primary key'));
          }
          return defer.promise;
        };
        ModelClass.where = function (queryObject) {
          var defer = $q.defer();
          resource.query(queryObject, function (resourceInstances) {
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
        ModelClass.all = function () {
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
        if (config.$primaryKey) {
          if (Object.keys(ModelClass.$attributesDefinition).indexOf(config.$primaryKey) !== -1) {
            ModelClass.$primaryKey = config.$primaryKey;
          } else {
            throw new Error('$primaryKey "' + config.$primaryKey + '" not in $attributes');
          }
        }
        return ModelClass;
      }
      return { factory: CoqModelFactory };
    }
  ];
});
'use strict';
angular.module('coq').service('coqModelFormInputs', function () {
  return {
    'text': { 'type': 'text' },
    'number': { 'type': 'number' },
    'email': { 'type': 'email' },
    'url': { 'type': 'url' },
    'radio': { 'type': 'radio' },
    'hidden': { 'type': 'hidden' },
    'checkbox': { 'type': 'checkbox' }
  };
});
angular.module('coq').provider('coqModelForm', function () {
  var inputDefinitionsModulesToLoad = ['coqModelFormInputs'];
  this.registerInputs = function (mixed) {
    inputDefinitionsModulesToLoad.push(mixed);
  };
  this.$get = [
    '$injector',
    function ($injector) {
      var inputsDefinitions = {};
      angular.forEach(inputDefinitionsModulesToLoad, function (module) {
        angular.extend(inputsDefinitions, $injector.get(module));
      });
      return {
        getInputAttributes: function (type) {
          return inputsDefinitions[type] || {};
        }
      };
    }
  ];
});
'use strict';
angular.module('coq').directive('coqModelAttribute', [
  '$compile',
  '$log',
  'coqModelForm',
  function ($compile, $log, coqModelForm) {
    return {
      priority: 101,
      require: '?^coqModel',
      restrict: 'A',
      link: function (scope, element, attrs, coqModelController) {
        if (!coqModelController) {
          $log.error('coq-model-attribute need a parent element with coq-model directive');
          return;
        }
        var type = coqModelController.coqModel.$attributesDefinition[attrs.coqModelAttribute] || false;
        if (type) {
          element.attr(coqModelForm.getInputAttributes(type));
          element.attr('ng-model', coqModelController.coqModelName + '.' + attrs.coqModelAttribute);
        }
      }
    };
  }
]);
/* global $ */
'use strict';
angular.module('coq').controller('coqModelController', [
  '$scope',
  '$parse',
  function ($scope, $parse) {
    this.init = function (attrs) {
      this.coqModel = $parse(attrs.coqModel)($scope).constructor;
      this.coqModelName = attrs.coqModel;
      this.insertMode = [
        'append',
        'replace',
        'prepend'
      ].indexOf(attrs.coqModelInsertMode) !== -1 ? attrs.coqModelInsertMode : 'append';
    };
  }
]);
angular.module('coq').directive('coqModel', [
  '$compile',
  function ($compile) {
    return {
      priority: 102,
      controller: 'coqModelController',
      restrict: 'A',
      link: {
        pre: function (scope, element, attrs, coqModelController) {
          coqModelController.init(attrs);
          if (element[0].tagName === 'FORM' && !$(element).find('input[coq-model-attribute]').length) {
            var paragraph, input, paragraphs = [];
            angular.forEach(coqModelController.coqModel.$attributesDefinition, function (type, name) {
              paragraph = document.createElement('p');
              input = document.createElement('input');
              angular.element(input).attr('coq-model-attribute', name);
              angular.element(paragraph).append(input);
              paragraphs.push(paragraph);
            });
            if (coqModelController.insertMode === 'replace') {
              element.empty();
              element.append(paragraphs);
            } else {
              element[coqModelController.insertMode](paragraphs);
            }
            $compile(element.contents())(scope);
            paragraphs = null;
          }
        },
        post: function (scope, iElement) {
          $compile(iElement.contents())(scope);
        }
      }
    };
  }
]);
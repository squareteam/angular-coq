'use strict';

angular.module('coq').service('coqModelFormInputs', function() {
  return {
    // Default angular inputs
    'text'      : { 'type' : 'text' },
    'number'    : { 'type' : 'number' },
    'email'     : { 'type' : 'email' },
    'url'       : { 'type' : 'url' },
    'radio'     : { 'type' : 'radio' },
    'hidden'    : { 'type' : 'hidden' },
    'checkbox'  : { 'type' : 'checkbox' }
  };
});

angular.module('coq').provider('coqModelForm', function() {
  var inputDefinitionsModulesToLoad = ['coqModelFormInputs'];

  this.registerInputs = function(mixed) {
    inputDefinitionsModulesToLoad.push(mixed);
  };

  this.$get = function($injector) {
    var inputsDefinitions = {};
    angular.forEach(inputDefinitionsModulesToLoad, function(module) {
      angular.extend(inputsDefinitions, $injector.get(module));
    });

    return {
      // Given a input config, return attributes to add to element
      getInputAttributes : function(inputConfig) {
        return angular.isString(inputConfig) ? (inputsDefinitions[inputConfig] || {}) : inputConfig;
      }
    };
  };

});
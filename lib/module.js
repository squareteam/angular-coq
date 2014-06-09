'use strict';

angular.module('coq', [
  'ngResource',
  'ngSanitize'
]);


angular.module('coq').config(function($provide) {

  $provide.decorator('$resource', function($delegate) {

    var $wrapper = function resourceWrapper() {
      var url       = arguments[0],
          variables = [],
          inst      = $delegate.apply(arguments);

      angular.forEach(url.split(/\W/), function(param){
        if (param && (new RegExp('(^|[^\\\\]):' + param + '\\W').test(url))) {
          variables.push(param);
        }
      });

      inst.$$routeVariables = variables;
      return inst;
    };

    return $wrapper;

  });
});
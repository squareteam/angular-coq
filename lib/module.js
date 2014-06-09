'use strict';

angular.module('coq', [
  'ngResource',
  'ngSanitize'
]);


angular.module('coq').config(function($provide) {

  // Add $$routeVariables to every $resource instance
  //  > Because resourceFactory keep route object, make it
  //    unreachable outside the $resource instance
  //    
  //  Route class is also unreachable outside the $resource service,
  //  that's why this snippet is used here
  $provide.decorator('$resource', function($delegate) {

    var $wrapper = function resourceWrapper() {
      var url       = arguments[0],
          variables = [],
          parts     = url.split('/'),
          inst      = $delegate.apply($delegate, arguments);

      angular.forEach(parts, function(param){
        if (param[0] === ':') {
          variables.push(param.substr(1));
        }
      });

      inst.$$routeVariables = variables;
      return inst;
    };

    return $wrapper;

  });
});
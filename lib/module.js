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
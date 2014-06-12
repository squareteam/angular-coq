'use strict';


angular.module('coq').config(function($provide) {

  $provide.decorator('$q', function($delegate) {

    $delegate.pipeline = function(tasks, defaultValue) {
      var tasksLength = tasks.length;

      if (tasksLength) {
        return (function() {
          var defer = $delegate.defer();
          function callTask (i, lastResult) {
            $delegate.when(tasks[i](lastResult)).then(function(result) {
              if (i + 1 < tasksLength) {
                callTask(i + 1, result);
              } else {
                defer.resolve(result);
              }
            }, function(error) {
              defer.reject(error);
            });
          }
          callTask(0, defaultValue);

          return defer.promise;
        })();
      } else {
        return $delegate.when(defaultValue);
      }
    };

    return $delegate;

  });
});
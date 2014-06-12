'use strict';

angular.module('coq').directive('coqModelAttribute', function($compile, $log, coqModelForm) {
  return {
    priority  : 101,
    require   : '?^coqModel',
    restrict  : 'A',
    link: function(scope, element, attrs, coqModelController) {
      if (!coqModelController) {
        $log.error('coq-model-attribute need a parent element with coq-model directive');
        return;
      }

      var inputConfig = coqModelController.coqModel.$attributesDefinition[attrs.coqModelAttribute] || false;
      if (inputConfig) {
        element.attr(coqModelForm.getInputAttributes(inputConfig));
        element.attr('ng-model', coqModelController.coqModelName + '.' + attrs.coqModelAttribute);
      }
    }
  };

});

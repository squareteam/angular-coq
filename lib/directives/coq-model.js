/* global $ */
'use strict';

angular.module('coq').controller('coqModelController', function($scope, $parse) {
  this.init = function(attrs) {
    this.coqModel     = $parse(attrs.coqModel)($scope).constructor;
    this.coqModelName = attrs.coqModel;
    this.insertMode   = (['append', 'replace', 'prepend'].indexOf(attrs.coqModelInsertMode) !== -1) ? attrs.coqModelInsertMode : 'append';
  };
});

angular.module('coq').directive('coqModel', function($compile) {
  return {
    priority    : 102,
    controller  : 'coqModelController',
    restrict    : 'A',
    link : {
      pre : function(scope, element, attrs, coqModelController) {

        coqModelController.init(attrs);

        if (element[0].tagName === 'FORM' && !$(element).find('input[coq-model-attribute]').length) {
          var paragraph, input, paragraphs = [];
          angular.forEach(coqModelController.coqModel.$attributesDefinition, function(type, name) {
            paragraph = document.createElement('p');
            input     = document.createElement('input');
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
        } else {
          element.addClass('coq-clean');
        }
      },
      post : function (scope, iElement) {
        if (!$(iElement).hasClass('coq-clean')) {
          $compile(iElement.contents())(scope);
        }
      }
    }
  };

});

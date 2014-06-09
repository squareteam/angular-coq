'use strict';

describe('Coq $resource decorator', function() {

  var $resource;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    $resource = $injector.get('$resource');
  }));

  it('should add $$routeVariables property on instances', function() {
    var myResource = $resource('http://api.example.com/users/:id/');
    expect(myResource.$$routeVariables).toEqual(['id']);
  });
  
});
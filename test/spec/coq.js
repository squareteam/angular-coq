'use strict';

describe('Coq', function() {

  var Coq,
      $resource, $rootScope;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    Coq         = $injector.get('Coq');
    
    $resource   = $injector.get('$resource');
    $rootScope  = $injector.get('$rootScope');
  }));

  describe('API', function() {
    
    it('should provide a factory method', function() {
      expect(!!Coq.factory).toBe(true);
    });
    
    it('should throw if factory called without config', function() {
      expect(function() {
        Coq.factory();
      }).toThrow(new Error('config parameter missing'));
    });

  });

  describe('Model declaration', function() {
    
    it('should throw if given resource is invalid', function() {
      expect(function() {
        Coq.factory({
          $resource : null
        });
      }).toThrow(new Error('model declaration : resource object invalid'));
    });

  });

});
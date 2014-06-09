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

  describe('Finders', function() {
    
    var myModel, resourceMockSpy,
        errorCallback, successCallback;

    beforeEach(function() {

      errorCallback   = jasmine.createSpy('error');
      successCallback = jasmine.createSpy('success');

    });

    describe('should succeed to', function() {


      beforeEach(function() {
        var successDeferred = function(cb) {
          cb();
        },
            resourceMock = function(params, cb, errb) {
          return successDeferred(cb, errb);
        };

        resourceMockSpy = jasmine.createSpy('resourceMock', resourceMock);
        resourceMockSpy.and.callThrough();

        resourceMockSpy.query = successDeferred;

        resourceMockSpy.$$routeVariables = ['id'];

        myModel = Coq.factory({
          $resource : resourceMockSpy,

          $attributes : {
            id : {
              type : 'number'
            }
          }
        });
      });
      
      it('find a record', function() {

        myModel.find(1).then(successCallback, errorCallback);

        $rootScope.$digest();

        expect(resourceMockSpy.calls.argsFor(0)[0]).toEqual({ id : 1 });

      });

      it('find all records', function() {

        myModel.all().then(successCallback, errorCallback);

        $rootScope.$digest();

      });

      afterEach(function() {
        expect(errorCallback.calls.any()).toEqual(false);
        expect(successCallback.calls.count()).toEqual(1);
      });

    });

    describe('should fail to', function() {

      beforeEach(function() {
        var errorDeferred = function(cb, errb) {
          errb();
        }, resourceFailingMock = function(params, cb, errb) {
          return errorDeferred(cb, errb);
        };

        resourceFailingMock.query = errorDeferred;

        resourceFailingMock.$$routeVariables = ['id'];

        myModel = Coq.factory({
          $resource : resourceFailingMock
        });
      });
      
      it('find a record should fail', function() {

        myModel.find(1).then(successCallback, errorCallback);

        $rootScope.$digest();

      });

      it('find all records', function() {

        myModel.all().then(successCallback, errorCallback);

        $rootScope.$digest();

      });

      afterEach(function() {
        expect(successCallback.calls.any()).toEqual(false);
        expect(errorCallback.calls.count()).toEqual(1);
      });

    });

  });
});
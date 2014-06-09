'use strict';

describe('Coq Finders', function() {

  var Coq,
      $resource, $rootScope;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    Coq         = $injector.get('Coq');
    
    $resource   = $injector.get('$resource');
    $rootScope  = $injector.get('$rootScope');
  }));

  
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
      },  resourceMock = function(params, cb, errb) {
        return successDeferred(cb, errb);
      };

      resourceMock.query = successDeferred;

      resourceMock.$$routeVariables = ['id'];

      myModel = Coq.factory({
        $resource : resourceMock,

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

  describe('conditionsBuilder', function() {

    beforeEach(function() {
      var successDeferred = function(cb) {
        cb();
      },  resourceMock = function(params, cb, errb) {
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
    
   
    it('should interpolate resource route params if find() called with value', function() {
       
      myModel.find(1).then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMockSpy.calls.argsFor(0)[0]).toEqual({ id : 1 });

    });

  });

});
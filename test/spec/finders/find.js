/* global getResourceMock */

'use strict';

describe('CoqModelClass.find', function() {

  var Coq,
      $resource, $rootScope,
      myModel,
      errorCallback, successCallback;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    Coq         = $injector.get('Coq');
    
    $resource   = $injector.get('$resource');
    $rootScope  = $injector.get('$rootScope');

    errorCallback   = jasmine.createSpy('error');
    successCallback = jasmine.createSpy('success');
  }));

  describe('should succeed to', function() {


    beforeEach(function() {
      var resourceMock = getResourceMock();

      resourceMock.shouldSucceed();

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

      expect(errorCallback.calls.any()).toEqual(false);
      expect(successCallback.calls.count()).toEqual(1);
    });

  });

  describe('should fail to', function() {

    beforeEach(function() {
      var resourceMock = getResourceMock();

      resourceMock.shouldFail();

      myModel = Coq.factory({
        $resource : resourceMock
      });
    });
    
    it('find a record', function() {

      myModel.find(1).then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(successCallback.calls.any()).toEqual(false);
      expect(errorCallback.calls.count()).toEqual(1);
    });

  });

});
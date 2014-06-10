/* global getResourceMock */

'use strict';

describe('CoqModelClass.where', function() {

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
    var resourceMock;

    beforeEach(function() {
      resourceMock = getResourceMock();

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

    it('find all records', function() {

      spyOn(resourceMock, 'query').and.callThrough();

      myModel.where({ name : 'charly'}).then(successCallback, errorCallback);

      $rootScope.$digest();


      expect(errorCallback.calls.any()).toEqual(false);
      expect(successCallback.calls.count()).toEqual(1);
      expect(resourceMock.query.calls.argsFor(0)[0]).toEqual({ name : 'charly'});
    });

  });

  describe('should fail to', function() {
    var resourceMock;

    beforeEach(function() {
      resourceMock = getResourceMock();

      resourceMock.shouldFail();

      myModel = Coq.factory({
        $resource : resourceMock
      });
    });

    it('find all records', function() {

      spyOn(resourceMock, 'query').and.callThrough();

      myModel.where({ name : 'charly'}).then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(successCallback.calls.any()).toEqual(false);
      expect(errorCallback.calls.count()).toEqual(1);
      expect(resourceMock.query.calls.argsFor(0)[0]).toEqual({ name : 'charly'});
    });

  });

});
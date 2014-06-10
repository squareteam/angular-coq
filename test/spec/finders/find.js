/* global getResourceMock */

'use strict';

describe('CoqModelClass.find', function() {

  var Coq,
      $resource, $rootScope,
      myModel, resourceMock,
      errorCallback, successCallback;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    Coq         = $injector.get('Coq');
    
    $resource   = $injector.get('$resource');
    $rootScope  = $injector.get('$rootScope');

    errorCallback   = jasmine.createSpy('error');
    successCallback = jasmine.createSpy('success');
  }));

  beforeEach(function() {
    resourceMock = getResourceMock();

    resourceMock.shouldSucceed();

    myModel = Coq.factory({
      $resource : resourceMock,
      $attributes : {
        id    : 'number'
      }
    });
  });


  it('should reject if request failed', function() {

    resourceMock.shouldFail();

    myModel.find(1).then(successCallback, errorCallback);

    $rootScope.$digest();

    expect(successCallback.calls.any()).toEqual(false);
    expect(errorCallback.calls.count()).toEqual(1);
  });




  it('use $primaryKey from config', function() {

    var myModelWithPrimaryKey;

    myModelWithPrimaryKey = Coq.factory({
      $resource : resourceMock,
      $attributes : {
        id    : 'number'
      },
      $primaryKey : 'id'
    });
     
    spyOn(resourceMock, 'get').and.callThrough();

    myModelWithPrimaryKey.find(1).then(successCallback, errorCallback);

    $rootScope.$digest();

    expect(resourceMock.get.calls.argsFor(0)[0]).toEqual({ id : 1 });

  });


  it('use $primaryKey guessed from resource route', function() {

    resourceMock.$$routeVariables = ['id'];
     
    spyOn(resourceMock, 'get').and.callThrough();

    myModel.find(1).then(successCallback, errorCallback);

    $rootScope.$digest();

    expect(resourceMock.get.calls.argsFor(0)[0]).toEqual({ id : 1 });

  });

  it('reject if $primaryKey not found', function() {

    
    resourceMock.shouldFail();

    myModel.find(1).then(successCallback, errorCallback);

    $rootScope.$digest();

    expect(successCallback.calls.any()).toEqual(false);
    expect(errorCallback.calls.count()).toEqual(1);

    expect(errorCallback.calls.argsFor(0)[0]).toEqual(new Error('unable to locate primary key'));

  });

});
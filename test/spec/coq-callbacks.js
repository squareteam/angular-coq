/* global getResourceMock */
'use strict';

describe('CoqModel callbacks', function() {

  var Coq,
      $resource, $rootScope;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    Coq         = $injector.get('Coq');

    $resource   = $injector.get('$resource');
    $rootScope  = $injector.get('$rootScope');
  }));

  // BEFORE CALLBACKS

  describe('should not call resource cause a before callback failed', function() {
       
    var UserModel, resourceMock,
        errorCallback, successCallback;

    beforeEach(inject(function($q, Coq) {
      resourceMock = getResourceMock();

      UserModel = Coq.factory({
        $resource       : resourceMock,
        $beforeSave     : function() {
          return $q.reject('ERROR');
        },
        $beforeUpdate   : function() {
          return $q.reject('ERROR');
        },
        $beforeDestroy  : function() {
          return $q.reject('ERROR');
        }
      });

      errorCallback   = jasmine.createSpy('error');
      successCallback = jasmine.createSpy('success');
    }));

    it('on save()', function() {
      spyOn(resourceMock, 'save');

      var user = new UserModel();

      user.save().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.save.calls.any()).toEqual(false);

    });

    it('on destroy()', function() {

      spyOn(resourceMock, 'delete');

      var user = new UserModel();

      user.destroy().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock['delete'].calls.any()).toEqual(false);

    });

    it('on update()', function() {

      resourceMock.addCustomMethod('update');

      spyOn(resourceMock, 'update');

      var user = new UserModel();

      user.update().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.update.calls.any()).toEqual(false);

    });

    afterEach(function() {
      expect(errorCallback).toHaveBeenCalledWith('ERROR');
      expect(successCallback.calls.any()).toEqual(false);
    });

  });

  describe('should call resource if before callback succeed', function() {
       
    var UserModel, resourceMock,
        errorCallback, successCallback;

    beforeEach(inject(function($q, Coq) {
      resourceMock = getResourceMock();
      resourceMock.behavior = function() {
        var defer = $q.defer();
        defer.resolve();
        return {
          $promise : defer.promise
        };
      };

      UserModel = Coq.factory({
        $resource       : resourceMock,
        $beforeSave     : function() {
          return 'ok';
        },
        $beforeUpdate   : function() {
          return 'ok';
        },
        $beforeDestroy  : function() {
          return 'ok';
        }
      });

      errorCallback   = jasmine.createSpy('error');
      successCallback = jasmine.createSpy('success');
    }));

    it('on save()', function() {
      spyOn(resourceMock, 'save').and.callThrough();

      var user = new UserModel();

      user.save().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.save.calls.any()).toEqual(true);

    });

    it('on destroy()', function() {

      spyOn(resourceMock, 'delete').and.callThrough();

      var user = new UserModel();

      user.destroy().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock['delete'].calls.any()).toEqual(true);

    });

    it('on update()', function() {

      resourceMock.addCustomMethod('update');

      spyOn(resourceMock, 'update').and.callThrough();

      var user = new UserModel();

      user.update().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.update.calls.any()).toEqual(true);

    });

    afterEach(function() {
      expect(errorCallback.calls.any()).toEqual(false);
      expect(successCallback.calls.any()).toEqual(true);
    });

  });

  // AFTER CALLBACKS

  describe('if after callback failed, should reject promise', function() {
       
    var UserModel, resourceMock,
        errorCallback, successCallback;

    beforeEach(inject(function($q, Coq) {
      resourceMock = getResourceMock();
      resourceMock.behavior = function() {
        var defer = $q.defer();
        defer.resolve();
        return {
          $promise : defer.promise
        };
      };

      UserModel = Coq.factory({
        $resource       : resourceMock,
        $afterSave     : function() {
          return $q.reject('ERROR AFTER');
        },
        $afterUpdate   : function() {
          return $q.reject('ERROR AFTER');
        },
        $afterDestroy  : function() {
          return $q.reject('ERROR AFTER');
        }
      });

      errorCallback   = jasmine.createSpy('error');
      successCallback = jasmine.createSpy('success');
    }));

    it('on save()', function() {
      spyOn(resourceMock, 'save').and.callThrough();

      var user = new UserModel();

      user.save().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.save.calls.any()).toEqual(true);

    });

    it('on destroy()', function() {

      spyOn(resourceMock, 'delete').and.callThrough();

      var user = new UserModel();

      user.destroy().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock['delete'].calls.any()).toEqual(true);

    });

    it('on update()', function() {

      resourceMock.addCustomMethod('update');

      spyOn(resourceMock, 'update').and.callThrough();

      var user = new UserModel();

      user.update().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.update.calls.any()).toEqual(true);

    });

    afterEach(function() {
      expect(errorCallback.calls.any()).toEqual(true);
      expect(successCallback.calls.any()).toEqual(false);
    });

  });

  describe('if resource failed, should reject promise', function() {
       
    var UserModel, resourceMock,
        errorCallback, successCallback;

    beforeEach(inject(function($q, Coq) {
      resourceMock = getResourceMock();
      resourceMock.behavior = function() {
        var defer = $q.defer();
        defer.reject();
        return {
          $promise : defer.promise
        };
      };

      UserModel = Coq.factory({
        $resource       : resourceMock,
        $afterSave     : function() {
          return 'OK';
        },
        $afterUpdate   : function() {
          return 'OK';
        },
        $afterDestroy  : function() {
          return 'OK';
        }
      });

      errorCallback   = jasmine.createSpy('error');
      successCallback = jasmine.createSpy('success');
    }));

    it('on save()', function() {
      spyOn(resourceMock, 'save').and.callThrough();

      var user = new UserModel();

      user.save().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.save.calls.any()).toEqual(true);

    });

    it('on destroy()', function() {

      spyOn(resourceMock, 'delete').and.callThrough();

      var user = new UserModel();

      user.destroy().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock['delete'].calls.any()).toEqual(true);

    });

    it('on update()', function() {

      resourceMock.addCustomMethod('update');

      spyOn(resourceMock, 'update').and.callThrough();

      var user = new UserModel();

      user.update().then(successCallback, errorCallback);

      $rootScope.$digest();

      expect(resourceMock.update.calls.any()).toEqual(true);

    });

    afterEach(function() {
      expect(errorCallback.calls.any()).toEqual(true);
      expect(successCallback.calls.any()).toEqual(false);
    });

  });

});
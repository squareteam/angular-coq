'use strict';

describe('$q.pipeline', function() {

  var $q, $rootScope,
      promises = [];

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    $q          = $injector.get('$q');
    $rootScope  = $injector.get('$rootScope');
  }));

  it('should return default value if no tasks provided', function() {
    
    var resultsPromise = $q.pipeline([], 'hi');

    $rootScope.$digest();

    resultsPromise.then(function(result) {
      expect(result).toBe('hi');
    });

  });

  it('should return undefined if no tasks and no defaultValue provided', function() {
    
    var resultsPromise = $q.pipeline([]);

    $rootScope.$digest();

    resultsPromise.then(function(result) {
      expect(result).toBe(undefined);
    });

  });


  it('should call tasks in order without overlap', function() {
      
    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.1.');

      return defer.promise;
    });

    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.2.');

      return defer.promise;
    });

    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.3');

      return defer.promise;
    });

    var resultsPromise = $q.pipeline(promises, '0.');

    $rootScope.$digest();

    resultsPromise.then(function(result) {
      expect(result).toBe('0.1.2.3');
    });

  });

  it('should work with non-promise tasks', function() {
      
    promises.push(function(result) {
      return result + '.1.';
    });

    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.2.');

      return defer.promise;
    });

    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.3');

      return defer.promise;
    });

    var resultsPromise = $q.pipeline(promises, '0.');

    $rootScope.$digest();

    resultsPromise.then(function(result) {
      expect(result).toBe('0.1.2.3');
    });

  });

  it('should reject if one task rejected', function() {
      
    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.1.');

      return defer.promise;
    });

    promises.push(function(/*result*/) {
      var defer = $q.defer();

      defer.reject('ERROR');

      return defer.promise;
    });

    promises.push(function(result) {
      var defer = $q.defer();

      defer.resolve(result + '.3');

      return defer.promise;
    });

    var resultsPromise = $q.pipeline(promises, '0.');

    $rootScope.$digest();

    resultsPromise.catch(function(result) {
      expect(result).toBe('ERROR');
    });

  });



});
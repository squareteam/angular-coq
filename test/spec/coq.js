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

    it('should add custom instance methods to model with correct binding', function() {
      var myModel;

      var successDeferred = function(cb) {
        cb({
          id    : 1,
          name  : 'charly'
        });
      },  resourceMock = {};

      resourceMock.get = function(params, cb, errb) {
        return successDeferred(cb, errb);
      };

      resourceMock.$$routeVariables = [];

      myModel = Coq.factory({
        $resource : resourceMock,

        $attributes : {
          id : {
            type : 'number'
          },
          name : {
            type : 'text'
          }
        },

        myMethod : function() {
          return 'hello';
        },

        helloMan : function() {
          return 'hello ' + this.$attributes.name;
        }
      });

      myModel.find(1).then(function(charly) {
        expect(charly.myMethod instanceof Function).toBe(true);
        expect(charly.myMethod()).toBe('hello');
        expect(charly.helloMan()).toBe('hello charly');
      });

      $rootScope.$digest();
    });

    it('should add statics methods to model', function() {
      var myModel = Coq.factory({
        $resource : $resource('http://example.com/users'),

        $statics : {
          myMethod : function() {
            return 'hello';
          }
        }
      });

      expect(typeof myModel.myMethod).toBe('function');
    });

  });

});
/* global $ */
'use strict';

describe('coq-model-attribute directive', function() {

  var element, scope, User,
      $rootScope, $compile, $log;

  beforeEach(module('coq', function($provide) {
    $provide.factory('User', function($resource, Coq) {
      return Coq.factory({
        $resource : $resource('/user/:id'),
        $attributes : {
          id    : 'number',
          name  : 'text'
        }
      });
    });
  }));

  beforeEach(inject(function($injector) {
    $rootScope  = $injector.get('$rootScope');
    $compile    = $injector.get('$compile');
    $log        = $injector.get('$log');

    User        = $injector.get('User');

    scope = $rootScope.$new();

    scope.user = new User();

  }));

  it('should call $log.error if no form[coq-model] parent found', function() {

    spyOn($log, 'error');
    
    element = $compile('<input coq-model-attribute="id">')(scope);

    expect($log.error).toHaveBeenCalledWith('coq-model-attribute need a parent element with coq-model directive');

  });

  it('should render correct User "name" attribute with correct configuration', function() {
    
    var input;

    element = $compile('<form coq-model="user"><input coq-model-attribute="name"></form>')(scope);

    input = element.find('input');

    expect($(input).attr('ng-model')).toBe('user.name');
    expect($(input).attr('type')).toBe('text');

  });

});
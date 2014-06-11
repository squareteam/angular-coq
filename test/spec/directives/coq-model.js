'use strict';

describe('coq-model directive', function() {

  var element, scope, User,
      $rootScope, $compile,
      $ = angular.element;

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

    User        = $injector.get('User');

    scope = $rootScope.$new();

    scope.user = new User();

  }));

  it('shoud append inputs to form', function() {
    var elements;

    element = $compile('<form coq-model="user"><div></div></form>')(scope);

    elements = element.children();

    expect(elements[0].tagName).toBe('DIV');

    expect(elements[1].tagName).toBe('P');
    expect($(elements[1]).find('input').attr('type')).toBe('number');

    expect(elements[2].tagName).toBe('P');
    expect($(elements[2]).find('input').attr('type')).toBe('text');

  });

  it('shoud prepend inputs to form', function() {
    var elements;

    element = $compile('<form coq-model="user" coq-model-insert-mode="prepend"><div></div></form>')(scope);

    elements = element.children();

    expect(elements[0].tagName).toBe('P');
    expect($(elements[0]).find('input').attr('type')).toBe('number');

    expect(elements[1].tagName).toBe('P');
    expect($(elements[1]).find('input').attr('type')).toBe('text');

    expect(elements[2].tagName).toBe('DIV');

  });

  it('shoud replace form content with inputs', function() {
    var elements;

    element = $compile('<form coq-model="user" coq-model-insert-mode="replace"><div></div></form>')(scope);

    elements = element.children();

    expect(elements[0].tagName).toBe('P');
    expect($(elements[0]).find('input').attr('type')).toBe('number');

    expect(elements[1].tagName).toBe('P');
    expect($(elements[1]).find('input').attr('type')).toBe('text');

  });

  it('shoud do nothing cause have at least one input[coq-model-attribute] children', function() {
    var elements;

    element = $compile('<form coq-model="user"><input coq-model-attribute="test"/></form>')(scope);

    elements = element.children();

    expect(elements[0].tagName).toBe('INPUT');
    expect($(elements[0]).attr('type')).toBe(undefined);


  });

});
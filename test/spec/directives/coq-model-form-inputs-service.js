'use strict';

describe('coqModelForm Service', function() {

  var coqModelForm;

  beforeEach(module('coq'));

  beforeEach(inject(function($injector) {
    coqModelForm = $injector.get('coqModelForm');
  }));

  it('should return "text" input attributes', function() {
    expect(coqModelForm.getInputAttributes('text')).toEqual({ 'type' : 'text' });
  });
  
  it('should be identity if inputConfig is object', function() {
    expect(coqModelForm.getInputAttributes({ 'type' : 'text', 'required' : '' })).toEqual({ 'type' : 'text', 'required' : '' });
  });
});
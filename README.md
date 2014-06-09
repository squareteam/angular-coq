angular-coq [![Build Status](https://travis-ci.org/squareteam/angular-coq.svg?branch=master)](https://travis-ci.org/squareteam/angular-coq)
===========

Angular models that make you say "cocoricoo"



### Expected Features (in development)

- Working on top of ngResource


##### Finders

```js

var MyModel = Coq.extend({
   resource : $resource('http://api.com/users/:id')
});

// GET http://api.com/users/
MyModel.all();

// GET http://api.com/users/1
var record = MyModel.find({ id : 1 });

// DELETE http://api.com/users/1
record.delete();

```

##### Callbacks

```js

var MyModel = Coq.extend({
   resource : $resource('http://api.com/users/:id')

   addToTeam      : function() { return $q.resolve();  },
   removeFromTeam : function($record) { return $q.reject('cannot delete from team'); }
});

MyModel.$beforeSave('addToTeam');
MyModel.$beforeDestroy('removeFromTeam');

// GET http://api.com/users/1
var record = MyModel.find(1);

// > 'cannot delete from team'
record.$delete().then(function() {}, function(error) {
   console.log(error);
});

```


##### Form Scaffolding

```html
<form coq-model="MyModel"></form>
<!-- Inputs will be automatically added to form -->

```

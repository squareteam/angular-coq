angular-coq [![Build Status](https://travis-ci.org/squareteam/angular-coq.svg)](https://travis-ci.org/squareteam/angular-coq)
===========

Angular models that make you say "cocoricoo"






### Expected Features (in development)

- Working with ngResource

```js

function MyModel() {
   this.resource = $resource('http://api.com/users/:id');
   MyModel.superconstructor.call(this, arguments);
}

extend(CoqModel, MyModel);

// GET http://api.com/users/
MyModel.find();

// GET http://api.com/users/1
MyModel.find(1);

```

- Callbacks

```js

function MyModel() {
   this.resource = $resource('http://api.com/users/:id');

   this.$beforeDestroy.push('removeFromTeam');
   this.$afterSave.push('addToTeam');

   MyModel.superconstructor.call(this, arguments);
}

MyModel.prototype.addToTeam = function() {
   // ... should return "thenable" object
}

MyModel.prototype.removeFromTeam = function($record) {
   // ... should return "thenable" object
}

extend(CoqModel, MyModel);

// GET http://api.com/users/
MyModel.find();

// GET http://api.com/users/1
MyModel.find(1);

```


- Form Building

```html

<form coq-model="MyModel"></form>
<!-- Inputs will be automatically added to form -->

```

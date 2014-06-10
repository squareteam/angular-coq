angular-coq [![Build Status](https://travis-ci.org/squareteam/angular-coq.svg?branch=master)](https://travis-ci.org/squareteam/angular-coq) [![Coverage Status](https://coveralls.io/repos/squareteam/angular-coq/badge.png)](https://coveralls.io/r/squareteam/angular-coq) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)
===========

<table>
<tr>
<td>
<img src="http://www.coloriages.fr/coloriages/coloriage-looney-toons-charlie-le-coq.jpg" width="250">
</td>
<td>
Angular models that make you say "cocoricoo"
</td>
</tr>
</table>


#### The good parts

- Working on top of ngResource
- Simple API ( [see doc](https://github.com/squareteam/angular-coq/wiki/Coq-API) )

##### Examples

```js

var Users = Coq.extend({
   $resource   : $resource('http://api.com/users/:id', {}, { update : { method : 'PUT' } }),
   $attributes : {
      id    : 'number',
      name  : 'text'
   },
   
   // custom instance method
   update : function () {
      return this.constructor.$resource.update(this.$attributes).$promise;
   }
});

// GET http://api.com/users/
Users.all();

// GET http://api.com/users/1
Users.find({ id : 1 }).then(function(user) {
   // PUT http://api.com/users/1
   user.update();
   
   // DELETE http://api.com/users/1
   user.destroy();
});



// #### Using callbacks

var Teams = Coq.extend({
   resource : $resource('http://api.com/teams/:id')

   doSomething       : function() { return $q.resolve();  },
   doSomethingElse   : function($record) { return $q.reject('cannot delete from team'); }
});

Teams.$beforeSave('doSomething');
Teams.$beforeDestroy('doSomethingElse');

// GET http://api.com/users/1
Teams.find({ id : 1 }).then(function(team) {
   // > 'cannot delete from team'
   team.destroy().then(function() {}, function(error) {
      console.log(error);
   });

});
```


##### Form Scaffolding

*myController.js*
```js
app.controller('myController', function($scope, TeamsModel) {
   $scope.team = TeamsModel.find(1);
});
```

*index.html*
```html
<div ng-controller="myController">
   <form coq-model="team">
      <!-- Inputs will be automatically added to form -->
   </form>
</div>
```

*rendered html (before linking ngForm directive)*
```html
<div ng-controller="myController">
   <form coq-model="team" ng-submit="team.update()">
      <!-- ... -->
      <input type="number" name="id" ng-model="team.id">
      <!-- ... -->
      <input type="text" name="name" ng-model="team.name">
   </form>
</div>
```

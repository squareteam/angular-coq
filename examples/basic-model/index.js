'use strict';

angular.module('basicModelTest', [
  'coq',
  'ngResource'
]);

angular.module('basicModelTest').service('UserModel', function($resource, Coq) {

  var UserModel = Coq.factory({
    $resource : $resource('http://echo.jsontest.com/id/:id/name/test',{}, {
      update: {method:'PUT'}
    }),

    $attributes : {
      id    : 'number',
      name  : 'text'
    }
  });

  return UserModel;
});


angular.module('basicModelTest').run(function($resource, UserModel) {

  console.log('load user #1');

  UserModel.find(1).then(function(user) {
    console.log('user #1 loaded');
    user.name = 'test 2';


    // # echo.jsontest.com does not support PUT
    // replace $resource URL by your service
    //
    // console.log('update user #1');
    // user.update().then(function() {
    //   console.log('user #1 updated');
    // });
  });

  var user = new UserModel();

  user.name = 'hello';

  user.save();

});

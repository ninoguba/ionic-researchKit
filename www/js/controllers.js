angular.module('starter.controllers', [])

.controller('StepsCtrl', function($scope, $ionicModal, $ionicSlideBoxDelegate) {
  $scope.data = {};

  $ionicModal.fromTemplateUrl('templates/modal-steps.html', {
    //scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
	$scope.modal.show();
	$ionicSlideBoxDelegate.update();
  });

  $scope.openModal = function() {
    $scope.modal.show();
  };

  $scope.closeModal = function() {
    $scope.modal.hide();
    console.log('closed');
  };

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {
    // Execute action
  });

  // Execute action on remove modal
  $scope.$on('modal.removed', function() {
    // Execute action
  });
})

.controller('ResultsCtrl', function($scope) {

});

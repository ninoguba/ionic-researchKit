angular.module('starter.controllers', [])

.controller('StepsCtrl', function($scope, $ionicModal) {
  $scope.data = {};

  $scope.openModal = function() {
    $ionicModal.fromTemplateUrl('templates/modal-steps.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.openModalConsent = function() {
    $ionicModal.fromTemplateUrl('templates/modal-consent.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.openModalActiveTask = function() {
    $ionicModal.fromTemplateUrl('templates/modal-activetasks-fingertap.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function() {
    $scope.modal.remove();
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

.controller('ActiveTasksCtrl', function($scope, $ionicModal) {
  $scope.openModalFingerTapActiveTask = function() {
    $ionicModal.fromTemplateUrl('templates/modal-activetasks-fingertap.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.openModalVoiceActiveTask = function() {
    $ionicModal.fromTemplateUrl('templates/modal-activetasks-voice.html', {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function() {
    $scope.modal.remove();
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

.controller('ResultsCtrl', ['irkResults', '$scope', function(irkResults, $scope) {
  $scope.results = irkResults.getResults();
}])

.controller('DocumentCtrl', ['irkConsentDocument', '$scope', '$cordovaInAppBrowser', function(irkConsentDocument, $scope, $cordovaInAppBrowser) {
  $scope.consentDocument = irkConsentDocument.getDocument();

  /*
  //Open PDF (only works in browser)
  if ($scope.consentDocument) $scope.consentDocument.open();
  */

  /*
  //Get Base64 Encoded String
  if ($scope.consentDocument) {
    $scope.consentDocument.getBase64(function(encodedString) {
      console.log(encodedString)
    });
  }
  */

  //Get DataURL 
  if ($scope.consentDocument) {
    $scope.consentDocument.getDataUrl(function(dataURL) {
      //console.log(dataURL);
      $scope.dataURL = dataURL;
      $scope.viewPDF();
    });
  }

  $scope.viewPDF = function($cordovaInAppBrowser) {
    window.open($scope.dataURL, '_blank', 'location=no');
  }
}])

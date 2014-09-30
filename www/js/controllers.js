angular.module('pleaseApp.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal,
  game, $location, $window) {

  $ionicModal.fromTemplateUrl('templates/newgame.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.generateStats = function(){
    $scope.wonGames = $window.localStorage.wonGames || 0;
    $scope.lostGames = $window.localStorage.lostnGames || 0;

    $scope.totalGames = $scope.wonGames + $scope.lostGames;
    $scope.percentWon = $scope.totalGames?
                  $scope.wonGames/$scope.totalGames*100:0;
  }

  $scope.playGame = function() {
    var me = new game.Player(
      $window.localStorage.youName || "You", false);

    for (var i = 0; i < $scope.hand.length; i++){
      if ($scope.handDown[i])
        me.faceUp[me.faceUp.length] = $scope.hand[i];
      else
        me.hand[me.hand.length] = $scope.hand[i];
    }
    me.drawFaceDownCards(game.deck);

    var opponent = new game.Player(
        $window.localStorage.opponentName || "Opponent",
         true);
    opponent.generateAIHand();
    opponent.drawFaceDownCards(game.deck);

    game.players = [me, opponent];

    $scope.modal.hide();
    $location.url('app/game');
  };

  $scope.newgame = function() {
    game.generate(
      Number($window.localStorage.speed || 100));
    $scope.makeHand();
    $scope.modal.show();
  };

  $scope.numCardsDown = function(){
    if (!$scope.handDown) return 0;
    return $scope.handDown.reduce(function(count, down){
        if (down) return count + 1;
        return count;
    },0)
  }
  $scope.canPlaceCard = function(index) {
    if ( $scope.numCardsDown() >= 3)
      return !$scope.handDown[index];
    else return false;
  }

  $scope.makeHand = function() {
    $scope.hand = [];
    $scope.handDown = [];
    for (var i = 0; i < 6; i++) {
      $scope.hand[i] = game.deck.drawCard();
      $scope.handDown[i] = false;
    };
  };
})

.controller('GameCtrl', function($scope, $location,
                        game, $ionicModal) {
  if (game.players.length==0) $location.path('app/main')
  
  $scope.me = _.find(game.players, function(player){
    return !player.ai;
  }); // The first non-AI player

  game.start();

  $scope.opponents = _.filter(game.players, 'ai');

  $scope.game = game;

  $scope.pickUp = function(){
    if ($scope.me.mayPlay && game.cardPile.length){
      $scope.me.pickUp();
    }
  }

  $scope.askHuman = function(card, from, callback){
    $scope.playable = _.filter(from, function(otherCard){
      return (otherCard.value == card.value);
    });

    $scope.play = _.map(from, function(otherCard){
      return otherCard == card;
    });

    $scope.submitText = function(){
      if (_.some($scope.play, _.identity)){
        return 'Choose';
      }
      return 'Cancel';
    }

    $scope.submit = function(){
      $scope.choice.hide();
      var someCard = false;
      for (var i = 0; i < $scope.play.length; i++) {
        if ($scope.play[i]){
          someCard = true;
          $scope.play[i] = $scope.playable[i];
        }
        else
          $scope.play[i] = null;
      };
      if (someCard)
        callback(card,from,_.filter($scope.play,function(card){
          return card != null;
        }));
    }

    $ionicModal.fromTemplateUrl('templates/choose.html', {
        scope: $scope
      }).then(function(modal) {
        $scope.choice = modal;
        modal.show();
      });
  }
})
.controller('WinCtrl', function($scope, $window) {
  $scope.won = true;
  $scope.text = 'Win'
  $scope.adjusted = false;

  $scope.adjustStats = function(){
    if (!$scope.adjusted){
      if ($window.localStorage.wonGames)
          $window.localStorage.wonGames++;
      else
          $window.localStorage.wonGames = 1;
    }
    $scope.adjusted = true;
  }
})
.controller('LoseCtrl', function($scope) {
  $scope.won = false;
  $scope.text = 'Lose'
  $scope.adjusted = false;

  $scope.adjustStats = function(){
    if (!$scope.adjusted){
      if ($window.localStorage.lostGames)
          $window.localStorage.lostGames++;
      else
          $window.localStorage.lostGames = 1;
    }
    $scope.adjusted = true;
  }
})
.controller('SettingsCtrl', function($scope, $window) {
  $scope.localStorage = $window.localStorage;

  if (!$scope.localStorage.speed){
    $scope.localStorage.speed = 100;
  }

  if (!$scope.localStorage.youName){
    $scope.localStorage.youName = "You";
  }
  if (!$scope.localStorage.opponentName){
    $scope.localStorage.opponentName = "Opponent";
  }

});

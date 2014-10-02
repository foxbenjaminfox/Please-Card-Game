angular.module('pleaseApp.services', [])

.factory('game', function($timeout, $location){
  gameObject = {};

  gameObject.generate = function(gameSpeed){
    var game = this;

    game.cardValues = [
          'Three', 'Four', 'Five', 'Six',
          'Seven', 'Eight', 'Nine', 'Jack',
          'Queen','King', 'Ace',
          'Two','Ten',
          ];

    game.cardSuits = ['Clubs','Diamonds', 'Hearts','Spades'];

    suitsToSymbols = {Clubs:'♣',Diamonds:'♦', Hearts:'♥',
                        Spades:'♠'};

    valuesToSymbols = {
          Three:3, Four:4, Five:5, Six:6,
          Seven:7, Eight:8, Nine:9, Jack:'J', Queen:'Q',
          King:'K', Ace:'A', Two:2, Ten:10,
          };

    var Deck = function(){
      this.cards = [];
      for (var suit = 0; suit < 4; suit++) {
        this.cards = _.union(this.cards, _.map(game.cardValues,
        function(value){
          return new Card(value, game.cardSuits[suit]);
        }));
      }
      this.cards = _.shuffle(this.cards);
      this.drawCard = function(){
        return this.cards.pop();
      }
    }

    var Card = function(value, suit){
      this.value = value;
      this.suit = suit;
      this.hidden = false;
      this.notice = false;
      this.name = function(){
        return this.value + ' of ' + this.suit;
      }
      
      this.display = function(){
        if (this.hidden) return '?';
        return suitsToSymbols[this.suit] + ' ' + valuesToSymbols[this.value];
      }

      this.wild = function(){
        return this.value == 'Two' || this.value == 'Ten';
      }

      this.canPlay = function(on){
        if (on !== null && on.value == 'Seven')
          return this.wild() ||
               game.cardValues.indexOf(this.value) <=
                  game.cardValues.indexOf(on.value);
        else return this.wild() || on === null || on.wild() ||
            game.cardValues.indexOf(this.value) >=
                  game.cardValues.indexOf(on.value); 
      }

      this.onPlay = function(){
        var fourOfAKind = this.isFourOfAKind();
        if (fourOfAKind || this.value == 'Ten'){
          game.messageExpire = game.turn + 2;
          game.message = fourOfAKind?"Four of a kind: ":"A 10 has been played: "
          game.message += game.cardPile.length +
                  " cards eliminated"
          game.cardPile = [];
        }
      }

      this.isFourOfAKind = function(){
        var fourOfAKind = true;
        for (var i = 1; i <= 4; i++) {
          var card = game.cardPile[game.cardPile.length-i];
          if (!card || card.value !== this.value){
            fourOfAKind = false;
          }
        }
        return fourOfAKind;
      }

      this.canPlayAgain = function(){
        return this.isFourOfAKind() || this.value == 'Ten'
              || this.value == 'Two';
      }
    }

    game.Player = function(name, ai){
      this.ai = ai;
      this.hand = [];
      this.faceUp = [];
      this.name = name;
      this.faceDown = [];
      this.mayPlay = false;
      this.sortOrder = -1;

      this.drawFaceDownCards = function(deck){
        for (var i = 0; i < 3; i++) {
          this.faceDown[i] = deck.drawCard();
          this.faceDown[i].hidden = true;
        }
      }

      this.doAIPlay = function(){
        var from = this.hand;
        bestCardToPlay = _(this.hand).filter(function(card){
          return card.canPlay(game.topCard());
          }).sortBy( function(card){
              return game.cardValues.indexOf(card.value)
            }).value()[0];

        if (bestCardToPlay === undefined && this.hand.length === 0){
          from = this.faceUp;
          bestCardToPlay = _(this.faceUp).filter(function(card){
            return card.canPlay(game.topCard());
            }).sortBy(function(card){
                return game.cardValues.indexOf(card.value)
              }).value()[0];

          if (bestCardToPlay === undefined && 
                    this.faceUp.length === 0){
            from = this.faceDown;
            bestCardToPlay = this.faceDown[0];
          }
        }

        if (bestCardToPlay !== undefined){
          this.play(bestCardToPlay, from, from == this.hand);
        }
        else {
          this.pickUp();
        }
      }

      this.play = function(card,from,fromHand,askHuman){
        if (!this.mayPlay) return false;
        if (!this.ai && askHuman === undefined){
          throw 'Must be able to ask';
        }
        var valid = false;
        if (fromHand){
          valid = card.canPlay(game.topCard());
        }
        else {
          if (this.hand.length > 0) return false;
          if (card.hidden) {
            if (this.faceUp.length > 0) return false;
            else {
              if (card.canPlay(game.topCard())) valid = true;
              else {
                game.cardPile[game.cardPile.length] = card;
                card.notice = true;
                card.hidden = false;
                $timeout(_.bind(function(){
                  from.splice(from.indexOf(card), 1);
                  card.notice = false;
                  this.pickUp();
                },this), 20*gameSpeed);
                return;
              }
            }
          }
          valid = card.canPlay(game.topCard());
        }
        
        if (valid){
          var all = this.askForAllCards(card,from,
            _.bind(this.executeCardPlaying,this),askHuman);
        }
      }
      this.executeCardPlaying = function(card, from, all){
        var wait = this.ai?0:6.5*gameSpeed;

        if (card.hidden) wait = 1000;
        card.hidden = false;
        for (var i = 0; i < all.length; i++) {
          game.cardPile[game.cardPile.length] = all[i];
          from.splice(from.indexOf(all[i]), 1);
        }

        this.refillHand();
        
        if (this.faceDown.length === 0 &&
                 this.hand.length === 0) {
            $timeout(_.bind(this.win,this),15*gameSpeed);
        }
        else {
          this.mayPlay = card.canPlayAgain();
          if (this.mayPlay){
            card.onPlay(this);
            if (this.ai) {
              $timeout(_.bind(function(){
                this.doAIPlay();
              },this), 4*gameSpeed);
            }
          }
          else {
            $timeout(function(){
              game.turn++;
              card.onPlay(this);
              game.passTurn();
            }, wait);
          }
        }
      }

      this.win = function(){
        if (this.ai) $location.path('app/lose');
        else $location.path('app/win');
      }
      this.pickUp = function(){
        this.mayPlay = false;
        $timeout(_.bind(function(){
          for (var i = 0; i < game.cardPile.length; i++) {
            this.hand[this.hand.length] = game.cardPile[i];
          }
          game.message = this.name + 
                " picked up " +
                game.cardPile.length +
                " cards";
          game.messageExpire = game.turn + 2;
          game.cardPile = [];
          game.turn++;
          game.passTurn()
        },this),this.ai?10*gameSpeed:0)
      }

      this.refillHand = function(){
        while (this.hand.length < 3){
          card = game.deck.drawCard();
          if (card)
            this.hand[this.hand.length] = card;
          else break;
        }
      }

      this.sortHand = function(){
        this.hand = _.sortBy(this.hand, _.bind(
          function(card){
            return this.sortOrder*game.cardValues.indexOf(card.value);
        }, this))

        if (!this.ai){
          this.sortOrder = 1;
          $timeout(_.bind(function(){
            this.sortOrder = -1;
          }, this),20*gameSpeed)
        }
      }

      this.askForAllCards = function(card, from, callback, askHuman){
        if (card.hidden) {
          callback(card,from,[card]);
          return;
        }

        if (this.ai){
          if (card.value == 'Two' || card.value == 'Ten'){
            callback(card,from,[card]);
            return;
          }
          else {
            callback(card,from, _.filter(from, function(otherCard){
             return card.value == otherCard.value;
            }));
            return;
          }
        }
        else {
          if (_.filter(from,function(otherCard){
             return card.value == otherCard.value;
            }).length == 1){
            callback(card,from,[card]);
            return;
          }
          askHuman(card, from, callback);
        }
      }

      this.generateAIHand = function(){
        for (var i = 0; i < 6; i++) {
          this.hand[i] = game.deck.drawCard();
        }
        this.sortHand();
        for (var i = 0; i < 3; i++) {
          this.faceUp[i] = this.hand.shift();
        }
      }

      this.onTheTable = function(){
        table = [];
        for (var i = 0; i < this.faceDown.length; i++) {
          if (this.faceUp[i] !== undefined)
            table[i] = this.faceUp[i];
          else table[i] = this.faceDown[i];
        }
        return table;
      }
    }

    game.deck = new Deck();
    game.cardPile = [];
    game.topCard = function(){
      return game.cardPile[game.cardPile.length-1] || null;
    }

    game.topCards = function(){
      if (!game.topCard()) return '';
      cards = [];
      for (var i = game.cardPile.length-1; i >=0 ; i--) {
        if (game.cardPile[i].value == game.topCard().value){
          cards[cards.length] = game.cardPile[i].display();
        }
        else break;
      }
      return cards.join(' ');
    }

    game.turn = 0;

    game.whoseTurn = function(){
      return this.players[this.turn % this.players.length];
    }

    game.passTurn = function(){
      var player = game.whoseTurn();
      if (game.turn >= game.messageExpire) game.message = "";
      player.mayPlay = true;
      if (player.ai){
        player.doAIPlay();
      }
    }

    game.start = function(){
      if (game.players[0] !== undefined)
        game.players[0].mayPlay = true;
    }

    game.players = [];
    game.message = "";
    game.messageExpire = 0;
  }

  return gameObject;
});
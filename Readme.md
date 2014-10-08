Please
=================

This is an implementation of the card game occasionally known as "Please", in the form of an Ionic app.

You may know it by a different name, if you know of it at all, as it seems to be a game with many different and varied names.

This app may have many bugs in it: It was whipped together in a few days, and only marginally revised thereafter. If you find
a bug, then go ahead and open an issue on Github.

## How to build the app

Assuming you have the Ionic framework installed, `ionic build android` builds the android version of the app.

It wouldn't be much work to build it for other platforms as well.

If you want a precompiled version to try out, you can download [this prebuilt APK](https://app.box.com/s/ps7b0kergzdefu8kvkhz).

## How to play

Each player starts with three random cards face down in front of him or her, and six cards in his or her hand.
Each player chooses three of the cards in his or her hand to put down face up, one on each of the face down cards.

Throughout the game, each player, on his or her turn, needs to play a card with an equal or higher value to the card that
currently tops the discard pile. (Aces are considered high.)
A player may play multiple cards on his or her turn, but they must be of the same value.

A player who cannot play on his or her turn, must pick up all the cards in the discard pile.

Players play cards from their hands, drawing back up to three cards in hand at the end of each turn, until the deck is empty.
Once a player runs out of cards in hand he or she is allowed to play the face up cards in front of her (still face up),
and after those are finished, must play the face down cards, still face down. This means playing them blindly, and if a
card played this way is illegal, the player must pick up the whole discard pile, and start trying to empty their hand
again.

If a player completes a set of four as the top played cards, all cards in the discard pile are removed from the game and
that player takes another turn.

Some cards are considered special:

- 2's are wild. They can be played any time, and give you an extra turn.
- 10's are wild, and they remove the discard pile in the same way four of a kind do. (Including the extra turn.)
- 7's need not be exceeded in value by the next card, but rather the opposite: The next card played must be a 7 or *less*.

## Playing Instructions

Playing the game in the app should be pretty self-explanatory. You tap a card to play it, and you can adjust the settings
(like what you and your opponent are called) in the settings menu. To pick up the discard pile, tap the icon in the lower right corner,
and if you tap the icon in the bottom left, it will sort your hand. Double tap it in order to reverse the direction of the sorting.
Alternately, in the settings screen, you can set your hand to automaticly sort itself.


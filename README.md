# Break down of goal to a few smaller tasks:

1. Define rules
2. Structure the game
3. Draw the board
	1. Draw fields
	2. Plant mines
	3. Calculate distances
7. Find a way to traverse the board
8. Implement the "reveal" logic


## Defining the rules

1. The goal of the game is to find all mines on the board.

2. You reveal mines by clicking the board fields.
3. If you reveal a field with mine you lose the game.
4. If you reveal field without a mine it will show exact number of mines surrounding that field.
5. If you reveal field without number it means that there are no mines in its surroundings. In that case board will reveal all connected empty fields with its surroundings.
6. You can flag field by right-clicking it.
7. If you click on a revealed field and you already flagged all mines around that field, board will reveal rest of the hidden fields. Of course, if you misplaced flags you will reveal a field with a mine and lose the game.

## Boards
- __Beginner__: 
	- 9 X 9
	- 10 mines (%12)
- __Intermediate__:
	- 16 X 16
	- 40 mines (%16)
- __Expert__:
	- 30X16
	- 99 mines (%20)

## TODO
- fix the *Play Again?* button
- ~~fix the flagged cells issue~~
- ~~implement the mine count down~~
- implement the timer
- implement **rule 7** above
- add explosion animation
- replace numbers with pictures
- add audio
- add media query


<!--## Structure
- Game
	- startGame()
- Board
-->
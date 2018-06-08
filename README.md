# Minesweeper

Minesweeper is a single-player puzzle game. The objective of the game is to clear a rectangular board containing hidden *"mines"* or bombs without detonating any of them, with help from clues about the number of neighboring mines in each field. The game originates from the 1960s, and has been written for many computing platforms in use today. It has many variations and offshoots.

## How to Play
You can play Minesweeper in three different modes. These modes represent different difficulty levels of the game. The modes are:

- __Beginner Mode__: A simple 9 X 9 grid containing 10 hidden mines which cover about **12%** of the grid.

![beginner](images/beginner-screenshot.png)

- __Intermediate Mode__: A more challenging 16 X 16 grid containing 40 hidden mines which covers about **16%** of the grid.

![intermediate](images/intermediate-screenshot.png)

- __Expert Mode__: The most challenging mode which is a grid of size 16 X 30 with 99 mines that makes about **20%** of the grid.

![expert](images/expert-screenshot.png)

Each cell of the grid is of one of the 3 different types:

- *Mine cell:* This cell contains a mine and if revealed, you lose the game.
- *Empty cell:* This is an empty cell with no adjacent mine. If revealed, it also reveals all it's adjacent cells all of which are safe *(i.e. non-mine cell)*
- *Numbered cell:* This is also an empty cell but with some adjacent mines. If revealed, it shows a number which represents the number of adjacent cells that contain a mine.

![cell types](images/cell-types.png)

The game starts by default on the *Beginner* mode. There are 3 ways to interact with the board:

**1. Click:** If you click on a cell which hasn't been explored (revealed) before, it reveals the content of that cell which is one of the 3 types mentioned above.

**2. Right-Click:** If you right-click on an unexplored cell with no flag, it adds a flag on that cell to mark the location of a mine. If you right-click on a flagged cell, the flag is removed.

**3. Double-Click:** If you double-click on a revealed and numbered cell, if the cell's number matches the number of flags surrounding it, any other unexplored and unflagged adjacent cells are revealed. These could be empty cells, numbered cells or even mine cells which will end the game if revealed.

![flag screenshot](images/flag-screenshot.png)

**Your task** is to clear the board without detonating any of the mines.

![win screenshot](images/win-screenshot.png)


You can play this game online [here](https://alijy.github.io/Minesweeper/)

Have fun!

## How to Implement

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
- ~~fix the *Play Again?* button~~
- ~~fix the flagged cells issue~~
- ~~implement the mine count down~~
- ~~implement the timer~~
- ~~implement **rule 7** above~~
- ~~add explosion animation~~
- replace numbers with pictures
- ~~add audio~~
- ~~add media query~~


<!--## Structure
- Game
	- startGame()
- Board
-->
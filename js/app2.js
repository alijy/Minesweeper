$(document).ready(function () {

  // Disable the right click button's menu.
  function pressRightClick() { return false; }
  document.oncontextmenu = pressRightClick;

  // An object including difficulty modes
  var modes = {
    beginner : [9, 9, 10],
    intermediate : [16, 16, 40],
    expert : [16, 30, 99]
  }

  // Set the mode and initialise a new game in that mode
  var mode = 'beginner';
  newGame(mode);

  $('#mode li').click(function() {
    $('#mode li').removeClass('selected');
    $(this).addClass('selected');
    mode = $(this).attr('id');
    newGame(mode);
    // $('#new-game').hide();
  });

  /*
  * Generates a new game
  */
  function newGame(mode) {
    var board = new Board(modes[mode]) // generates  a new instance of board object
    board.render();
    // board.gameOver = false;

    // detects and acts on both left and right click
    $('.cell').mouseup(function(event) {
      var mouseButton = event.which;
      var row = $(event.target).attr("cellRow");
      var col = $(event.target).attr("cellCol");
      if (mouseButton == 1) {           // detects left click
        leftClick(board, row, col);
      } else if (event.which == 3) {    // detects right click
        rightClick(board, row, col);
      }
    })
  }


  /*
  * Performing the right-click action.
  * If an unexplored cell is right-clicked, it is flagged/unflagged.
  */
   function rightClick(board, row, col) {
    if ((board.gameOver == false) && (board.boardCells[row][col].explored == false))  {
      var flagCell = 'div[cellRow="' + row + '"][cellCol="' + col + '"]';
      if (board.boardCells[row][col].flagged) {
        $(flagCell).removeClass('flag');
        board.boardCells[row][col].flagged = false;
      } else {
        $(flagCell).addClass('flag');
        board.boardCells[row][col].flagged = true;
    }
    }
  }


  /*
  * Performing the click action.
  * If an unexplored cell is clicked, it is revealed.
  * If the revealed cell is empty, all its adjacent cells are explored
  */
  function leftClick(board, row, col) {
    if ((board.gameOver == false) && (board.boardCells[row][col].explored == false)) {
      if (board.boardCells[row][col].holds == -1) {
        board.explode();
      } else if (board.boardCells[row][col].holds == 0) {
        board.clear(row, col);
        uncoverSurroundings(board, row, col);
      } else {
        board.clear(row, col);
      }
    }
  }



  /*
  * board class constructor
  */
  function Board(mode){
    this.row = mode[0];
    this.col = mode[1];
    this.mineCount = mode[2];
    this.boardCells = [];
    this.gameOver = false;
    this.cellsCleared = 0;

    //Initialising the cells
    this.boardCells = new Array(this.row);
    for (i = 0; i < this.row; i++) {
        this.boardCells[i] = new Array(this.col);
        for (j = 0; j < this.col; j++) {
            this.boardCells[i][j] = new cell(false, false, 0);
        }
    }

    //Initialising the mines
    $('#value').html(this.mineCount);
    var mineIndex = mineLocationGenerator(this.mineCount, this.row, this.col);
    for (var i = 0; i < mineIndex.length; i++) {
      this.boardCells[mineIndex[i][0]][mineIndex[i][1]] = new cell(false, false, -1);
    }

    // calculating and storing the number of adjacent mines
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
          this.boardCells[i][j].holds = numNearMine(this, i, j);
      }
    }

    // Populating and displaying the board on the page
    this.render = function() {
      var cells = "";
      for (var i = 0; i < this.row; i++) {
          for (var j = 0; j < this.col; j++) {
              cells = cells.concat('<div class="cell" cellRow="' + i + '" cellCol="' + j + '">&nbsp;</div>');
          }
          cells = cells.concat('<br>');
      }
      $('#board').empty();
      $('#board').append(cells);
    }
  }


  /*
  * cell class constructor
  */
  function cell(explored, flagged, holds){
    this.explored = explored;
    this.flagged = flagged;
    this.holds = holds;
  }


  // Calculates the number of adjacent mines. Returns -1 if the cell itself contains a mine
  function numNearMine(board, row, col) {
    if (board.boardCells[row][col].holds == -1) {
      return -1;
    } else {
      var sum = 0;
      sum += valueAt(board, row - 1, col - 1) // top left
          + valueAt(board, row - 1, col) // top
          + valueAt(board, row - 1, col + 1) // top right
          + valueAt(board, row, col - 1) // left
          + valueAt(board, row, col + 1) // right
          + valueAt(board, row + 1, col - 1) // bottom left
          + valueAt(board, row + 1, col) // bottom
          + valueAt(board, row + 1, col + 1); // bottom right
      return sum;
    }

  }


  // Checks a cell and returns 1 if it contains a mine and 0 otherwise
  function valueAt(board, row, col) {
    if (row < 0 || row >= board.row || col < 0 || col >= board.col) {
        return 0;
    } else if(board.boardCells[row][col].holds == -1){
        return 1;
    } else {
        return 0;
    }
  }


  // generates a set of unique random cell coordinates
  function mineLocationGenerator(count, maxRow, maxCol) {
    var arr = []
    var myc = 0;
    while(arr.length < count){
      console.log(myc); myc++;
      var randomRow = Math.floor(Math.random() * maxRow);
      var randomCol = Math.floor(Math.random() * maxCol);
      if (arr.some(coordinate => coordinate[0] == randomRow && coordinate[1] == randomCol)) {
        continue;
      }
      arr[arr.length] = [randomRow, randomCol];
      console.log("*["+randomRow+","+randomCol+"]");
    }
    return arr;
  }



})

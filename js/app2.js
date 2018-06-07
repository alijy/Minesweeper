$(document).ready(function () {

  // Disable the right click button's menu.
  document.oncontextmenu = function() { return false;};

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
  });

  $('#playAgain').click(function() {
    var mode = $('#mode li.selected').attr('id');
    newGame(mode);
  });


  function disableGame() {
    $('#playAgain').show();
  }

  function enableGame() {
    $('#playAgain').hide();
  }

  /*
  * Generates a new game
  */
  function newGame(mode) {
    enableGame();
    var board = new Board(modes[mode]) // generates  a new instance of board object
    board.render();
    // board.gameOver = false;

    // detects and acts on both left and right click
    $('.cell').mouseup(function(event) {
      var mouseButton = event.which;
      var row = parseInt($(event.target).attr("cellRow"));
      var col = parseInt($(event.target).attr("cellCol"));
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
        updateStats(board, 1);
      } else {
        $(flagCell).addClass('flag');
        board.boardCells[row][col].flagged = true;
        updateStats(board, -1);
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
      var content = board.boardCells[row][col].holds;
      if (content == -1) {
        board.explode();
      } else if (content == 0) {
        board.clear(row, col);
        exploreNeigbours(board, row, col);
      } else {
        board.clear(row, col);
      }
    }
  }


  function exploreNeigbours(board, row, col) {
    checkCell(board, row - 1, col - 1);
    checkCell(board, row - 1, col);
    checkCell(board, row - 1, col + 1);
    checkCell(board, row, col - 1);
    checkCell(board, row, col + 1);
    checkCell(board, row + 1, col - 1);
    checkCell(board, row + 1, col);
    checkCell(board, row + 1, col + 1);
    checkAllCellsExplored(board);
  }


  function checkCell(board, row, col) {
    if (row < 0
        || row >= board.row
        || col < 0
        || col >= board.col
        || board.boardCells[row][col].explored == true
        || board.boardCells[row][col].flagged == true) {
      return;
    } else if (board.boardCells[row][col].holds >= 0) {
      board.clear(row, col);
      if (board.boardCells[row][col].holds == 0) {
        exploreNeigbours(board, row, col);
        return;
      }
    }
  }

  function checkAllCellsExplored(board){
    if (board.row * board.col - board.spacesCleared == board.bombCount) {
      for (i = 0; i < board.row; i++) {
        for (j = 0; j < board.col; j++) {
          if (board.boardCells[i][j].holds == -1) {
            var bomb_target = 'div[cellRow="' + (i + 1) + '"][cellCol="' + (j + 1) + '"]';
            board.gameOver = true;
            disableGame();
          }
        }
      }
    }
  }


  function updateStats(board, change = 0) {
    board.mineCount += change;
    $('#value').html(board.mineCount);
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
    updateStats(this);
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


    // Reveals all mines and ends the game (maybe rewrite it with jquery later)
    this.explode = function() {
      for (i = 0; i < this.row; i++) {
        for (j = 0; j < this.col; j++) {
          var mineCell = 'div[cellRow="' + i + '"][cellCol="' + j + '"]';
          if (this.boardCells[i][j].holds == -1 && this.boardCells[i][j].flagged == false) {
            var imgUrl = "url('images/mine1.gif?random=" + Math.floor(Math.random() * 10000000 + 1000000) + "')"
            $(mineCell).addClass('mine').css("background-image", imgUrl);
            // this.boardCells[i][j].flagged = false;  (// TODO: )
            // $(mineCell).removeClass('flag');
          } else if (this.boardCells[i][j].holds != -1 && this.boardCells[i][j].flagged == true) {
            // $(mineCell).removeClass('flag');
            $(mineCell).css('background-image', 'url(images/badFlag.png)');
          }
        }
      }
      this.gameOver = true;
      disableGame();
    }

    // explores (reveals) a non-mine cell
    this.clear = function (row, col) {
      var mineCell = 'div[cellRow="' + row + '"][cellCol="' + col + '"]';
      $(mineCell).addClass('safe');
      if (this.boardCells[row][col].holds > 0) {
        $(mineCell).text(this.boardCells[row][col].holds);    // sets the number on the cell
      } else {
        $(mineCell).html('&nbsp;');    // sets an empty space on the cell
      }
      // checkAllCellsExplored.call(this);  // TODO:
      this.spacesCleared++;
      this.boardCells[row][col].explored = true;
      this.boardCells[row][col].flagged = false;
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

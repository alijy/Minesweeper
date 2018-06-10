$(document).ready(function () {

  // Disable the right click button's menu.
  document.oncontextmenu = function() { return false;};

  // An object including difficulty modes
  var modes = {
    beginner : [9, 9, 10],
    intermediate : [16, 16, 40],
    expert : [16, 30, 99]
  }

  // timers
  var timer;

  // sound effects
  var explosionSound = $('#explosionSound');

  // Set the mode and initialise a new game in that mode
  var mode = 'beginner';
  newGame(mode);

  // adding click event listener for mode selection
  $('#mode li').click(function() {
    $('#mode li').removeClass('selected');
    $(this).addClass('selected');
    mode = $(this).attr('id');
    newGame(mode);
  });

  // adding event listener for re-play button
  $('#playAgain').click(function() {
    var mode = $('#mode li.selected').attr('id');
    newGame(mode);
  });

  // Disables the game board
  function disableGame(result) {
    clearInterval(timer);   // stops the running timer
    $('#mode li').addClass('animated zoomOut');   // hides mode selection buttons
    $('#gameResult').text('You ' + result + '!').css('display' , 'inline-block');  // displays the game result
    $('#playAgain').show(); // displays the 'Play Again?' button
  }

  // Enables the game board
  function enableGame() {
    clearInterval(timer);   // stops the running timer
    $('#mode li').removeClass('animated zoomOut');  // displays mode selection buttons
    $('#gameResult').text('You Win!').css('display' , 'none');  // hides game result
    $('#playAgain').hide(); // hides the 'Play Again?' button
    $('#timer').text("0:00:00");
  }

  // when called this function starts the timer and updates it on the screen every second
  function timerStarter() {
    var start = new Date().getTime();  // keeps the start time for calculations

    // updates the timer every second
    clearInterval(timer);
    timer = setInterval(function(){
      var time = new Date().getTime() - start; // gets the elapsed time since start
      var seconds = Math.floor((time % (1000 * 60)) / 1000);
      var minutes = Math.floor((time % (1000 * 60 * 60)) / (1000 * 60));
      var hours = Math.floor((time % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      // Display the result in the element with id="timer"
      if (seconds < 10) { seconds = "0"+seconds}
      if (minutes < 10) { minutes = "0"+minutes}
      $('#timer').text(hours + ":" + minutes + ":" + seconds);
    }, 1000);
  }


  /*
  * Generates a new game
  */
  function newGame(mode) {
    enableGame();
    var board = new Board(modes[mode]) // generates  a new instance of board object
    board.render();

    // detects and acts on both left and right click
    $('.cell').mouseup(function(event) {
      var mouseButton = event.which;
      var row = parseInt($(event.target).attr("cellRow"));
      var col = parseInt($(event.target).attr("cellCol"));

      // detect the type of click (left or right)
      if (mouseButton == 1) {           // detects left click
        leftClick(board, row, col);
      } else if (event.which == 3) {    // detects right click
        rightClick(board, row, col);
      }

      // jumpstart the timer on first left/right click
      if ($('#timer').text() == "0:00:00") {
        timerStarter();
      }
    })

    // detects and acts on double click
    $('.cell').dblclick(function() {
      var row = parseInt($(event.target).attr("cellRow"));
      var col = parseInt($(event.target).attr("cellCol"));
      doubleClick(board, row, col);
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
        updateStats(board, -1);
      } else {
        $(flagCell).addClass('flag');
        board.boardCells[row][col].flagged = true;
        updateStats(board, 1);
        checkAllCellsExplored(board);
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
        exploreNeighbours(board, row, col);
      } else {
        board.clear(row, col);
      }
    }
  }


  /*
  * Performing the double-click action.
  * If an explored and numbered cell is double-clicked, it checks whether the number of adjacent flags match cell's number.
  * If they match, all other unexplored neighbours are explored automatically.
  */
  function doubleClick(board, row, col) {
    var cell = 'div[cellRow="' + row + '"][cellCol="' + col + '"]';
    var cellMineCount = board.boardCells[row][col].holds;
    if (cellMineCount > 0 &&  cellMineCount == neighbourFlags(board, row, col)) {
      getNeighbours(board,row,col).forEach(function(nb){
        if (board.boardCells[nb[0]][nb[1]].explored == false  && board.boardCells[nb[0]][nb[1]].flagged == false) {
          leftClick(board,nb[0],nb[1]);
        }
      })
    }
  }


  // return a 2-dimensional array of available adjacent cells.
  function getNeighbours(board, row, col) {
    var neighbours = [[row - 1, col - 1],
                      [row - 1, col],
                      [row - 1, col + 1],
                      [row, col - 1],
                      [row, col + 1],
                      [row + 1, col - 1],
                      [row + 1, col],
                      [row + 1, col + 1]];
    var realNeighbours = [];
    neighbours.forEach(function(nb) {
      if (nb[0] >= 0 && nb[0] < board.row && nb[1] >= 0 && nb[1] < board.col){
        realNeighbours.push(nb);
      }
    })
    return realNeighbours;
  }

  // returns the number of flagged neighbours of a given cell
  function neighbourFlags(board, row, col) {
    var sum = 0;
    getNeighbours(board, row, col).forEach(function(nb) {
      if(board.boardCells[nb[0]][nb[1]].flagged) {
        sum++;
      }
    })
    return sum;
  }


  // checks all adjacent cell of the given cell recursively (using 'checkCell' function)
  function exploreNeighbours(board, row, col) {
    getNeighbours(board,row,col).forEach(function(nb){
      checkCell(board, nb[0], nb[1]);
    })
    checkAllCellsExplored(board);
  }


  // checks whether a given cell can be cleared (i.e. no mine) and if it's empty calls 'exploreNeighbours' to check adjacent cells
  function checkCell(board, row, col) {
    if (board.boardCells[row][col].explored == false
        && board.boardCells[row][col].flagged == false
        && (board.boardCells[row][col].holds >= 0)) {
      board.clear(row, col);
      if (board.boardCells[row][col].holds == 0) {
        exploreNeighbours(board, row, col);
        return;
      }
    }
  }


  // detects a winning condition by checking whether all safe cells are explored
  function checkAllCellsExplored(board){
    if (board.row * board.col - board.cellsCleared == board.mineCount) {
      board.gameOver = true;
      disableGame('Win');
    }
  }


  // updates the number of unflagged mines on the screen
  function updateStats(board, change = 0) {
    board.flagCount += change;
    $('#value').html(board.mineCount - board.flagCount);
  }


  /*
  * board class constructor
  */
  function Board(mode){
    this.row = mode[0];
    this.col = mode[1];
    this.mineCount = mode[2];
    this.flagCount = 0;
    this.boardCells = [];
    this.gameOver = false;
    this.cellsCleared = 0;
    updateStats(this);

    //Initialising the cells
    this.boardCells = new Array(this.row);
    for (i = 0; i < this.row; i++) {
        this.boardCells[i] = new Array(this.col);
        for (j = 0; j < this.col; j++) {
            this.boardCells[i][j] = new cell(false, false, 0);
        }
    }

    //Initialising the mines
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
            var imgUrl = "url('images/mine1.gif?random=" + Math.floor(Math.random() * 10000000 + 1000000) + "')"; // creates a unique image url
            $(mineCell).addClass('mine').css("background-image", imgUrl);
            setTimeout(function() {   // sets a time delay to match sound and animation
              explosionSound[0].play();
            },1200)
          } else if (this.boardCells[i][j].holds != -1 && this.boardCells[i][j].flagged == true) {
            $(mineCell).css('background-image', 'url(images/badFlag.png)');
          }
        }
      }
      this.gameOver = true;
      disableGame('Lose');
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
      this.cellsCleared++;
      this.boardCells[row][col].explored = true;
      this.boardCells[row][col].flagged = false;
      checkAllCellsExplored(this);
    }
  }


  /*
  * cell class constructor
  */
  function cell(explored, flagged, holds){
    this.explored = explored;   // true if the cell is explored
    this.flagged = flagged;     // true if the cell is flagged
    this.holds = holds;         // -1 if the cell contains a mine, the number of adjacent mines otherwise
  }


  // Calculates the number of adjacent mines. Returns -1 if the cell itself contains a mine
  function numNearMine(board, row, col) {
    if (board.boardCells[row][col].holds == -1) {
      return -1;
    } else {
      var sum = 0;
      getNeighbours(board, row, col).forEach(function(nb){
        sum += valueAt(board, nb[0], nb[1]);
      })
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

$(document).ready(function () {

  // Disable the right click button's menu.
  function pressRightClick() { return false; }
  document.oncontextmenu = pressRightClick;

  var mode = 'beginner';
  newGame(mode);
  // $('#new-game').hide();

  $('#mode li').click(function() {
    $('#mode li').removeClass('selected');
    $(this).addClass('selected');
    mode = $(this).attr('id');
    newGame(mode);
    // $('#new-game').hide();
  });

  // $('#new-game').click(function() {
  //     var mode = $('#mode li.selected').attr('id');
  //     newGame(mode);
  //     $('#new-game').hide();
  // });

  function newGame(mode) {
    var board;
    switch (mode) {
      case 'intermediate':
        board = new boardGenerator(16, 16);
        break;
      case 'expert':
        board = new boardGenerator(16, 30);
        break;
      case 'beginner':
      default:
        board = new boardGenerator(9,9);
        break;
    }
    board.render();
    board.gameOver = false;

    $('.cell').click(function (event) {
      board.click(event.target);
    });

    $('.cell').mouseup(function(event) {
      var mouseButton = event.which;
      var row = $(event.target).attr("data-row");
      var col = $(event.target).attr("data-col");
      if (mouseButton == 1) {   // detects left click
        board.leftClick(row, col);
      } else if (event.which == 3) {    // detects right click
        board.rightClick(row, col);
      }
    })

    // return board;
  }

  // Board Object Generator
  function boardGenerator(row, col){
    this.row = row;
    this.col = col;
    this.spaces = [];
    this.gameOver = false;
    this.spacesCleared = 0;
    this.mineCount = 0;

    //Initialising the cells
    this.spaces = new Array(this.row);
    for (i = 0; i < this.row; i++) {
        this.spaces[i] = new Array(this.col);
        for (j = 0; j < this.col; j++) {
            this.spaces[i][j] = new cell(false, 0);
        }
    }

    //Initialising the mines
    this.mineCount = mineNum();
    $('#value').html(this.mineCount);
    var mineIndex = mineIndexGenerator(this.mineCount, this.row, this.col);
    for (var i = 0; i < mineIndex.length; i++) {
      this.spaces[mineIndex[i][0]][mineIndex[i][1]] = new cell(false, -1);
    }
    for (var i = 0; i < this.row; i++) {
      for (var j = 0; j < this.col; j++) {
          this.spaces[i][j].holds = numMineNear.call(this, i, j);
      }
    }

    /*
    * Returns the number of mines around the calling cell.
    * If the cell itself contains a mine, -1 is returned.
    */
    function numMineNear(row, col) {
      if (this.spaces[row][col].holds == -1) {
        return -1;
      } else {
        var sum = 0;
        sum += valueAt.call(this, row - 1, col - 1) // top left
            + valueAt.call(this, row - 1, col) // top
            + valueAt.call(this, row - 1, col + 1) // top right
            + valueAt.call(this, row, col - 1) // left
            + valueAt.call(this, row, col + 1) // right
            + valueAt.call(this, row + 1, col - 1) // bottom left
            + valueAt.call(this, row + 1, col) // bottom
            + valueAt.call(this, row + 1, col + 1); // bottom right
        return sum;
      }
    }

    /*
    * Checks a cell and returns 1 if it contains a mine and 0 otherwise
    */
    function valueAt(row, col) {
      if (row < 0 || row >= this.row || col < 0 || col >= this.col) {
          return 0;
      } else if(this.spaces[row][col].holds == -1){
          return 1;
      } else {
          return 0;
      }
    }

    this.click = function (target) {
      var row = $(target).attr("data-row");
      var col = $(target).attr("data-col");
      if (this.gameOver === true) {
        return;
      }
      if (this.spaces[row - 1][col - 1].explored == true) {
        return;
      }
      if (this.spaces[row - 1][col - 1].holds == -1) {
        this.explode();
        } else if (this.spaces[row - 1][col - 1].holds == 0) {
          this.clear(row - 1, col - 1);
          uncoverSurroundings.call(this, row - 1, col - 1);
        } else {
          this.clear(row - 1, col - 1);
      }
    }

    // this.leftClick = function

    this.rightClick = function(row, col) {
      console.log(">>["+row+","+col+"]");
      if (this.gameOver === true || (this.spaces[row - 1][col - 1].explored == true))  {
        return;
      }
      var flagCell = 'div[data-row="' + row + '"][data-col="' + col + '"]';
      $(flagCell).addClass('flag');
    }

    this.render = function() {
      var spaces = "";
      for (var i = 1; i <= row; i++) {
          for (var j = 1; j <= col; j++) {
              spaces = spaces.concat('<div class="cell" data-row="' + i + '" data-col="' + j + '">&nbsp;</div>');
          }
          spaces = spaces.concat('<br>');
      }
      $('#board').empty();
      $('#board').append(spaces);
    }

    this.clear = function (row, col) {
      var mineCell = 'div[data-row="' + (row + 1) + '"][data-col="' + (col + 1) + '"]';
      $(mineCell).addClass('safe');
      if (this.spaces[row][col].holds > 0) {
        $(mineCell).text(this.spaces[row][col].holds);
      } else {
        $(mineCell).html('&nbsp');
      }
      checkAllCellsExplored.call(this);
      this.spacesCleared++;
      this.spaces[row][col].explored = true;
    }

    function uncoverSurroundings(row, col) {
      checkSpace.call(this, row - 1, col - 1);
      checkSpace.call(this, row - 1, col);
      checkSpace.call(this, row - 1, col + 1);
      checkSpace.call(this, row, col - 1);
      checkSpace.call(this, row, col + 1);
      checkSpace.call(this, row + 1, col - 1);
      checkSpace.call(this, row + 1, col);
      checkSpace.call(this, row + 1, col + 1);
      checkAllCellsExplored.call(this);
    }

    function checkSpace(row, col) {
      if (row < 0 || row >= this.row || col < 0 || col >= this.col || this.spaces[row][col].explored == true) {
        return;
      } else if (this.spaces[row][col].holds >= 0) {
        this.clear(row, col);
        if (this.spaces[row][col].holds == 0) {
            uncoverSurroundings.call(this, row, col);
            return;
        }
      }
    }

    function checkAllCellsExplored(){
      if (this.row * this.col - this.spacesCleared == this.bombCount) {
          for (i = 0; i < this.row; i++) {
              for (j = 0; j < this.col; j++) {
                  if (this.spaces[i][j].holds == -1) {
                      var bomb_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
                      this.gameOver = true;
                      // $('#new-game').show();
                  }
              }
          }
      }
    }

    this.explode = function() {
      for (i = 0; i < this.row; i++) {
        for (j = 0; j < this.col; j++) {
          if (this.spaces[i][j].holds == -1) {
            var mineCell = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
            $(mineCell).addClass('mine');
          }
        }
      }
      this.gameOver = true;
      $('#new-game').show();
    }

  }

  //cell Object
  function cell(explored, holds){
    this.explored = explored;
    this.holds = holds;
  }

  //Mine Count Generator
  function mineNum() {
    var num = 0;
    switch(mode) {
      case 'beginner':
        num = 10;
        break;
      case 'intermediate':
        num = 40;
        break;
      case 'expert':
        num = 99;
        break;
    }
    return num;
  }

  function mineIndexGenerator(count, maxRow, maxCol) {
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

});

$(document).ready(function () {

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

    //Initialising the Object
    this.spaces = new Array(this.row);
    for (i = 0; i < this.row; i++) {
        this.spaces[i] = new Array(this.col);
        for (j = 0; j < this.col; j++) {
            this.spaces[i][j] = new cell(false, 0);
        }
    }

    //Initialising the cells
    this.mineCount = mineNum();
    $('#value').html(this.mineCount);
    var mineIndex = mineIndexGenerator(this.mineCount, this.row, this.col);
    for (var i = 0; i < mineIndex.length; i++) {
      this.spaces[mineIndex[i][0]][mineIndex[i][1]] = new cell(false, -1);
    }
    // for (var i = 0; i < this.row; i++) {
    //   for (var j = 0; j < this.col; j++) {
    //       this.spaces[i][j].holds = numMineNear.call(this, i, j);
    //   }
    // }


    this.click = function (target_element) {
      var row = $(target_element).attr("data-row");
      var col = $(target_element).attr("data-col");
      // if (this.gameOver === true) {
      //     return;
      // }
      // if (this.spaces[row - 1][col - 1].explored == true) {
      //     return;
      // }
      if (this.spaces[row - 1][col - 1].holds == -1) {
        this.explode();
        // } else if (this.spaces[row - 1][col - 1].holds == 0) {
        //     this.clear(row - 1, col - 1);
        //     uncoverSurroundings.call(this, row - 1, col - 1);
        // } else {
        //     this.clear(row - 1, col - 1);
      }
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
      var dom_target = 'div[data-row="' + (row + 1) + '"][data-col="' + (col + 1) + '"]';
      $(dom_target).addClass('safe');
      if (this.spaces[row][col].holds > 0) {
        $(dom_target).text(this.spaces[row][col].holds);
      } else {
        $(dom_target).html('&nbsp');
      }
      checkAllCellsExplored.call(this);
      this.spacesCleared++;
      this.spaces[row][col].explored = true;
    }

    this.explode = function() {
      for (i = 0; i < this.row; i++) {
        for (j = 0; j < this.col; j++) {
          if (this.spaces[i][j].holds == -1) {
            var dom_target = 'div[data-row="' + (i + 1) + '"][data-col="' + (j + 1) + '"]';
            $(dom_target).addClass('mine');
            $(dom_target).html('<i class="fa fa-mine"></i>');
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

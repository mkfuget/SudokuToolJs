const BOARD_WIDTH = 9;
const SQUARE_WIDTH = 3;
const BOARD_SQUARES = 81;


const orange = [255, 102, 0];
const red = [255, 0, 0];
const green = [0, 255, 0];
var highlightColor = 'rgba(0, 153, 255, 0.1)';

var board = new Array(BOARD_SQUARES);
var boardHeapIndex = new Array(BOARD_SQUARES);
var boardBlocks = new Array(BOARD_SQUARES);
var boardNumOptions = new Array(BOARD_SQUARES);
var solveOrder = new Array(BOARD_SQUARES);
var heapSize;
const heapCapacity = BOARD_SQUARES;

for(var i=0; i<BOARD_SQUARES; i++)
{
    solveOrder[i] = new Array(2);
    boardBlocks[i] = new Array(BOARD_WIDTH);
    boardNumOptions[i] = 9;

    solveOrder[i][0] = boardNumOptions[i];
    solveOrder[i][1] = i;
    boardHeapIndex[i] = i;
}
for(var i=0; i<BOARD_SQUARES; i++)
{
    for(var j=0; j<BOARD_WIDTH; j++)
    {
        boardBlocks[i][j]=0; // indicates all spaces are available for placement
    }
} 
var CURRENT_BOARD_INDEX;
const cells = document.querySelectorAll('.cell');
startGame();

function startGame()
{
  heapSize=BOARD_SQUARES;
  CURRENT_BOARD_INDEX = -1;
  for(var i=0; i<81; i++)
  {
    board[i] = -1;    
  }

  for(var i=0; i < cells.length; i++)
  {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
    cells[i].addEventListener('click', interpretClick, false);
  }

  addEventListener  ("keypress", interpretKeyPress, false);
}

function interpretClick(square)
{
  if(CURRENT_BOARD_INDEX!=-1)
  {
        cells[CURRENT_BOARD_INDEX].style.removeProperty('background-color');
  }
  var i = square.target.id;

  CURRENT_BOARD_INDEX = i;
  cells[i].style.backgroundColor = highlightColor;

  if(board[i]!=-1)
  {
    console.log(board[i]);
    cells[CURRENT_BOARD_INDEX].innerText = board[i]+1;
  }

}
function interpretKeyPress(e)
{
    var keyPressed = e.keyCode;
    var number;
    var lookatSolveOrder = solveOrder;
    if(keyPressed>=49 && keyPressed<=57)
    {
        number = keyPressed - 49;//ascii to number 
        addEntry(CURRENT_BOARD_INDEX, number);
    }
    if(keyPressed==97)
    {
        deleteEntry(CURRENT_BOARD_INDEX);
    }
    if(keyPressed==114)
    {
        var look = verifyHeapIntegrity();
        addEntry(0, 5);
        addEntry(2, 1);
        addEntry(3, 2);
        addEntry(5, 7);
        addEntry(8, 4);
        addEntry(9, 0);
        addEntry(11, 4);
        addEntry(14, 1);
        addEntry(16, 5);
        addEntry(19, 3);
        addEntry(21, 8);
        addEntry(24, 0);
        addEntry(25, 6);
        addEntry(26, 1);
        addEntry(31, 8);
        addEntry(33, 6);
        addEntry(37, 4);
        addEntry(39, 1);
        addEntry(41, 6);
        addEntry(43, 7);
        addEntry(47, 0);
        addEntry(49, 5);
        addEntry(54, 3);
        addEntry(55, 5);
        addEntry(56, 6);
        addEntry(59, 0);
        addEntry(61, 8);
        addEntry(64, 1);
        addEntry(66, 5);
        addEntry(69, 7);
        addEntry(71, 3);
        addEntry(72, 7);
        addEntry(75, 3);
        addEntry(77, 8);
        addEntry(78, 5);
        addEntry(80, 6);

    }
    if(keyPressed==115)
    {
        solve();
    }
}
function isPlacable(currentIndex, currentNumber, testIndex, testNumber)
{
    var currentSquare = indexToSquare(currentIndex);
    var currentCol = indexToCol(currentIndex);
    var currentRow = indexToRow(currentIndex);

    var testSquare = indexToSquare(testIndex);
    var testCol = indexToCol(testIndex);
    var testtRow = indexToRow(testIndex);

    if(currentCol==testCol && currentNumber == testNumber)
    {
        return 0;
    }
    if(currentRow==testtRow && currentNumber == testNumber)
    {
        return 0;
    }
    if(currentSquare==testSquare && currentNumber == testNumber)
    {
        return 0;
    }
    return 1;

}
function addEntry(index, number)
{
    if(boardBlocks[index][number]>0)//placement not allowed on this square
    {
        for(var i=0; i<BOARD_SQUARES; i++)
        {
            if(isPlacable(index, number, i, board[i])==0)//light up the squares that are causing a conflict
            {
                lightUpSquare(i, orange);
            }
        }
    }
    else
    {
        if(board[index]!=-1)
        {
            deleteEntry(index);
        }
        board[index][number]++;
        for(var i=0; i<BOARD_SQUARES; i++)
        {
            if(isPlacable(index, number, i, number)==0 && index!=i)
            {
                if(boardBlocks[i][number]==0)//we are adding the first blocking square for this index and number
                {
                    boardNumOptions[i]--;
                    heapIndex = boardHeapIndex[i];
                    solveOrder[heapIndex][0] = boardNumOptions[i];
                }
                boardBlocks[i][number]++;//indicate new squares that now cannot be placed in
            }
        }
        deleteHeapIndex(boardHeapIndex[index]);
        cells[index].innerText = (number+1);
        board[index] = number;    
        heapify();
    }
}
function deleteEntry(index)
{
    var number = board[index];
    if(board[index]!=-1)
    {
        boardBlocks[index][number]--;
        for(var i=0; i<BOARD_SQUARES; i++)
        {
            if(isPlacable(index, number, i, number)==0 && index!=i)
            {
                if(boardBlocks[i][number]==1)// we are removing the only blocking square for this index, 
                {
                    boardNumOptions[i]++;
                    heapIndex = boardHeapIndex[i];
                    solveOrder[heapIndex][0] = boardNumOptions[i];
                }        
                boardBlocks[i][number]--;
            }
        }
        cells[index].innerText = "";
        board[index] = -1;   
        heapPush(boardNumOptions[index], index);
        heapify();
    }
}

function solve()
{
    var look = verifyHeapIntegrity();
    var choices = [];
    var currentNumberGuess=0;
    while(heapSize>0)
    {
        currentNumberGuess = iterateHeapSolution(choices, currentNumberGuess);
    }
}
function iterateHeapSolution(choices, currentNumberGuess)
{
    var look = verifyHeapIntegrity();
    var look2 = heapSize;
    var index = heapTop()[1];
    if(currentNumberGuess>=BOARD_WIDTH)   
    {
        var lastChoice = choices.pop();
        var lastChoiceIndex = lastChoice[0];
        var lastChoiceNumber = lastChoice[1];
        lightUpSquare(lastChoiceIndex, red);
        deleteEntry(lastChoiceIndex);
        currentNumber = lastChoiceNumber[1]+1;
    }
    else if(boardBlocks[index][currentNumberGuess]==0)//placement is allowed
    {
        lightUpSquare(index, green);
        addEntry(index, currentNumberGuess);
        choices.push([index, currentNumberGuess]);
        currentNumberGuess = 0;
    }
    else
    {
        currentNumberGuess++;
    }
    return currentNumberGuess;
}

function lightUpSquare(index, color)
{
  var currentOpacity = 0.2;
  var deltaOpacity = 0.1;
  var timer = setInterval(function(){
    console.log(color.toString())
    currentOpacity += deltaOpacity;
    cells[index].style.backgroundColor = 'rgb('+color.toString()+',' + currentOpacity+')';
    if(currentOpacity>=0.5)
      {
        deltaOpacity=-0.1;
      }
      if(currentOpacity<=0 && deltaOpacity==-0.1)
      {
        clearInterval(timer);
      }
    }, 100);

}
function indexToRow(index)
{
    return Math.floor(index/9);
}

function indexToCol(index)
{
    return Math.floor(index%9);
}

function indexToSquare(index)
{
    return Math.floor(index/(SQUARE_WIDTH)%SQUARE_WIDTH)+Math.floor(index/(BOARD_WIDTH*SQUARE_WIDTH))*SQUARE_WIDTH;
}
    function right(index)
    {
        return 2*index+2;
    }
    
    function left(index)
    {
        return 2*index+1;
    }
    
    function parent(index)
    {
        return Math.floor((index-1)/2);
    }
    
    function heapPush(value, index)
    {
        if(heapSize==heapCapacity)
        {
            return;
        }
        heapSize++;
        var heapIndex = heapSize-1;
        solveOrder[heapIndex][0] = boardNumOptions[index];
        solveOrder[heapIndex][1] = index;
        
        boardHeapIndex[index] = heapIndex;
        if(typeof solveOrder[heapIndex][0] == 'undefined' || typeof solveOrder[heapIndex][1] == 'undefined')
        {
            out = "undefined data in heap"
        }

        bubbleUp(heapIndex);
    }
    
    function heapTop()
    {
        if(heapSize<=0)
        {
            var out = -1;
            return out;
        }
        return solveOrder[0];
    }
    
    function heapPop()
    {
        if(heapSize<=0)
        {
            var out = -1;
            return out;
        }
        if(heapSize ==1)
        {
            heapSize--;
            return solveOrder[0][1];
        }
        var out = solveOrder[0][1];
        heapSwap(0, heapSize-1);
        heapSize--;
        bubbleDown(0);
        return out;
    
    }
    
    function deleteHeapIndex(index)
    {
        heapSwap(index, heapSize-1);
        heapSize--;
        bubbleDown(index);
    }
    
    function bubbleDown(heapIndex)
    {
        var lookatSolveOrder = solveOrder;
        var leftIndex = left(heapIndex);
        var rightIndex = right(heapIndex);
        var child = heapIndex;
        if(leftIndex < heapSize && solveOrder[leftIndex][0] < solveOrder[child][0])
        {
            child = leftIndex;
        }
        if(rightIndex < heapSize && solveOrder[rightIndex][0] < solveOrder[child][0])
        {
            child = rightIndex;
        }
        if(child!=heapIndex)
        {
            heapSwap(heapIndex, child);
            bubbleDown(child);
        }
    }
    
    function bubbleUp(heapIndex)// cal on index in heap
    {
        while(heapIndex!=0 && solveOrder[parent(heapIndex)][0]>solveOrder[heapIndex][0])
        {
            heapSwap(parent(heapIndex), heapIndex);
            heapIndex=parent(heapIndex);
        }
    }
    
    function heapSwap(parentHeapIndex, childHeapIndex)
    {
        var lookatSolveOrder = solveOrder;
        var parentBoardIndex = solveOrder[parentHeapIndex][1];
        var childBoardIndex = solveOrder[childHeapIndex][1];
        
        var temp = solveOrder[parentHeapIndex];
        solveOrder[parentHeapIndex] = solveOrder[childHeapIndex];
        solveOrder[childHeapIndex] = temp;

        boardHeapIndex[parentBoardIndex] = childHeapIndex;
        boardHeapIndex[childBoardIndex] = parentHeapIndex;

    }
    
    function heapify()
    {
    
        for(var i=heapSize; i>=0; i--)
        {
            bubbleDown(i);
        }
    }
    function verifyHeapIntegrity()
    {
        var confirmed = 0;
        var out = "";
        for(var i=0; i<heapSize; i++)
        {
            if(typeof solveOrder[i][0] == 'undefined' || typeof solveOrder[i][1] == 'undefined')
            {
                out += "undefined data in heap"
            }
            if((left[i]<=heapSize && solveOrder[i][0]>solveOrder[left(i)][0]) || (right[i]<=heapSize && solveOrder[i][0]>solveOrder[right(i)][0]))
            {
                out += "heap structure broken";
            }
        }
        return out;
    }

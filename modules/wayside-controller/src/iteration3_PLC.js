//main
//waysideAPLC()
//waysideBPLC()
//waysideCPLC()
//waysideDPLC()
//updateCmdSpd()
//update



//FROM TRACK MODEL
var numBlocks = 150;
var blockOccupancy = new Array(numBlocks).fill(false)
var blockOperational = new Array(numBlocks).fill(true)

var switches = new Array(6).fill(false)

var arrived = false;
//FROM CTC
//var wayside_distro = 4

var waysideDistribution = new Array(150)
waysideDistribution = ['A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A','A',
'B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B',
'C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C',
'D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D','D',
'C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C','C',
'B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B','B']

var waysideDistroASugSpeed = new Array(25).fill(10)
var waysideDistroBSugSpeed = new Array(46).fill(10)
var waysideDistroCSugSpeed = new Array(38).fill(10)
var waysideDistroDSugSpeed = new Array(41).fill(10)

var waysideDistroASugAuth = new Array(25).fill(2)
var waysideDistroBSugAuth = new Array(46).fill(2)
var waysideDistroCSugAuth = new Array(38).fill(2)
var waysideDistroDSugAuth = new Array(41).fill(2)


var waysideDistroAComSpeed = new Array(25).fill(10)
var waysideDistroBComSpeed = new Array(46).fill(10)
var waysideDistroCComSpeed = new Array(38).fill(10)
var waysideDistroDSpeeComd = new Array(41).fill(10)

var waysideDistroAComAuth = new Array(25).fill(2)
var waysideDistroBComAuth = new Array(46).fill(2)
var waysideDistroCComAuth = new Array(38).fill(2)
var waysideDistroDComAuth = new Array(41).fill(2)



//DORMONT STATION BLOCKS
waysideDistroDSugSpeed[72] = 0;



export default class iteration3_PLC
{
    //get information for track model 

    
}


function waysideAPLC()
{
    switches[4] = blockOccupancy[11]
}

function waysideBPLC()
{
    switches[3] = blockOccupancy[28]
}


function waysideCPLC()
{
    switches[0] = false
    switches[5] = false

}

function waysideDPLC()
{
    switches[1] = blockOccupancy[76]
    switches[2] = blockOccupancy[99]
}

function updateCmdSpd()
{
    if(!arrived && blockOccupancy[72]==true)
    {
        arrived = true;
        setTimeout(() => {console.log("WAITING!");}, 2000)
    }
}
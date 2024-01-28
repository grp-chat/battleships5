const sock = io();

//LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL
var nickname;
const promptMsg = () => {

    //const sat2PMStudents = [LK, LXR, SZF, JHA, JL, JV, H, TCR];
    const sun230pmStudents = ["LOK", "KSY", "KN", "JT", "CJH", "LSH", "KX", "TJY"];
    const sat4pmStudents = ["JX", "JZ", "TWN", "LJY", "LSH", "ELI", "CUR", "CT", "RYD"];

    const studentLogins = {
        teacher: { pinNumber: '8', nickname: 'TCR' },
        len: { pinNumber: '1502', nickname: 'LEN' },

        sat2pmStudent1: { pinNumber: '9852', nickname: 'LK' },
        sat2pmStudent2: { pinNumber: '9035', nickname: 'LXR' },
        sat2pmStudent3: { pinNumber: '3839', nickname: 'SZF' },
        sat2pmStudent4: { pinNumber: '3583', nickname: 'JHA' },
        sat2pmStudent5: { pinNumber: '1072', nickname: 'JL' },
        sat2pmStudent6: { pinNumber: '5691', nickname: 'JV' },
        sat2pmStudent7: { pinNumber: '4048', nickname: 'H' },

        sat4pmStudent1: { pinNumber: '1289', nickname: "JX" },
        sat4pmStudent2: { pinNumber: '3825', nickname: "JZ" },
        sat4pmStudent3: { pinNumber: '8579', nickname: "TWN" },
        sat4pmStudent4: { pinNumber: '8828', nickname: "LJY" },
        sat4pmStudent5: { pinNumber: '1529', nickname: "LSH" },
        sat4pmStudent6: { pinNumber: '3191', nickname: "ELI" },
        sat4pmStudent7: { pinNumber: '3307', nickname: "CUR" },
        sat4pmStudent8: { pinNumber: '2318', nickname: "CT" },
        sat4pmStudent9: { pinNumber: '7385', nickname: "RYD" },

        sun230pmStudent1: { pinNumber: '1198', nickname: "LOK" },
        sun230pmStudent2: { pinNumber: '6139', nickname: "KSY" },
        sun230pmStudent3: { pinNumber: '7051', nickname: "KN" },
        sun230pmStudent4: { pinNumber: '4162', nickname: "JT" },
        sun230pmStudent5: { pinNumber: '2105', nickname: "CJH" },
        sun230pmStudent6: { pinNumber: '5086', nickname: "CED" },
        sun230pmStudent7: { pinNumber: '2167', nickname: "KX" },
        sun230pmStudent8: { pinNumber: '6588', nickname: "TJY" }
    }

    const getNickname = pinNumber => {
        return Object.values(studentLogins).find(obj => obj.pinNumber === pinNumber)?.nickname;
    }

    var nick = prompt("Please enter your pin number:");
    while (nick.length == 0) {
        alert("Please enter your pin number!");
        nick = prompt("Please enter your pin number:");
    }

    nickname = getNickname(nick);

    if (typeof (nickname) === 'undefined') {
        alert("Wrong pin number!");
        promptMsg();
    }
    
};

promptMsg();
sock.emit('newuser', nickname);

//LLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLLL

const modal = document.getElementById('modal');
const closeModalButton = document.getElementById('close-modal-button');
const overlay = document.getElementById('overlay');
const modalHeader = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

var studentsArr;
var connectedUsers;

var triggerList = [];

let matrixAreaRenderingHere = "";
let chatObjectsArr = [];
let missionObjectArr = [];
let matrixLengthXAxis = 0;
let matrixLengthYAxis = 0;
let keySafe = false;
//let obtainedPowersArr = [];

var lastClicked;
let whosTurn = "";
let turnsPlayerTeam = "";
let secretMode = false;
let deployShipCoords = 0;
let deployShipMap = null;
let targetCoord = null;
let targetMap = null;

//GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG

function createChatDivs() {
    const chatSec = document.getElementById("chat");
    var chatDiv = document.createElement("div");
    //var chatDiv = document.getElementById("chatdiv");
    //chatDiv.setAttribute("id", "chatdiv");
    chatDiv.style.width = "272px";
    chatDiv.style.height = "320px";
    //chatDiv.style = "background:rgba(255, 255, 255, 0.5); color:black; overflow: auto;"
    chatDiv.style.background = "rgba(255, 255, 255, 0.5)";
    chatDiv.style.color = "black";
    chatDiv.style.overflow = "auto";
    chatDiv.style.overflowX = "hidden";
    //chatDiv.style.float = "right";
    //chatDiv.style.marginLeft = "2%";
    //chatDiv.style.position = "fixed";
    chatDiv.style.top = "30px";
    //chatDiv.style.right = "30px";

    chatSec.appendChild(chatDiv);

    var chatInput = document.createElement('input');
    
    //chatInput.className = "form-control";
    chatInput.style.width = "205px";
    chatInput.style.height = "45px";
    chatInput.setAttribute("id", "chatinput");
    chatInput.setAttribute("type", "text");
    chatInput.style.display = "inline";
    chatInput.style.fontSize = "1.2em";
    chatDiv.appendChild(chatInput);

    var chatBtn = document.createElement('button');

    chatBtn.className = "btn";
    chatBtn.setAttribute("id", "chatBtn");
    chatBtn.innerHTML = "Send";
    chatBtn.style.height = "50px";
    chatBtn.style.width = "55px";


    chatDiv.appendChild(chatBtn);

    var div3 = document.createElement('div');
    div3.setAttribute("id", "div3");
    div3.style.width = '350px';
    div3.style.height = '260px'
    div3.style.color = 'black';
    div3.style.background = 'rgba(236, 236, 236, 0.5)';
    div3.style.overflowY = "auto";
    chatDiv.appendChild(div3);

    chatBtn.addEventListener('click', function () {
        const message = `${nickname}: ${chatInput.value}`;
        const message2 = chatInput.value;
        sock.emit('chat-to-server', message);
        if (message2 === "") {
            sock.emit('clearChatObject', nickname);
        } else if (message2.startsWith("ee") === true) {
            sock.emit('clearChatObject', nickname);
        } else {
            sock.emit('createChatObject', { message2, nickname });
        }
        
        chatInput.value = '';
    });

    chatInput.addEventListener("keyup", function (event) {
        keySafe = false;
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("chatBtn").click();
        }

    });

    chatInput.addEventListener("keydown", function (event) {
        
        if (!keySafe) {keySafe = true}
        else if (event.keyCode != 8) {event.preventDefault()}
        
        if (event.keyCode === 16) {keySafe = false}
        if (event.keyCode === 17) {keySafe = false}
        

    });

    return chatSec;
}

function createInfoDiv() {
    const infoSect = document.createElement("div");
    infoSect.setAttribute("id", "infoSect");
    infoSect.style.width = "272px";
    infoSect.style.height = "270px";
    //infoSect.style = "background:rgba(255, 255, 255, 0.5); color:black; overflow: auto;"
    //infoSect.style.background = "rgba(255, 255, 255, 0.5)";
    infoSect.style.color = "white";
    infoSect.style.border = "1px solid white";
    infoSect.style.position = "absolute";
    infoSect.style.left = "1005px";
    infoSect.style.top = "8px";
    infoSect.innerHTML = ""
    document.body.appendChild(infoSect);
}
function loadInfoDiv(connectedUsers, teamSlots) {
    const infoSect = document.getElementById("infoSect");
    infoSect.innerHTML = "<span class='green'>Connected Users:</span> <br>";
    infoSect.innerHTML += `[ ${connectedUsers.join(", ")} ] <br>`;
    infoSect.innerHTML += `<hr>`;
    infoSect.innerHTML += "<span class='red'>Red Team:</span> <br>";
    infoSect.innerHTML += `[ ${teamSlots["Red"].join(", ")} ] <br><br>`;
    infoSect.innerHTML += `<span class='blue'>Blue Team:</span> <br>`;
    infoSect.innerHTML += `[ ${teamSlots["Blue"].join(", ")} ] <br>`;
    

    // connectedUsers.forEach(connectedId => {
    //     infoSect.innerHTML += `${connectedId}<br>`;
    // });
    

}

function appendMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.innerText = message;
    var div3 = document.getElementById("div3");
    div3.append(messageDiv);
    div3.scrollTop = div3.scrollHeight;


    allCommands.forEach((command) => {
        command.executeCommand(message);
    });
}

function openModal() {
    if (modal === null) return
    modal.classList.add('active');
    overlay.classList.add('active');
}
function requestPowerArray() {
    sock.emit('pushPowerArray', nickname);
}
function loadObtainedPowersToModal(powersArr, teamNum, awardedSteps) {
    
    modalHeader.innerHTML = `${nickname} - ${teamDetails[teamNum].art}: ${teamDetails[teamNum].desc} <br>`;
    modalHeader.innerHTML += `Abilities: ${teamDetails[teamNum].abilities}<br>`;
    modalHeader.innerHTML += `Steps: ${awardedSteps}`
    modalBody.innerHTML = "";
    powersArr.forEach((power, index) => {
        modalBody.innerHTML +=`${index + 1}: ${power.title} <br>`;
    });
}
function loadMiniMapToModal() {
    
    modalHeader.innerHTML = `Map`;
    modalBody.innerHTML = "";
    
}
function loadListToModal() {
    modalHeader.innerHTML = "Trigger list";
    modalBody.innerHTML = "";
    triggerList.forEach((item) => {
        modalBody.innerHTML += item + " <br>";
    });

}
function closeModal() {
    if (modal === null) return
    modal.classList.remove('active');
    overlay.classList.remove('active');
}

function clientRender(data) {
    const getPlayerObject = data.playersArr.find(object => object.id === nickname);
    matrixAreaRenderingHere = getPlayerObject.area;
    const {
        gridMatrix: playerMatrix, 
        title: playerAreaTitle, 
        doors: redDoorCoords,
        signBoards: signBoards,
        finishFlags: finishFlags
        } = data.allMatrixes[getPlayerObject.area];
    
    const {playersArr, extraArr, itemsArr} = data;


    const config = { playersArr, extraArr, itemsArr, playerMatrix, playerAreaTitle, redDoorCoords, signBoards, finishFlags };
    const clientRender = new GridSystemClient(config);
    clientRender.render();
    
}
//BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB


function clickableGrid(rows, cols, team, callback) {
    var i = 0;
    var grid = document.createElement('table');
    grid.setAttribute("id", "tbl")
    grid.className = 'grid';
    grid.style = "color:white";

    const teams = {
        "red": { title: "Red Team's Map", style: "background:rgba(255, 0, 0, 0.6); color:white", mapName: "red" },
        "blue": { title: "Blue Team's Map", style: "background:rgba(0, 0, 255, 0.6); color:white", mapName: "blue" },
    }

    const header = grid.appendChild(document.createElement('th'));
    header.style = teams[team].style;
    header.colSpan = 3;
    header.innerHTML = teams[team].title;

    const teamMap = teams[team].mapName;
    for (var r = 0; r < rows; ++r) {
        var tr = grid.appendChild(document.createElement('tr'));
        for (var c = 0; c < cols; ++c) {
            var cell = tr.appendChild(document.createElement('td'));
            cell.innerHTML = ++i;
            cell.setAttribute("id", `${teamMap}${i}`);
            cell.addEventListener('click', (function (el, r, c, i, teamMap) {
                return function () {
                    callback(el, r, c, i, teamMap);
                }
            })(cell, r, c, i, teamMap), false);
        }
    }
    return grid;
}

function checkIfThisUserCanClick(id) {
    if (["TCR", whosTurn].indexOf(id) === -1) return false;
    return true;
}
function checkifUserCanClickThisMap(teamMap, turnsPlayerTeam) {
    const settings = {
        "Red": "red",
        "Blue": "blue",
    }

    if (nickname === "TCR") return true;
    if(teamMap === settings[turnsPlayerTeam]) return false;
    return true;
}

function toggleOnAndOffThe2Cells(id) {
    lastClicked.className = '';
    document.getElementById(id).className = 'clicked';
    lastClicked = document.getElementById(id);
}

function afterClickingTheGrid(el, row, col, i, teamMap) {
    // console.log("You clicked on element:", el);
    // console.log("You clicked on row:", row);
    // console.log("You clicked on col:", col);
    // console.log("You clicked on item #:", i);
    // console.log("You clicked on map:", teamMap);
    
    // el.className = 'clicked';
    // if (lastClicked) lastClicked.className = '';
    // lastClicked = el;

    if (!checkIfThisUserCanClick(nickname)) return;
    if (!checkifUserCanClickThisMap(teamMap, turnsPlayerTeam)) return;
    const cell = el.id
    sock.emit('clickedGrid', { cell, i, teamMap });
    
}
function clickGridDuringSecretMode(el, row, col, i, teamMap) {
    // console.log("You clicked on element:", el);
    // console.log("You clicked on row:", row);
    // console.log("You clicked on col:", col);
    // console.log("You clicked on item #:", i);
    // console.log("You clicked on map:", teamMap);
    
    el.className = 'clicked';
    if (lastClicked) lastClicked.className = '';
    lastClicked = el;

    deployShipCoords = i;
    deployShipMap = teamMap;
    
}

function getPlayerObject(playerId, playersObj) {
    return Object.values(playersObj).find(obj => obj.id === playerId);
}

function secretModeFunction(playersArr, swapMode) {
    secretMode = true;
    document.body.style.backgroundImage = "url('https://image.api.playstation.com/vulcan/img/cfn/113073OFqK6aOGtChoaD10NjzN9CP9FrvkckXuENRrh660ikA_6I5hbRG9oaweerDRiOjduQhxEdElSwMYXJGVBcajAtZhgG.png')";

    const playerObj = getPlayerObject(nickname, playersArr);
    if (playerObj.team == "Blue") {
        // document.body.style.backgroundImage = "url('https://getwallpapers.com/wallpaper/full/a/b/1/1255965-world-of-warships-yamato-wallpaper-1920x1080-pc.jpg')";
        document.body.style.backgroundImage = "url('https://ips4-wowslegends-global.gcdn.co/monthly_2021_10/Mainz_DE_T7_CA_Art_key-artwork_1920x1080_WG_Spb_WoWSL_NoLogo.jpg.9bd3826507660e79cb6e1ea65015d7cd.jpg')";
    }

    const settings = {
        "Red": grid2,
        "Blue": grid,
    }

    if (settings[playerObj.team] === undefined) {
        grid.style.display = "none";
        grid2.style.display = "none";
        return;
    }

    if (nickname === "TCR" && swapMode === true) {
        grid.style.display = "inline";
        grid2.style.display = "inline";
    } 

    settings[playerObj.team].style.display = "none";

    
    
}
function offSecretMode(mainSystem) {
    
    secretMode = false;
    document.body.style.backgroundImage = "url('https://naval-encyclopedia.com/wp-content/uploads/2019/07/wow-lepanto.jpg')"
    if (lastClicked) lastClicked.className = '';

    grid.style.display = "inline";
    grid2.style.display = "inline";

    const playerObj = getPlayerObject(nickname, mainSystem.playersArr);
    const settings = {
        "Red": "red",
        "Blue": "blue",
    }
    
    if (mainSystem.shipsLocations[settings[playerObj.team]] === undefined) return;
    mainSystem.shipsLocations["red"].forEach(coords => {
        document.getElementById(`red${coords}`).innerHTML = coords;
    });
    mainSystem.shipsLocations["blue"].forEach(coords => {
        document.getElementById(`blue${coords}`).innerHTML = coords;
    });
    mainSystem.allCrates["red"].forEach(coords => {
        document.getElementById(`red${coords}`).innerHTML = coords;
    });
    mainSystem.allCrates["blue"].forEach(coords => {
        document.getElementById(`blue${coords}`).innerHTML = coords;
    });
}


//EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
const grid = clickableGrid(5, 5, "red", function (el, row, col, i, teamMap) {
    if (secretMode) {
        clickGridDuringSecretMode(el, row, col, i, teamMap);
    } else {
        afterClickingTheGrid(el, row, col, i, teamMap);
    }
    
    
});

const grid2 = clickableGrid(5, 5, "blue", function (el, row, col, i, teamMap) {
    if (secretMode) {
        clickGridDuringSecretMode(el, row, col, i, teamMap);
    } else {
        afterClickingTheGrid(el, row, col, i, teamMap);
    }
});

// document.getElementById("redTeamMap").appendChild(grid);
// document.getElementById("blueTeamMap").appendChild(grid2);
document.body.appendChild(grid);
document.body.appendChild(grid2);

//document.getElementById("red1").className = 'clicked';
lastClicked = document.getElementById("red1");

//FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF


createChatDivs();
createInfoDiv();


closeModalButton.addEventListener('click', () => {
    closeModal();
});

overlay.addEventListener('click', () => {
    closeModal();
});

document.addEventListener("keydown", (e) => {
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.view.event.preventDefault();
    }
});
document.addEventListener("keyup", (e) => {
    if ([37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        sock.emit('keyPress', e.keyCode);
    }
    //e.view.event.preventDefault();
    //sock.emit('keyPress', e.keyCode);
});

document.getElementById("chatinput").focus();

//============================================================================================================

//============COMMAND BUILDER======================COMMAND BUILDER===================COMMAND BUILDER==========
//============COMMAND BUILDER======================COMMAND BUILDER===================COMMAND BUILDER==========


sock.on('chat-to-clients', data => {
    var message = data;
    // var extractNicknameAtPrefix = message.slice(0, 4).replace(/[^A-Z]+/g, "");
    // const sliceAfter = extractNicknameAtPrefix.length
    // if (message.slice(sliceAfter + 2, sliceAfter + 4) === "pw") {
    // message = extractNicknameAtPrefix + ": pw *****"
    // }
    appendMessage(message);
});

sock.on('emitToAllUsersTheClickedCell', data => {
    if (data === null) return;

    toggleOnAndOffThe2Cells(data.cell);
    targetCoord = data.i;
    targetMap = data.teamMap;

});

sock.on('pushStudentsArr', data => {
    studentsArr = data.studentIdArr;
    loadInfoDiv(data.connectedUsers, data.teamSlots);

});

sock.on('setWhosTurnAtClient', data => {
    whosTurn = data.id;
    turnsPlayerTeam = data.team;

});

sock.on('secretModeAtClient', data => {
    const swapMode = false;
    secretModeFunction(data.playersArr, swapMode);
});

sock.on('offSecretModeAtClient', data => {
    offSecretMode(data);
});

sock.on('updateDeployMap', data => {

    const playerObj = getPlayerObject(nickname, data.playersArr);
    const settings = {
        "Red": "red",
        "Blue": "blue",
    }
    if (settings[playerObj.team] === undefined) return;

    data.shipsLocations[settings[playerObj.team]].forEach(coords => {
        document.getElementById(`${settings[playerObj.team]}${coords}`).innerHTML = ""
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/battlefield-3/340/battleship_warship_cannon_military_marine_ocean_battle-1024.png";
        img.style = "width:35px;height:35px"
        document.getElementById(`${settings[playerObj.team]}${coords}`).appendChild(img);
    });

    data.allCrates[settings[playerObj.team]].forEach(coords => {
        document.getElementById(`${settings[playerObj.team]}${coords}`).innerHTML = ""
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/infinity-outline-finance-1/48/007_123_product_crate_delivery_parachute-512.png";
        img.style = "width:35px;height:35px"
        document.getElementById(`${settings[playerObj.team]}${coords}`).appendChild(img);
    });

    data.allHits[settings[playerObj.team]].forEach(coords => {
        document.getElementById(`${settings[playerObj.team]}${coords}`).innerHTML = ""
        const img = document.createElement('img');
        img.src = "https://cdn1.iconfinder.com/data/icons/food-4-9/128/Vigor_Fire-Hot-Flame-Burn-256.png";
        img.style = "width:35px;height:35px"
        document.getElementById(`${settings[playerObj.team]}${coords}`).appendChild(img);
    });
    
});

sock.on('removeShipFromDeployMap', data => {
    const cell = document.getElementById(`${data.deployShipMap}${data.deployShipCoords}`);
    cell.innerHTML = data.deployShipCoords;
});

sock.on('updateTargetMapAtClient', data => {
    const settings = {
        "red": grid,
        "blue": grid2,
    }

    //console.log(data.shipsLocations);

    if (data.allHits[data.targetMap].includes(data.targetCoord)) {
    // data.allHits.forEach(coords => {});
        document.getElementById(`${data.targetMap}${data.targetCoord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn1.iconfinder.com/data/icons/food-4-9/128/Vigor_Fire-Hot-Flame-Burn-256.png";
        img.style = "width:30px;height:30px"
        document.getElementById(`${data.targetMap}${data.targetCoord}`).appendChild(img);

    } else if (data.cratesFound[data.targetMap].includes(data.targetCoord)) {
        document.getElementById(`${data.targetMap}${data.targetCoord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn3.iconfinder.com/data/icons/virtual-reality-and-drones/65/_Crate_Drop-1024.png";
        img.style = "width:30px;height:30px"
        document.getElementById(`${data.targetMap}${data.targetCoord}`).appendChild(img);
    } else {
        document.getElementById(`${data.targetMap}${data.targetCoord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn2.iconfinder.com/data/icons/funtime-objects-part-2/60/005_055_delete_cross_close_cancel_exit_vote-1024.png";
        img.style = "width:30px;height:30px"
        document.getElementById(`${data.targetMap}${data.targetCoord}`).appendChild(img);
    }

    
});

sock.on('updateMapIfRefreshed', data => {
    data.allHits["red"].forEach(coord => {
        document.getElementById(`red${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn1.iconfinder.com/data/icons/food-4-9/128/Vigor_Fire-Hot-Flame-Burn-256.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`red${coord}`).appendChild(img);
    });
    data.allHits["blue"].forEach(coord => {
        document.getElementById(`blue${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn1.iconfinder.com/data/icons/food-4-9/128/Vigor_Fire-Hot-Flame-Burn-256.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`blue${coord}`).appendChild(img);
    });
    data.allMisses["red"].forEach(coord => {
        document.getElementById(`red${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn2.iconfinder.com/data/icons/funtime-objects-part-2/60/005_055_delete_cross_close_cancel_exit_vote-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`red${coord}`).appendChild(img);
    });
    data.allMisses["blue"].forEach(coord => {
        document.getElementById(`blue${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn2.iconfinder.com/data/icons/funtime-objects-part-2/60/005_055_delete_cross_close_cancel_exit_vote-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`blue${coord}`).appendChild(img);
    });
    data.cratesFound["red"].forEach(coord => {
        document.getElementById(`red${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn3.iconfinder.com/data/icons/virtual-reality-and-drones/65/_Crate_Drop-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`red${coord}`).appendChild(img);
    });
    data.cratesFound["blue"].forEach(coord => {
        document.getElementById(`blue${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn3.iconfinder.com/data/icons/virtual-reality-and-drones/65/_Crate_Drop-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`blue${coord}`).appendChild(img);
    });
});

sock.on('revealAllAtClient', data => {

    data.shipsLocations["red"].forEach(coord => {
        document.getElementById(`red${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/battlefield-3/340/battleship_warship_cannon_military_marine_ocean_battle-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`red${coord}`).appendChild(img);

    });
    data.shipsLocations["blue"].forEach(coord => {
        document.getElementById(`blue${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/battlefield-3/340/battleship_warship_cannon_military_marine_ocean_battle-1024.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`blue${coord}`).appendChild(img);

    });

    data.allCrates["red"].forEach(coord => {
        document.getElementById(`red${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/infinity-outline-finance-1/48/007_123_product_crate_delivery_parachute-512.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`red${coord}`).appendChild(img);

    });
    data.allCrates["blue"].forEach(coord => {
        document.getElementById(`blue${coord}`).innerHTML = "";
        const img = document.createElement('img');
        img.src = "https://cdn4.iconfinder.com/data/icons/infinity-outline-finance-1/48/007_123_product_crate_delivery_parachute-512.png";
        img.style = "width:30px;height:30px";
        document.getElementById(`blue${coord}`).appendChild(img);

    });
});

sock.on('pushLocationsToTCR', data => {

    // console.log(studentsArr);
    if (data.shipsLocations[targetMap].includes(targetCoord)) {
        // gDrv1 = "https://drive.google.com/file/d/1kL-6P-VordZC9O8upAx9hW_yPbXe9_BY/view?usp=sharing";
        gDrv1 = "https://drive.google.com/file/d/1HiB6sgspap8lniCqNUkzecD3LaAA_8HF/view?usp=sharing";
        window.open(gDrv1, "_blank");

        // const videoDiv = document.querySelector('.video2');
        // videoDiv.classList.add('active');
        // const clip = document.querySelector('.clip2');
        // clip.play();

        // clip.addEventListener('ended',myHandler,false);
        // function myHandler(e) {
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
        // }

        // setTimeout(() => {
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
        // }, 17000);

        //console.log("Hit")
    }else if (data.allCrates[targetMap].includes(targetCoord)) {
        // gDrv1 = "https://drive.google.com/file/d/1XyLIyCJ7eVu9cWAv2n2Eae-tTOroAsr6/view?usp=sharing";
        gDrv1 = "https://drive.google.com/file/d/1ukl6RwbxsTOPV6CWb2qYGOgDVk-HzR0l/view?usp=sharing";
        window.open(gDrv1, "_blank");

        // const videoDiv = document.querySelector('.video3');
        // videoDiv.classList.add('active');
        // const clip = document.querySelector('.clip3');
        // clip.play();

        // clip.addEventListener('ended',myHandler,false);
        // function myHandler(e) {
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
        // }

        // setTimeout(() => {
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
        // }, 17000);

        //console.log("Hit")
    } else {
        // gDrv2 = "https://drive.google.com/file/d/15KRceSBG9Z-uTgGvDym33TsKoBlIJ1TO/view?usp=sharing"
        // gDrv2 = "https://drive.google.com/file/d/1iFgTNGjZqElB5vY8Ji-eB0PZOHu8m_eT/view?usp=sharing"
        gDrv2 = "https://drive.google.com/file/d/1ruywp3Hkr7l_XjPKKS_4llQlRc3HFRhM/view?usp=sharing"
        window.open(gDrv2, "_blank");

        const videoDiv = document.querySelector('.video');
        // videoDiv.classList.add('active');
        // const clip = document.querySelector('.clip1');
        // // clip.setAttribute('src', gDrv2);
        // clip.play();

        // clip.addEventListener('ended',myHandler,false);
        // function myHandler(e) {
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
        // }
        
        // setTimeout(() => {
            
        //     clip.pause();
        //     clip.currentTime = 0;
        //     videoDiv.classList.remove('active');
            
        // }, 17000);

        
        
        //console.log("Miss")
    }
    // const targetMap = data.targetMap;
    setTimeout(() => {
        if (nickname != "TCR") {return};
        sock.emit('updateTargetMap', { targetCoord, targetMap });
    }, 5000);
    

});
sock.on('displayAirDrop', data => {
    const gDrv1 = "https://drive.google.com/file/d/1xc4upf6KheKfludPmsZlC8oFEHOgO1lG/view?usp=sharing";
    const gDrv2 = "https://drive.google.com/file/d/1xPhqS8Dp3n2lTg5Wo6JczNBiyNWxvADo/view?usp=sharing";
    const gDrv3 = "https://drive.google.com/file/d/15wYolPrd3Dbeum9AJj3EsssALqUjeLSN/view?usp=sharing";
    // const gDrv3 = "https://drive.google.com/file/d/1eo_y6OpA5ovOmRw9L26PoDCA4Il3nA1D/view?usp=sharing";
    const gDrv4 = "https://drive.google.com/file/d/11X4SeC0b0Juzq4bm-Eqra18GnuZxUeQj/view?usp=sharing";

    const settings = {
        1: gDrv1,
        2: gDrv2,
        3: gDrv3,
        4: gDrv4
    }
    const teams = {
        1: data.redCratesFound,
        2: data.blueCratesFound
    }
    
    // console.log(teams[data.data]);
    // console.log(settings[teams[data.data]]);

    if (teams[data.data] == 0) {return};
    if (settings[teams[data.data]] == undefined) {return};
    
    // console.log(`Did not exit`);
    window.open(settings[teams[data.data]], "_blank");

});

sock.on('swapTCRMap', data => {
    const swapMode = true;
    secretModeFunction(data, swapMode);
});

sock.on('fixBGClient', () => {
    alert("test");
    const body = document.getElementsByTagName('body')[0];
    body.style.backgroundImage = 'url("backupBG.jpg")';
});
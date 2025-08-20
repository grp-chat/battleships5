const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { join } = require('path');
const { json } = require('express');
const fs = require('fs');
const PORT = process.env.PORT || 3000;

const app = express();

const clientPath = `${__dirname}/client`;
console.log(`Serving static files from path ${clientPath}`);

app.use(express.static(clientPath));
const server = http.createServer(app);
const io = socketio(server);

server.listen(PORT);
console.log("Server listening at " + PORT);

//------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------
const { Player } = require('./player');
const { Item } = require('./item');
const { TeamObjects } = require('./TeamObjects');
const { AllMatrixes } = require('./maps');
//------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------


const getPlayerObject = playerId => {
    return Object.values(gridSystem).find(obj => obj.id === playerId);
}
const getPlayerObjectKey = playerId => {
    const findThis = Object.values(gridSystem).find(obj => obj.id === playerId);
    return Object.keys(gridSystem).find(key => gridSystem[key] === findThis);
}
const getLockIdFromPassword = password => {
    const findThis = Object.values(gridSystem.lockIds).find(obj => obj.password === password);
    return Object.keys(gridSystem.lockIds).find(key => gridSystem.lockIds[key] === findThis);

    // const findThisObject = Object.values(gridSystem.lockIds).find(obj => obj.password === data);
    //     const lockId = Object.keys(gridSystem.lockIds).find(key => gridSystem.lockIds[key] === findThisObject);
}

class MainSystem {
    constructor() {
        // this.extraArr = ["TCR", "LOK", "LK", "JHA", "JV", "CJH", "SZF", "JHA", "TJY", "KX"];
        //this.studentIdArr = ["TCR", "JX", "JZ", "TWN", "LJY", "ELI", "CUR", "LSH", "CT", "LK", "JV"];
        //this.extraArr = ["TCR", "CUR", "CT", "ELI", "JZ", "LJY", "TWN", "RYD", "JX", "LK", "JV"];
        // this.extraArr = ["TCR", "LOK", "JHA", "KN", "JT", "CJH", "CED", "KX", "TJY", "LSH", "SZF"];
        // this.studentIdArr = ["TCR", "LOK", "JHA", "KN", "JT", "CJH", "CED", "KX", "TJY", "RYD", "SZF"];
        this.studentIdArr = ["TCR", "PA", "PB", "LOK", "KN", "JON", "LXA", "KX", "TJY", "RYD", "SZF"];

        this.playersArr = [
            this.p1 = new Player({ id: this.studentIdArr[0], deployChance:100 }),

            this.p2 = new Player({ id: this.studentIdArr[1], }),
            this.p3 = new Player({ id: this.studentIdArr[2], }),
            this.p4 = new Player({ id: this.studentIdArr[3], }),
            this.p5 = new Player({ id: this.studentIdArr[4], }),
            this.p6 = new Player({ id: this.studentIdArr[5], }),
            this.p7 = new Player({ id: this.studentIdArr[6], }),
            this.p8 = new Player({ id: this.studentIdArr[7], }),
            this.p9 = new Player({ id: this.studentIdArr[8], }),
            this.p10 = new Player({ id: this.studentIdArr[9], }),
            this.p11 = new Player({ id: this.studentIdArr[10], })
        ];

        this.connectedUsers = [];

        this.whosTurn = "";

        this.teamSlots = {
            "Red": [],
            "Blue": []
        };

        this.shipsQty = {
            "Red": 5,
            "Blue": 5
        }

        this.shipsLocations = {
            "red": [],
            "blue": [],
        }
        this.allMisses = {
            "red": [],
            "blue": [],
        }
        this.allHits = {
            "red": [],
            "blue": [],
        }
        this.allCrates = {
            "red": [],
            "blue": [],
        }
        this.cratesFound = {
            "red": [],
            "blue": [],
        }
        this.resultPending = false;

        this.cellLastClicked = null;

        this.secretMode = false;

        this.gameStarted = false;

        this.randomRed = [];
        this.randomBlue = [];

        while(this.randomBlue.length < 4) {
            var r = Math.floor(Math.random() * 5) + 1;
            if (this.randomBlue.indexOf(r) === -1) this.randomBlue.push(r)
        }
        while(this.randomRed.length < 4) {
            var r = Math.floor(Math.random() * 5) + 1;
            if (this.randomRed.indexOf(r) === -1) this.randomRed.push(r)
        }

        console.log(this.randomRed)
        console.log (this.randomBlue)
        
    }

    getPlayerObject(playerId) {
        return Object.values(this.playersArr).find(obj => obj.id === playerId);
    }

    checkIfServerJustCrashed() {

        // if (this.shipsLocations["red"].length == 0 && this.shipsLocations["blue"].length == 0) {
        //     if (this.gameStarted == true) {}
        //     io.emit('chat-to-clients', `please run restore`);
        // }
        // io.emit('chat-to-clients', `${this.shipsLocations["red"].length}`);
        io.emit('chat-to-clients', `Game started is ${this.gameStarted}`);
        io.emit('chat-to-clients', `Please check if server crashed`);
        io.emit('chat-to-clients', `Missile launch not initiated`);
    }
}

const mainSystem = new MainSystem;
//console.log(mainSystem.getPlayerObject("LOK"));
// console.log(mainSystem.playersArr[1].deployChance);



//##############################################################################################################


io.sockets.on('connection', function (sock) {

    sock.on('newuser', (data) => {

        sock.id = data; //"TCR"
        io.emit('chat-to-clients', data + " connected");
        const [ redShipsCount, redShipsDestroyed ] = [mainSystem.shipsLocations["red"].length, mainSystem.allHits["red"].length];
        const [ blueShipsCount, blueShipsDestroyed ] = [mainSystem.shipsLocations["blue"].length, mainSystem.allHits["blue"].length];
        io.emit('chat-to-clients', `Total Red Ships: ${redShipsCount}`);
        io.emit('chat-to-clients', `Total Blue Ships: ${blueShipsCount}`);
        io.emit('chat-to-clients', `Game Started: ${mainSystem.gameStarted}`);


        if (!mainSystem.studentIdArr.includes(data)) return;
        mainSystem.connectedUsers.push(data);

        io.emit('pushStudentsArr', mainSystem);

        if (mainSystem.secretMode) {
            io.emit('secretModeAtClient', mainSystem);
            sock.emit('updateDeployMap', mainSystem);
        }

        const playerObj = mainSystem.getPlayerObject(data);
        if (mainSystem.whosTurn === playerObj.id) {
            io.emit('setWhosTurnAtClient', playerObj);
        }

        io.emit('updateMapIfRefreshed', mainSystem);
        
        io.emit('emitToAllUsersTheClickedCell', mainSystem.cellLastClicked);

        // gridSystem.emitToUsers('loadMatrix');
        // const gridSysKey = getPlayerObjectKey(sock.id);

        // sock.on('keyPress', function (data) {
        //     if (gridSystem[gridSysKey].steps <= 0) { return }
        //     gridSystem.movePlayer(data, gridSystem[gridSysKey]);
        //     gridSystem.emitToUsers('sendMatrix');
        // });
    });

    sock.on('disconnect', () => {
        io.emit('chat-to-clients', sock.id + " disconnected");

        mainSystem.connectedUsers = mainSystem.connectedUsers.filter(id => {
            return id !== sock.id;
        });

        io.emit('pushStudentsArr', mainSystem);

    });

    sock.on('chat-to-server', (data) => {
        io.emit('chat-to-clients', data);
    });

    sock.on('setPlayerTeam', data => {
        const playerObj = mainSystem.getPlayerObject(data.studentId);
        if (data.getNum === "0") {
            mainSystem.teamSlots[playerObj.team] = mainSystem.teamSlots[playerObj.team].filter(id => {
                return id !== data.studentId;
            });
            io.emit('pushStudentsArr', mainSystem);
            playerObj.setPlayerTeam(data.getNum);
            
            return;
        }
        if (playerObj.team !== null) {return;}
        playerObj.setPlayerTeam(data.getNum);
        mainSystem.teamSlots[playerObj.team].push(playerObj.id);
        io.emit('pushStudentsArr', mainSystem);

    });

    
    sock.on('swapTeams', () => {
        gridSystem.teamSwap();
        gridSystem.emitToUsers('sendMatrix');
        //console.log("swap activated")
    });


    sock.on('clickedGrid', data => {
        mainSystem.cellLastClicked = data;
        io.emit('emitToAllUsersTheClickedCell', data);
    });

    sock.on('setWhosTurn', data => {
        //console.log(data);
        if(data === undefined) {
            mainSystem.whosTurn = "TCR";
            io.emit('setWhosTurnAtClient', "TCR");
            return;
        }

        if (mainSystem.resultPending) {
            io.emit('chat-to-clients', `Failed - Map not updated!`);
            return;
        }
        const playerObj = mainSystem.getPlayerObject(data);
        mainSystem.whosTurn = playerObj.id;
        io.emit('setWhosTurnAtClient', playerObj);
    });

    sock.on('secretMode', () => {
        if (mainSystem.teamSlots["Blue"] == 0 && mainSystem.teamSlots["Red"] == 0) {
            io.emit('chat-to-clients', `Error. Teams not set`);
            return;
        }
        mainSystem.secretMode = true;
        io.emit('secretModeAtClient', mainSystem);
    });

    sock.on('offSecretMode', () => {
        mainSystem.secretMode = false;
        io.emit('offSecretModeAtClient', mainSystem);
    });

    sock.on('deployShip', data => {
        if (!mainSystem.secretMode) return;
        if (data.deployShipCoords === 0) return;
        if (data.deployShipMap === null) return;

        const playerObj = mainSystem.getPlayerObject(data.nickname);
        if (playerObj.deployChance === 0) {
            io.emit('chat-to-clients', `${data.nickname} deploy limit reached`);
            return;
        }
        
        if (mainSystem.shipsLocations[data.deployShipMap].includes(data.deployShipCoords)) {
            io.emit('chat-to-clients', `${data.nickname} - Already have a ship here`);
            return;
        }
        if (mainSystem.allCrates[data.deployShipMap].includes(data.deployShipCoords)) {
            io.emit('chat-to-clients', `${data.nickname} - Already have a air drop here`);
            return;
        }
        if (mainSystem.shipsLocations[data.deployShipMap].length >= 6) {
            io.emit('chat-to-clients', `${data.nickname} - Maximum ships: 6`);
            return;
        }
        // if (mainSystem.allCrates[data.deployShipMap].length >= 4)) {
        //     io.emit('chat-to-clients', `${data.nickname} - Maximum drops: 4`);
        //     return;
        // }
        //console.log("Deploy ok with data: " + data.deployShipCoords + " and " + data.deployShipMap);
        mainSystem.shipsLocations[data.deployShipMap].push(data.deployShipCoords);
        playerObj.deployChance--;
        //console.log(mainSystem.shipsLocations);
        io.emit('chat-to-clients', `Deploy success!`);
        io.emit('updateDeployMap', mainSystem);
    });
    sock.on('addShip', data => {
        
        if (data.deployShipCoords === 0) return;
        if (data.deployShipMap === null) return;

        const playerObj = mainSystem.getPlayerObject(data.nickname);
        
        mainSystem.shipsLocations[data.deployShipMap].push(data.deployShipCoords);
        io.emit('chat-to-clients', `Deploy extra ship success!`);
        //io.emit('updateDeployMap', mainSystem);
    });

    sock.on('deployCrate', data => {
        if (!mainSystem.secretMode) return;
        if (data.deployShipCoords === 0) return;
        if (data.deployShipMap === null) return;

        const playerObj = mainSystem.getPlayerObject(data.nickname);
        if (playerObj.deployChance === 0) {
            io.emit('chat-to-clients', `${data.nickname} deploy limit reached`);
            return;
        }
        
        if (mainSystem.shipsLocations[data.deployShipMap].includes(data.deployShipCoords)) {
            io.emit('chat-to-clients', `${data.nickname} - Already have a ship here`);
            return;
        }
        if (mainSystem.allCrates[data.deployShipMap].includes(data.deployShipCoords)) {
            io.emit('chat-to-clients', `${data.nickname} - Already have a air drop here`);
            return;
        }
        // if (mainSystem.shipsLocations[data.deployShipMap].length >= 7) {
        //     io.emit('chat-to-clients', `${data.nickname} - Maximum ships: 7`);
        //     return;
        // }
        if (mainSystem.allCrates[data.deployShipMap].length >= 4) {
            io.emit('chat-to-clients', `${data.nickname} - Maximum drops: 4`);
            return;
        }
        //console.log("Deploy ok with data: " + data.deployShipCoords + " and " + data.deployShipMap);
        mainSystem.allCrates[data.deployShipMap].push(data.deployShipCoords);
        playerObj.deployChance--;
        //console.log(mainSystem.shipsLocations);
        io.emit('chat-to-clients', `Air drop set!`);
        io.emit('updateDeployMap', mainSystem);
    });

    sock.on('unDeployShip', data => {
        if (!mainSystem.secretMode) return;
        if (data.deployShipCoords === 0) return;
        if (data.deployShipMap === null) return;
        if (data.nickname !== "TCR") return;
        const { deployShipCoords, deployShipMap } = data;

        mainSystem.shipsLocations[data.deployShipMap] = mainSystem.shipsLocations[data.deployShipMap].filter(coord => {
            return coord !== data.deployShipCoords;
        });
        io.emit('chat-to-clients', `Un-Deploy success!`);
        io.emit('removeShipFromDeployMap', { mainSystem, deployShipMap, deployShipCoords });
        console.log("Undeployment detected:");
        //console.log(mainSystem.shipsLocations);

    });

    sock.on('updateTargetMap', data => {
        const {targetCoord, targetMap} = data;
        const shipsLocations = mainSystem.shipsLocations;
        const allCrates = mainSystem.allCrates;

        if (mainSystem.shipsLocations[targetMap] === undefined) return;

        if (mainSystem.shipsLocations[targetMap].includes(targetCoord)) {
            mainSystem.allHits[targetMap].push(targetCoord);
            
        }else if (mainSystem.allCrates[targetMap].includes(targetCoord)) {
            mainSystem.cratesFound[targetMap].push(targetCoord);
            
        } else {
            mainSystem.allMisses[targetMap].push(targetCoord);
            
        }
        
        mainSystem.shipsLocations[targetMap] = mainSystem.shipsLocations[targetMap].filter(coord => {
            return coord !== targetCoord;
        });
        mainSystem.allCrates[targetMap] = mainSystem.allCrates[targetMap].filter(coord => {
            return coord !== targetCoord;
        });

        const allHits = mainSystem.allHits;
        const cratesFound = mainSystem.cratesFound;
        io.emit('updateTargetMapAtClient', { targetCoord, targetMap, shipsLocations, allCrates, allHits, cratesFound });

        mainSystem.resultPending = false;

        const txtShipLocations = JSON.stringify(mainSystem.shipsLocations);
        const txtAllHits = JSON.stringify(mainSystem.allHits);
        const txtAllMisses = JSON.stringify(mainSystem.allMisses);
        const txtAllCrates = JSON.stringify(mainSystem.allCrates);
        const txtcratesFound = JSON.stringify(mainSystem.cratesFound);

        const writeToFile = `"Loc": ${txtShipLocations} \n "Hits": ${txtAllHits} \n "Misses": ${txtAllMisses} \n "Crates": ${txtAllCrates} \n "Found": ${txtcratesFound}`;
        fs.writeFile('history.txt', writeToFile, err => {
            if(err) {
                console.err;
                return;
            }
        });

    });

    sock.on('launch', () => {
        
        if (mainSystem.gameStarted == false) {
            mainSystem.checkIfServerJustCrashed();
            return
        };
        io.emit('chat-to-clients', `Progress saved`);

        sock.emit('pushLocationsToTCR', mainSystem);
        mainSystem.resultPending = true;
    });
    sock.on('fixBG', () => {
        io.emit('fixBGClient');
    });
    sock.on('getLink', () => {
        io.emit('chat-to-clients', `https://lh3.googleusercontent.com/pw/AP1GczPdivmQ54fYNV7yvRRBHhZw2IONtHLmMIk10ANIGvDFfUU45j44_hk-KykTBSVdux4FD5rrAztSnGODVyD8npkkoR3F1XpNOX_nG9ztj4MY5B58Nx4=w2400`);
    });
    sock.on('setGameStart', () => {
        mainSystem.gameStarted = true;
        io.emit('chat-to-clients', `Game start: ${mainSystem.gameStarted}`);
        io.emit('chat-to-clients', `START!!!`);
    });
    sock.on('restoreData', () => {
        fs.readFile('history.txt', function(err, data) {
            if(err) throw err;
            var testArray = data.toString().split("\n");
            for(i in testArray) {
                // io.emit('chat-to-clients', testArray[i]);
                
                const vitalObjects = { 
                    0: mainSystem.shipsLocations,
                    1: mainSystem.allHits,
                    2: mainSystem.allMisses,
                    3: mainSystem.allCrates,
                    4: mainSystem.cratesFound
                }
                const convertToJson = JSON.parse(`{${testArray[i]}}`);
                
                vitalObjects[i]["red"] = Object.entries(convertToJson)[0][1]["red"];
                vitalObjects[i]["blue"] = Object.entries(convertToJson)[0][1]["blue"];

            }
            const [ redShipsCount, redShipsDestroyed ] = [mainSystem.shipsLocations["red"].length, mainSystem.allHits["red"].length];
            const [ blueShipsCount, blueShipsDestroyed ] = [mainSystem.shipsLocations["blue"].length, mainSystem.allHits["blue"].length];
            io.emit('chat-to-clients', `Restore success!`);
            io.emit('chat-to-clients', `Total Red Ships: ${redShipsCount}`);
            io.emit('chat-to-clients', `Total Blue Ships: ${blueShipsCount}`);
            io.emit('chat-to-clients', `Please refresh!!!`);
            
            
        });
        
    });

    sock.on('swapTCR', () => {
        if (!mainSystem.secretMode) {
            io.emit('chat-to-clients', "Negative, must be in secret mode.");
            return
        };

        const playerObj = mainSystem.getPlayerObject("TCR");
        
        if (playerObj.team === "Red") {
            playerObj.team = "Blue";
            mainSystem.teamSlots["Red"] = mainSystem.teamSlots["Red"].filter(id => {
                return id !== "TCR";
            });
            mainSystem.teamSlots["Blue"].push("TCR");
        } else if (playerObj.team === "Blue") {
            playerObj.team = "Red";
            mainSystem.teamSlots["Blue"] = mainSystem.teamSlots["Blue"].filter(id => {
                return id !== "TCR";
            });
            mainSystem.teamSlots["Red"].push("TCR");
        }
        // console.log(playerObj);
        // console.log(mainSystem.teamSlots);
        io.emit('pushStudentsArr', mainSystem);
        sock.emit('swapTCRMap', mainSystem.playersArr);
        sock.emit('updateDeployMap', mainSystem);
    });

    sock.on('callLocations', () => {
        console.log("Locations:");
        console.log(mainSystem.shipsLocations);
        io.emit('chat-to-clients', "Locations returned at server.");
    });
    sock.on('allShipsInfo', () => {
        
        const [ redShipsCount, redShipsDestroyed ] = [mainSystem.shipsLocations["red"].length, mainSystem.allHits["red"].length];
        const [ blueShipsCount, blueShipsDestroyed ] = [mainSystem.shipsLocations["blue"].length, mainSystem.allHits["blue"].length];
        const [ redCratesCount, redCratesFound ] = [mainSystem.allCrates["red"].length, mainSystem.cratesFound["red"].length];
        const [ blueCratesCount, blueCratesFound ] = [mainSystem.allCrates["blue"].length, mainSystem.cratesFound["blue"].length];
        
        io.emit('chat-to-clients', `Total Red Ships: ${redShipsCount}`);
        io.emit('chat-to-clients', `Red Ships Destroyed: ${redShipsDestroyed}`);
        io.emit('chat-to-clients', `Total Blue Ships: ${blueShipsCount}`);
        io.emit('chat-to-clients', `Blue Ships Destroyed: ${blueShipsDestroyed}`);
        io.emit('chat-to-clients', `Red Crates: F${redCratesFound}R${redCratesCount},Blue Crates: F${blueCratesFound}R${blueCratesCount}`);
    });

    sock.on('displayAirDrop', data => {
        
        
        const [ redCratesCount, redCratesFound ] = [mainSystem.allCrates["red"].length, mainSystem.cratesFound["red"].length];
        const [ blueCratesCount, blueCratesFound ] = [mainSystem.allCrates["blue"].length, mainSystem.cratesFound["blue"].length];        
        const redRandCrate = mainSystem.randomRed[redCratesFound -1];
        const blueRandCrate = mainSystem.randomBlue[blueCratesFound -1];

        io.emit('chat-to-clients', `Red Crates Found: ${redCratesFound}`);
        io.emit('chat-to-clients', `Blue Crates Found: ${blueCratesFound}`);
        io.emit('displayAirDrop', { redCratesFound, blueCratesFound, redRandCrate, blueRandCrate, data});
    });

    sock.on('addChance', data => {
        const playerObj = mainSystem.getPlayerObject(data.studentId);
        playerObj.deployChance += parseInt(data.getNum);
    });

    sock.on('revealAll', () => {
        io.emit('revealAllAtClient', mainSystem);
    });



});

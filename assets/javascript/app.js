const config = {
    apiKey: "AIzaSyA4whV92fGl0v1m7MEwkWwPd6QuFXCmrHU",
    authDomain: "rock-paper-scissors-37c58.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-37c58.firebaseio.com",
    projectId: "rock-paper-scissors-37c58",
    storageBucket: "rock-paper-scissors-37c58.appspot.com",
    messagingSenderId: "904997244284",
};

firebase.initializeApp(config);

// Create a variable to reference the database.
var database = firebase.database();
// -----------------------------

// connectionsRef references a specific location in our database.
// All of our connections will be stored in this directory.
var connectionsRef = database.ref("/connections");

// '.info/connected' is a special location provided by Firebase that is updated
// every time the client's connection state changes.
// '.info/connected' is a boolean value, true if the client is connected and false if they are not.
var connectedRef = database.ref(".info/connected");
var playersRef = database.ref("/players");
var chatRef = database.ref("/chat");

// define global variables

// playerObj takes the details of current player
var playerObj = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0,
    status: false
}

var player1Online, player2Online,
    playerNumber, otherPlayerNumber,
    player1Name, player2Name,
    player1Choice, player2Choice, timerId,
    player1Wins, player1Losses, player2Wins, player2Losses,
    playerExists, oPlayerExists;

/**
 *************************** Start - Firebase on value change events ***************************
 */

// insert connections in firebase 
connectedRef.on("value", function (snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

// read player 1 data
playersRef.child(1).on("value", function (snapshot) {
    player1Name = '';
    if (snapshot.val()) {
        player1Name = snapshot.val().name;
        player1Online = snapshot.val().status;
        player1Choice = snapshot.val().choice;
        player1Wins = snapshot.val().wins;
        player1Losses = snapshot.val().losses;

    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// read player 2 data
playersRef.child(2).on("value", function (snapshot) {
    player2Name = '';
    if (snapshot.val()) {
        player2Name = snapshot.val().name;
        player2Online = snapshot.val().status;
        player2Choice = snapshot.val().choice;
        player2Wins = snapshot.val().wins;
        player2Losses = snapshot.val().losses;
    }

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// if more than 2 connections, show message to user saying he cannot play
connectionsRef.on("value", function (snap) {
    if (snap.numChildren() > 2 && !player1Name && !player2Name) {
        $(".pre-login").hide();
        $(".post-login").hide();
        $(".player").hide();
        $("#connected-viewers").addClass("alert alert-danger m-2");
        $("#connected-viewers").text("There are already 2 players playing, you can play when one player quits.");
    }
});

// read data for both players
playersRef.on("value", function (snapshot) {
    $("#player-1").text(player1Name || "Waiting for Player 1");
    $("#player-2").text(player2Name || "Waiting for Player 2");

    // show welcome message when player enters name
    if (playerNumber) {
        showWelcomeMessage();
    }

    playerExists = snapshot.child(playerNumber).exists();
    oPlayerExists = snapshot.child(otherPlayerNumber).exists();

    if (player1Choice && player2Choice) {
        // if both players enter choices, play game and then show the results
        getWinner(player1Choice, player2Choice);
        $(".p1-choice-reveal").text(player1Choice).show();
        $(".p2-choice-reveal").text(player2Choice).show();
    } else if ((!player1Choice && player2Choice) || (player1Choice && !player2Choice)) {
        // if only 1 player has entered their choice then show the choice made to other player
        $(".p" + playerNumber + "-selections").show();
        $(".p" + otherPlayerNumber + "-choice-made").show();
    } else if (playerExists && oPlayerExists) {
        // if both players exists show them the r,p,s choices to play
        $(".p" + playerNumber + "-selections").show();
        $(".p" + otherPlayerNumber + "-no-choice").show();

        // if the players have played at least once then show them the scores
        if (playerObj.wins > 0 || playerObj.losses > 0) {
            $(".stats").show();
            $("#p1-wins").text(player1Wins);
            $("#p1-losses").text(player1Losses);
            $("#p2-wins").text(player2Wins);
            $("#p2-losses").text(player2Losses);
        }
    }

    // remove chat if at least 1 player has disconnected
    removeChat();

}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

// if one player has disconnected, show the current player that other player has left
// and remove chat
playersRef.on("child_removed", function (snapshot) {
    chatRef.push({
        name: "auto",
        text: snapshot.val().name + " left"
    });

    removeChat();
});

// check is chat is added in firebase, the display to both players
chatRef.on('child_added', function (snapshot) {
    var ssObject = snapshot.val();
    var chatDiv = $("<div>");

    if (ssObject.playerId == playerNumber) {
        chatDiv.addClass("alert alert-success chat-text");
    } else {
        chatDiv.addClass("alert alert-secondary chat-text");
    }
    chatDiv.text(ssObject.name + ": " + ssObject.text);
    $("#chat-log").append(chatDiv);
});

/**
 *************************** End - Firebase on value change events ***************************
 */

/**
 *************************** Start - event listeners ***************************
 */

// clear error message is name is entered 
$("#nameId").on("change", function () {
    $('.error').empty();
});

// if name entered then add in firebase
$("#btnSubmit").on("click", function (event) {
    event.preventDefault();
    $(".error").empty();
    name = $("#nameId").val().trim();
    if (!name) {
        $(".error").append("Please enter your name");
        return;
    }

    playerObj.name = name;
    playerObj.status = true;

    //  check player exists
    if (!player1Online) {
        playerNumber = 1;
        otherPlayerNumber = 2;
    }
    else if (!player2Online) {
        // if player 1 exists then the current player becomes no 2 player
        playerNumber = 2;
        otherPlayerNumber = 1;
    }
    else
        playerNumber = null;

    // add in firebase    
    database.ref("/players/" + playerNumber).set(playerObj);
    database.ref("/players/" + playerNumber).onDisconnect().remove();
});

// if r,p,s is selected then save in firebase and show choice added for other player
$(".choice").on("click", function () {
    if (!playerNumber) return;

    playerObj.choice = this.id;
    database.ref("/players/" + playerNumber).set(playerObj);

    $(".p" + playerNumber + "-selections").hide();
    $(".p" + playerNumber + "-choice-reveal").text(this.id).show();
    if (!player1Choice || !player2Choice) {
        $(".p" + otherPlayerNumber + "-no-choice").show();
    }
    $(".p" + otherPlayerNumber + "-choice-made").hide();
    $(".stats").show();
});

// to save chat in firebase on click of send
$("#btnSend").on("click", function (event) {
    event.preventDefault();
    chatRef.push({
        playerId: playerNumber,
        name: playerObj.name,
        text: $("#chat").val().trim()
    });

    $("#chat").val("");
});

/**
 *************************** End - Event listeners ***************************
 */

/**
*************************** Start - user defined functions ***************************
*/

// show the name form
function showForm() {
    $(".post-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".pre-login").show();
}

// show welcome message
function showWelcomeMessage() {
    $(".pre-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".post-login").show();
    $("#player-name-display").text(playerObj.name);
    $("#player-number").text(playerNumber);
}

// r,p,s functionality
function getWinner(p1Choice, p2Choice) {
    var scissorMsg = 'scissor wins against paper';
    var paperMsg = 'paper wins against rock';
    var rockMsg = 'rock wins against scissor';
    var message;
    var winner;
    var player1win = false;
    message = "It's a draw!!";

    userGuess = p1Choice;
    computerGuess = p2Choice;
    // rock and scissors
    if (userGuess == 'rock' && computerGuess == 'scissors') {
        message = rockMsg;
        winner = player1Name;
        player1win = true;
    } else if (userGuess == 'scissors' && computerGuess == 'rock') {
        message = rockMsg;
        winner = player2Name;
    }

    // paper and rock
    if (userGuess == 'paper' && computerGuess == 'rock') {
        message = paperMsg;
        winner = player1Name;
        player1win = true;
    } else if (userGuess == 'rock' && computerGuess == 'paper') {
        message = paperMsg;
        winner = player2Name;
    }

    // scissor and paper
    if (userGuess == 'scissors' && computerGuess == 'paper') {
        message = scissorMsg;
        winner = player1Name;
        player1win = true;
    } else if (userGuess == 'paper' && computerGuess == 'scissors') {
        message = scissorMsg;
        winner = player2Name;
    }

    if (winner) {
        if (player1win === true) {
            if (playerNumber == "1") {
                playerObj.wins++;
            } else {
                playerObj.losses++;
            }
        } else {
            if (playerNumber == "2") {
                playerObj.wins++;
            } else {
                playerObj.losses++;
            }
        }
        message += "<br />" + winner + " wins!!";
    }

    $("#results").html(message);
    $("#results").addClass("alert alert-danger");

    timerId = setTimeout(clearResults, 3000);
}

// remove chat from firebase if no players exists
function removeChat() {
    if (!player1Name && !player2Name) {
        chatRef.remove();
        $("#chat-log").empty();
        $(".post-login").hide();
        $(".pre-login").show();
    }
}

// clear results when there is a winner/lose/draw
function clearResults() {
    clearTimeout(timerId);
    $(".choice-reveal").text('').hide();
    $("#results").empty();
    $("#results").removeClass("alert alert-danger");

    playerObj.choice = "";
    database.ref("/players/" + playerNumber).set(playerObj);
}

/**
*************************** End - user defined functions ***************************
*/

$(document).ready(function () {
    if (!playerNumber) {
        showForm();
    }
});
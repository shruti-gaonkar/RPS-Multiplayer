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
console.log(database);
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

var player1Obj = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0,
    status: false
}
var player2Obj = {
    name: "",
    choice: "",
    wins: 0,
    losses: 0,
    status: false
}

var player1Online, player2Online, playerNumber, otherPlayerNumber,
    player1Name, player2Name;

connectedRef.on("value", function (snap) {
    if (snap.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
    }
});

connectionsRef.on("value", function (snap) {
    if (snap.numChildren() > 2) {
        $("#connected-viewers").text("There are already 2 players playing, you can play when one player quits.");
    }

});

/*playersRef.child(1).on('child_added', function (ss) {
    var newPlayer = ss.val();
    console.log(newPlayer)
    //player1Online = newPlayer.status;
    //console.log("1===" + player1Online);
    $("#player_msg").text("Hi " + newPlayer.name + "! You are player 1.");
});*/
var player1Choice, player2Choice, timerId, player1Wins, player1Losses, player2Wins, player2Losses,
    playerExists, oPlayerExists;
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

/*playersRef.child(1).child('status').on('value', function (ss) {
    player1Online = ss.val();
    //console.log("1===" + player1Online);
    console.log("1===" + player1Online + "==" + player2Online);
});

playersRef.child(2).child('status').on('value', function (ss) {
    player2Online = ss.val();
    //console.log("2===" + player2Online);
    console.log("1===" + player1Online + "==" + player2Online);
});*/

$("#btnSubmit").on("click", function (event) {
    event.preventDefault();
    name = $("#nameId").val().trim();

    player1Obj.name = name;
    player1Obj.status = true;

    if (!player1Online) {
        playerNumber = 1;
        otherPlayerNumber = 2;
    }
    else if (!player2Online) {
        playerNumber = 2;
        otherPlayerNumber = 1;
    }
    else
        playerNumber = null;

    database.ref("/players/" + playerNumber).set(player1Obj);
    database.ref("/players/" + playerNumber).onDisconnect().remove();
});


$(".choice").on("click", function () {
    if (!playerNumber) return;

    player1Obj.choice = this.id;
    database.ref("/players/" + playerNumber).set(player1Obj);

    $(".p" + playerNumber + "-selections").hide();
    $(".p" + playerNumber + "-choice-reveal").text(this.id).show();
    if (!player1Choice || !player2Choice) {
        $(".p" + otherPlayerNumber + "-no-choice").show();
    }
    $(".p" + otherPlayerNumber + "-choice-made").hide();
    $(".stats").show();
});

$("#btnSend").on("click", function (event) {
    event.preventDefault();
    chatRef.push({
        playerId: playerNumber,
        name: player1Obj.name,
        text: $("#chat").val().trim()
    });

    $("#chat").val("");
});

function showForm() {
    $(".post-login, .pending-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".pre-login").show();
}

function showWelcomeMessage() {
    $(".pre-login, .pending-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".post-login").show();
    // console.log("playerNumber===" + playerNumber);
    $("#player-name-display").text(player1Obj.name);
    $("#player-number").text(playerNumber);
}

function getWinner(p1Choice, p2Choice) {
    var scissorMsg = 'Scissor wins against paper';
    var paperMsg = 'Paper wins against rock';
    var rockMsg = 'Rock wins against scissor';
    var message;
    var winner;
    var player1win = false;
    //returnArr = new Array();
    message = "It's a draw";
    winner = "";

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

    if (player1win === true) {
        if (playerNumber == "1") {
            player1Obj.wins++;
        } else {
            player1Obj.losses++;
        }
    } else {
        if (playerNumber == "2") {
            player1Obj.wins++;
        } else {
            player1Obj.losses++;
        }
    }

    //returnArr['msg'] = message;
    //returnArr['winner'] = winner + " wins";

    $("#results").html(message + "<br />" + winner + " wins");
    $("#results").addClass("alert alert-danger");

    timerId = setTimeout(clearResults, 3000);
}

function clearResults() {
    clearTimeout(timerId);
    $(".choice-reveal").text('').hide();
    $("#results").empty();
    $("#results").removeClass("alert alert-danger");

    player1Obj.choice = "";
    console.log(player1Obj);
    database.ref("/players/" + playerNumber).set(player1Obj);
}

playersRef.on("value", function (snapshot) {
    $("#player-1").text(player1Name || "Waiting for Player 1");
    $("#player-2").text(player2Name || "Waiting for Player 2");

    if (playerNumber) {
        showWelcomeMessage();
    }

    playerExists = snapshot.child(playerNumber).exists();
    oPlayerExists = snapshot.child(otherPlayerNumber).exists();
    //var playerChoice = snapshot.child(playerNumber).val().choice;
    //var oPlayerChoice = snapshot.child(otherPlayerNumber).val().choice;
    if (player1Choice && player2Choice) {
        getWinner(player1Choice, player2Choice);
        $(".p1-choice-reveal").text(player1Choice).show();
        $(".p2-choice-reveal").text(player2Choice).show();
        //setTimeout()
    } else if ((!player1Choice && player2Choice) || (player1Choice && !player2Choice)) {
        console.log(2222222222222);
        $(".p" + playerNumber + "-selections").show();
        $(".p" + otherPlayerNumber + "-choice-made").show();
    }/* else if (player1Choice && !player2Choice) {
        console.log(2222222222222);
        $(".p" + otherPlayerNumber + "-choice-made").show();
        $(".p" + playerNumber + "-selections").show();
        $(".stats").show();
    }*/
    /*else if (playerChoice && !oPlayerChoice) {
        //$(".p" + playerNumber + "-choice-made").show();
        //$(".p" + otherPlayerNumber + "-selections").show();
        $(".stats").show();
        $(".p" + playerNumber + "-no-choice").hide();
    } else if (!playerChoice && oPlayerChoice) {
        $(".p" + otherPlayerNumber + "-choice-made").show();
        $(".p" + otherPlayerNumber + "-no-choice").hide();
    } */else if (playerExists && oPlayerExists) {
        $(".p" + playerNumber + "-selections").show();
        $(".p" + otherPlayerNumber + "-no-choice").show();

        if (player1Obj.wins > 0 || player1Obj.losses > 0) {
            $(".stats").show();

            $("#p1-wins").text(player1Wins);
            $("#p1-losses").text(player1Losses);
            $("#p2-wins").text(player2Wins);
            $("#p2-losses").text(player2Losses);
        }
    }

    console.log(playerExists + "====" + oPlayerExists);

    removeChat();
    // if(snapshot.child(playerNumber).val().choice)
    /*if (player1Name && player2Name) {
        $(".selections").show();
    }*/
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

playersRef.on("child_removed", function (snapshot) {
    chatRef.push({
        name: "auto",
        text: snapshot.val().name + " left"
    });

    removeChat();
});

function removeChat() {
    if (!playerExists && !oPlayerExists) {
        chatRef.remove();
        $("#chat-log").empty();
        $(".post-login").hide();
        $(".pre-login").show();
    }
}

chatRef.on('child_added', function (snapshot) {
    var ssObject = snapshot.val();
    var chatDiv = $("<div>");
    //console.log(ssObject.playerId + "===" + playerNumber);
    if (ssObject.playerId == playerNumber) {
        chatDiv.addClass("chat-red-class");
    } else {
        chatDiv.addClass("chat-blue-class");
    }
    chatDiv.text(ssObject.name + ": " + ssObject.text);
    $("#chat-log").append(chatDiv);
});

if (!playerNumber) {
    showForm();
}
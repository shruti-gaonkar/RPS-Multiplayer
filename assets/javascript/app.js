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

playersRef.child(1).on("value", function (snapshot) {
    if (snapshot.val()) {
        player1Name = snapshot.val().name;
        player1Online = snapshot.val().status;
    }
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

playersRef.child(2).on("value", function (snapshot) {
    if (snapshot.val()) {
        player2Name = snapshot.val().name;
        player2Online = snapshot.val().status;
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
    $(".p" + otherPlayerNumber + "-no-choice").show();
    $(".stats").show();
});

function showForm() {
    $(".post-login, .pending-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".pre-login").show();
}

function showWelcomeMessage() {
    $(".pre-login, .pending-login, .selections, .stats, .no-choice, .choice-made").hide();
    $(".post-login").show();
    $("#player-name-display").text(player1Obj.name);
    $("#player-number").text(playerNumber);
}



playersRef.on("value", function (snapshot) {
    $("#player-1").text(player1Name || "Waiting for Player 1");
    $("#player-2").text(player2Name || "Waiting for Player 2");

    if (playerNumber) {
        showWelcomeMessage();
    }

    var playerExists = snapshot.child(playerNumber).exists();
    var oPlayerExists = snapshot.child(otherPlayerNumber).exists();
    var playerChoice = snapshot.child(playerNumber).val().choice;
    var oPlayerChoice = snapshot.child(otherPlayerNumber).val().choice;
    if (oPlayerChoice && oPlayerChoice) {

    } else if (!playerChoice && oPlayerChoice) {
        $(".p" + playerNumber + "-selections").show();
        $(".p" + otherPlayerNumber + "-choice-made").show();
        $(".stats").show();
        $(".p" + playerNumber + "-no-choice").hide();
    } /*else if (playerChoice && !oPlayerChoice) {
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
    }

    // if(snapshot.child(playerNumber).val().choice)
    /*if (player1Name && player2Name) {
        $(".selections").show();
    }*/
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});

if (!playerNumber) {
    showForm();
}
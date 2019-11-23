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

var player1Online, player2Online, playerNumber;

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

playersRef.child(1).child('status').on('value', function (ss) {
    player1Online = ss.val();
    console.log("1===" + player1Online);
});

playersRef.child(2).child('status').on('value', function (ss) {
    player2Online = ss.val();
    console.log("2===" + player2Online);
});

$("#btnSubmit").on("click", function (event) {
    event.preventDefault();
    name = $("#nameId").val().trim();

    player1Obj.name = name;
    player1Obj.status = true;

    if (!player1Online) {
        playerNumber = 1;
        console.log(111);
    }
    else if (!player2Online) {
        playerNumber = 2;
        console.log(222);
    }
    else
        playerNumber = null;

    database.ref("/players/" + playerNumber).set(player1Obj);
    database.ref("/players/" + playerNumber).onDisconnect().remove();
});




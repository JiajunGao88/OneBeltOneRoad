$(document).ready(function() {
    $("#logout").hide();
    $("#rank").hide();
    $('#profile').hide();
    var socket = io.connect("http://localhost:5000");

    // room list
    socket.on('room_list', function(data) {
        console.log(data);
        // room_creation(a_room["m"], a_room["n"]);
        const len = data.length;
        var rooms = data;
        for (var i = 0; i < len; i++) {
            var room = rooms[i];
            console.log(room)
            room_creation(room["room-num"], room["room-name"]);
        }
    })

    // ranking table
    socket.on('ranking', function(data) {
        ranking_list = data;
        let text = "<table width='100%'><tr><th>User</th><th>Won</th><th>Game</th></tr>";
        for (let i = 0; i < data.length; i++) {
            let row = "<tr><td>" + data[i]["username"] + "</td><td>" + data[i]["won"] + "</td><td>" + data[i]["games"] + "</td></tr>";
            text += row;
          }
          text += "</table>";
        $("#rank").append(text);

    })

    // login
    socket.on('login', function(data) {
        console.log(data["status"]);
        if (data["status"] === "True") {
            let welcome_words = "Welcome, " + data["username"] + "!";
            let text = "<h4>You played: "+ data["games"]+", won: "+ data["won"]+"</h4>";
            $("#welcome").text(welcome_words);
            $('#profile').append(text)
            $("#auth_token").val("12345678910");
            $("#username").val(data["username"]);
            console.log($("#username").val());
            // request ranking
            socket.send("ranking request");

            $(".login_signup").hide();
            $("#logout").show();
            $("#rank").show();
            $('#profile').show();


            // request for room
            socket.emit("request_room", "");
        } else {
            alert("Username or Password is wrong, please try again!");
        }
    });
    // sign up
    socket.on('signup', function(data) {
        console.log(data["status"]);
        if (data["status"] === "False") {
            alert("Username already exists, please use another one!");
        } else {
            alert("Sign up successfully, please log in.");
        }
    })
    // create
    socket.on('create', function(data) {
        console.log(data);
        const room_info = JSON.parse(data);
        console.log(room_info["room_num"]);
        room_creation(room_info["room_num"], room_info["room-name"]);
    })

    // create send to server
    // After Game Room Creation, adding into Game Romes
    $("#Create").click(function () {
        if ($("#auth_token").val() === "") {
            alert("Please login!")
        } else {
            let room_name = $("#room-name").val();
            socket.emit("create", {"room-name": room_name});
        }
    })
    $("#refresh").click(function () {
        $("#room-list-box").empty();
        socket.emit("refresh_room", "refresh");
    })

    // After User Login, adding into Live user List
    $("#Login").click(function () {
        let signin_name = $("#signin_username").val();
        let signin_password = $("#signin_password").val();
        let login = {"username":signin_name, "password":signin_password};
        socket.emit("login", login);
    })
    $("#SignUp").click(function () {
        let signup_name = $("#signup_username").val();
        let signup_password = $("#signup_password").val();
        let signup = {"username":signup_name, "password":signup_password};
        socket.emit("signup", signup);
    })


    // Update room situ in the list
    function room_creation(room_num, room_name) {
        $("#room-list-box").append($("<div>").attr({"class": "row", "id": room_num}));
        let room = $("#" + room_num);
        room.append($("<div>").attr({"class": "col-md-3"}).append($("<h4>").text(room_num)));
        room.append($("<div>").attr({"class": "col-md-4",}).append($("<h4>").text(room_name)));
        room.append($("<div>").attr({"class": "col-md-1",}).append($("<h4>").text("0/4")));
        let username = $("#username").val();
        console.log(username);
        var form = $('<form>').attr({"action": "/game", "method": "post", "enctype": "\"multipart/form-data\""});
        form.append($('<input>').attr({"id": "username", "name": "username", "value": username, "hidden": "true"}));
        form.append($('<input>').attr({"id": "room", "name": "room", "value": room_num, "hidden": "true"}));
        form.append($('<button>').attr({"type": "submit", "class": "join"}).text("join"));

        room.append($("<div>").attr({"class": "col-md-3 offset-md-1", "id": "button_area" + room_num}));
        $('#button_area' + room_num).append(form);
        // room.append($("<div>").attr({"class": "col-md-3 offset-md-1", "id": "button_area" + room_num}));
        // $('#button_area' + room_num).append($('<form>').attr({"action": "/game"}).append($('<button>').attr({"class": "join", "id": room_num}).text("join")));
    }

})

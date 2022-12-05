$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    $("#logout").hide();
    socket.on('login', function(data) {
        console.log(data["status"]);
        if (data["status"] === "true") {
            let welcome_words = "Welcome, " + data["username"] + "!";
            $("#welcome").text(welcome_words);
            $("#auth_token").val("12345678910");
            $(".login_signup").hide();
            $("#logout").show();
        } else {
            alert("Username or Password is wrong, please try again!");
        }
    });
    socket.on('signup', function(data) {
        console.log(data["status"]);
    })
    socket.on('create', function(data) {
        console.log(data);
        const room_info = JSON.parse(data);
        console.log(room_info["room_num"]);
        room_creation(room_info["room_num"], room_info["room-name"]);
    })

    // After Game Room Creation, adding into Game Romes
    $("#Create").click(function () {
        if ($("#auth_token").val() === "") {
            alert("Please login!")
        } else {
            let room_name = $("#room-name").val();
            socket.emit("create", {"room-name": room_name});
        }
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
        room.append($("<div>").attr({"class": "col-md-3",}).append($("<button>").text("join")));
    }
})

$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    // let user

    socket.on('login', function(data) {
        console.log(data["status"]);
        if (data["status"] === "True") {
            let welcome_words = "Welcome, " + data["username"] + "!";
            $("#welcome").text(welcome_words);
            $("#auth_token").val("12345678910");
            // console.log($("#auth_token").val());
        } else {
            alert("Username or Password is wrong, please try again!");
        }
    });
    socket.on('signup', function(data) {
        console.log(data["status"]);
        if (data["status"] === "False") {
            alert("Username already exists, please use another one!");
        } else {
            alert("Sign up successfully, please log in.");
        }
    })
    // After Game Room Creation, adding into Game Romes


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

})

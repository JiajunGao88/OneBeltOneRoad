$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    // let user
    socket.on('login', function(data) {
        // console.log(socket_id)
        console.log(data["status"]);
        let welcome_words = "Welcome, " + data["username"] + ".";
        $("#welcome ").text(welcome_words);
        socket.send("User connected!");
    });
    socket.on('signup', function(data) {
        console.log(data["status"]);
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

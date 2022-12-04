$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    // let user
    socket.on('login', function(data) {
        // console.log(socket_id)
        console.log("data: ", data);
        socket.send("User connected!");
    });
    socket.on('signup', function(data) {
        console.log("data: ", data);
    })
    // After Game Room Creation, adding into Game Romes


    // After User Login, adding into Live user List
    $("#Login").click(function () {
        let signin_name = $("#signin_username").val();
        let signin_password = $("#signin_password").val();
        // $("#login").hide();
        socket.emit("login", JSON.stringify("{username: " + signin_name + ", password:" + signin_password + "}"));
    })
    $("#SignUp").click(function () {
        let signup_name = $("#signup_username").val();
        console.log(signup_name);
        let signup_password = $("#signup_password").val();
        console.log(signup_password);
        socket.emit("signup", JSON.stringify("{username: " + signup_name + ", password:" + signup_password + "}"));
    })


    // Update room situ in the list

})

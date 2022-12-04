$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    // let user
    socket.on('after connect', function(data) {
        // console.log(socket_id)
        console.log("data: ", data)
        socket.send("User connected!");
    });

    // After Game Room Creation, adding into Game Romes


    // After User Login, adding into Live user List
    $("#Login").click(function () {
        let signin_name = $("#signin_username").val();
        let signin_password = $("#signin_password").val();
        // $("#login").hide();
        socket.emit("login", socket_id.toString() + ":sign in:" + signin_name + ":" + signin_password);
    })
    $("#SignUp").click(function () {
        let signup_name = $("#signup_username").val();
        let signup_password = $("#signup_password").val();
        socket.emit("signup", socket_id.toString() + ":sign in:" + signup_name + ":" + signup_password);
    })


    // Update room situ in the list

})

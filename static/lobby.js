$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    socket.on('after connect', function(data) {
        // console.log(socket_id)
        console.log("data: ", data)
        socket.send("User connected!");
    });

    // After Game Room Creation, adding into Game Romes


    // After User Login, adding into Live user List



    // Update room situ in the list

})

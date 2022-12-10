$(document).ready(function() {
    var socket = io.connect("http://localhost:5000/game");
    let socket_id = Math.floor(Math.random() * 100);
    let username;
    socket.on('connect', function() {
        $(".dice-button").hide();
        username = $("#username").val();
        socket.emit("join", {"room": $("#room").val(), "username": username});
    });
    socket.on("join", function(data) {
        var username = $("#username_val_" + data["players"].toString());
        if (username.text() === "") {
            username.text(data["username"]);
        }
    })
    socket.on('ready', function(data){
        var ready_amount = $("#ready_amount");
        ready_amount.text((parseInt(ready_amount.text()) + 1).toString())
        var ready_list = JSON.parse(data)
        if (ready_list.includes(socket_id.toString())) {
            // console.log("I am here")
            var ready_area = $("#ready_area")
            ready_area.empty();
            ready_area.append($('<div>').attr({"class": "col-md-12", "id": "ready_message"}));
            $("#ready_message").append($('<h4>').text("Waiting for the other players ready!"))
        }
    })
    socket.on("start", function(data) {
        console.log(data);
        $("#ready_area").hide();
        var mes = JSON.parse(data)["users"]
        alert("Game start!");
        let roll_user = user_profile_fill(mes);
        console.log(roll_user)
        console.log("---------")
        console.log(socket_id)
        if (roll_user.toString() === socket_id.toString()) {
            $(".dice-button").show();
        }
    })
    socket.on('message', function(data) {
        // console.log(data);
        const gameStatus = JSON.parse(data)[0];
        const ret_mes = JSON.parse(data)[1];
        if (gameStatus === "game") {
            refresh_items()
            roll(ret_mes["roll_num"]);
            let roll_user = user_profile_fill(ret_mes["user"]);
            if (roll_user.toString() === socket_id.toString()) {
                $(".dice-button").show();
            }
            let alert_mess = JSON.parse(data)[2];
            console.log(alert_mess[0])
            console.log(socket_id)
            if (alert_mess.length !== 0 && alert_mess[0].toString() === socket_id.toString()) {
                alert_spec_status(alert_mess[1]);
            }
        }
        // else if (gameStatus === "ready") {
        //     var ready_amount = $("#ready_amount");
        //     ready_amount.empty();
        //     if (ret_mes.includes(socket_id)) {
        //         var ready_area = $("#ready_area")
        //         ready_area.empty();
        //         ready_area.append($('<div>').attr({"class": "col-md-12", "id": "ready_message"}));
        //         $("#ready_message").append($('<h4>').text("Waiting for the other players ready!"))
        //     }
        //     ready_amount.append($('<h4>').text(ret_mes.length));
        // }
        else if (gameStatus === "end") {
            alert(ret_mes);
        }
        // else {
        //     $("#ready_area").hide();
        //     alert("Game start!");
        //     let roll_user = user_profile_fill(ret_mes);
        //     if (roll_user === socket_id) {
        //         $(".dice-button").show();
        //     }
        // }
    })

    // user ready
    $("#ready-button").click(function () {
        socket.emit("ready", {"socket_id": socket_id.toString(), "room": $("#room").val()});
    })

    // ---------- DICE START HERE ----------
    $(".dice-button").click(function (){
        socket.send(JSON.stringify({"room": $("#room").val(), 'user':  socket_id}));
    });

    let images = ["static/img/dice_1.png", "static/img/dice_2.png", "static/img/dice_3.png", "static/img/dice_4.png", "static/img/dice_5.png", "static/img/dice_6.png"];
    let dice = document.querySelectorAll("img[class=die]");
    let avatar = ["/static/img/avatar1.png", "/static/img/avatar2.png", "/static/img/avatar3.png", "/static/img/avatar4.png"];

    function avatar_adding(user_id, loc_num) {
        var image = new Image();
        image.src = avatar[user_id - 1];
        image.className = "avatar";
        image.id = "avatar" + user_id;
        $("#grid-" + loc_num.toString() + "-" + user_id.toString()).append(image);

    }

    // function alert_spec_status(mes) {
    //     if (typeof mes !== "number") {
    //         let base_sent = "you reach " + mes[0] +", and you are moved from " + mes[0] + " to " + mes[1] + ".";
    //         console.log(base_sent);
    //         if (mes[0] < mes[1]) {
    //             alert("Fortunately, " + base_sent);
    //         } else {
    //             alert("Unfortunately, " + base_sent);
    //         }
    //     } else {
    //          alert("Enjoy your view for one round.");
    //     }
    //
    // }

    function refresh_items() {
        $(".dice-button").hide();
        $(".term_logo").remove();
        $(".location_val").empty();
        $(".status_val").empty();
        $(".avatar").remove();
    }


    function alert_spec_status(mes) {
        if (typeof mes !== "number") {
            let base_sent = "you reach " + mes[0] +", and you are moved from " + mes[0] + " to " + mes[1] + ".";
            console.log(base_sent);
            if (mes[0] < mes[1]) {
                alert("Fortunately, " + base_sent);
            } else {
                alert("Unfortunately, " + base_sent);
            }
        } else {
             alert("Enjoy your view for one round.");
        }

    }

    function user_profile_fill(ret_mes) {
        let roll_user = 0;
        for (let i = 0; i < 4; i++) {
            let user_id = i + 1;
            $("#location_val_" + user_id.toString()).append($('<h3>').text(ret_mes[i]["location"]));
            avatar_adding(user_id, ret_mes[i]["location"]);
            if (ret_mes[i]["status"]) {
                $("#status_val_" + user_id.toString()).append($('<h3>').text("Stop!"));
            } else {
                $("#status_val_" + user_id.toString()).append($('<h3>').text("normal"));
            }
            if (ret_mes[i]["term"]) {
                $("#user" + user_id.toString() + "_term_logo_area").append($('<i>').attr({"class": "fa fa-star term_logo"}));
                roll_user = ret_mes[i]["user_id"];
            }
        }
        console.log(roll_user)
        return roll_user;
    }

    function roll(num){
      dice.forEach(function(die){
        die.classList.add("shake");
      });
      setTimeout(function(){
        dice.forEach(function(die){
          die.classList.remove("shake");
        });

        document.querySelector("#die-1").setAttribute("src", images[num - 1]);
        // document.querySelector("#die-2").setAttribute("src", images[dieTwoValue]);
      },
      1000
      );
    }
})

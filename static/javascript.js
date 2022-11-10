$(document).ready(function() {
    var socket = io.connect("http://localhost:5000");
    let socket_id = Math.floor(Math.random() * 100);
    socket.on('connect', function() {
      // console.log(socket_id)
        $(".dice-button").hide();
      socket.send(socket_id.toString() + ": User connected!");
    });
    socket.on('message', function(data) {
        console.log(data);

        const gameStatus = JSON.parse(data)[0];
        const ret_mes = JSON.parse(data)[1];
        if (gameStatus === "game") {
            refresh_items()
            roll(ret_mes["roll_num"]);
            let roll_user = user_profile_fill(ret_mes);
            if (roll_user === socket_id) {
                $(".dice-button").show();
            }
        } else if (gameStatus === "ready") {
            var ready_amount = $("#ready_amount");
            ready_amount.empty();
            if (ret_mes.includes(socket_id)) {
                var ready_area = $("#ready_area")
                ready_area.empty();
                ready_area.append($('<div>').attr({"class": "col-md-12", "id": "ready_message"}));
                $("#ready_message").append($('<h4>').text("Waiting for the other players ready!"))
            }
            ready_amount.append($('<h4>').text(ret_mes.length));
        } else {
            console.log("start game!");
            $("#ready_area").hide();
            alert("Game start!");
            let roll_user = user_profile_fill(ret_mes);
            if (roll_user === socket_id) {
                $(".dice-button").show();
            }
        }

    })
    $("#ready-button").click(function () {
        socket.send(socket_id.toString() + ": User ready!");
    })
    // ---------- DICE START HERE ----------
    $(".dice-button").click(function (){
        socket.send(JSON.stringify({'user':  socket_id}));
    });

    let images = ["static/img/dice_1.png", "static/img/dice_2.png", "static/img/dice_3.png", "static/img/dice_4.png", "static/img/dice_5.png", "static/img/dice_6.png"];
    let dice = document.querySelectorAll("img[class=die]");

    function refresh_items() {
        $(".dice-button").hide();
        $(".term_logo").remove();
        $(".location_val").empty();
        $(".status_val").empty();
    }

    function user_profile_fill(ret_mes) {
        let roll_user = 0;
        for (let i = 0; i < 4; i++) {
            let user_id = i + 1;
            // console.log(ret_mes);
            $("#location_val_" + user_id.toString()).append($('<h3>').text(ret_mes["user"][i]["location"]));
            if (ret_mes["user"][i]["status"]) {
                $("#status_val_" + user_id.toString()).append($('<h3>').text("Stop rolling one term!"));
            } else {
                $("#status_val_" + user_id.toString()).append($('<h3>').text("normal"));
            }
            if (ret_mes["user"][i]["term"]) {
                $("#user" + user_id.toString() + "_term_logo_area").append($('<i>').attr({"class": "fa fa-star term_logo"}));
                roll_user = ret_mes["user"][i]["user_id"];
            }
        }
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
        // let dieOneValue = Math.floor(Math.random() * 6);
        // let dieTwoValue = Math.floor(Math.random() * 6);

        // console.log(dieOneValue+1, dieTwoValue+1);
        document.querySelector("#die-1").setAttribute("src", images[num - 1]);
        // document.querySelector("#die-2").setAttribute("src", images[dieTwoValue]);
      },
      1000
      );
    }
})

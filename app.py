from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit, join_room
import json, sys
from pymongo import MongoClient
import cookie_engine
import random

import game_engine


mongo_client = MongoClient("mongo")
db = mongo_client["proj"]
users_info_collection = db["users_info"]

users_account = db["users_account"]
users_test_account = db["users_account"]
cookies_collection = db["cookies_collection"]
game_collection = db["game_collection"]

app = Flask(__name__, static_url_path="/static")
app.config['SECRET'] = "secret!123"
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():  # put application's code here
    # users_account.drop()
    room_list = list(game_collection.find({}, {'_id': 0}))
    send_list = []
    for i in room_list:
        if i["game-start"] == "False":
            break
        num_user = 0
        for j in room_list["users_info"]:
            if j[0]["username"] != "":
                num_user += 1
        num_user_str = str(num_user) + "/4"
        send_list.append({"m":i["room-num"], "n":i["room-name"], "p":num_user_str})

    list_str = ''
    for i in send_list:
        c0 = '<div class="row" id="' + i["m"] + '">'
        c1 = '<div class="col-md-3"> <h4>' + i["m"] + '</h4> </div>'
        c2 = '<div class="col-md-4"> <h4>' + i["n"] + '</h4> </div>'
        c3 = '<div class="col-md-1"> <h4>' + i["p"] + '</h4> </div>'
        c4 = '<div class="col-md-3 offset-md-1" id="button_area' + i["m"] + '">'
        c4 += '<form action="/game" method="post" enctype="multipart/form-data">'
        c4 += '<input id="", "name": "", "value": "", hidden>'
        c4 += '<input id="room", name="room", value=' + i["m"] + ' hidden>'
        c4 += '<button type="submit", class="join">Join</button>'

    if list_str != '':
        list_str += '</form></div></div>'
        
    return render_template("lobby.html", list_rooms = list_str)

@app.route('/game', methods=['POST'])
def game():  # put application's code here
    print(request.form['username'])
    db_data = game_collection.find_one({"room-num": str(request.form['room'])})
    print(db_data)
    users_info = db_data["users_info"]
    players = int(db_data["num_players"]) + 1
    for i in range(0, 4):
        if users_info[i]["username"] == "":
            users_info[i]["username"] = request.form['username']
            break
    print(users_info)
    game_collection.update_one({"room-num": str(request.form['room'])}, {"$set": {"num_players": players, "users_info": users_info}})
    sys.stdout.flush()
    sys.stderr.flush()
    return render_template("index.html",
                           username1=users_info[0]["username"],
                           username2=users_info[1]["username"],
                           username3=users_info[2]["username"],
                           username4=users_info[3]["username"],
                           amount_ready=str(len(game_engine.ready_list)),
                           room=str(request.form['room']),
                           username=request.form['username'])


@socketio.on('message')
def handle_message(message):
    if "ranking request" in message:
        ranking = list(users_test_account.find({}, {"_id":0, "password":0, "salt":0}))
        emit('ranking',ranking)

@socketio.on('message', namespace='/game')
def handle_message(message):
    print("Received message: " + message)
    game_engine.alert_status = []
    # if "User connected!" in message:
    #     game_engine.users.append(int(message.split(":")[0]))
    #     # print("Connect Successful")
    if "User ready!" in message:
        user_id = int(message.split(":")[0])
        if user_id not in game_engine.ready_list:
            game_engine.ready_list.append(user_id)
            send(json.dumps(["ready", game_engine.ready_list]), broadcast=True)
        if len(game_engine.ready_list) == 4:
            for i in range(0, len(game_engine.ready_list)):
                game_engine.users_info[i]["user_id"] = game_engine.ready_list[i]
                game_engine.users = game_engine.ready_list
            send(json.dumps(["start", {"roll_num": 1, "user": game_engine.users_info}]), broadcast=True)
    else:
        term_info = json.loads(message)
        roll_num = game_engine.roll_dice()
        ret_game_states = game_engine.game_func(term_info, roll_num)
        if type(ret_game_states) == str:
            # users_info_collection.delete_one({"datatype": "status"})
            send(json.dumps(["end", ret_game_states]))
        send(json.dumps(["game", {"roll_num": roll_num, "user": ret_game_states}, game_engine.alert_status]), broadcast=True)
    sys.stdout.flush()
    sys.stderr.flush()

@socketio.on("login", namespace="/")
def signup_test(json):
    print("login")
    username = json["username"]
    password = json["password"]
    print("username is: " + username)
    print("password is: " + password)

    # check if the user in db
    exist_user = users_test_account.find_one({"username":username})
    if exist_user == None:
        feedback = {"status": "False", "username": username}
        emit('login',feedback)
    else:
        salt = exist_user["salt"]
        password_se = cookie_engine.disencry(password, salt)
        if password_se != exist_user["password"]:
            feedback = {"status": "False", "username": username}
            emit('login',feedback)
        else:
            feedback = {"status": "True", "username": username}
            emit('login', feedback)

@socketio.on("signup", namespace="/")
def signup_test(json):
    print("signup")
    username = json["username"]
    password = json["password"]
    print("username is: " + username)
    print("password is: " + password)
    # feedback = {"status": "true"}
    # emit('signup', feedback)

    # store user into user collection
    # check if user in collection
    exist_user = users_test_account.find_one({"username":username})
    if exist_user != None:
        feedback = {"status": "False", "username": username}
        emit('signup',feedback)
    else:
        salt, password_se = cookie_engine.encry(password)
        users_test_account.insert_one({"username":username, "password":password_se, "salt":salt, "won":"0", "games":"0"})
        feedback = {"status": "True", "username": username}
        emit('signup', feedback)


@socketio.on("create", namespace="/")
def create(message):
    print(message)
    message["room_num"] = str(random.randint(0, 100))
    while game_collection.find_one({"room-num": message["room_num"]}) is not None:
        message["room_num"] = str(random.randint(0, 100))
    users_info = [{"username": "", "location": 0, "status": False, "term": True},
                  {"username": "", "location": 0, "status": False, "term": False},
                  {"username": "", "location": 0, "status": False, "term": False},
                  {"username": "", "location": 0, "status": False, "term": False}]
    room = {"room-num": message["room_num"],
            "room-name": message["room-name"],
            "game-start": "False",
            "num_players": 0,
            "roll-num": 1,
            "users_info": users_info}
    game_collection.insert_one(room)
    print(room)
    emit('create', json.dumps(message), broadcast=True)


@socketio.on('connect', namespace="/game")
def connect():
    print("connect!")
    emit("connect", "Client received data!")


@socketio.on('join', namespace="/game")
def on_join(data):
    print(data)
    username = data['username']
    room = data['room']
    db_data = game_collection.find_one({"room-num": room})
    players = db_data["num_players"]
    join_room(room)
    emit("join", {"username": username, "players": players}, to=room)
    sys.stdout.flush()
    sys.stderr.flush()


# def password_confirm(username, input_password):
#     for user in game_engine.users_info:
#         if user["username"] == username:
#             return user["password"] == input_password
#     return False


    

if __name__ == '__main__':
    # from waitress import serve
    app.run(host="0.0.0.0", port=5000)

    # socketio.run(app)





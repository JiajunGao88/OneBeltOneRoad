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
    return render_template("lobby.html") #fix

@app.route('/game', methods=['POST'])
def game():  # put application's code here
    # print(request.form['username'])
    db_data = game_collection.find_one({"room-num": str(request.form['room'])})
    # print(db_data)
    users_info = db_data["users_info"]
    players = int(db_data["num_players"]) + 1
    users = db_data["users"]
    for i in range(0, 4):
        if users_info[i]["username"] == "":
            users_info[i]["username"] = request.form['username']
            break
    # print(users_info)
    game_collection.update_one({"room-num": str(request.form['room'])}, {"$set": {"num_players": players, "users_info": users_info}})
    sys.stdout.flush()
    sys.stderr.flush()
    return render_template("index.html",
                           username1=users_info[0]["username"],
                           username2=users_info[1]["username"],
                           username3=users_info[2]["username"],
                           username4=users_info[3]["username"],
                           amount_ready=str(len(users)),
                           room=str(request.form['room']),
                           username=request.form['username'])

@app.route('/data')
def datacheck():  # put application's code here
    r = list(game_collection.find({}))
    return render_template("data.html",room = r)

@socketio.on('message')
def handle_message(message):
    if "ranking request" in message:
        ranking = list(users_test_account.find({}, {"_id":0, "password":0, "salt":0}))
        emit('ranking',ranking)

@socketio.on('ready', namespace='/game')
def ready(message):
    # print("Received message: ", message)
    room = message["room"]
    user_id = message["socket_id"]
    game_data = game_collection.find_one({"room-num": room})
    users = game_data["users"]
    users.append(user_id)
    game_collection.update_one({"room-num": room}, {"$set": {"users": users}})
    if len(users) < 4:
        emit("ready", json.dumps(users), to=room)
    else:
        users_info = game_data["users_info"]
        for i in range(0, 4):
            users_info[i]["user_id"] = users[i]
            db_user = users_account.find_one({"username": users_info[i]["username"]})
            games = int(db_user["games"]) + 1
            users_account.update_one({"username": users_info[i]["username"]}, {"$set": {"games": str(games)}})
        game_collection.update_one({"room-num": room}, {"$set": {"users_info": users_info}})
        emit("start", json.dumps({"roll_num": 1, "users": users_info}), to=room)
    sys.stdout.flush()
    sys.stderr.flush()


@socketio.on('message', namespace='/game')
def handle_message(message):
    print("Received message: ", message)
    # if "User ready!" in message:
    #     user_id = message["socket_id"]
    #     if user_id not in game_engine.ready_list:
    #         game_engine.ready_list.append(user_id)
    #         send(json.dumps(["ready", game_engine.ready_list]), to=room)
    #     if len(game_engine.ready_list) == 4:
    #         for i in range(0, len(game_engine.ready_list)):
    #             game_engine.users_info[i]["user_id"] = game_engine.ready_list[i]
    #             game_engine.users = game_engine.ready_list
    #         send(json.dumps(["start", {"roll_num": 1, "user": game_engine.users_info}]), broadcast=True)
    # else:
    message = json.loads(message)
    room = message["room"]
    db_data = game_collection.find_one({"room-num": room})
    roll_num = game_engine.roll_dice()
    ret_game_states, alert_status = game_engine.game_func(message, roll_num, db_data["users"], db_data["users_info"])
    if type(ret_game_states) == str:
        # users_info_collection.delete_one({"datatype": "status"})
        send(json.dumps(["end", ret_game_states]), to=room)
    game_collection.update_one({"room-num": room}, {"$set": {"roll_num": roll_num, "users_info": ret_game_states}})
    send(json.dumps(["game", {"roll_num": roll_num, "user": ret_game_states}, alert_status]), to=room)

    sys.stdout.flush()
    sys.stderr.flush()

@socketio.on("refresh_room", namespace="/")
def request_room_from_web(data):
    room_list = list(game_collection.find({}, {'_id': 0}))
    send_list = []
    for i in room_list:
        # if i["game-start"] == "False":
        #     break

        # send_list.append({"m":i["room-num"], "n":i["room-name"], "p":num_user_str})
        send_list.append({"room-num": i["room-num"], "room-name": i["room-name"]})
    emit('room_list', send_list)


@socketio.on("login", namespace="/")
def signup_test(json):
    username = json["username"]
    username = cookie_engine.escape_html(username)
    password = json["password"]
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
            feedback = {"status": "True", "username": username, "won": exist_user["won"], "games": exist_user["games"]}
            emit('login', feedback)

@socketio.on("signup", namespace="/")
def signup_test(json):
    print("signup")
    username = json["username"]
    username = cookie_engine.escape_html(username)
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
            "room-name": cookie_engine.escape_html(message["room-name"]),
            "game-start": "False",
            "num_players": 0,
            "roll-num": 1,
            "users": [],
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


if __name__ == '__main__':
    # from waitress import serve
    app.run(host="0.0.0.0", port=5000)

    # socketio.run(app)





from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit
import json
from pymongo import MongoClient
import cookie_engine
import random

import game_engine


mongo_client = MongoClient("mongo")
db = mongo_client["proj"]
users_info_collection = db["users_info"]

users_account = db["users_account"]
cookies_collection = db["cookies_collection"]
game_collection = db["game_collection"]

app = Flask(__name__, static_url_path="/static")
app.config['SECRET'] = "secret!123"
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():  # put application's code here
    # users_account.drop()
    return render_template("lobby.html")

@app.route('/game')
def game():  # put application's code here
    return render_template("index.html", amount_ready=str(len(game_engine.ready_list)))

@socketio.on('message')
def handle_message(message):
    if "ranking request" in message:
        ranking = list(users_account.find({}, {"_id":0, "password":0}))
        emit('ranking',ranking)

# @socketio.on('message')
# def handle_message(message):
#     # print("Received message: " + message)
#     game_engine.alert_status = []
#     if "User connected!" in message:
#         game_engine.users.append(int(message.split(":")[0]))
#         # print("Connect Successful")
#     elif "User ready!" in message:
#         user_id = int(message.split(":")[0])
#         if user_id not in game_engine.ready_list:
#             game_engine.ready_list.append(user_id)
#             send(json.dumps(["ready", game_engine.ready_list]), broadcast=True)
#         if len(game_engine.ready_list) == 4:
#             for i in range(0, len(game_engine.ready_list)):
#                 game_engine.users_info[i]["user_id"] = game_engine.ready_list[i]
#                 game_engine.users = game_engine.ready_list
#             send(json.dumps(["start", {"roll_num": 1, "user": game_engine.users_info}]), broadcast=True)
#     else:
#         term_info = json.loads(message)
#         roll_num = game_engine.roll_dice()
#         ret_game_states = game_engine.game_func(term_info, roll_num)
#         if type(ret_game_states) == str:
#             # users_info_collection.delete_one({"datatype": "status"})
#             send(json.dumps(["end", ret_game_states]))
#         send(json.dumps(["game", {"roll_num": roll_num, "user": ret_game_states}, game_engine.alert_status]), broadcast=True)

@socketio.on("login", namespace="/")
def signup_test(json):
    print("login")
    username = json["username"]
    password = json["password"]
    print("username is: " + username)
    print("password is: " + password)

    password_se = cookie_engine.encry(password)
    # check if the user in db
    exist_user = users_account.find_one({"username":username, "password":password_se})
    if exist_user == None:
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
    exist_user = users_account.find_one({"username":username})
    if exist_user != None:
        feedback = {"status": "False", "username": username}
        emit('signup',feedback)
    else:
        password_se = cookie_engine.encry(password)
        users_account.insert_one({"username":username, "password":password_se, "won":"0", "games":"0"})
        feedback = {"status": "True", "username": username}
        emit('signup',feedback)

@socketio.on("create", namespace="/")
def create(message):
    print(message)
    message["room_num"] = str(random.randint(0, 100))
    emit('create', json.dumps(message))




# def password_confirm(username, input_password):
#     for user in game_engine.users_info:
#         if user["username"] == username:
#             return user["password"] == input_password
#     return False


    

if __name__ == '__main__':
    # from waitress import serve
    app.run(host="0.0.0.0", port=5000)
    # socketio.run(app)





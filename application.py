import os
import psycopg2
import requests
import json

from flask import Response
from flask import abort, jsonify
from functools import wraps
from flask import Flask,g, render_template, request, session, redirect, url_for
from flask_session import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from flask_socketio import SocketIO, emit


app = Flask(__name__)
app.secret_key = b'_5#y2L"F4Q8z\n\xec]/'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"

Session(app)
socketio = SocketIO(app)
users=[]
all_channels=[]
class Channel:
    def __init__(self, name):
        self.name = name
        self.messages = []

    def newMessage(self,message, user, channel, time):
        new = {"message": message, "user": user, "channel": channel, "time": time}
        self.messages.append(new)
        while len(self.messages) > 100:
            del(self.messages[0])

sample = Channel("sample")
all_channels.append(sample)
for x in range(1, 100):
    sample.newMessage(x, "user", sample.name, "time")

@app.route("/")
def intro():    
    return render_template("intro.html")

@app.route("/sign")
def sign():    
    return render_template("index.html")

@app.route("/loged", methods=["POST"])
def loged():
    sent_user = request.form.get("user")
    pwd = request.form.get("pwd")
    # Make sure user doesn't exist
    for user in users:
        if user['username'] == sent_user:
            if user['pwd'] == pwd:
                session['username'] = sent_user
                return jsonify({"success": True})
            else:
                return jsonify({"success": False})

    session['username'] = sent_user
    users.append({"username":sent_user, "pwd": pwd})
    return jsonify({"success": True})


@app.route("/channels")
def channels():
    try:               
        return render_template("channels.html", user= session['username'], channels=all_channels)
    except:
        return redirect(url_for('sign'))

@app.route("/new_channel", methods=["POST"])
def new_channel():
    sent_channel = request.form.get('channel')
    # Avoid creating channel with same name
    for channel in all_channels:
        if sent_channel == channel.name:
            return jsonify({"success": False})
    # Create new channel
    newChannel = Channel(sent_channel)
    all_channels.append(newChannel)
    return jsonify({"success": True})


@socketio.on("emit channel")
def emit_channel(data):    
    sent_channel = data["channel"]
    emit("announce channel", {"channel": sent_channel}, broadcast=True)


@socketio.on("emit message")
def emit_message(data):
    channel = data["channel"]
    message = data["message"]
    user = data["user"]
    time = data["time"]
    for check in all_channels:
        if channel == check.name:
            check.newMessage(message, user, channel, time)
            emit("announce message", {'channel': channel , 'message': message , 'user': user , 'time': time}, broadcast=True)


@app.route("/get_messages", methods=["POST"])
def get_messages():
    last_channel = request.form.get('last_channel')
    for check in all_channels:
        if last_channel == check.name:
            msg_list= check.messages
            msg_json=json.dumps(msg_list)
            return msg_json

    # create channel if doesn't exist
    for channel in all_channels:
        if last_channel == channel.name: 
            return 
        else:     
            newChannel = Channel(last_channel)
            all_channels.append(newChannel)
            msg_list= newChannel.messages
            msg_json=json.dumps(msg_list)
            return msg_json

    
@socketio.on("emit delete")
def emit_delete(data):
    channel = data["channel"]
    message = data["message"]
    user = data["user"]
    time = data["time"]
    to_delete = {"message": message, "user": user, "channel": channel, "time": time}
    for check in all_channels:
        if channel == check.name:
            for msg in check.messages:
                if msg == to_delete:
                    check.messages.remove(msg)
                    emit("announce delete", {'channel': channel , 'message': message , 'user': user , 'time': time}, broadcast=True)

@app.route("/logout")
def logout():
    session['username'] = None
    session.pop('username', None)
    session.clear()    
    return redirect(url_for('sign'))

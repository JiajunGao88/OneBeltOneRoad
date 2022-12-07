import os
import hashlib
import random

def encry(string):
    salt = random.sample('zyxwvutsrqponmlkjihgfedcbaABCDEFGHIJKLMNOPQRSTUVWXYZ', 11)
    salt_ = ""
    for i in salt:
        salt_ += i
    string += salt_
    b_ = string.encode()
    return salt_, hashlib.sha256(b_).hexdigest()

def disencry(string, salt):
    s = string + salt
    b_ = s.encode()
    return hashlib.sha256(b_).hexdigest()

def create_cookie():
    new_id = random.sample('zyxwvutsrqponmlkjihgfedcba!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ', 11)
    string = ""
    for i in new_id:
        string += i
    return string

def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


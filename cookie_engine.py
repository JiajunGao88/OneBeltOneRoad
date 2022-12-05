import os
import hashlib
import random

def encry(string):
    b_ = string.encode()
    return hashlib.sha256(b_).hexdigest()

def create_cookie():
    new_id = random.sample('zyxwvutsrqponmlkjihgfedcba!@#$%^&*ABCDEFGHIJKLMNOPQRSTUVWXYZ', 11)
    string = ""
    for i in new_id:
        string += i
    return string

def escape_html(text):
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


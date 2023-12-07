# -*- coding: utf-8 -*-
import sys 

from flask import Flask
import pickle
import numpy as np
import io

popular_df = pickle.load(open('popular.pkl','rb'))
pt = pickle.load(open('pt.pkl','rb'))
books = pickle.load(open('books.pkl','rb'))
similarity_scores = pickle.load(open('similarity_scores.pkl','rb'))

app = Flask(__name__)


user_input = sys.argv[1]

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
# print(user_input)

data = []

if user_input in pt.index:
    index = np.where(pt.index == user_input)[0][0]
    # print(index)
    similar_items = sorted(list(enumerate(similarity_scores[index])), key=lambda x: x[1], reverse=True)[1:7]
    # print(similar_items)

    for i in similar_items:
        item = []
        temp_df = books[books['Book-Title'] == pt.index[i[0]]]
        item.extend(list(temp_df.drop_duplicates('Book-Title')['ISBN'].values))
        data.append(item)

    print(data)
else:
    print(data)

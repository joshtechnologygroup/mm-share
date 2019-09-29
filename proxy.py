import requests
from flask import Flask, request
from flask_cors import cross_origin

app = Flask('__main__')
SITE_NAME = 'http://mm.jtg.tools/'


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>', methods =['GET', 'POST'])
@cross_origin(supports_credentials=True)
def proxy(path):
    print(f'{SITE_NAME}{path}', request.headers, request.data)
    res = getattr(requests, (request.method).lower())(
        f'{SITE_NAME}{path}',
        headers={'Authorization': request.headers['Authorization'], 'Content-Type': 'application/json'},
        data=request.data
    )
    print(res.status_code, res.content)
    return res.content

app.run(host='0.0.0.0', port=8080)
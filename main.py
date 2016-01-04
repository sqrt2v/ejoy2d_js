from flask import Flask
from flask import render_template
from flask import send_from_directory


app = Flask(__name__)
app.debug = True


@app.route('/')
def hello_world():
    return render_template('index.html')


@app.route('/sample.json')
def get_sample_json():
    return send_from_directory(app.static_folder, "Assets/sample.json")


@app.route('/sample.1.png')
def get_sample_tex():
    return send_from_directory(app.static_folder, "Assets/sample.1.png")


if __name__ == '__main__':
    app.run()

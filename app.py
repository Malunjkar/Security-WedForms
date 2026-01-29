from flask import Flask , session

def create_app():
    app = Flask(__name__)

    app.secret_key = 'super_secret_key'

    @app.before_request
    def set_default_user():
        email = "Pilsecurity.CS01@pipelineinfra.com"
        location = email.split('@')[0].split('.')[-1]

        if 'user' not in session:
            session['user'] = {}

        session['user'].update({
            "email": email,
            "name": "PIL Security",
            "location": location
        })




    from route import routes_bp
    app.register_blueprint(routes_bp)


    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=True)


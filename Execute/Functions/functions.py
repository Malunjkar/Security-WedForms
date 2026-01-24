from flask import request, jsonify
from Execute import queries

def save_patrolling_data_fn():
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "No data received"
            }), 400

        success, msg = queries.save_patrolling_data(data)

        return jsonify({
            "success": success,
            "message": msg
        }), 200 if success else 500

    except Exception as e:
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500

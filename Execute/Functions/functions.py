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

def get_patrolling_data():
    success, data = queries.get_patrolling_data()
    return jsonify({
        "success": success,
        "data": data
    })


def update_patrolling_data():
    from flask import request, jsonify
    data = request.get_json()

    success, msg = queries.update_patrolling_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })

def delete_patrolling_data():
    from flask import request, jsonify
    data = request.get_json()

    if not data or "n_sr_no" not in data:
        return jsonify({
            "success": False,
            "message": "Invalid delete request"
        }), 400

    success, msg = queries.delete_patrolling_data(data)

    return jsonify({
        "success": success,
        "message": msg
    })

from Execute.executesql import get_connection

def save_patrolling_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        # 🔹 Get next primary key safely
        cursor.execute("SELECT ISNULL(MAX(n_sr_no), 0) + 1 FROM dbo.Patrolling_Observation_Register")
        next_sr_no = cursor.fetchone()[0]

        insert_patrolling_record(cursor, data, next_sr_no, username)

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Patrolling data saved successfully"

    except Exception as e:
        return False, str(e)

def insert_patrolling_record(cursor, data, n_sr_no, username):
    sql = """
    INSERT INTO dbo.Patrolling_Observation_Register
    (
        n_sr_no,
        s_location_code,
        d_patrol_date,
        t_from_time,
        t_to_time,
        s_boundary_wall_condition,
        s_patrolling_pathway_condition,
        s_suspicious_movement,
        s_wild_vegetation,
        s_illumination_status,
        s_workers_without_valid_permit,
        s_unknown_person_without_authorization,
        s_unattended_office_unlocked,
        s_other_observations_status,
        s_remarks,
        s_patrolling_guard_name,
        s_created_by
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """

    cursor.execute(sql, (
        n_sr_no,
        data.get("s_location_code"),
        data.get("d_patrol_date"),
        data.get("t_from_time"),
        data.get("t_to_time"),
        data.get("s_boundary_wall_condition"),
        data.get("s_patrolling_pathway_condition"),
        data.get("s_suspicious_movement"),
        data.get("s_wild_vegetation"),
        data.get("s_illumination_status"),
        data.get("s_workers_without_valid_permit"),
        data.get("s_unknown_person_without_authorization"),
        data.get("s_unattended_office_unlocked"),
        data.get("s_other_observations_status"),
        data.get("s_remarks"),
        data.get("s_patrolling_guard_name"),
        username
    ))


def get_patrolling_data():
    try:
        conn = get_connection()
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                n_sr_no,
                s_location_code,
                d_patrol_date,
                t_from_time,
                t_to_time,
                s_boundary_wall_condition,
                s_patrolling_pathway_condition,
                s_suspicious_movement,
                s_wild_vegetation,
                s_illumination_status,
                s_workers_without_valid_permit,
                s_unknown_person_without_authorization,
                s_unattended_office_unlocked,
                s_other_observations_status,
                s_remarks,
                s_patrolling_guard_name
            FROM dbo.Patrolling_Observation_Register
            ORDER BY n_sr_no DESC
        """)

        rows = cursor.fetchall()

        result = []
        for r in rows:
            result.append({
                "n_sr_no": r[0],
                "s_location_code": r[1],
                "d_patrol_date": str(r[2]),
                "t_from_time": str(r[3]),
                "t_to_time": str(r[4]),
                "s_boundary_wall_condition": r[5],
                "s_patrolling_pathway_condition": r[6],
                "s_suspicious_movement": r[7],
                "s_wild_vegetation": r[8],
                "s_illumination_status": r[9],
                "s_workers_without_valid_permit": r[10],
                "s_unknown_person_without_authorization": r[11],
                "s_unattended_office_unlocked": r[12],
                "s_other_observations_status": r[13],
                "s_remarks": r[14],
                "s_patrolling_guard_name": r[15]
            })

        cursor.close()
        conn.close()

        return True, result

    except Exception as e:
        return False, str(e)

def update_patrolling_data(data, username="system"):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = """
        UPDATE dbo.Patrolling_Observation_Register
        SET
            s_location_code = ?,
            d_patrol_date = ?,
            t_from_time = ?,
            t_to_time = ?,
            s_boundary_wall_condition = ?,
            s_patrolling_pathway_condition = ?,
            s_suspicious_movement = ?,
            s_wild_vegetation = ?,
            s_illumination_status = ?,
            s_workers_without_valid_permit = ?,
            s_unknown_person_without_authorization = ?,
            s_unattended_office_unlocked = ?,
            s_other_observations_status = ?,
            s_remarks = ?,
            s_patrolling_guard_name = ?,
            dt_updated_at = GETDATE(),
            s_updated_by = ?
        WHERE n_sr_no = ?
        """

        cursor.execute(sql, (
            data["s_location_code"],
            data["d_patrol_date"],
            data["t_from_time"],
            data["t_to_time"],
            data["s_boundary_wall_condition"],
            data["s_patrolling_pathway_condition"],
            data["s_suspicious_movement"],
            data["s_wild_vegetation"],
            data["s_illumination_status"],
            data["s_workers_without_valid_permit"],
            data["s_unknown_person_without_authorization"],
            data["s_unattended_office_unlocked"],
            data["s_other_observations_status"],
            data["s_remarks"],
            data["s_patrolling_guard_name"],
            username,
            data["n_sr_no"]
        ))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record updated successfully"

    except Exception as e:
        return False, str(e)

def delete_patrolling_data(data):
    try:
        conn = get_connection()
        cursor = conn.cursor()

        sql = "DELETE FROM dbo.Patrolling_Observation_Register WHERE n_sr_no = ?"
        cursor.execute(sql, (data["n_sr_no"],))

        conn.commit()
        cursor.close()
        conn.close()

        return True, "Record deleted successfully"

    except Exception as e:
        return False, str(e)

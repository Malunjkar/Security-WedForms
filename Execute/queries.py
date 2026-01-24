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

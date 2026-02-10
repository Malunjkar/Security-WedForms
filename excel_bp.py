# excel_bp.py
import io
import pandas as pd


def write_excel(df: pd.DataFrame):
    """
    Converts a pandas DataFrame into an Excel file (BytesIO)
    - Shows ONLY non-deleted data (n_flag = 1)
    - Handles NaT / NaN safely
    - Adds auto Sr No
    - Applies formatting
    """

    # -------------------------------------------------
    # FILTER NON-DELETED RECORDS (SOFT DELETE)
    # -------------------------------------------------
    if "n_flag" in df.columns:
        df = df[df["n_flag"] == 1]
        df = df.drop(columns=["n_flag"])

    # -------------------------------------------------
    # CLEAN DATA (NaT / NaN)
    # -------------------------------------------------
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime("%Y-%m-%d %H:%M:%S").fillna("")
        else:
            df[col] = df[col].fillna("")

    # -------------------------------------------------
    # REMOVE DB SERIAL NUMBER IF PRESENT
    # -------------------------------------------------
    for col in list(df.columns):
        if col.lower().replace(" ", "").replace("_", "") == "srno":
            df.drop(columns=[col], inplace=True)
            break

    # -------------------------------------------------
    # ADD AUTO SERIAL NUMBER FOR EXCEL
    # -------------------------------------------------
    df.insert(0, "Sr No", range(1, len(df) + 1))

    # -------------------------------------------------
    # WRITE EXCEL
    # -------------------------------------------------
    output = io.BytesIO()
    writer = pd.ExcelWriter(output, engine="xlsxwriter")
    df.to_excel(writer, index=False, sheet_name="Report")

    workbook = writer.book
    worksheet = writer.sheets["Report"]

    # -------------------------------------------------
    # FORMATTING
    # -------------------------------------------------
    text_fmt = workbook.add_format({
        "border": 1,
        "text_wrap": True,
        "align": "left",
        "valign": "top"
    })

    header_fmt = workbook.add_format({
        "border": 1,
        "bold": True,
        "align": "center",
        "valign": "middle"
    })

    # Header formatting
    for col_idx, col_name in enumerate(df.columns):
        worksheet.write(0, col_idx, col_name, header_fmt)
        worksheet.set_column(col_idx, col_idx, 22)

    # Cell formatting
    for row_idx, row in enumerate(df.itertuples(index=False), start=1):
        for col_idx, value in enumerate(row):
            worksheet.write(row_idx, col_idx, str(value), text_fmt)

    worksheet.freeze_panes(1, 0)

    writer.close()
    output.seek(0)
    return output

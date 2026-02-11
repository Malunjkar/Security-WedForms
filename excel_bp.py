import io
import pandas as pd


def write_excel(df: pd.DataFrame):

    if "n_flag" in df.columns:
        df = df[df["n_flag"] == 1]

    if "delete_flag" in df.columns:
        df = df[df["delete_flag"] == 0]

    df = df.drop(columns=[c for c in ["n_flag", "delete_flag"] if c in df.columns])

    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime("%Y-%m-%d %H:%M:%S").fillna("")
        else:
            df[col] = df[col].fillna("")

    for col in list(df.columns):
        if col.lower().replace(" ", "").replace("_", "") == "srno":
            df.drop(columns=[col], inplace=True)
            break

    df.insert(0, "Sr No", range(1, len(df) + 1))

    output = io.BytesIO()

    
    with pd.ExcelWriter(output, engine="xlsxwriter") as writer:
        df.to_excel(writer, index=False, sheet_name="Report")

        workbook = writer.book
        worksheet = writer.sheets["Report"]

        text_fmt = workbook.add_format({
            "border": 1,
            "text_wrap": True,
            "align": "center",
            "valign": "vcenter"
        })

        header_fmt = workbook.add_format({
            "border": 1,
            "bold": True,
            "align": "center",
            "valign": "middle",
            "bg_color": "#007bff",
            "font_color": "#ffffff"
        })

        # Header formatting
        for col_idx, col_name in enumerate(df.columns):
            worksheet.write(0, col_idx, col_name, header_fmt)
            worksheet.set_column(col_idx, col_idx, 22)

        # Cell formatting
        for row_idx, row in enumerate(df.itertuples(index=False), start=1):
            for col_idx, value in enumerate(row):
                worksheet.write(row_idx, col_idx, value, text_fmt)

        worksheet.freeze_panes(1, 0)

    output.seek(0)
    return output

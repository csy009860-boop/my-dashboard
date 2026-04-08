
import pandas as pd
import sys

file_path = 'C:/Users/User/ai/dashboard/sy_mh.xlsx'
output_path = 'C:/Users/User/ai/dashboard/sy_mh_temp.csv'

try:
    df = pd.read_excel(file_path)
    df.to_csv(output_path, index=False, encoding='utf-8')
    print(f"Successfully converted '{file_path}' to '{output_path}'")
except Exception as e:
    print(f"Error converting Excel to CSV: {e}", file=sys.stderr)
    sys.exit(1)

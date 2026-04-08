
import pandas as pd
import sys

file_path = 'C:/Users/User/ai/dashboard/sy_mh.csv'

try:
    # UTF-8 또는 cp949로 시도하여 올바른 인코딩 찾기
    try:
        df = pd.read_csv(file_path, encoding='utf-8')
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding='cp949')
        
    print(df.to_csv(index=False))
except Exception as e:
    print(f"Error reading CSV file: {e}", file=sys.stderr)
    sys.exit(1)

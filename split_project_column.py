
import pandas as pd
import re
import os

def split_project_column(excel_path, sheet_name='상세업무보고서'):
    try:
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
    except FileNotFoundError:
        print(f"Error: File not found at {excel_path}", file=sys.stderr)
        return
    except Exception as e:
        print(f"Error reading Excel file: {e}", file=sys.stderr)
        return

    # 새로운 '업무코드'와 '프로젝트' 컬럼을 생성
    df['업무코드'] = ''
    df['프로젝트_새로운'] = ''

    # '프로젝트' 컬럼을 순회하며 내용 분리
    for index, row in df.iterrows():
        project_full_name = str(row['프로젝트'])
        match = re.search(r'\[(.*?)\]\s*(.*)', project_full_name)
        
        if match:
            df.loc[index, '업무코드'] = match.group(1).strip()
            df.loc[index, '프로젝트_새로운'] = match.group(2).strip()
        else:
            # []가 없는 경우, 전체를 프로젝트 이름으로 간주하고 업무코드는 비워둠
            df.loc[index, '프로젝트_새로운'] = project_full_name.strip()
            df.loc[index, '업무코드'] = '' # 또는 pd.NA

    # 기존 '프로젝트' 컬럼을 삭제하고 '프로젝트_새로운'을 '프로젝트'로 이름 변경
    df = df.drop(columns=['프로젝트'])
    df = df.rename(columns={'프로젝트_새로운': '프로젝트'})

    # 최종 컬럼 순서 재조정
    # 기존 컬럼들 중 '프로젝트'가 있던 자리에 '업무코드'와 '프로젝트'를 삽입
    cols = df.columns.tolist()
    
    # '날짜' 다음에 '업무코드', '프로젝트'가 오도록 조정
    if '날짜' in cols:
        date_idx = cols.index('날짜')
        new_cols = cols[:date_idx+1] # 날짜까지
        
        if '업무코드' not in new_cols: new_cols.append('업무코드')
        if '프로젝트' not in new_cols: new_cols.append('프로젝트')
        
        # 기존 컬럼들 중 이미 추가된 컬럼 제외하고 나머지 추가
        for col in cols:
            if col not in new_cols:
                new_cols.append(col)
        df = df[new_cols]
    else: # '날짜'가 없다면 그냥 '업무코드', '프로젝트'를 맨 앞에
        df = df[['업무코드', '프로젝트'] + [col for col in cols if col not in ['업무코드', '프로젝트']]]


    # 엑셀 파일에 덮어쓰기
    try:
        with pd.ExcelWriter(excel_path, engine='openpyxl', mode='w') as writer:
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f"'{excel_path}' 파일의 '프로젝트' 컬럼이 '업무코드'와 '프로젝트'로 성공적으로 분리되었습니다.")
    except Exception as e:
        print(f"Error writing to Excel file: {e}", file=sys.stderr)

# 스크립트 실행
if __name__ == '__main__':
    excel_file = 'C:/Users/User/ai/dashboard/업무보고서_업무.xlsx'
    split_project_column(excel_file)

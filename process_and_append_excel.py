# -*- coding: utf-8 -*-
import pandas as pd
import re
import os
import sys
from datetime import datetime

# 표준 출력을 UTF-8로 설정
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def process_and_append_excel(input_excel_path):
    output_excel_path = 'C:/Users/User/ai/dashboard/업무보고서_업무.xlsx' # 출력 파일 경로 변경
    sheet_name = '상세업무보고서'
    
    try:
        df_raw = pd.read_excel(input_excel_path)
    except Exception as e:
        print(f"Error reading input Excel file: {e}", file=sys.stderr)
        return

    # 1. 인덱스 기반 데이터 추출
    # [날짜(0), 출근(1), 연장시간(2), O/T(3), 프로젝트(4), 서브코드(5), 업무내용(6), 담당자(7), 셀(8)]
    df = df_raw.iloc[:, :9].copy()
    df.columns = ['date', 'start', 'ot_raw', 'ot_type', 'project_col_input', 'subcode_col_input', 'content_col_input', 'manager', 'cell']

    # 결측치 처리
    df['date'] = df['date'].astype(str).str.strip().replace('nan', pd.NA).replace('', pd.NA).ffill()
    
    for col in ['project_col_input', 'subcode_col_input', 'content_col_input', 'manager', 'cell']:
        df[col] = df[col].astype(str).str.strip().replace('nan', '')

    df = df[df['project_col_input'] != ''].copy()

    # 파일명에서 년도와 월 추출
    year_match = re.search(r'(\d{4})년', input_excel_path)
    month_match = re.search(r'(\d{1,2})월', input_excel_path)
    
    # 기본값 설정 (파일명에서 추출 실패 시)
    current_year = datetime.now().year
    current_month = datetime.now().month

    if year_match:
        current_year = int(year_match.group(1))
    if month_match:
        current_month = int(month_match.group(1))

    # 날짜 변환 (파일명에서 추출한 년월 기준)
    def format_date(date_str):
        day_match = re.search(r'(\d+)일', date_str)
        if day_match:
            day = int(day_match.group(1))
            try:
                dt = datetime(current_year, current_month, day) 
                return dt.strftime("%Y.%m.%d")
            except ValueError:
                return date_str
        return date_str

    df['date_formatted'] = df['date'].apply(format_date)

    def time_to_min(t_str):
        if re.fullmatch(r'\d{2}:\d{2}', str(t_str)):
            h, m = map(int, t_str.split(':'))
            return h * 60 + m
        return 0

    final_rows = []
    df['date_dt'] = pd.to_datetime(df['date_formatted'], format='%Y.%m.%d', errors='coerce')
    df = df.dropna(subset=['date_dt'])

    for (dt, mgr), group in df.groupby(['date_dt', 'manager'], sort=False):
        day_ot_min = 0
        for val in group['ot_raw'].unique():
            day_ot_min += time_to_min(str(val).strip())

        tasks = []
        for _, row in group.iterrows():
            c = str(row['content_col_input'])
            tm = re.search(r'\[(\d{2}):(\d{2})\]', c)
            if tm:
                m = int(tm.group(1)) * 60 + int(tm.group(2))
                tasks.append({'row': row, 'min': m, 'is_main': False})
            else:
                tasks.append({'row': row, 'min': 0, 'is_main': True})

        sub_total = sum(t['min'] for t in tasks if not t['is_main'])
        main_count = sum(1 for t in tasks if t['is_main'])
        base_min = 8 * 60 + day_ot_min
        main_min = max(0, base_min - sub_total) // main_count if main_count > 0 else 0

        for t in tasks:
            m = t['min'] if not t['is_main'] else main_min
            
            # 프로젝트 컬럼에서 [코드] 추출 및 분리
            proj_val = str(t['row']['project_col_input'])
            code_match = re.search(r'\[(.*?)\]', proj_val)
            
            업무카드_val = ""
            프로젝트_val = proj_val # 초기값은 원본 프로젝트 컬럼 내용
            
            if code_match:
                업무카드_val = code_match.group(1)
                프로젝트_val = proj_val.replace(code_match.group(0), '').strip()
            
            # 서브코드 컬럼: input_excel의 '서브코드' 컬럼 내용
            서브코드_val = str(t['row']['subcode_col_input']).strip()

            # 업무내용 컬럼: input_excel의 '업무내용' 컬럼 내용 (시간 태그 제거)
            업무내용_val = re.sub(r'\[\d{2}:\d{2}\]', '', str(t['row']['content_col_input'])).strip()

            ot_disp = f"{day_ot_min//60:02d}:{day_ot_min%60:02d}"
            
            final_rows.append({
                '날짜': t['row']['date_formatted'],
                '업무카드': 업무카드_val,
                '프로젝트': 프로젝트_val,
                '서브코드': 서브코드_val,
                '업무내용': 업무내용_val,
                '담당자': t['row']['manager'],
                '셀': t['row']['cell'],
                '소요시간': f"{m//60:02d}:{m%60:02d}",
                '연장시간_적용': ot_disp
            })

    new_df = pd.DataFrame(final_rows)
    # 최종 컬럼 순서 (GEMINI.md 기준 + 업무카드)
    cols = ['날짜', '업무카드', '프로젝트', '서브코드', '업무내용', '담당자', '셀', '소요시간', '연장시간_적용']
    new_df = new_df[cols]

    # 기존 파일 병합
    if os.path.exists(output_excel_path):
        existing_df = pd.read_excel(output_excel_path, sheet_name=sheet_name)
        combined = pd.concat([existing_df, new_df], ignore_index=True)
        combined.drop_duplicates(subset=['날짜', '업무카드', '프로젝트', '서브코드', '업무내용', '담당자'], keep='last', inplace=True)
        combined['dt_tmp'] = pd.to_datetime(combined['날짜'], format='%Y.%m.%d', errors='coerce')
        combined = combined.sort_values(['dt_tmp', '담당자']).drop(columns=['dt_tmp'])
        
        with pd.ExcelWriter(output_excel_path, engine='openpyxl', mode='a', if_sheet_exists='overlay') as writer:
            combined.to_excel(writer, sheet_name=sheet_name, index=False)
    else:
        new_df.to_excel(output_excel_path, sheet_name=sheet_name, index=False)

    print(f"Successfully processed and updated {output_excel_path}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        process_and_append_excel(sys.argv[1])
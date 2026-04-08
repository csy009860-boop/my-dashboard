
import pandas as pd
import re

# 원본 데이터 CSV 파일 경로
raw_csv_path = 'C:/Users/User/ai/dashboard/raw_task_data.csv'

# CSV 파일을 읽기 (쉼표로 구분)
df = pd.read_csv(raw_csv_path, sep='	', engine='python')

# '날짜' 컬럼에서 앞뒤 공백 제거 및 결측치 처리 (이전 행의 날짜로 채우기)
df['날짜'] = df['날짜'].str.strip()
df['날짜'] = df['날짜'].replace('', pd.NA).ffill() 

# 필요한 컬럼들 공백 제거
df['프로젝트'] = df['프로젝트'].str.strip()
df['서브코드'] = df['서브코드'].str.strip()
df['업무내용'] = df['업무내용'].str.strip()
df['담당자'] = df['담당자'].str.strip()
df['셀'] = df['셀'].str.strip()

# 연장시간 컬럼 처리: NaN 값을 빈 문자열로 대체 후 공백 제거
df['연장시간'] = df['연장시간'].fillna('').astype(str).str.strip()

# '날짜' 컬럼을 실제 날짜 (2026년 3월 기준 yyyy.mm.dd)로 변환
def format_date_to_full(date_str):
    day_match = re.search(r'(\d+)일', date_str)
    if day_match:
        day = int(day_match.group(1))
        return f"2026.03.{day:02d}"
    return date_str

df['날짜'] = df['날짜'].apply(format_date_to_full)

# 시간 문자열을 분으로 변환하는 헬퍼 함수
def time_str_to_minutes(time_str):
    if re.fullmatch(r'\d{2}:\d{2}', time_str):
        h, m = map(int, time_str.split(':'))
        return h * 60 + m
    return 0

# 시간 계산 함수 (연장시간 반영)
def calculate_task_times(df_daily_group):
    daily_tasks_info = []
    
    # 해당 날짜의 총 연장시간 계산
    total_overtime_minutes = 0
    # '연장시간' 컬럼의 NaN 값은 fillna('')로 처리했으므로, 빈 문자열인 경우만 스킵
    for ot_str in df_daily_group['연장시간'].unique():
        if ot_str and ot_str != 'nan': # 'nan' 문자열이 들어올 경우도 대비
            total_overtime_minutes += time_str_to_minutes(ot_str)

    for _, row in df_daily_group.iterrows():
        task_content = str(row['업무내용']) 
        time_match = re.search(r'\[(\d{2}):(\d{2})\]', task_content)
        
        if time_match:
            hours = int(time_match.group(1))
            minutes = int(time_match.group(2))
            total_minutes = hours * 60 + minutes
            daily_tasks_info.append({'업무내용': task_content, '소요분': total_minutes, 'is_main': False})
        else:
            daily_tasks_info.append({'업무내용': task_content, '소요분': 0, 'is_main': True})

    total_sub_task_minutes = sum(task['소요분'] for task in daily_tasks_info if not task['is_main'])
    
    # 기본 8시간 + 총 연장시간
    base_daily_minutes = 8 * 60 + total_overtime_minutes
    remaining_minutes_for_main = max(0, base_daily_minutes - total_sub_task_minutes)
    
    main_tasks_count = sum(1 for task in daily_tasks_info if task['is_main'])
    
    calculated_task_times = []
    for task in daily_tasks_info:
        if task['is_main']:
            if main_tasks_count > 0:
                main_task_time = remaining_minutes_for_main // main_tasks_count
                calculated_task_times.append(main_task_time)
            else:
                calculated_task_times.append(0) 
        else:
            calculated_task_times.append(task['소요분'])

    return calculated_task_times, total_overtime_minutes # 연장시간도 반환

# 각 날짜 및 담당자별로 시간 계산 및 적용
final_rows = []
for (date_str, 담당자), group in df.groupby(['날짜', '담당자'], sort=False):
    calculated_times_minutes_list, total_overtime_minutes_day = calculate_task_times(group)
    
    for i, (_, row) in enumerate(group.iterrows()):
        minutes = calculated_times_minutes_list[i]
        hours = minutes // 60
        remaining_minutes = minutes % 60
        
        clean_content = re.sub(r'\[(\d{2}):(\d{2})\]', '', str(row['업무내용'])).strip() 
        
        # 연장시간 표시: 해당 날짜에 연장시간이 있으면, 첫 번째 메인 업무에만 표시하거나
        # 아니면 별도 컬럼으로 표시. 여기서는 별도 컬럼으로 표시하고 해당 날짜의 연장시간을 넣어줌.
        overtime_display = f"{total_overtime_minutes_day // 60:02d}:{total_overtime_minutes_day % 60:02d}" if total_overtime_minutes_day > 0 else '00:00'

        final_rows.append({
            '날짜': row['날짜'], 
            '프로젝트': row['프로젝트'],
            '서브코드': row['서브코드'], 
            '업무내용': clean_content, 
            '담당자': row['담당자'],
            '셀': row['셀'], 
            '소요시간': f"{hours:02d}:{remaining_minutes:02d}",
            '연장시간_적용': overtime_display # 연장시간 적용 여부 및 시간 표시
        })

final_df = pd.DataFrame(final_rows)

# 최종 정렬 (날짜, 담당자 순)
final_df['날짜_dt'] = pd.to_datetime(final_df['날짜'], format='%Y.%m.%d')
final_df = final_df.sort_values(by=['날짜_dt', '담당자']).reset_index(drop=True)
final_df['날짜'] = final_df['날짜_dt'].dt.strftime('%Y.%m.%d') # 다시 문자열 형식으로 변환

# 최종 컬럼 순서 조정: 요청된 순서대로 (연장시간_적용 컬럼 추가)
final_df = final_df[['날짜', '프로젝트', '서브코드', '업무내용', '담당자', '셀', '소요시간', '연장시간_적용']]


# 엑셀 파일로 저장
output_file = 'C:/Users/User/ai/dashboard/업무보고서_새로운구성_날짜연장수정.xlsx'
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    final_df.to_excel(writer, sheet_name='상세업무보고서', index=False)

print(f"엑셀 파일 '{output_file}'이(가) 성공적으로 생성되었습니다.")


import pandas as pd
import re

# 원본 데이터 CSV 파일 경로
raw_csv_path = 'C:/Users/User/ai/dashboard/raw_task_data.csv'

# CSV 파일을 읽기 (쉼표로 구분)
# 구분자를 쉼표가 아닌 탭으로 명시적으로 지정
df = pd.read_csv(raw_csv_path, sep='	', engine='python')

# '날짜' 컬럼에서 앞뒤 공백 제거 및 결측치 처리 (이전 행의 날짜로 채우기)
df['날짜'] = df['날짜'].str.strip()
df['날짜'] = df['날짜'].replace('', pd.NA).ffill() 

# '프로젝트', '업무내용', '담당자' 컬럼도 공백 제거
df['프로젝트'] = df['프로젝트'].str.strip()
df['업무내용'] = df['업무내용'].str.strip()
df['담당자'] = df['담당자'].str.strip()

# '날짜_정렬' 컬럼 생성 (정렬을 위해 숫자만 추출)
df['날짜_정렬'] = df['날짜'].apply(lambda x: int(re.search(r'(\d+)일', x).group(1)) if re.search(r'(\d+)일', x) else 0)


# 시간 계산 함수
def calculate_task_times(df_daily_group):
    daily_tasks_info = []
    for _, row in df_daily_group.iterrows():
        task_content = str(row['업무내용']) # str()로 명시적 변환
        time_match = re.search(r'\[(\d{2}):(\d{2})\]', task_content)
        
        if time_match:
            hours = int(time_match.group(1))
            minutes = int(time_match.group(2))
            total_minutes = hours * 60 + minutes
            daily_tasks_info.append({'업무내용': task_content, '소요분': total_minutes, 'is_main': False})
        else:
            daily_tasks_info.append({'업무내용': task_content, '소요분': 0, 'is_main': True})

    total_sub_task_minutes = sum(task['소요분'] for task in daily_tasks_info if not task['is_main'])
    remaining_minutes_for_main = max(0, 8 * 60 - total_sub_task_minutes) # 8시간 기준
    
    main_tasks_count = sum(1 for task in daily_tasks_info if task['is_main'])
    
    calculated_task_times = []
    for task in daily_tasks_info:
        if task['is_main']:
            if main_tasks_count > 0:
                # 메인 업무가 여러 개일 경우 남은 시간을 균등하게 배분
                main_task_time = remaining_minutes_for_main // main_tasks_count
                calculated_task_times.append(main_task_time)
            else:
                calculated_task_times.append(0) # 메인 업무가 없으면 0분
        else:
            calculated_task_times.append(task['소요분'])

    return calculated_task_times

# 각 날짜 및 담당자별로 시간 계산 및 적용
final_rows = []
for (date_str, 담당자), group in df.groupby(['날짜', '담당자']):
    calculated_times_minutes_list = calculate_task_times(group)
    
    # 그룹 내의 첫 번째 행에서 날짜_정렬 값을 가져옴
    date_sort_value = group['날짜_정렬'].iloc[0] 

    for i, (_, row) in enumerate(group.iterrows()):
        minutes = calculated_times_minutes_list[i]
        hours = minutes // 60
        remaining_minutes = minutes % 60
        
        # [HH:MM] 부분 제거
        clean_content = re.sub(r'\[(\d{2}):(\d{2})\]', '', str(row['업무내용'])).strip() # str() 추가
        
        final_rows.append({
            '날짜': row['날짜'],
            '담당자': row['담당자'],
            '프로젝트': row['프로젝트'],
            '업무내용': clean_content,
            '소요시간': f"{hours:02d}:{remaining_minutes:02d}",
            '날짜_정렬': date_sort_value # 날짜_정렬 값 추가
        })

final_df = pd.DataFrame(final_rows)

# 최종 정렬 (날짜_정렬, 담당자 순)
final_df = final_df.sort_values(by=['날짜_정렬', '담당자']).drop(columns=['날짜_정렬'])


# 최종 컬럼 순서 조정
final_df = final_df[['날짜', '담당자', '프로젝트', '업무내용', '소요시간']]


# 엑셀 파일로 저장
output_file = 'C:/Users/User/ai/dashboard/업무요약_상세.xlsx'
with pd.ExcelWriter(output_file, engine='openpyxl') as writer:
    final_df.to_excel(writer, sheet_name='상세업무보고서', index=False)

print(f"엑셀 파일 '{output_file}'이(가) 성공적으로 생성되었습니다.")

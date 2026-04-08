
import sys
import re

file_path = 'C:/Users/User/ai/dashboard/sy_mh.csv'

def parse_time(text):
    match = re.search(r'\[(\d{2}):(\d{2})\]', text)
    if match:
        return int(match.group(1)) * 60 + int(match.group(2))
    return 0

def format_time(minutes):
    h = minutes // 60
    m = minutes % 60
    return f"{h:02d}:{m:02d}"

data_by_date = {}
current_date = None

# 인코딩 처리
try:
    with open(file_path, 'r', encoding='cp949') as f:
        lines = f.readlines()
except UnicodeDecodeError:
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

for line in lines[1:]:
    cols = line.split(',')
    if len(cols) < 7: continue
    
    date_str = cols[0].strip()
    content = cols[6].strip()
    content = content.replace('"', '')
    
    if date_str:
        current_date = date_str
    
    if not current_date or not content: continue
    
    if current_date not in data_by_date:
        data_by_date[current_date] = []
    
    minutes = parse_time(content)
    is_main = minutes == 0
    clean_content = re.sub(r'\[\d{2}:\d{2}\]', '', content).strip()
    
    data_by_date[current_date].append({
        'content': clean_content,
        'minutes': minutes,
        'is_main': is_main
    })

print("### 2026년 3월 업무일지 시간 분석 결과 ###\n")

# 날짜 순서대로 출력 (데이터에 나타난 순서)
for date, tasks in data_by_date.items():
    sub_total = sum(t['minutes'] for t in tasks if not t['is_main'])
    main_total = max(0, 8 * 60 - sub_total)
    
    print(f"[{date}]")
    main_task_found = False
    
    for t in tasks:
        if t['is_main']:
            if not main_task_found:
                print(f"- {t['content']} : {format_time(main_total)} (메인)")
                main_task_found = True
            else:
                print(f"- {t['content']} : 00:00")
        else:
            print(f"- {t['content']} : {format_time(t['minutes'])}")
    print("")

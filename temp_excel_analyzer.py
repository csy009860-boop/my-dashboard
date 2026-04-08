# -*- coding: utf-8 -*-
import pandas as pd
import json
import os
import re

def excel_to_json():
    # 경로 설정
    work_file = r'C:\Users\User\ai\dashboard\업무보고서_업무.xlsx'
    project_file = r'C:\Users\User\ai\dashboard\업무보고서_프로젝트.xlsx'
    output_file = r'C:\Users\User\ai\dashboard\data.json'

    # 1. 프로젝트 리스트 추출 (업무보고서_프로젝트.xlsx)
    projects_data = []
    if os.path.exists(project_file):
        df_p = pd.read_excel(project_file)
        # 인덱스 기반으로 데이터 추출 (첫 번째 컬럼이 [코드] 이름 형식이라고 가정)
        for _, row in df_p.iterrows():
            raw_title = str(row.iloc[0]).strip()
            match = re.search(r'\[(.*?)\]', raw_title)
            code = match.group(1) if match else ""
            name = raw_title.replace(match.group(0), "").strip() if match else raw_title
            
            projects_data.append({
                "code": code,
                "name": name,
                "pm": str(row.iloc[2]).strip() if len(row) > 2 else "",
                "status": str(row.iloc[3]).strip() if len(row) > 3 else "",
                "progress": str(row.iloc[4]).strip() if len(row) > 4 else "0%",
                "period": str(row.iloc[5]).strip() if len(row) > 5 else ""
            })

    # 2. 업무 타임라인 데이터 추출 (업무보고서_업무.xlsx)
    tasks_data = []
    if os.path.exists(work_file):
        df_w = pd.read_excel(work_file)
        # 컬럼 인덱스: 날짜(0), 프로젝트(1), 서브코드(2), 업무내용(3), 담당자(4), 소요시간(6)
        # NaN 값을 빈 문자열이나 적절한 기본값으로 변환
        df_w = df_w.fillna("")
        
        for _, row in df_w.iterrows():
            date_val = str(row.iloc[0]).strip()
            if not date_val or date_val == "nan": continue # 날짜 없는 행 제외
            
            tasks_data.append({
                "date": date_val,
                "project_code": str(row.iloc[1]).strip(),
                "project_name": str(row.iloc[2]).strip(),
                "content": str(row.iloc[3]).strip(),
                "manager": str(row.iloc[4]).strip(),
                "hours": str(row.iloc[6]).strip() if str(row.iloc[6]).strip() else "0"
            })

    # JSON 저장
    final_data = {
        "projects": projects_data,
        "tasks": tasks_data
    }
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"Data saved to {output_file}")

if __name__ == "__main__":
    excel_to_json()

# -*- coding: utf-8 -*-
import pandas as pd
import re
import os
import sys

# 표준 출력을 UTF-8로 설정
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def refine_excel():
    # 원본 '업무보고서_업무.xlsx'를 읽어 모든 데이터를 '업무보고서_업무_정리본.xlsx'에 올바른 형식으로 통합합니다.
    src_path = 'C:/Users/User/ai/dashboard/업무보고서_업무.xlsx'
    dst_path = 'C:/Users/User/ai/dashboard/업무보고서_업무_정리본.xlsx'
    sheet_name = '상세업무보고서'
    
    if not os.path.exists(src_path):
        print(f"File not found: {src_path}")
        return

    try:
        df = pd.read_excel(src_path, sheet_name=sheet_name)
    except Exception as e:
        print(f"Error reading Excel: {e}")
        return

    # 1. 날짜 정제 (요일 제거)
    df['날짜'] = df['날짜'].astype(str).apply(lambda x: re.match(r'(\d{4}\.\d{2}\.\d{2})', x.strip()).group(1) if re.match(r'(\d{4}\.\d{2}\.\d{2})', x.strip()) else x.strip())

    # 2. 프로젝트/서브코드 재정의 (이미 정제된 행도 포함하여 다시 확인)
    # [BD-26-xxx] Domainer -> 프로젝트: BD-26-xxx, 서브코드: Domainer
    def fix_mapping(row):
        proj = str(row['프로젝트']).strip()
        sub = str(row['서브코드']).strip()
        
        # 프로젝트 셀에 [코드]가 있는 경우
        match = re.search(r'\[(.*?)\]', proj)
        if match:
            code = match.group(1)
            name = proj.replace(match.group(0), '').strip()
            # 만약 서브코드가 비어있다면 추출한 이름을 넣음
            return pd.Series([code, name if name else sub])
        
        # 만약 프로젝트에 코드가 없고 서브코드에 코드가 있는 경우 (일부 3월 데이터 대응)
        if re.match(r'^[A-Z]{2}-\d{2}-', proj): # 프로젝트란에 이미 코드가 있는 경우
            return pd.Series([proj, sub])
            
        return pd.Series([proj, sub])

    df[['프로젝트', '서브코드']] = df.apply(fix_mapping, axis=1)

    # 3. 중복 제거 및 정렬
    for col in df.columns:
        df[col] = df[col].astype(str).str.strip().replace('nan', '')

    # 4월 데이터가 이미 정리본에 있다면 합칩니다.
    if os.path.exists(dst_path):
        new_df = pd.read_excel(dst_path)
        df = pd.concat([df, new_df], ignore_index=True)

    df.drop_duplicates(subset=['날짜', '프로젝트', '업무내용', '담당자'], keep='last', inplace=True)
    df['dt_tmp'] = pd.to_datetime(df['날짜'], format='%Y.%m.%d', errors='coerce')
    df = df.sort_values(by=['dt_tmp', '담당자']).drop(columns=['dt_tmp'])

    try:
        with pd.ExcelWriter(dst_path, engine='openpyxl') as writer:
            df.to_excel(writer, sheet_name=sheet_name, index=False)
        print(f"Successfully refined and merged all data to {dst_path}")
    except Exception as e:
        print(f"Error saving merged Excel: {e}")

if __name__ == '__main__':
    refine_excel()

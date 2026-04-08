
import pandas as pd
import re
import os

def create_project_report_with_details(input_excel_path):
    output_excel_path = 'C:/Users/User/ai/dashboard/업무보고서_프로젝트.xlsx'
    sheet_name = '프로젝트리스트'

    # 사용자로부터 받은 상세 섹션의 헤더 및 데이터 시작 행 번호 (1-indexed)
    detail_header_rows_1indexed = [58, 161, 247, 332, 421, 498, 584, 664, 747, 835, 921, 1007, 1097, 1183, 1269]
    detail_data_rows_1indexed = [59, 162, 248, 333, 422, 499, 585, 665, 748, 836, 922, 1008, 1098, 1184, 1270]

    # 최종 출력될 상세 내용 컬럼명 (프로젝트 리스트의 핵심 컬럼은 별도 처리)
    detail_output_columns = [
        'PM', '우선순위', '상태', '진행률', '협업팀',
        '배경및 목적', '업무범위', '역할및 책임', '일정계획', '커뮤니케이션', '피드백'
    ]

    # 엑셀 파일 전체 읽기
    try:
        full_sheet_df = pd.read_excel(input_excel_path, sheet_name=0, header=None)
    except Exception as e:
        print(f"Error reading input Excel file '{input_excel_path}': {e}", file=sys.stderr)
        return

    # --- 1. 마스터 프로젝트 리스트 추출 (8행 헤더, 9행부터 53행 데이터) ---
    master_header_row_idx = 8 - 1 # 0-indexed
    master_data_start_row_idx = 9 - 1 # 0-indexed
    master_data_end_row_idx = 53 - 1 # 0-indexed (53행까지 포함)

    master_header_series = full_sheet_df.loc[master_header_row_idx]
    
    # 실제 헤더명 추출 (NaN, None, 공백이 아닌 값만)
    master_actual_header_names = []
    for col_idx, col_val in enumerate(master_header_series):
        if pd.notna(col_val) and str(col_val).strip() != '':
            master_actual_header_names.append(str(col_val).strip())
        else:
            master_actual_header_names.append(f'Unnamed_{col_idx}')

    df_master_list = full_sheet_df.loc[master_data_start_row_idx : master_data_end_row_idx].copy()
    
    # 마스터 데이터프레임의 컬럼명 설정
    if len(df_master_list.columns) > len(master_actual_header_names):
        master_actual_header_names.extend([f'Unnamed_{j}' for j in range(len(master_actual_header_names), len(df_master_list.columns))])
    df_master_list.columns = master_actual_header_names[:len(df_master_list.columns)]
    
    # '프로젝트'와 '프로젝트코드' 컬럼을 찾아서 정리 (매핑 필요)
    # 실제 엑셀 파일의 헤더명이 '프로젝트'와 '프로젝트코드'로 바로 되어있지 않을 수 있음.
    # 여기서는 '프로젝트'와 '프로젝트코드'가 각각 첫번째와 두번째 유효한 헤더일 것이라고 가정
    
    # 일단 '프로젝트'와 '프로젝트코드'를 output_columns에서 가져옴
    master_relevant_cols = ['프로젝트', '프로젝트코드'] # 마스터 리스트에서 찾을 핵심 컬럼
    df_master_list_cleaned = pd.DataFrame(columns=master_relevant_cols)

    # 마스터 리스트의 컬럼 매핑 (이름이 일치하는 경우)
    for col_name in master_relevant_cols:
        if col_name in df_master_list.columns:
            df_master_list_cleaned[col_name] = df_master_list[col_name].astype(str).str.strip()
        else:
            # 컬럼 이름이 다를 경우, Unnamed 컬럼 중 적절한 위치를 가정
            # 예를 들어, 첫 번째 유효한 컬럼이 '프로젝트', 두 번째가 '프로젝트코드'일 것이라는 가정
            if 'Unnamed_0' in df_master_list.columns and col_name == '프로젝트':
                 df_master_list_cleaned[col_name] = df_master_list['Unnamed_0'].astype(str).str.strip()
            elif 'Unnamed_1' in df_master_list.columns and col_name == '프로젝트코드':
                 df_master_list_cleaned[col_name] = df_master_list['Unnamed_1'].astype(str).str.strip()
            else:
                df_master_list_cleaned[col_name] = pd.NA

    df_master_list_cleaned.dropna(subset=master_relevant_cols, how='all', inplace=True) # 모두 비어있으면 삭제


    # --- 2. 상세 프로젝트 내용 추출 (각 섹션별) ---
    all_details_df = []

    for i in range(len(detail_header_rows_1indexed)):
        header_row_idx = detail_header_rows_1indexed[i] - 1
        data_start_row_idx = detail_data_rows_1indexed[i] - 1
        
        # 다음 섹션의 헤더 행 또는 파일 끝까지를 현재 섹션의 끝으로 간주
        if i + 1 < len(detail_header_rows_1indexed):
            next_header_row_idx = detail_header_rows_1indexed[i+1] - 1
        else:
            next_header_row_idx = len(full_sheet_df) # 마지막 섹션이면 끝까지

        # 현재 섹션의 헤더 추출
        detail_header_series = full_sheet_df.loc[header_row_idx]
        detail_actual_header_names = []
        for col_idx, col_val in enumerate(detail_header_series):
            if pd.notna(col_val) and str(col_val).strip() != '':
                detail_actual_header_names.append(str(col_val).strip())
            else:
                detail_actual_header_names.append(f'Unnamed_{col_idx}')

        # 현재 섹션의 데이터 추출
        current_detail_section_df = full_sheet_df.loc[data_start_row_idx : next_header_row_idx - 1].copy()
        
        if len(current_detail_section_df.columns) > len(detail_actual_header_names):
            detail_actual_header_names.extend([f'Unnamed_{j}' for j in range(len(detail_actual_header_names), len(current_detail_section_df.columns))])
        current_detail_section_df.columns = detail_actual_header_names[:len(current_detail_section_df.columns)]


        # 상세 내용 컬럼 매핑
        processed_detail_section = pd.DataFrame(columns=['프로젝트'] + detail_output_columns) # 프로젝트명도 상세에서 추출될 수 있으므로 포함

        # 상세 섹션의 '프로젝트' 또는 '프로젝트코드'를 찾아서 연결 키로 사용
        project_name_in_detail = None
        # 예를 들어, 상세 섹션의 첫 번째 컬럼이 프로젝트명이라고 가정
        if '프로젝트' in current_detail_section_df.columns:
            project_name_in_detail = current_detail_section_df['프로젝트'].iloc[0] # 첫 행의 프로젝트명 사용
        elif 'Unnamed_0' in current_detail_section_df.columns: # 아니면 Unnamed_0 가정
             project_name_in_detail = current_detail_section_df['Unnamed_0'].iloc[0]

        if project_name_in_detail:
            processed_detail_section.loc[0, '프로젝트'] = str(project_name_in_detail).strip() # 임시로 첫 행에 프로젝트명 저장
            
            detail_mapping = {
                'PM': ['PM', '담당자'],
                '우선순위': ['우선순위', '우선'],
                '상태': ['상태', '진행상태'],
                '진행률': ['진행률', '달성률'],
                '협업팀': ['협업팀', '부서'],
                '배경및 목적': ['배경및 목적', '배경 및 목적'],
                '업무범위': ['업무범위', '범위'],
                '역할및 책임': ['역할및 책임', '책임'],
                '일정계획': ['일정계획', '일정'],
                '커뮤니케이션': ['커뮤니케이션', '소통'],
                '피드백': ['피드백', '의견']
            }
            
            for output_col, possible_names in detail_mapping.items():
                found_col = None
                for name in possible_names:
                    if name in current_detail_section_df.columns:
                        found_col = name
                        break
                if found_col:
                    # 상세 내용은 여러 행에 걸쳐 있을 수 있으므로, 해당 컬럼의 모든 데이터를 합치거나 대표값을 가져와야 함.
                    # 여기서는 일단 해당 컬럼의 모든 유효한 값을 문자열로 합치는 방식으로 처리 (예시)
                    processed_detail_section.loc[0, output_col] = ' '.join(current_detail_section_df[found_col].dropna().astype(str).tolist())
                else:
                    processed_detail_section.loc[0, output_col] = pd.NA
            
            processed_detail_section.dropna(how='all', inplace=True) # 프로젝트명 이외 모두 비어있으면 삭제

            all_details_df.append(processed_detail_section)

    if not all_details_df:
        print("처리할 유효한 상세 데이터 섹션을 찾지 못했습니다.", file=sys.stderr)
        return

    df_details_combined = pd.concat(all_details_df, ignore_index=True)
    
    # --- 3. 마스터 리스트와 상세 내용 연결 (Merge) ---
    # '프로젝트' 컬럼을 기준으로 merge
    # df_master_list_cleaned의 '프로젝트' 컬럼과 df_details_combined의 '프로젝트' 컬럼을 기준으로 조인
    final_merged_df = pd.merge(
        df_master_list_cleaned, 
        df_details_combined, 
        on='프로젝트', 
        how='left' # 마스터 리스트의 모든 프로젝트를 유지하고 상세 정보를 연결
    )

    # NaN 값을 빈 문자열로 대체하여 엑셀에서 보기 좋게
    final_merged_df = final_merged_df.fillna('')

    # 최종 출력 컬럼 순서
    final_output_columns = ['프로젝트', '프로젝트코드'] + detail_output_columns
    final_merged_df = final_merged_df[final_output_columns]

    # 엑셀 파일로 저장
    with pd.ExcelWriter(output_excel_path, engine='openpyxl') as writer:
        final_merged_df.to_excel(writer, sheet_name=sheet_name, index=False)

    print(f"엑셀 파일 '{output_excel_path}'이(가) 성공적으로 생성되었습니다.")


# 스크립트 실행
if __name__ == '__main__':
    input_file = 'C:/Users/User/ai/dashboard/2026년2분기_프로젝트_리스트.xlsx'
    create_project_report_with_details(input_file)

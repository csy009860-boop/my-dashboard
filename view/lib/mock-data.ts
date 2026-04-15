import type { FilteredData } from './types'

export const mockFilteredData: FilteredData = {
  startDate: '2026-03-01',
  endDate: '2026-03-31',
  projects: [
    {
      id: '1',
      name: '브랜드 리뉴얼 프로젝트',
      status: 'in-progress',
      totalHours: 156,
      requestDepartment: '마케팅팀',
      requester: '홍길동',
      requestDate: '2026-02-15',
      dueDate: '2026-04-15',
      assignees: [
        { id: '1', name: '김민수', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu', role: 'Lead Designer' },
        { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' },
        { id: '3', name: '박서준', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seojun', role: 'UI Designer' }
      ],
      weeklyTasks: [
        { id: 'wt1', weekNumber: 1, weekLabel: '1주차', title: '로고 시안 작업', description: '메인 로고 3가지 시안 제작', assignee: { id: '1', name: '김민수', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu', role: 'Lead Designer' }, hours: 24, status: 'completed' },
        { id: 'wt2', weekNumber: 1, weekLabel: '1주차', title: '컬러 팔레트 정의', description: 'Primary, Secondary, Accent 컬러 선정', assignee: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, hours: 12, status: 'completed' },
        { id: 'wt3', weekNumber: 2, weekLabel: '2주차', title: '타이포그래피 가이드', description: '웹/앱용 타이포그래피 스타일 가이드', assignee: { id: '3', name: '박서준', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seojun', role: 'UI Designer' }, hours: 16, status: 'completed' },
        { id: 'wt4', weekNumber: 3, weekLabel: '3주차', title: '아이콘 시스템 구축', description: '커스텀 아이콘 세트 디자인', assignee: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, hours: 32, status: 'in-progress' }
      ],
      aiAnalysis: '1주차에 로고 및 컬러 작업이 순조롭게 완료되었습니다. 2주차 타이포그래피 가이드 작업도 예정대로 마무리되었으며, 현재 3주차 아이콘 시스템 구축이 진행 중입니다. 전반적으로 일정 준수율이 높으며, 김민수 디자이너의 리드 아래 팀 협업이 원활합니다. 다만 아이콘 작업량이 예상보다 많아 추가 리소스 투입을 권장합니다.',
      resources: [
        { id: 'r1', title: 'Figma 디자인 파일', type: 'link', value: 'https://figma.com/file/xxxxx' },
        { id: 'r2', title: '브랜드 가이드라인 v1.0', type: 'link', value: 'https://notion.so/brand-guide' },
        { id: 'r3', title: '로고 시안 폴더', type: 'text', value: '/Design/Brand/Logo_Drafts' }
      ],
      notes: '클라이언트 미팅 후 로고 시안 A 방향으로 진행 확정. 컬러 팔레트는 접근성 기준 충족 확인 완료.',
      designAssets: [
        {
          id: 'da1',
          title: '메인 로고 시안 A',
          description: '메인 로고의 첫 번째 시안입니다. 심플하고 모던한 느낌을 강조했습니다.',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=1200&h=800&fit=crop',
          comments: [
            { id: 'c1', pinX: 45, pinY: 30, author: { id: '1', name: '김민수', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu', role: 'Lead Designer' }, content: '로고 심볼의 라인 두께 조정이 필요합니다.', createdAt: '2026-03-06 14:30', resolved: false },
            { id: 'c2', pinX: 70, pinY: 55, author: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, content: '컬러 대비 비율 확인 부탁드립니다.', createdAt: '2026-03-06 15:45', resolved: true }
          ]
        },
        {
          id: 'da2',
          title: '컬러 팔레트 가이드',
          description: '브랜드 컬러 팔레트 정의서입니다. Primary, Secondary, Accent 컬러가 포함되어 있습니다.',
          type: 'pdf',
          url: '/files/color-palette.pdf',
          comments: [
            { id: 'c3', pinX: 25, pinY: 40, author: { id: '3', name: '박서준', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seojun', role: 'UI Designer' }, content: 'Accent 컬러가 너무 채도가 높은 것 같습니다.', createdAt: '2026-03-09 09:15', resolved: false }
          ]
        },
        {
          id: 'da3',
          title: '타이포그래피 스타일 가이드',
          description: '웹/앱에서 사용할 타이포그래피 스타일 가이드 링크입니다.',
          type: 'link',
          url: 'https://figma.com/file/typography',
          comments: []
        }
      ]
    },
    {
      id: '2',
      name: '모바일 앱 UI 개선',
      status: 'completed',
      totalHours: 198,
      requestDepartment: '제품개발팀',
      requester: '이수진',
      requestDate: '2026-02-01',
      dueDate: '2026-03-25',
      assignees: [
        { id: '4', name: '최유나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuna', role: 'UX Designer' },
        { id: '5', name: '정현우', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyunwoo', role: 'UI Designer' }
      ],
      weeklyTasks: [
        { id: 'wt5', weekNumber: 1, weekLabel: '1주차', title: '사용자 리서치', description: '기존 앱 사용성 테스트 및 인터뷰', assignee: { id: '4', name: '최유나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuna', role: 'UX Designer' }, hours: 40, status: 'completed' },
        { id: 'wt6', weekNumber: 2, weekLabel: '2주차', title: '와이어프레임 작성', description: '주요 화면 와이어프레임 제작', assignee: { id: '4', name: '최유나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuna', role: 'UX Designer' }, hours: 24, status: 'completed' },
        { id: 'wt7', weekNumber: 3, weekLabel: '3주차', title: 'UI 디자인', description: '최종 UI 디자인 및 프로토타입', assignee: { id: '5', name: '정현우', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyunwoo', role: 'UI Designer' }, hours: 56, status: 'completed' }
      ],
      aiAnalysis: '프로젝트가 예정일보다 빠르게 완료되었습니다. 사용자 리서치 결과가 UI 개선 방향에 효과적으로 반영되었으며, 최유나 디자이너의 UX 분석이 프로젝트 성공에 크게 기여했습니다. 개선된 UI에 대한 초기 사용자 피드백이 긍정적입니다.',
      resources: [
        { id: 'r4', title: '사용자 리서치 보고서', type: 'link', value: 'https://notion.so/user-research' },
        { id: 'r5', title: 'Figma 프로토타입', type: 'link', value: 'https://figma.com/proto/xxxxx' }
      ],
      notes: '앱스토어 업데이트 v2.5.0으로 배포 완료. 사용자 만족도 조사 예정.',
      designAssets: [
        {
          id: 'da4',
          title: '홈 화면 UI',
          description: '개선된 홈 화면 UI 디자인입니다. 사용자 피드백을 반영하여 네비게이션을 단순화했습니다.',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1616469829581-73993eb86b02?w=1200&h=800&fit=crop',
          comments: []
        }
      ]
    },
    {
      id: '3',
      name: '대시보드 리디자인',
      status: 'review',
      totalHours: 132,
      requestDepartment: '운영팀',
      requester: '김영희',
      requestDate: '2026-02-20',
      dueDate: '2026-04-01',
      assignees: [
        { id: '6', name: '한소희', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sohee', role: 'Product Designer' },
        { id: '1', name: '김민수', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu', role: 'Lead Designer' }
      ],
      weeklyTasks: [
        { id: 'wt8', weekNumber: 1, weekLabel: '1주차', title: '차트 컴포넌트 디자인', description: '데이터 시각화용 차트 UI 제작', assignee: { id: '6', name: '한소희', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sohee', role: 'Product Designer' }, hours: 28, status: 'completed' },
        { id: 'wt9', weekNumber: 2, weekLabel: '2주차', title: '테이블 UI 개선', description: '대용량 데이터 테이블 UX 최적화', assignee: { id: '6', name: '한소희', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sohee', role: 'Product Designer' }, hours: 20, status: 'review' }
      ],
      aiAnalysis: '차트 컴포넌트 디자인이 완료되어 현재 테이블 UI 개선 작업이 리뷰 단계에 있습니다. 데이터 시각화 측면에서 접근성 고려가 잘 되어있으며, 리뷰 완료 후 즉시 개발 핸드오프가 가능할 것으로 예상됩니다.',
      resources: [
        { id: 'r6', title: 'Dashboard 요구사항', type: 'link', value: 'https://notion.so/dashboard-req' }
      ],
      notes: '차트 라이브러리는 Recharts 사용 예정. 테이블은 가상화 적용 필요.',
      designAssets: [
        {
          id: 'da5',
          title: '대시보드 메인 화면',
          description: '관리자 대시보드 메인 화면입니다. 주요 지표와 차트가 한눈에 보이도록 구성했습니다.',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=800&fit=crop',
          comments: [
            { id: 'c4', pinX: 60, pinY: 35, author: { id: '1', name: '김민수', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=minsu', role: 'Lead Designer' }, content: '사이드바 너비 조정 필요', createdAt: '2026-03-23 11:00', resolved: false }
          ]
        }
      ]
    },
    {
      id: '4',
      name: '이커머스 결제 플로우 개선',
      status: 'in-progress',
      totalHours: 88,
      requestDepartment: '이커머스사업부',
      requester: '박준영',
      requestDate: '2026-03-01',
      dueDate: '2026-04-20',
      assignees: [
        { id: '5', name: '정현우', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyunwoo', role: 'UI Designer' }
      ],
      weeklyTasks: [
        { id: 'wt10', weekNumber: 1, weekLabel: '1주차', title: '결제 플로우 분석', description: '현재 결제 단계별 이탈률 분석', assignee: { id: '5', name: '정현우', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyunwoo', role: 'UI Designer' }, hours: 16, status: 'completed' },
        { id: 'wt11', weekNumber: 2, weekLabel: '2주차', title: '개선안 도출', description: '이탈률 감소를 위한 UI 개선안 작성', assignee: { id: '5', name: '정현우', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hyunwoo', role: 'UI Designer' }, hours: 24, status: 'in-progress' }
      ],
      aiAnalysis: '결제 플로우 분석 결과, 배송지 입력 단계에서 가장 높은 이탈률(23%)이 발견되었습니다. 현재 UI 개선안 도출 단계이며, 주소 자동완성 기능과 간편결제 옵션 추가를 권장합니다.',
      resources: [
        { id: 'r7', title: 'GA 분석 데이터', type: 'text', value: 'Analytics > Ecommerce > Checkout Funnel' }
      ],
      notes: '결제 전환율 목표: 현재 72% → 85%',
      designAssets: []
    },
    {
      id: '5',
      name: '고객센터 챗봇 인터페이스',
      status: 'planning',
      totalHours: 24,
      requestDepartment: '고객지원팀',
      requester: '최민정',
      requestDate: '2026-03-10',
      dueDate: '2026-05-01',
      assignees: [
        { id: '4', name: '최유나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuna', role: 'UX Designer' },
        { id: '3', name: '박서준', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=seojun', role: 'UI Designer' }
      ],
      weeklyTasks: [
        { id: 'wt12', weekNumber: 1, weekLabel: '1주차', title: '벤치마킹 리서치', description: '경쟁사 챗봇 UI 분석', assignee: { id: '4', name: '최유나', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yuna', role: 'UX Designer' }, hours: 12, status: 'in-progress' }
      ],
      aiAnalysis: '현재 벤치마킹 리서치 단계입니다. 주요 경쟁사 5개사의 챗봇 UI를 분석 중이며, 대화형 인터페이스 트렌드와 사용자 기대치를 파악하고 있습니다.',
      resources: [
        { id: 'r8', title: '챗봇 기획안', type: 'link', value: 'https://notion.so/chatbot-plan' }
      ],
      notes: 'AI 모델은 GPT-4 기반으로 개발팀에서 준비 중.',
      designAssets: []
    },
    {
      id: '6',
      name: '마케팅 랜딩페이지 시즌 캠페인',
      status: 'completed',
      totalHours: 56,
      requestDepartment: '마케팅팀',
      requester: '김서연',
      requestDate: '2026-02-25',
      dueDate: '2026-03-20',
      assignees: [
        { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }
      ],
      weeklyTasks: [
        { id: 'wt13', weekNumber: 1, weekLabel: '1주차', title: '히어로 섹션 디자인', description: '메인 비주얼 및 CTA 버튼 디자인', assignee: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, hours: 20, status: 'completed' },
        { id: 'wt14', weekNumber: 2, weekLabel: '2주차', title: '상품 섹션 디자인', description: '프로모션 상품 카드 및 그리드 디자인', assignee: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, hours: 16, status: 'completed' },
        { id: 'wt15', weekNumber: 3, weekLabel: '3주차', title: '반응형 최적화', description: '모바일/태블릿 반응형 디자인', assignee: { id: '2', name: '이지현', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jihyun', role: 'Visual Designer' }, hours: 20, status: 'completed' }
      ],
      aiAnalysis: '프로젝트가 일정 내 성공적으로 완료되었습니다. 랜딩페이지 오픈 후 첫 주 방문자 수가 예상 대비 150% 달성했으며, 전환율도 목표치를 초과했습니다. 이지현 디자이너의 비주얼 퀄리티가 캠페인 성공에 크게 기여했습니다.',
      resources: [
        { id: 'r9', title: '캠페인 가이드', type: 'link', value: 'https://notion.so/spring-campaign' },
        { id: 'r10', title: '이미지 에셋 폴더', type: 'text', value: '/Marketing/Spring2026/Assets' }
      ],
      notes: '캠페인 종료 후 성과 분석 리포트 작성 예정. A/B 테스트 결과 CTA 버튼 컬러 변경이 효과적.',
      designAssets: [
        {
          id: 'da6',
          title: '랜딩페이지 히어로 섹션',
          description: '봄 시즌 캠페인 메인 히어로 섹션입니다. 밝고 경쾌한 분위기를 연출했습니다.',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&h=800&fit=crop',
          comments: []
        }
      ]
    }
  ]
}

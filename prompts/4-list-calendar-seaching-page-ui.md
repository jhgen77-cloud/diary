새 링크 페이지의 UI를 구현할 것

# 페이지 구성

    - 달력으로 등록된 글 검색 가능한 페이지 구현할 것
    - Write(app\diary\calendar\page.tsx)와 연동하여 구현할 것
    - Write(app\@modal\(.)diary\page.tsx) 기본 구성을 최대한 포맷을 유지할 것

    - 메인 섹션
    - calendar.png를 클릭될 때, 날짜 순 글 목록 리스트 대신, 달력으로 저장된
      글을 확인할 수 있도록 구현할 것
    - 달력에는 현재 일로 설정할 것
    - 달력에 작성한 날짜에 저장된 글 제목과 등록된 아이콘이 표시되게 할 것
      또한, 이미지 첨부가 되어 있으면, 이미지 첨부 아이콘도 함께 표시되게 할 것
        - C:\webdev\diary\images\mood 안의 이미지 사용
        - C:\webdev\diary\images\weather 안의 이미지 사용
        - 이미지 첨부 아이콘은 C:\webdev\diary\images\image-attachment를 사용할 것
    - 해당 날짜를 클릭하면, 작성된 글 페이지로 모달창을 구현할 것
        - 아직 페이지는 구현안됨
        - 해당 날짜를 클릭하면, 눌러지는 이벤트가 발생하도록 구현할 것

# 주의사항

    - 컴포넌트 단위로 적절히 분할해서 구현할 것
    - 결과는 컴포넌트 단위로 보고할 것
    - 이미 만들어둔 컴포넌트를 최대한 활용할 것

# 추가 수정 사항

    - 검색 인풋란에 원하는 등록된 단어나 제목을 작성 후, search.png를 클릭하면
      Write(app\@modal\(.)diary\page.tsx)로 전환되게 구현하고, 해당 글 목록 검색되게 할 것
    - search.png 클릭으로, 해당 글 목록 검색하고, calendar.png를 바로 클릭하면
      검색된 목록을 초기화되도록 하고, 검색에 사용된 인풋란에 작성된 단어도 함께 초기화되도록 구현할 것
    - Write(app\diary\calendar\page.tsx)에서 검색에 사용된 인풋란에 작성된 단어를
      Write(app\@modal\(.)diary\page.tsx)로 전환되서 남아 있는 상태로 있으면, file.png를 클릭하면 검색에 사용된 인풋란에 작성된 단어도 함께 초기화되도록 구현할 것
    - 닫기 버튼을 클릭하면, 바로 이전 단계로 전환되도록 구현할 것
    - 닫기 버튼을 클릭할 때, 아래와 같이 개별 분리하여 구현할 것
        - Write(app\diary\calendar\page.tsx)에서 닫기하면 C:\webdev\diary\app\page.tsx로 전환시킬 것
        - Write(app\@modal\(.)diary\page.tsx)에서 닫기하면
        C:\webdev\diary\app\page.tsx로 전환시킬 것

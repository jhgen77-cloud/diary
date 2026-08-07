# 글 읽기 리스트 테이블을 데이터 구성하기

    - id: 오토 인크리먼트, 프라이머리 키
    - Write(app\@modal\(.)diary\write\page.tsx)에서 저장한 데이터를
      글 일기 리스트 테이블의 컬럼에 아래와 추가할 것
    - Title: 작성된 제목
    - Text: 작성된 본문 내용
    - Mood: angry.png, bad.png, sad.png, sarcastic.png, smile.png,
            no-select.png 중에서 선택된 icon 저장
    - Weather: '[선택안함]' 텍스트, brightness.png,cloudy.png
               haze.png, rain.png 중에서 선택된 텍스트 또는 icon 저장
    - image: 첨부된 이미지
    - create_at: 글이 작성된 년/월/일

document.addEventListener("DOMContentLoaded", function () {

  // 1. 기술 스택 칩: 마우스를 올리면 강조, 나가면 원래대로
  const chips = document.querySelectorAll(".chips li");
  chips.forEach(function (chip) {
    chip.addEventListener("mouseover", function () {
      chip.classList.add("is-hover");
    });
    chip.addEventListener("mouseout", function () {
      chip.classList.remove("is-hover");
    });
  });

  // 2. 프로필 사진: 올리면 테두리 색이 바뀌고 나가면 돌아옴
  const photo = document.querySelector(".photo");
  if (photo) {
    photo.addEventListener("mouseover", function () {
      photo.classList.add("is-hover");
    });
    photo.addEventListener("mouseout", function () {
      photo.classList.remove("is-hover");
    });
  }

  // 3. 기술 칩 설명: 누르면 칩 목록 바로 아래에 설명이 열리고, 다시 누르면 닫힘
  const desc = {
    // SAP / ABAP
    "ABAP Cloud (RAP)": "SAP의 최신 ABAP 개발 방식입니다. RAP(RESTful Application Programming)는 데이터 모델, 비즈니스 로직, 서비스를 한 흐름으로 만드는 틀입니다. 이 분야로 SAP ABAP Cloud 백엔드 개발자 자격을 취득했습니다.",
    "OData 서비스": "SAP 데이터를 웹 표준(HTTP) 방식으로 주고받게 해 주는 규격입니다. Fiori 화면이나 외부 시스템이 SAP 데이터를 읽고 쓸 때 사용합니다.",
    "비즈니스 로직 구현": "주문·출고·청구처럼 회사 업무 규칙을 코드로 옮기는 일입니다. 입력값을 검사하고 상태를 바꾸는 처리를 ABAP으로 구현합니다.",
    "데이터베이스 연동": "ABAP 프로그램에서 SAP 테이블을 조회·저장하는 작업입니다. Open SQL과 CDS 뷰로 필요한 데이터만 효율적으로 가져옵니다.",
    "SAP BTP": "SAP Business Technology Platform. SAP의 클라우드 플랫폼으로, ABAP Cloud 개발 환경과 앱 배포, 데이터 연동 기능을 제공합니다.",
    "SAPUI5 / Fiori": "SAPUI5는 SAP의 웹 화면 프레임워크이고, Fiori는 그 위에서 쓰는 SAP 표준 디자인입니다. 사용자가 보는 업무 화면을 만듭니다.",
    "ABAP": "SAP 시스템 전용 프로그래밍 언어입니다. GBA PARTNERS에서 SAP SD 모듈 개발에 사용했습니다.",
    "RAP": "ABAP RESTful Application Programming. 데이터 모델부터 서비스까지 한 흐름으로 만드는 ABAP Cloud 개발 틀입니다.",
    "SAP Fiori": "SAP의 표준 웹 화면 디자인입니다. 업무 화면을 카드·목록 형태로 단순하게 보여 줍니다.",
    "SAP SD": "Sales & Distribution. 견적·주문·출하·청구 같은 영업·유통 업무를 담당하는 SAP 모듈입니다. GBA PARTNERS에서 이 모듈을 개발했습니다.",

    // Infra & Security
    "SAP HANA": "SAP의 인메모리 데이터베이스입니다. 데이터를 메모리에 올려 빠르게 처리합니다. 블루어드에서 HANA DB 암호화 구축에 참여했습니다.",
    "DB 개인정보 암호화": "이름·주소·주민등록번호처럼 민감한 컬럼을 암호화해, DB가 유출돼도 내용을 읽을 수 없게 만드는 작업입니다. 블루어드 인턴 때 고객사 구축에 참여했습니다.",
    "DB 암호화": "민감한 컬럼을 암호화해, DB가 유출돼도 내용을 읽을 수 없게 만드는 작업입니다.",
    "암호화 솔루션 설치·설정": "DB 암호화 솔루션을 서버에 설치하고, 어떤 컬럼을 어떤 방식으로 암호화할지 정책을 설정하는 일입니다.",
    "성능 테스트": "암호화 같은 변경을 적용한 뒤 조회·저장 속도가 얼마나 달라지는지 측정하는 작업입니다. 적용 전후를 비교해 서비스에 문제가 없는지 확인합니다.",
    "AWS (학습 중)": "아마존의 클라우드 서비스입니다. 클라우드 보안 공부의 첫 단계로 기초를 학습하고 있고, 2026년 11월 AWS Cloud Practitioner 시험을 준비하고 있습니다.",

    // Backend & DB
    "Java": "가장 널리 쓰이는 서버 개발 언어 중 하나입니다. Smart Fridge 백엔드를 Java로 개발했습니다.",
    "Java 17": "Java의 장기 지원(LTS) 버전입니다. Smart Fridge 서버를 Java 17로 개발했습니다.",
    "Kotlin": "Java와 함께 쓸 수 있는 간결한 언어로, 안드로이드 공식 언어입니다.",
    "Spring Boot": "Java 서버를 빠르게 만들 수 있게 해 주는 프레임워크입니다. Smart Fridge의 REST API 14개를 Spring Boot로 구현했습니다.",
    "JPA": "Java 객체와 DB 테이블을 연결해 주는 표준 기술입니다. SQL을 직접 쓰지 않아도 객체로 데이터를 저장·조회할 수 있습니다.",
    "Spring Data JPA": "JPA를 더 쉽게 쓰게 해 주는 Spring 도구입니다. Smart Fridge에서 레시피·냉장고 데이터를 다룰 때 사용했습니다.",
    "Oracle DB": "기업에서 많이 쓰는 관계형 데이터베이스입니다. Smart Fridge의 레시피 1,156건과 사용자별 냉장고 데이터를 저장합니다.",
    "RESTful API 설계": "주소(URL)와 HTTP 방식(GET·POST·PUT·DELETE)으로 기능을 나누는 API 설계 방식입니다. 앱과 서버가 데이터를 주고받는 약속입니다.",
    "REST API 설계": "주소(URL)와 HTTP 방식(GET·POST·PUT·DELETE)으로 기능을 나누는 API 설계 방식입니다. Smart Fridge에서 냉장고·레시피 API 14개를 설계했습니다.",
    "클라이언트-서버 통신": "앱(클라이언트)이 서버에 요청을 보내고 결과를 받는 구조입니다. 주로 HTTP와 JSON 형식으로 데이터를 주고받습니다.",
    "SQL 쿼리 최적화": "같은 결과를 더 빠르게 가져오도록 쿼리와 인덱스를 다듬는 작업입니다.",
    "관계형 DB 스키마 설계": "어떤 테이블과 컬럼을 만들고 서로 어떻게 연결할지 정하는 작업입니다. 데이터 중복을 줄이고 조회를 쉽게 합니다.",
    "데이터 무결성 관리": "잘못되거나 모순된 데이터가 저장되지 않게 막는 일입니다. 제약 조건과 입력값 검증으로 데이터의 정확성을 지킵니다.",
    "입력값 검증": "필수값 누락이나 음수 수량 같은 잘못된 요청을 서버에서 걸러내는 작업입니다. Smart Fridge에서는 문제가 있으면 사유를 담은 400 응답을 돌려줍니다.",

    // Mobile
    "Android Studio": "구글의 공식 안드로이드 앱 개발 도구입니다. 화면 설계, 코드 작성, 에뮬레이터 실행까지 한곳에서 합니다.",
    "Java / Kotlin": "안드로이드 앱 개발에 쓰는 두 언어입니다. Kotlin이 공식 언어이고, Java로도 개발할 수 있습니다.",
    "실시간 데이터 처리": "데이터가 들어오는 즉시 처리해 화면에 바로 반영하는 방식입니다.",
    "UI/UX 구현": "사용자가 보는 화면(UI)을 만들고, 쓰기 편한 흐름(UX)을 설계하는 작업입니다.",
    "Retrofit 연동": "안드로이드에서 서버 API를 쉽게 호출하게 해 주는 라이브러리입니다. Smart Fridge 앱이 Retrofit으로 제 서버와 통신합니다.",

    // Tools & Etc
    "Git": "코드 변경 이력을 기록하고 여러 사람이 함께 작업하게 해 주는 버전 관리 도구입니다. 이 포트폴리오도 Git으로 관리합니다.",
    "Claude API 연동": "Anthropic의 AI 모델 Claude를 서버에서 호출하는 작업입니다. Smart Fridge에서 영수증 분석, 대화형 추천, 번역에 사용했습니다.",
    "Claude API": "Anthropic의 AI 모델 Claude를 호출하는 API입니다. Smart Fridge에서는 키 노출을 막기 위해 서버에서만 호출합니다.",
    "공공데이터 API": "정부 기관이 공개한 데이터를 받아 오는 API입니다. Smart Fridge는 식약처 레시피 DB에서 1,156건을 자동 수집했습니다.",
    "클라우드 환경 개발": "내 컴퓨터가 아닌 클라우드 서버 위에서 개발하고 배포하는 방식입니다.",
    "데이터 모델링": "현실의 정보를 어떤 데이터 구조로 담을지 설계하는 작업입니다. 사용자·식재료·레시피처럼 개념과 관계를 정리합니다.",
    "애자일 팀 협업": "짧은 주기로 계획·개발·점검을 반복하며 팀이 함께 개선해 나가는 방식입니다."
  };

  document.querySelectorAll(".chips").forEach(function (list) {
    const box = document.createElement("div");
    box.className = "chip-desc";
    box.hidden = true;
    box.setAttribute("aria-live", "polite");
    list.after(box);

    list.querySelectorAll("li").forEach(function (chip) {
      const name = chip.textContent.trim();
      if (!desc[name]) return;

      chip.classList.add("has-desc");
      chip.tabIndex = 0;
      chip.setAttribute("role", "button");
      chip.setAttribute("aria-expanded", "false");

      function toggle() {
        const open = chip.classList.contains("is-active");
        list.querySelectorAll(".is-active").forEach(function (c) {
          c.classList.remove("is-active");
          c.setAttribute("aria-expanded", "false");
        });
        if (open) {
          box.hidden = true;
          return;
        }
        chip.classList.add("is-active");
        chip.setAttribute("aria-expanded", "true");
        box.innerHTML = "";
        const title = document.createElement("strong");
        title.textContent = name;
        const text = document.createElement("p");
        text.textContent = desc[name];
        box.append(title, text);
        box.hidden = false;
      }

      chip.addEventListener("click", toggle);
      chip.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  });
  // 4. 스크롤 등장 효과: 화면에 들어온 섹션과 카드가 아래에서 부드럽게 올라옴
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll("main > section, .links");
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }
});

export const translations = {
  en: {
    title: "PRO GEAR MATCH",
    subtitle: "Find your pro gamer twin",
    selectGame: "Select Game",
    gearSettings: "Gear Settings",
    mouse: "Mouse",
    keyboard: "Keyboard",
    monitor: "Monitor",
    mousepad: "Mousepad",
    sensitivity: "Sensitivity",
    dpi: "DPI",
    findMatch: "Find My Match",
    proList: "Pro Gamers",
    refresh: "Refresh List",
    fetching: "Fetching Pro List...",
    scanning: "Scanning Pro Databases...",
    perfectMatch: "Perfect Match Found",
    source: "Source",
    viewProfile: "View Profile",
    enterGear: "",
    failedMatch: "Failed to find a match. Please try again.",
    back: "Back to Settings",
    edpi: "eDPI",
    team: "Team",
    similarMatch: "Similar Match",
  },
  ko: {
    title: "PRO GEAR MATCH",
    subtitle: "나와 닮은 프로게이머 찾기",
    selectGame: "게임 선택",
    gearSettings: "장비 설정",
    mouse: "마우스",
    keyboard: "키보드",
    monitor: "모니터",
    mousepad: "마우스패드",
    sensitivity: "감도",
    dpi: "DPI",
    findMatch: "매칭 시작",
    proList: "프로게이머 목록",
    refresh: "목록 갱신",
    fetching: "프로 목록 불러오는 중...",
    scanning: "프로 데이터베이스 스캔 중...",
    perfectMatch: "완벽한 매칭 발견",
    source: "출처",
    viewProfile: "프로필 보기",
    enterGear: "",
    failedMatch: "매칭에 실패했습니다. 다시 시도해주세요.",
    back: "설정으로 돌아가기",
    edpi: "eDPI",
    team: "팀",
    similarMatch: "비슷한 매칭",
  }
};

export type Language = keyof typeof translations;

export const getLanguage = (): Language => {
  const lang = navigator.language.split('-')[0];
  return (translations[lang as Language] ? lang : 'en') as Language;
};

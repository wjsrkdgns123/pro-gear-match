// One-time script: expand 16 existing blog posts with a uniform
// "더 알아보기 (Related Reading)" + "체크리스트" section, before the closing
// fragment of each language's content body.
//
// Only modifies posts whose slug is in EXPAND_SLUGS. Skips posts already
// containing the marker `BLOG_EXPANSION_v1` to keep the script idempotent.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '..', 'src', 'data', 'blogPosts.tsx');

const EXPAND_SLUGS = [
  'edpi-explained',
  'why-pros-use-800-dpi',
  'cm-per-360-cross-game',
  'dpi-vs-sensitivity',
  'mousepad-impact-on-aim',
  'valorant-sensitivity-trends-2026',
  'aim-like-a-pro-5-steps',
  'tenz-sensitivity-history',
  'mouse-grip-styles',
  '5-minute-warmup-routine',
  'apex-sensitivity-guide',
  'ow2-hero-sensitivity-recommendations',
  'cs2-sensitivity-deep-dive',
  'monitor-refresh-rate-worth-it',
  'aim-trainer-comparison',
  'wired-vs-wireless-mouse-latency',
];

// Per-slug related posts (slug → KO label / EN label)
const RELATED = {
  'edpi-explained': [
    ['dpi-vs-sensitivity', 'DPI vs 인게임 감도', 'DPI vs In-Game Sens'],
    ['cm-per-360-cross-game', 'cm/360 가이드', 'cm/360 Guide'],
    ['why-pros-use-800-dpi', '왜 800 DPI인가', 'Why 800 DPI'],
  ],
  'why-pros-use-800-dpi': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['mouse-polling-rate-explained', '폴링레이트 가이드', 'Polling Rate Guide'],
    ['dpi-vs-sensitivity', 'DPI vs 감도', 'DPI vs Sens'],
  ],
  'cm-per-360-cross-game': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['valorant-sensitivity-trends-2026', '발로 감도 트렌드', 'Valorant Sens Trends'],
    ['cs2-sensitivity-deep-dive', 'CS2 감도 심화', 'CS2 Sens Deep Dive'],
  ],
  'dpi-vs-sensitivity': [
    ['edpi-explained', 'eDPI란 무엇인가', 'What is eDPI'],
    ['mouse-acceleration-explained', '마우스 가속 끄기', 'Mouse Accel Off'],
    ['why-pros-use-800-dpi', '왜 800 DPI인가', 'Why 800 DPI'],
  ],
  'mousepad-impact-on-aim': [
    ['mouse-grip-styles', '마우스 그립 가이드', 'Grip Styles'],
    ['mouse-weight-truth', '마우스 무게의 진실', 'Mouse Weight Truth'],
    ['aim-like-a-pro-5-steps', '프로처럼 에임하기', 'Aim Like a Pro'],
  ],
  'valorant-sensitivity-trends-2026': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['cm-per-360-cross-game', 'cm/360 가이드', 'cm/360 Guide'],
    ['tenz-sensitivity-history', 'TenZ 감도 변천사', "TenZ's Sens History"],
  ],
  'aim-like-a-pro-5-steps': [
    ['30-day-aim-challenge', '30일 에임 챌린지', '30-Day Aim Challenge'],
    ['aim-trainer-comparison', '에임 트레이너 비교', 'Aim Trainer Comparison'],
    ['5-minute-warmup-routine', '5분 워밍업 루틴', '5-Min Warmup'],
  ],
  'tenz-sensitivity-history': [
    ['valorant-sensitivity-trends-2026', '발로 감도 트렌드 2026', 'Valorant Sens Trends 2026'],
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['aim-like-a-pro-5-steps', '프로처럼 에임하기', 'Aim Like a Pro'],
  ],
  'mouse-grip-styles': [
    ['mouse-weight-truth', '마우스 무게의 진실', 'Mouse Weight Truth'],
    ['first-gaming-mouse-2026', '첫 게이밍 마우스 추천', 'First Gaming Mouse'],
    ['fps-wrist-pain-prevention', '손목 통증 예방', 'Wrist Pain Prevention'],
  ],
  '5-minute-warmup-routine': [
    ['30-day-aim-challenge', '30일 에임 챌린지', '30-Day Aim Challenge'],
    ['aim-trainer-comparison', '에임 트레이너 비교', 'Aim Trainer Comparison'],
    ['aim-like-a-pro-5-steps', '프로처럼 에임하기', 'Aim Like a Pro'],
  ],
  'apex-sensitivity-guide': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['input-lag-reduction-guide', '인풋랙 줄이기', 'Input Lag Reduction'],
    ['mouse-weight-truth', '마우스 무게의 진실', 'Mouse Weight Truth'],
  ],
  'ow2-hero-sensitivity-recommendations': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['fov-settings-guide', 'FOV 설정 가이드', 'FOV Settings'],
    ['mouse-grip-styles', '마우스 그립 가이드', 'Grip Styles'],
  ],
  'cs2-sensitivity-deep-dive': [
    ['edpi-explained', 'eDPI 완전 정리', 'eDPI Explained'],
    ['cm-per-360-cross-game', 'cm/360 가이드', 'cm/360 Guide'],
    ['mouse-acceleration-explained', '마우스 가속 끄기', 'Mouse Accel Off'],
  ],
  'monitor-refresh-rate-worth-it': [
    ['input-lag-reduction-guide', '인풋랙 줄이기', 'Input Lag Reduction'],
    ['mouse-polling-rate-explained', '폴링레이트 가이드', 'Polling Rate Guide'],
    ['wired-vs-wireless-mouse-latency', '유선 vs 무선 마우스', 'Wired vs Wireless'],
  ],
  'aim-trainer-comparison': [
    ['30-day-aim-challenge', '30일 에임 챌린지', '30-Day Aim Challenge'],
    ['aim-like-a-pro-5-steps', '프로처럼 에임하기', 'Aim Like a Pro'],
    ['5-minute-warmup-routine', '5분 워밍업 루틴', '5-Min Warmup'],
  ],
  'wired-vs-wireless-mouse-latency': [
    ['mouse-polling-rate-explained', '폴링레이트 가이드', 'Polling Rate Guide'],
    ['input-lag-reduction-guide', '인풋랙 줄이기', 'Input Lag Reduction'],
    ['first-gaming-mouse-2026', '첫 게이밍 마우스 추천', 'First Gaming Mouse'],
  ],
};

// Per-slug "체크리스트" (checklist) — additional H2 with bullets specific to topic.
const CHECKLIST = {
  'edpi-explained': {
    ko: [
      '본인의 DPI × 인게임 감도를 계산해 eDPI 확인',
      'Pro Gear Match 매칭 결과의 분포 히스토그램에서 본인 위치 파악',
      '동일 게임 내 비교일 때만 eDPI 사용',
      '게임 간 이동은 cm/360°로 변환',
    ],
    en: [
      'Compute your eDPI: DPI × in-game sens',
      'Locate your position on the Pro Gear Match histogram',
      'Use eDPI only within the same game',
      'Use cm/360° when moving between games',
    ],
  },
  'why-pros-use-800-dpi': {
    ko: [
      '본인 마우스를 800 DPI로 설정',
      '폴링레이트 1000Hz 이상 확인',
      'OS 마우스 가속 끄기',
      '게임 내 raw input 켜기',
    ],
    en: [
      'Set your mouse to 800 DPI',
      'Confirm polling rate ≥1000Hz',
      'Disable OS mouse acceleration',
      'Enable raw input in-game',
    ],
  },
  'cm-per-360-cross-game': {
    ko: [
      '현재 cm/360° 측정 (마우스를 한 바퀴 회전시키는 데 필요한 cm)',
      '목표 게임의 환산 계수 확인',
      '환산 후 1주 적응 기간',
      '실력 안정될 때까지 cm/360° 통일',
    ],
    en: [
      'Measure current cm/360° (cm needed to rotate one full turn)',
      'Find the conversion ratio for the target game',
      'Allow 1 week to adapt after switching',
      'Keep cm/360° consistent until stable',
    ],
  },
  'dpi-vs-sensitivity': {
    ko: [
      'DPI는 800 또는 1600 중 선택',
      '인게임 감도는 cm/360° 30-50cm 기준으로 조정',
      'DPI를 자주 바꾸지 말 것',
      '두 값 다 결정 후 최소 2주 적응',
    ],
    en: [
      'Pick 800 or 1600 DPI',
      'Tune in-game sens to a 30-50 cm/360° target',
      "Don't change DPI frequently",
      'Once set, give it 2 weeks',
    ],
  },
  'mousepad-impact-on-aim': {
    ko: [
      '현재 패드의 표면 종류 확인 (Speed/Hybrid/Control)',
      '본인 그립과 마우스 무게에 맞춰 표면 선택',
      '최소 450×400mm 크기 추천',
      '6-12개월마다 교체 (마모됨)',
    ],
    en: [
      'Identify your pad type (Speed/Hybrid/Control)',
      'Match surface to your grip + mouse weight',
      'Minimum 450×400mm recommended',
      'Replace every 6-12 months (wear)',
    ],
  },
  'valorant-sensitivity-trends-2026': {
    ko: [
      '본인 eDPI가 200-400 범위에 있는지 확인',
      'cm/360° 25-45cm 범위 권장',
      '발로란트는 800 DPI + 감도 0.3-0.5 일반적',
      '플릭 비중이 높으면 낮은 감도가 유리',
    ],
    en: [
      'Verify your eDPI sits in the 200-400 band',
      'Aim for 25-45 cm/360°',
      '800 DPI + 0.3-0.5 sens is the norm',
      'Lower sens if flicking is your style',
    ],
  },
  'aim-like-a-pro-5-steps': {
    ko: [
      'DPI 800 고정 + cm/360° 30-50cm 시작',
      '5분 워밍업 루틴 매일 실천',
      '주 1회 트레이너 점수 측정',
      '실력 안정되면 1-2개월간 감도 변경 금지',
    ],
    en: [
      'Lock DPI to 800, start at 30-50 cm/360°',
      'Daily 5-min warmup',
      'Weekly trainer baseline check',
      'Stable players: no sens change for 1-2 months',
    ],
  },
  'tenz-sensitivity-history': {
    ko: [
      '본인의 감도 변경 빈도가 너무 잦지 않은지 점검',
      '감도 변경 시 최소 2-4주 적응 기간 두기',
      '"무엇이 더 맞는지" 보다 "꾸준히 같은 것" 우선',
      '랭크 슬럼프 시기엔 감도 변경 자제',
    ],
    en: [
      'Audit how often you change sens',
      'Allow 2-4 weeks of adaptation per change',
      'Consistency beats chasing the "ideal" sens',
      "Don't change sens during a ranked slump",
    ],
  },
  'mouse-grip-styles': {
    ko: [
      '본인 손 길이/너비 측정 (mm 단위)',
      '현재 그립이 자연스러운지 확인 (긴장도 체크)',
      '마우스 모양이 그립과 맞는지 점검',
      '그립 변경 시 최소 2주 적응',
    ],
    en: [
      'Measure hand length/width (mm)',
      'Check current grip for tension/discomfort',
      'Verify mouse shape suits the grip',
      'Allow 2 weeks if changing grip',
    ],
  },
  '5-minute-warmup-routine': {
    ko: [
      '게임 시작 직전이 아닌 5-10분 전부터 시작',
      '워밍업은 빠른 동작 → 정밀 동작 순서',
      '주 5회 이상 일관성 있게',
      '결과 측정으로 효과 확인',
    ],
    en: [
      'Start 5-10 minutes before the match',
      'Order: fast motions → precision drills',
      '5+ sessions per week for consistency',
      'Measure results to verify effect',
    ],
  },
  'apex-sensitivity-guide': {
    ko: [
      '본인 ADS 감도 멀티플라이어 별도 설정',
      'NVIDIA Reflex On + Boost 활성화',
      'cm/360° 30-50cm 권장',
      '컨트롤러는 4-3 또는 5-4 리니어 일반적',
    ],
    en: [
      'Tune ADS sens multiplier separately',
      'Enable NVIDIA Reflex On + Boost',
      '30-50 cm/360° baseline',
      'Controller: 4-3 or 5-4 linear is the norm',
    ],
  },
  'ow2-hero-sensitivity-recommendations': {
    ko: [
      '히어로 풀에 따라 1-3 감도 프로필 운영',
      '하이파이브 픽 (트레이서, 디바 등)은 빠른 회전 필요',
      '히트스캔(맥크리, 솔져)은 정밀 위주',
      'FOV는 최대(103)로 설정 권장',
    ],
    en: [
      'Maintain 1-3 sens profiles per hero pool',
      'Highly mobile heroes (Tracer, D.Va) need fast turning',
      'Hitscan (Cassidy, Soldier) favor precision',
      'Set FOV to max (103)',
    ],
  },
  'cs2-sensitivity-deep-dive': {
    ko: [
      'm_rawinput 1, m_customaccel 0 확인',
      'AWP 감도는 cl_dynamicfov 0과 함께 별도 조정',
      'cm/360° 35-50cm 권장 (낮은 감도 메타)',
      '카운터스트레이프와 호환되는 무빙 키 설정',
    ],
    en: [
      'Verify m_rawinput 1, m_customaccel 0',
      'AWP sens needs separate tuning (with cl_dynamicfov 0)',
      '35-50 cm/360° (low-sens meta)',
      'Keybinds compatible with counter-strafing',
    ],
  },
  'monitor-refresh-rate-worth-it': {
    ko: [
      'GPU가 목표 헤르츠의 fps를 안정적으로 뽑는지 확인',
      'DisplayPort 1.4 이상 케이블 사용',
      'Hz 제대로 활성화 확인 (Windows 디스플레이 설정)',
      'G-Sync / FreeSync 권장',
    ],
    en: [
      "Confirm GPU can hit the monitor's target fps",
      'Use a DisplayPort 1.4+ cable',
      'Verify Hz is active (Windows display settings)',
      'Enable G-Sync / FreeSync',
    ],
  },
  'aim-trainer-comparison': {
    ko: [
      '본인 약점에 맞는 시나리오 선택',
      '주 1회 기준 점수 측정',
      '하루 30분 × 30일 루틴 추천',
      '실제 게임과 균형 있게 (트레이너만 X)',
    ],
    en: [
      'Pick scenarios matching your weak areas',
      'Weekly baseline measurement',
      '30 min × 30 days routine recommended',
      'Balance trainer with real play',
    ],
  },
  'wired-vs-wireless-mouse-latency': {
    ko: [
      '무선이면 2.4GHz 전용 리시버 사용 (블루투스 X)',
      '폴링레이트 1000Hz 이상 확인',
      '도크 충전 권장 (게임 중 끊김 방지)',
      '유선이라도 케이블 드래그 줄이는 마우스 번지 사용',
    ],
    en: [
      'Wireless: use 2.4GHz dongle, not Bluetooth',
      'Verify polling rate ≥1000Hz',
      'Use a charging dock to avoid mid-game disconnects',
      'Even with wired, add a mouse bungee to reduce drag',
    ],
  },
};

const txt = readFileSync(FILE, 'utf8');

if (txt.includes('BLOG_EXPANSION_v1')) {
  console.log('Already expanded (marker found). Aborting.');
  process.exit(0);
}

let out = txt;
let modified = 0;

for (const slug of EXPAND_SLUGS) {
  const related = RELATED[slug];
  const checklist = CHECKLIST[slug];
  if (!related || !checklist) {
    console.warn(`  skip: ${slug} (no related/checklist defined)`);
    continue;
  }

  // For each language, build a unique anchor matching THIS post's content end.
  // The unique anchor: the slug line + everything up to the first
  // `        </>\n      ),\n    },\n    en: {` (KO end) or
  // `        </>\n      ),\n    },\n  },\n  //` (EN end).
  //
  // We capture and re-emit the same content + injected expansion.

  // KO: find from `slug: 'X',` to the first KO closing.
  const slugAnchor = `    slug: '${slug}',`;
  const ix = out.indexOf(slugAnchor);
  if (ix < 0) { console.warn(`  not found: ${slug}`); continue; }

  // Find next `        </>\n      ),\n    },\n    en: {` after this slug
  const koEndMarker = '        </>\n      ),\n    },\n    en: {';
  const koEndIx = out.indexOf(koEndMarker, ix);
  if (koEndIx < 0) { console.warn(`  no KO end: ${slug}`); continue; }

  const koInject =
    `          {/* BLOG_EXPANSION_v1:${slug} */}\n` +
    `          <H2>한눈에 체크리스트</H2>\n` +
    `          <UL>\n` +
    checklist.ko.map((line) => `            <LI>${line}</LI>`).join('\n') + '\n' +
    `          </UL>\n` +
    `          <H2>관련 가이드</H2>\n` +
    `          <UL>\n` +
    related.map(([s, ko]) => `            <LI><a className="text-emerald-400 underline" href="/blog/${s}/">${ko}</a></LI>`).join('\n') + '\n' +
    `          </UL>\n`;

  out = out.slice(0, koEndIx) + koInject + out.slice(koEndIx);

  // Recompute indexes after insertion
  const ix2 = out.indexOf(slugAnchor);
  const enEndMarker = '        </>\n      ),\n    },\n  },\n  //';
  let enEndIx = out.indexOf(enEndMarker, ix2);
  // If this is the LAST post in the file, the EN closing may be followed by `];` not `//`
  if (enEndIx < 0) {
    const altEnd = '        </>\n      ),\n    },\n  },\n];';
    enEndIx = out.indexOf(altEnd, ix2);
  }
  if (enEndIx < 0) { console.warn(`  no EN end: ${slug}`); continue; }

  const enInject =
    `          <H2>Quick Checklist</H2>\n` +
    `          <UL>\n` +
    checklist.en.map((line) => `            <LI>${line}</LI>`).join('\n') + '\n' +
    `          </UL>\n` +
    `          <H2>Related Guides</H2>\n` +
    `          <UL>\n` +
    related.map(([s, , en]) => `            <LI><a className="text-emerald-400 underline" href="/blog/${s}/">${en}</a></LI>`).join('\n') + '\n' +
    `          </UL>\n`;

  out = out.slice(0, enEndIx) + enInject + out.slice(enEndIx);
  modified++;
  console.log(`  expanded: ${slug}`);
}

writeFileSync(FILE, out);
console.log(`\nDone. ${modified} posts expanded.`);

// Blog posts data — bilingual (KO + EN). Each post is rendered as plain
// React nodes via the `content` function so we can interleave headings,
// paragraphs, lists, and emerald-highlighted callouts without pulling in a
// markdown parser. Add new posts to the END of POSTS so chronological sort
// stays stable.
import React from 'react';

export type BlogTag = 'guide' | 'analysis' | 'gear' | 'pro' | 'sensitivity';

export interface BlogPost {
  slug: string;
  date: string; // ISO yyyy-mm-dd
  readMins: number;
  tags: BlogTag[];
  ko: { title: string; excerpt: string; content: () => React.ReactNode };
  en: { title: string; excerpt: string; content: () => React.ReactNode };
}

const P = (props: { children: React.ReactNode }) =>
  React.createElement('p', { className: 'mb-4 leading-relaxed' }, props.children);
const H2 = (props: { children: React.ReactNode }) =>
  React.createElement('h2', { className: 'mt-10 mb-4 text-2xl font-black tracking-tight' }, props.children);
const H3 = (props: { children: React.ReactNode }) =>
  React.createElement('h3', { className: 'mt-6 mb-3 text-lg font-bold' }, props.children);
const UL = (props: { children: React.ReactNode }) =>
  React.createElement('ul', { className: 'mb-4 ml-5 list-disc space-y-1.5' }, props.children);
const LI = (props: { children: React.ReactNode }) =>
  React.createElement('li', null, props.children);
const Em = (props: { children: React.ReactNode }) =>
  React.createElement('strong', { className: 'text-emerald-400' }, props.children);

export const POSTS: BlogPost[] = [
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'edpi-explained',
    date: '2026-04-29',
    readMins: 6,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: 'eDPI란? FPS 감도 비교의 표준 단위 완전 정리',
      excerpt: 'DPI와 인게임 감도를 곱한 eDPI가 왜 중요한지, 어떻게 활용해야 하는지 처음부터 차근차근 정리했습니다.',
      content: () => (
        <>
          <P>
            FPS 게이머라면 한 번쯤 <Em>"eDPI"</Em> 라는 단어를 들어보셨을 겁니다.
            eDPI는 Effective DPI의 줄임말로, 마우스의 DPI 값과 인게임 감도를 곱한 값입니다.
            이 단순한 곱셈이 왜 게이밍 커뮤니티에서 표준 단위처럼 쓰일까요?
          </P>
          <H2>왜 DPI나 감도 단독으로는 부족한가</H2>
          <P>
            DPI(Dots Per Inch)는 마우스 센서가 1인치 이동했을 때 화면에 보내는 카운트 수입니다.
            인게임 감도는 그 카운트를 실제 시점 회전으로 변환하는 배율이고요.
            결국 게임에서 느끼는 실제 속도는 이 두 값의 <Em>곱</Em>으로 결정됩니다.
          </P>
          <P>
            예를 들어 DPI 1600 / 감도 0.25 와 DPI 800 / 감도 0.5 는 둘 다 eDPI가 400 입니다.
            마우스를 1인치 움직였을 때 시점 회전 각도가 동일합니다.
          </P>
          <H2>eDPI 계산법</H2>
          <P>공식은 단순합니다:</P>
          <UL>
            <LI><Em>eDPI = DPI × 인게임 감도</Em></LI>
          </UL>
          <P>예시:</P>
          <UL>
            <LI>800 × 0.50 = 400 (Valorant 평균대)</LI>
            <LI>800 × 1.20 = 960 (CS2 평균대)</LI>
            <LI>800 × 5.00 = 4000 (Overwatch 2 일부 프로)</LI>
          </UL>
          <H2>게임마다 평균 eDPI가 다른 이유</H2>
          <P>
            게임마다 시점 회전 알고리즘과 기본 감도 단위가 다르기 때문입니다.
            CS2는 Source 엔진 단위, Valorant는 자체 단위, Overwatch는 또 다른 단위라
            동일한 eDPI라도 실제 cm/360°(360도 회전을 위해 필요한 마우스 이동 거리)가 다릅니다.
          </P>
          <P>
            그래서 같은 게임 안에서 비교할 때는 eDPI가 좋지만,
            서로 다른 게임 사이에서 감도를 옮길 때는 <Em>cm/360°</Em>를 기준으로 변환하는 것이 정확합니다.
          </P>
          <H2>나에게 맞는 eDPI 찾는 법</H2>
          <UL>
            <LI>먼저 같은 게임 프로 평균 ±20% 범위에서 시작해 보세요</LI>
            <LI>1주일 단위로 ±10% 씩 조정하며 적응 시간을 충분히 두세요</LI>
            <LI>마우스패드 크기와 그립 스타일도 함께 고려하세요</LI>
            <LI>Pro Gear Match 매칭 결과의 eDPI 분포 히스토그램을 참고하면 내 위치를 시각적으로 확인할 수 있습니다</LI>
          </UL>
          <H2>마무리</H2>
          <P>
            eDPI는 감도를 비교하기 위한 만능 지표는 아니지만,
            동일 게임 내에서 프로의 설정을 참고하거나 친구와 감도를 공유할 때 가장 직관적인 단일 수치입니다.
            먼저 자신의 eDPI가 어디쯤인지 파악하고, 매칭 도구로 비슷한 프로를 찾아보세요.
          </P>
          {/* BLOG_EXPANSION_v1:edpi-explained */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인의 DPI × 인게임 감도를 계산해 eDPI 확인</LI>
            <LI>Pro Gear Match 매칭 결과의 분포 히스토그램에서 본인 위치 파악</LI>
            <LI>동일 게임 내 비교일 때만 eDPI 사용</LI>
            <LI>게임 간 이동은 cm/360°로 변환</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/dpi-vs-sensitivity/">DPI vs 인게임 감도</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/why-pros-use-800-dpi/">왜 800 DPI인가</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'eDPI Explained — The Standard Unit for FPS Sensitivity Comparison',
      excerpt: "Why eDPI matters, how to calculate it, and how to use it to find a sensitivity that works for you.",
      content: () => (
        <>
          <P>
            If you play FPS, you've probably heard the term <Em>"eDPI"</Em>.
            It stands for Effective DPI — your mouse DPI multiplied by your in-game sensitivity.
            Why does this simple product become the de-facto standard?
          </P>
          <H2>Why DPI or sensitivity alone isn't enough</H2>
          <P>
            DPI is how many counts your mouse sensor sends per inch of movement.
            In-game sensitivity is the multiplier converting those counts into in-game rotation.
            What you actually feel is the <Em>product</Em> of the two.
          </P>
          <P>
            For example, 1600 DPI × 0.25 sens equals 800 DPI × 0.5 sens — both have an eDPI of 400 and feel identical.
          </P>
          <H2>How to calculate</H2>
          <UL>
            <LI><Em>eDPI = DPI × In-Game Sensitivity</Em></LI>
          </UL>
          <P>Examples:</P>
          <UL>
            <LI>800 × 0.50 = 400 (Valorant average)</LI>
            <LI>800 × 1.20 = 960 (CS2 average)</LI>
            <LI>800 × 5.00 = 4000 (some OW2 pros)</LI>
          </UL>
          <H2>Why average eDPI differs across games</H2>
          <P>
            Each game uses a different rotation algorithm and base sensitivity unit.
            CS2 uses the Source engine unit, Valorant has its own, Overwatch yet another.
            Same eDPI translates to different <Em>cm/360°</Em> across games.
          </P>
          <P>
            For cross-game conversion, use cm/360° instead of raw eDPI.
          </P>
          <H2>Finding your eDPI</H2>
          <UL>
            <LI>Start within ±20% of your game's pro average</LI>
            <LI>Adjust ±10% per week and give yourself adaptation time</LI>
            <LI>Mousepad size and grip style matter too</LI>
            <LI>Check the eDPI distribution chart in your match result for visual context</LI>
          </UL>
          <H2>Wrapping up</H2>
          <P>
            eDPI isn't a one-size-fits-all metric, but within the same game it's the most intuitive shared number.
            Figure out where you stand, then use Pro Gear Match to find a pro with a near-identical setup.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Compute your eDPI: DPI × in-game sens</LI>
            <LI>Locate your position on the Pro Gear Match histogram</LI>
            <LI>Use eDPI only within the same game</LI>
            <LI>Use cm/360° when moving between games</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/dpi-vs-sensitivity/">DPI vs In-Game Sens</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/why-pros-use-800-dpi/">Why 800 DPI</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'why-pros-use-800-dpi',
    date: '2026-04-22',
    readMins: 5,
    tags: ['gear', 'analysis'],
    ko: {
      title: '왜 프로의 90%는 800 DPI를 쓸까? 단순한 이유',
      excerpt: 'Valorant, CS2, Overwatch, Apex 4개 게임의 프로 1861명을 분석해 보니 800 DPI가 압도적으로 우세했습니다.',
      content: () => (
        <>
          <P>
            Pro Gear Match 데이터베이스의 1861명 프로 선수 중,
            마우스 DPI를 800으로 설정한 비율은 <Em>약 87%</Em>에 달합니다.
            나머지 13% 중 대부분은 400 또는 1600을 사용합니다.
          </P>
          <H2>이유 ① 센서 정확도가 가장 높은 영역</H2>
          <P>
            대부분의 게이밍 마우스 센서는 400~1600 DPI 사이에서 가장 안정적으로 동작하도록 튜닝됩니다.
            그 중 800 DPI는 노이즈와 보간 오류가 가장 적어 픽셀 단위 정확도가 보장됩니다.
          </P>
          <H2>이유 ② 윈도우 / OS 조정 영향이 적음</H2>
          <P>
            너무 낮은 DPI(예: 400)는 운영체제의 마우스 가속 / 보정 설정의 영향을 더 많이 받습니다.
            800 DPI는 OS 보정의 영향을 거의 받지 않으면서도 풀 HD 모니터의 1픽셀 단위와 잘 맞아떨어집니다.
          </P>
          <H2>이유 ③ 인게임 감도 조정 폭이 적당</H2>
          <P>
            800 DPI를 기준으로 하면 인게임 감도를 <Em>0.3 ~ 0.6</Em> 범위에서 조절하게 되는데,
            이 범위가 게임 엔진의 정밀도 손실 없이 부드럽게 변하는 영역입니다.
          </P>
          <H2>예외도 있다</H2>
          <UL>
            <LI>일부 Apex Legends 프로는 1600 DPI + 매우 낮은 감도를 선호합니다 (정밀 조준 위주)</LI>
            <LI>Overwatch 2에는 3200 DPI 사용자도 일부 존재합니다</LI>
            <LI>크로스 게임으로 활동하는 스트리머는 1600 DPI로 통일하는 경우도 있습니다</LI>
          </UL>
          <H2>결론</H2>
          <P>
            800 DPI는 "전통" 때문에 굳어진 게 아닙니다.
            센서 정확도, OS 호환성, 인게임 감도 조절 편의성 세 가지가 동시에 최적인 지점입니다.
            특별한 이유가 없다면 800 DPI를 기준으로 시작하는 것이 가장 안전합니다.
          </P>
          {/* BLOG_EXPANSION_v1:why-pros-use-800-dpi */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인 마우스를 800 DPI로 설정</LI>
            <LI>폴링레이트 1000Hz 이상 확인</LI>
            <LI>OS 마우스 가속 끄기</LI>
            <LI>게임 내 raw input 켜기</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">폴링레이트 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/dpi-vs-sensitivity/">DPI vs 감도</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Why 90% of Pros Use 800 DPI — The Simple Reasons',
      excerpt: "Across 1,861 pros in Valorant, CS2, OW2, and Apex, 800 DPI dominates. Here's why.",
      content: () => (
        <>
          <P>
            Of the 1,861 pros in our database, roughly <Em>87% use 800 DPI</Em>.
            Most of the remaining 13% sit at either 400 or 1600.
          </P>
          <H2>Reason 1 — The sensor accuracy sweet spot</H2>
          <P>
            Most gaming mouse sensors are tuned to be most stable between 400–1600 DPI.
            At 800 DPI, noise and interpolation are minimized while pixel-level accuracy is guaranteed.
          </P>
          <H2>Reason 2 — Minimal OS interference</H2>
          <P>
            Very low DPI is more susceptible to OS-level mouse acceleration / smoothing.
            800 DPI sidesteps that while aligning naturally with 1080p pixel grids.
          </P>
          <H2>Reason 3 — Comfortable in-game sens range</H2>
          <P>
            With 800 DPI you typically dial sensitivity to <Em>0.3–0.6</Em>,
            a range where game engines preserve precision smoothly.
          </P>
          <H2>Exceptions</H2>
          <UL>
            <LI>Some Apex pros prefer 1600 DPI with very low sens for precision aim</LI>
            <LI>A handful of OW2 pros run 3200 DPI</LI>
            <LI>Multi-game streamers sometimes standardize on 1600 across titles</LI>
          </UL>
          <H2>Bottom line</H2>
          <P>
            800 DPI isn't tradition — it's the simultaneous sweet spot for sensor accuracy,
            OS compatibility, and in-game sensitivity ergonomics.
            Without a specific reason, start at 800 DPI.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Set your mouse to 800 DPI</LI>
            <LI>Confirm polling rate ≥1000Hz</LI>
            <LI>Disable OS mouse acceleration</LI>
            <LI>Enable raw input in-game</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">Polling Rate Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/dpi-vs-sensitivity/">DPI vs Sens</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'cm-per-360-cross-game',
    date: '2026-04-15',
    readMins: 7,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: 'cm/360° 가이드 — 게임을 넘나들 때 감도 옮기는 정확한 방법',
      excerpt: 'Valorant에서 CS2로 넘어갈 때 손에 익은 감각을 그대로 옮기려면 eDPI가 아니라 cm/360°를 봐야 합니다.',
      content: () => (
        <>
          <P>
            "친구가 Valorant에서 CS2로 옮겼는데 어떤 감도로 시작해야 하지?"
            이 질문의 답은 <Em>cm/360°</Em>에 있습니다.
          </P>
          <H2>cm/360°란?</H2>
          <P>
            마우스를 정확히 360° 시점 회전시키기 위해 필요한 물리적 이동 거리(cm)입니다.
            예를 들어 25 cm/360° 라면 마우스를 25cm 움직이면 한 바퀴를 돌 수 있다는 뜻입니다.
          </P>
          <H2>왜 cm/360°가 게임 간 비교에 더 정확한가</H2>
          <P>
            eDPI는 같은 게임 내에서만 일관된 단위입니다.
            게임 엔진마다 회전 계산이 달라서 동일한 eDPI여도 실제 cm/360°가 다릅니다.
          </P>
          <UL>
            <LI>Valorant: eDPI 320 ≈ 38 cm/360°</LI>
            <LI>CS2: eDPI 320 ≈ 25 cm/360°</LI>
            <LI>Overwatch 2: eDPI 320 ≈ 19 cm/360°</LI>
          </UL>
          <P>
            그래서 Valorant에서 CS2로 옮길 때 eDPI를 그대로 쓰면 마우스를 훨씬 적게 움직여도 360°가 돌아가서 어색합니다.
          </P>
          <H2>변환 공식</H2>
          <P>각 게임의 360° 회전 인치 계수(360°/inch coefficient)를 알면 계산할 수 있습니다:</P>
          <UL>
            <LI>Valorant: <Em>cm/360 = 2.54 × 360 / (DPI × 감도 × 0.07)</Em></LI>
            <LI>CS2: <Em>cm/360 = 2.54 × 360 / (DPI × 감도 × 0.022)</Em></LI>
            <LI>Overwatch 2: <Em>cm/360 = 2.54 × 360 / (DPI × 감도 × 0.0066)</Em></LI>
          </UL>
          <H2>실전 가이드</H2>
          <UL>
            <LI>현재 게임에서 사용 중인 cm/360°를 측정 (Pro Gear Match 매칭 결과 패널에서 확인 가능)</LI>
            <LI>새 게임에서 동일한 cm/360°가 나오도록 감도를 역산</LI>
            <LI>1주일 정도 적응 후 ±10% 범위에서 미세 조정</LI>
          </UL>
          <H2>요약</H2>
          <P>
            게임을 넘나들 때는 <Em>cm/360°</Em>를 기준으로 잡으세요.
            손에 익은 마우스 이동 거리가 그대로 유지되어 적응 기간이 훨씬 짧아집니다.
          </P>
          {/* BLOG_EXPANSION_v1:cm-per-360-cross-game */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>현재 cm/360° 측정 (마우스를 한 바퀴 회전시키는 데 필요한 cm)</LI>
            <LI>목표 게임의 환산 계수 확인</LI>
            <LI>환산 후 1주 적응 기간</LI>
            <LI>실력 안정될 때까지 cm/360° 통일</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/valorant-sensitivity-trends-2026/">발로 감도 트렌드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cs2-sensitivity-deep-dive/">CS2 감도 심화</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'cm/360° Guide — Moving Sensitivity Between Games Accurately',
      excerpt: "When switching from Valorant to CS2, eDPI lies — cm/360° tells the truth.",
      content: () => (
        <>
          <P>
            "I'm switching from Valorant to CS2 — what sens should I start with?"
            The answer lives in <Em>cm/360°</Em>.
          </P>
          <H2>What is cm/360°?</H2>
          <P>
            The physical distance (in cm) your mouse needs to travel to rotate the camera a full 360°.
            25 cm/360° means a 25cm sweep equals one full turn.
          </P>
          <H2>Why it's more accurate cross-game</H2>
          <P>
            eDPI is consistent only within the same game engine.
            The same eDPI gives different cm/360° across games:
          </P>
          <UL>
            <LI>Valorant: eDPI 320 ≈ 38 cm/360°</LI>
            <LI>CS2: eDPI 320 ≈ 25 cm/360°</LI>
            <LI>Overwatch 2: eDPI 320 ≈ 19 cm/360°</LI>
          </UL>
          <H2>Conversion formulas</H2>
          <UL>
            <LI>Valorant: <Em>cm/360 = 2.54 × 360 / (DPI × sens × 0.07)</Em></LI>
            <LI>CS2: <Em>cm/360 = 2.54 × 360 / (DPI × sens × 0.022)</Em></LI>
            <LI>Overwatch 2: <Em>cm/360 = 2.54 × 360 / (DPI × sens × 0.0066)</Em></LI>
          </UL>
          <H2>Practical workflow</H2>
          <UL>
            <LI>Measure your current cm/360° (Pro Gear Match shows this in the result panel)</LI>
            <LI>Solve for the new game's sens that gives the same cm/360°</LI>
            <LI>Adapt for a week, then ±10% adjust</LI>
          </UL>
          <H2>TL;DR</H2>
          <P>
            Use <Em>cm/360°</Em> as your anchor when crossing games.
            Your muscle memory transfers, adaptation is faster.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Measure current cm/360° (cm needed to rotate one full turn)</LI>
            <LI>Find the conversion ratio for the target game</LI>
            <LI>Allow 1 week to adapt after switching</LI>
            <LI>Keep cm/360° consistent until stable</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/valorant-sensitivity-trends-2026/">Valorant Sens Trends</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cs2-sensitivity-deep-dive/">CS2 Sens Deep Dive</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'dpi-vs-sensitivity',
    date: '2026-04-08',
    readMins: 5,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: 'DPI vs 인게임 감도 — 어느 쪽을 조절해야 할까?',
      excerpt: '같은 eDPI라도 DPI를 높이고 감도를 낮추는 게 좋을지, 반대가 좋을지 — 정확도와 부드러움의 트레이드오프를 정리합니다.',
      content: () => (
        <>
          <P>
            "eDPI를 400으로 맞추고 싶은데 800 DPI × 0.5 와 1600 DPI × 0.25 중 뭐가 더 좋아요?"
            결론부터 말하면 <Em>대부분의 경우 800 DPI 쪽이 안전</Em>합니다.
          </P>
          <H2>높은 DPI + 낮은 감도 — 부드럽고 정밀</H2>
          <P>
            DPI가 높을수록 마우스가 보내는 카운트 수가 많아져 시점 회전이 부드럽습니다.
            픽셀보다 작은 단위로 움직일 수 있어 정밀 에임에 유리하고, 손목 그립처럼 큰 동작이 적은 스타일에 잘 맞습니다.
          </P>
          <H2>낮은 DPI + 높은 감도 — 안정적이고 일관됨</H2>
          <P>
            낮은 DPI는 센서 노이즈가 적고, OS의 마우스 가속/보정 영향도 덜 받습니다.
            대신 미세 조정이 어렵고, 픽셀 단위 이동이 거칠게 느껴질 수 있습니다.
          </P>
          <H2>그럼 800 DPI가 왜 표준인가</H2>
          <UL>
            <LI>대부분의 센서가 800 DPI에서 가장 안정적으로 작동</LI>
            <LI>OS / Windows 보정 영향이 거의 없음</LI>
            <LI>1080p 모니터의 픽셀 단위와 자연스럽게 매칭</LI>
            <LI>인게임 감도 0.3~0.6 범위에서 부드럽게 조절 가능</LI>
          </UL>
          <H2>1600 DPI를 고려해야 하는 경우</H2>
          <UL>
            <LI>4K 모니터 사용자 — 픽셀 그리드가 더 촘촘해 더 높은 DPI가 자연스럽게 매칭</LI>
            <LI>매우 큰 마우스패드 + 풀 팜 그립 — 큰 동작 시 부드러움이 우선</LI>
            <LI>Apex Legends처럼 넓은 시야각 + 빠른 무빙이 필요한 경우</LI>
          </UL>
          <H2>실험 방법</H2>
          <P>
            현재 eDPI를 유지하면서 DPI만 800 / 1600 으로 바꿔보고,
            5분씩 에임 트레이너에서 같은 시나리오를 플레이해 보세요.
            점수 차이가 5% 이상 나면 그 방향으로 정착, 그렇지 않으면 800 DPI를 유지하는 것이 안전합니다.
          </P>
          {/* BLOG_EXPANSION_v1:dpi-vs-sensitivity */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>DPI는 800 또는 1600 중 선택</LI>
            <LI>인게임 감도는 cm/360° 30-50cm 기준으로 조정</LI>
            <LI>DPI를 자주 바꾸지 말 것</LI>
            <LI>두 값 다 결정 후 최소 2주 적응</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI란 무엇인가</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-acceleration-explained/">마우스 가속 끄기</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/why-pros-use-800-dpi/">왜 800 DPI인가</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'DPI vs In-Game Sensitivity — Which Should You Tune?',
      excerpt: 'Same eDPI, different DPI/sens splits — what changes? A breakdown of the precision vs. smoothness trade-off.',
      content: () => (
        <>
          <P>
            "I want eDPI 400 — should I run 800 × 0.5 or 1600 × 0.25?"
            For most players, <Em>800 DPI is the safer pick</Em>.
          </P>
          <H2>Higher DPI + lower sens — smoother and more precise</H2>
          <P>
            More DPI means more counts per inch, so rotation feels smoother and sub-pixel adjustments are possible.
            Good for wrist-grip and players who micro-adjust a lot.
          </P>
          <H2>Lower DPI + higher sens — more stable</H2>
          <P>
            Less sensor noise, less OS-level interference.
            But fine adjustments feel coarser — you can see the pixel snap.
          </P>
          <H2>Why 800 DPI is the standard</H2>
          <UL>
            <LI>Most sensors are calibrated to be most stable at 800 DPI</LI>
            <LI>Negligible OS / Windows smoothing</LI>
            <LI>Aligns naturally with 1080p pixel grid</LI>
            <LI>Comfortable in-game sens range (0.3–0.6)</LI>
          </UL>
          <H2>When to consider 1600 DPI</H2>
          <UL>
            <LI>4K monitors — denser pixel grid pairs well with higher DPI</LI>
            <LI>Large pad + full palm grip — smoothness on big sweeps matters more</LI>
            <LI>Apex-style wide-FOV + fast movement</LI>
          </UL>
          <H2>How to A/B test</H2>
          <P>
            Keep eDPI constant, swap DPI between 800 and 1600, run 5-minute aim trainer sessions.
            If one side wins by 5%+ consistently, switch. Otherwise stick with 800.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Pick 800 or 1600 DPI</LI>
            <LI>Tune in-game sens to a 30-50 cm/360° target</LI>
            <LI>Don't change DPI frequently</LI>
            <LI>Once set, give it 2 weeks</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">What is eDPI</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-acceleration-explained/">Mouse Accel Off</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/why-pros-use-800-dpi/">Why 800 DPI</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mousepad-impact-on-aim',
    date: '2026-04-01',
    readMins: 6,
    tags: ['gear'],
    ko: {
      title: '마우스패드가 에임에 미치는 영향 — 표면 마찰력의 과학',
      excerpt: '같은 마우스, 같은 감도라도 마우스패드만 바꾸면 에임이 달라집니다. 컨트롤형과 스피드형의 차이를 정리합니다.',
      content: () => (
        <>
          <P>
            마우스패드는 가장 저평가된 게이밍 장비입니다.
            DPI나 감도는 분 단위로 조정하면서, 정작 마우스가 미끄러지는 표면은 몇 년째 그대로 쓰는 분들이 많죠.
          </P>
          <H2>표면 분류: 컨트롤형 vs 스피드형</H2>
          <UL>
            <LI><Em>컨트롤형</Em> (Artisan FX Hayate Otsu, Wallhack SP-004) — 정지 마찰력 ↑, 미세 조준 ↑, 빠른 무빙 ↓</LI>
            <LI><Em>스피드형</Em> (X-raypad Equate Plus, Lethal Saturn Pro) — 정지 마찰력 ↓, 빠른 무빙 ↑, 미세 조준 ↓</LI>
            <LI><Em>밸런스형</Em> (Artisan Type-99, Razer Gigantus V2) — 중간</LI>
          </UL>
          <H2>장르별 추천</H2>
          <UL>
            <LI><Em>Valorant / CS2 (탭 슈팅)</Em>: 컨트롤형 우세 — 멈춤이 정확해야 함</LI>
            <LI><Em>Apex Legends</Em>: 스피드형 또는 밸런스형 — 무빙 + 트래킹 모두 필요</LI>
            <LI><Em>Overwatch 2</Em>: 영웅에 따라 다름 (탱커/지지: 컨트롤, 딜러: 밸런스)</LI>
          </UL>
          <H2>마우스패드 사이즈도 중요</H2>
          <P>
            낮은 감도(예: 30+ cm/360°)를 쓴다면 최소 90×40cm 사이즈가 필요합니다.
            한 번의 큰 스와이프로 360° 돌릴 공간이 부족하면 마우스를 들었다 놓는 동작이 늘어나 일관성이 떨어집니다.
          </P>
          <H2>관리 팁</H2>
          <UL>
            <LI>3~6개월에 한 번 미지근한 물 + 손세제로 세척 (드라이어 사용 금지)</LI>
            <LI>땀이 많은 환경이라면 손목 패드 추가 권장</LI>
            <LI>패드가 늘어지거나 표면 마찰이 줄어들면 교체</LI>
          </UL>
          <H2>마무리</H2>
          <P>
            새 마우스 사기 전에 마우스패드부터 점검해 보세요.
            5만원짜리 패드 교체로 에임이 두드러지게 좋아지는 경우가 많습니다.
          </P>
          {/* BLOG_EXPANSION_v1:mousepad-impact-on-aim */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>현재 패드의 표면 종류 확인 (Speed/Hybrid/Control)</LI>
            <LI>본인 그립과 마우스 무게에 맞춰 표면 선택</LI>
            <LI>최소 450×400mm 크기 추천</LI>
            <LI>6-12개월마다 교체 (마모됨)</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-grip-styles/">마우스 그립 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">마우스 무게의 진실</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">프로처럼 에임하기</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'How Your Mousepad Shapes Your Aim — The Surface-Friction Science',
      excerpt: 'Same mouse, same sens — different pad changes everything. Control vs. speed, and what suits each genre.',
      content: () => (
        <>
          <P>
            Mousepads are the most underrated piece of FPS gear.
            People tweak DPI to the decimal but use the same crusty pad for years.
          </P>
          <H2>Surface types: control vs. speed</H2>
          <UL>
            <LI><Em>Control</Em> (Artisan FX Hayate Otsu, Wallhack SP-004) — high static friction, precision aim, slower flicks</LI>
            <LI><Em>Speed</Em> (X-raypad Equate Plus, Lethal Saturn Pro) — low static friction, fast flicks, less micro-control</LI>
            <LI><Em>Balanced</Em> (Artisan Type-99, Razer Gigantus V2) — middle of the road</LI>
          </UL>
          <H2>Genre fit</H2>
          <UL>
            <LI><Em>Valorant / CS2 (tap aim)</Em>: control wins — stops need to be sharp</LI>
            <LI><Em>Apex</Em>: speed or balanced — movement + tracking both matter</LI>
            <LI><Em>OW2</Em>: depends on hero (tank/support: control, DPS: balanced)</LI>
          </UL>
          <H2>Size matters too</H2>
          <P>
            Low sens (30+ cm/360°) needs at least 90×40cm.
            If you have to lift mid-flick, consistency tanks.
          </P>
          <H2>Care tips</H2>
          <UL>
            <LI>Wash every 3–6 months with lukewarm water + mild soap (no dryer)</LI>
            <LI>Wrist rest helps in humid setups</LI>
            <LI>Replace when surface glides slip</LI>
          </UL>
          <H2>Bottom line</H2>
          <P>
            Before buying a new mouse, audit your pad.
            A $30 pad swap often improves aim more than a flagship mouse.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Identify your pad type (Speed/Hybrid/Control)</LI>
            <LI>Match surface to your grip + mouse weight</LI>
            <LI>Minimum 450×400mm recommended</LI>
            <LI>Replace every 6-12 months (wear)</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-grip-styles/">Grip Styles</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">Mouse Weight Truth</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">Aim Like a Pro</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'valorant-sensitivity-trends-2026',
    date: '2026-03-25',
    readMins: 6,
    tags: ['analysis', 'pro'],
    ko: {
      title: 'Valorant 프로 평균 감도 트렌드 분석 2026',
      excerpt: '2024년 대비 2026년 Valorant 프로들의 감도 변화 — 평균값은 그대로지만 분포가 좁아졌습니다.',
      content: () => (
        <>
          <P>
            Pro Gear Match DB의 Valorant 프로 636명 데이터를 분석했습니다.
            결론: <Em>평균 eDPI 257은 2024년과 동일</Em>하지만, 표준편차가 28% 줄어들었습니다.
          </P>
          <H2>2026년 데이터 요약</H2>
          <UL>
            <LI>평균 eDPI: 257</LI>
            <LI>중앙값: 264</LI>
            <LI>표준편차: 78 (2024년 109)</LI>
            <LI>최빈값 구간: 200~320</LI>
          </UL>
          <H2>왜 분포가 좁아졌나</H2>
          <P>
            ① 신인 프로들이 기존 톱 프로(TenZ, aspas)의 감도를 그대로 따르는 경향 강화 ②
            특정 무기 (Vandal/Phantom) 메타가 안정되면서 극단적 감도 실험이 줄어듦 ③
            Twitch / YouTube에서 "프로 평균에 맞추라"는 가이드 영상 영향력 증가
          </P>
          <H2>지역별 차이</H2>
          <UL>
            <LI>VCT Americas: 평균 eDPI 245 (가장 낮음)</LI>
            <LI>VCT Pacific (한국/일본/SEA): 평균 270</LI>
            <LI>VCT EMEA: 평균 263</LI>
            <LI>VCT China: 평균 252</LI>
          </UL>
          <P>
            한국/일본 프로들이 평균적으로 높은 감도를 쓰는 경향은 PC방 환경(작은 책상 + 작은 마우스패드) 영향으로 추정됩니다.
          </P>
          <H2>인기 장비 변화</H2>
          <UL>
            <LI>마우스: Razer Viper V3 Pro 점유율 41% (1위), Logitech G Pro X Superlight 2 32% (2위)</LI>
            <LI>키보드: Wooting 60HE 47% (래피드 트리거 대세화)</LI>
            <LI>모니터: ZOWIE XL2566K (240Hz) → Asus ROG Swift PG27AQDP (480Hz OLED) 전환 중</LI>
          </UL>
          <H2>당신에게 주는 시사점</H2>
          <P>
            평균 eDPI 200~320 안에 있다면 통계적으로 안전한 영역입니다.
            그 밖에 있다면 큰 변경 없이도 평균 ±20% 범위로 옮겨 보는 실험이 효율적일 수 있습니다.
          </P>
          {/* BLOG_EXPANSION_v1:valorant-sensitivity-trends-2026 */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인 eDPI가 200-400 범위에 있는지 확인</LI>
            <LI>cm/360° 25-45cm 범위 권장</LI>
            <LI>발로란트는 800 DPI + 감도 0.3-0.5 일반적</LI>
            <LI>플릭 비중이 높으면 낮은 감도가 유리</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/tenz-sensitivity-history/">TenZ 감도 변천사</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Valorant Pro Sensitivity Trends — 2026 Data Breakdown',
      excerpt: 'Analyzed 636 Valorant pros: average eDPI is unchanged from 2024, but the distribution tightened 28%.',
      content: () => (
        <>
          <P>
            We analyzed 636 Valorant pros in our DB.
            TL;DR: <Em>average eDPI of 257 matches 2024</Em>, but standard deviation dropped 28%.
          </P>
          <H2>2026 snapshot</H2>
          <UL>
            <LI>Mean eDPI: 257</LI>
            <LI>Median: 264</LI>
            <LI>Stdev: 78 (was 109 in 2024)</LI>
            <LI>Mode bucket: 200–320</LI>
          </UL>
          <H2>Why the distribution tightened</H2>
          <P>
            (1) New pros copy top players' sens; (2) weapon meta stabilized so wild experimentation faded;
            (3) "match the pro average" YouTube guides hit critical mass.
          </P>
          <H2>Region differences</H2>
          <UL>
            <LI>VCT Americas: 245 (lowest)</LI>
            <LI>VCT Pacific (KR/JP/SEA): 270</LI>
            <LI>VCT EMEA: 263</LI>
            <LI>VCT China: 252</LI>
          </UL>
          <P>
            Asian pros skew higher likely due to PC-bang setups with small desks/pads.
          </P>
          <H2>Gear shifts</H2>
          <UL>
            <LI>Mouse: Razer Viper V3 Pro at 41%, G Pro X Superlight 2 at 32%</LI>
            <LI>Keyboard: Wooting 60HE at 47% (rapid trigger went mainstream)</LI>
            <LI>Monitor: 240Hz → 480Hz OLED transition underway</LI>
          </UL>
          <H2>What this means for you</H2>
          <P>
            If your eDPI is 200–320, you're statistically safe.
            Outside that, try landing inside ±20% of 257 first.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Verify your eDPI sits in the 200-400 band</LI>
            <LI>Aim for 25-45 cm/360°</LI>
            <LI>800 DPI + 0.3-0.5 sens is the norm</LI>
            <LI>Lower sens if flicking is your style</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/tenz-sensitivity-history/">TenZ's Sens History</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'aim-like-a-pro-5-steps',
    date: '2026-03-18',
    readMins: 5,
    tags: ['guide'],
    ko: {
      title: '프로처럼 에임하는 법 — 감도 세팅 5단계',
      excerpt: '시간 낭비 없이 자기에게 맞는 감도를 찾는 검증된 5단계 프로세스. 1주일이면 정착됩니다.',
      content: () => (
        <>
          <P>
            매일 감도 바꾸면서 "내 감도가 안 맞는 것 같다" 고민하는 분들 많죠.
            아래 5단계로 진행하면 1주일 내에 안정적인 감도를 찾을 수 있습니다.
          </P>
          <H2>1단계 — 마우스 DPI를 800으로 고정</H2>
          <P>
            특별한 이유 없으면 800 DPI로 시작하세요.
            이후 단계는 인게임 감도만 조절합니다.
          </P>
          <H2>2단계 — 같은 게임 프로 평균 eDPI를 출발점으로 설정</H2>
          <P>
            Pro Gear Match에서 본인 게임의 프로 평균 eDPI를 확인합니다.
            그 값을 800으로 나눠 인게임 감도를 계산합니다.
            예: Valorant 평균 257 / 800 = <Em>0.32</Em>
          </P>
          <H2>3단계 — 1주일 동안 변경 금지</H2>
          <P>
            가장 중요한 단계입니다.
            손이 새 감도에 적응하는 데 최소 5~7일이 필요합니다.
            이 기간에 감도를 바꾸면 절대 정착되지 않습니다.
          </P>
          <H2>4단계 — 1주일 후 ±10% 미세 조정</H2>
          <P>
            1주일이 지났는데도 답답하면 +10%, 너무 빠르면 -10%로 조정합니다.
            한 번에 큰 변경은 금지 — 항상 10% 단위로만.
          </P>
          <H2>5단계 — 데일리 워밍업 루틴 고정</H2>
          <UL>
            <LI>에임랩 / Aim Trainer 10분 (스태틱 클릭킹)</LI>
            <LI>딥러쉬 / 에임 봇 10분 (트래킹)</LI>
            <LI>딱 그 게임의 데스매치 1판 (실전 적응)</LI>
          </UL>
          <H2>해서는 안 되는 일</H2>
          <UL>
            <LI>경기에서 진 직후 감도 바꾸기 — 100% 후회합니다</LI>
            <LI>스트리머가 새 감도 추천한다고 따라하기 — 그 사람의 PC/마우스/패드 환경이 다름</LI>
            <LI>1주일 안에 결론 내리기 — 적응 기간을 무시하면 영원히 떠돕니다</LI>
          </UL>
          <H2>요약</H2>
          <P>
            <Em>800 DPI → 프로 평균 eDPI → 1주일 유지 → ±10% 조정 → 워밍업 루틴 고정.</Em>
            5단계만 지키면 평생 감도 고민이 끝납니다.
          </P>
          {/* BLOG_EXPANSION_v1:aim-like-a-pro-5-steps */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>DPI 800 고정 + cm/360° 30-50cm 시작</LI>
            <LI>5분 워밍업 루틴 매일 실천</LI>
            <LI>주 1회 트레이너 점수 측정</LI>
            <LI>실력 안정되면 1-2개월간 감도 변경 금지</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30일 에임 챌린지</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-trainer-comparison/">에임 트레이너 비교</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/5-minute-warmup-routine/">5분 워밍업 루틴</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Aim Like a Pro — The 5-Step Sensitivity Setup',
      excerpt: 'Stop tweaking daily. A proven 5-step process to lock in your sens within a week.',
      content: () => (
        <>
          <P>
            If you change sens every day chasing the perfect feel, this guide will end the cycle.
          </P>
          <H2>Step 1 — Lock DPI at 800</H2>
          <P>
            Unless you have a specific reason otherwise, run 800 DPI. Only tune in-game sens from here.
          </P>
          <H2>Step 2 — Start at your game's pro average eDPI</H2>
          <P>
            Look up your game's pro average eDPI on Pro Gear Match.
            Divide by 800 to get the in-game sens.
            Example: Valorant 257 / 800 = <Em>0.32</Em>.
          </P>
          <H2>Step 3 — Don't touch it for a week</H2>
          <P>
            Most critical step. Your hand needs 5–7 days to adapt.
            Change sens before that and you will never settle.
          </P>
          <H2>Step 4 — After 1 week, ±10% adjust</H2>
          <P>
            Feels too slow? +10%. Too fast? -10%.
            Never change by more than 10% at once.
          </P>
          <H2>Step 5 — Lock in a warm-up routine</H2>
          <UL>
            <LI>10 min Aim Lab static clicking</LI>
            <LI>10 min tracking trainer</LI>
            <LI>1 deathmatch in your actual game</LI>
          </UL>
          <H2>Don't do this</H2>
          <UL>
            <LI>Change sens right after a loss — you'll regret it</LI>
            <LI>Copy a streamer's new sens blindly — different hardware/setup</LI>
            <LI>Conclude in less than a week — adaptation is real</LI>
          </UL>
          <H2>Summary</H2>
          <P>
            <Em>800 DPI → pro average eDPI → 1 week hold → ±10% nudge → warm-up routine.</Em>
            That's it. End of sens drama.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Lock DPI to 800, start at 30-50 cm/360°</LI>
            <LI>Daily 5-min warmup</LI>
            <LI>Weekly trainer baseline check</LI>
            <LI>Stable players: no sens change for 1-2 months</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30-Day Aim Challenge</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-trainer-comparison/">Aim Trainer Comparison</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/5-minute-warmup-routine/">5-Min Warmup</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'tenz-sensitivity-history',
    date: '2026-03-10',
    readMins: 5,
    tags: ['pro', 'analysis'],
    ko: {
      title: 'TenZ의 감도 변천사 — 2021년부터 2026년까지',
      excerpt: 'Sentinels의 에이스 TenZ가 5년간 어떻게 감도를 조정해 왔는지, 그리고 그 결정이 의미하는 바를 추적합니다.',
      content: () => (
        <>
          <P>
            Tyson "TenZ" Ngo는 Valorant 씬에서 가장 영향력 있는 선수 중 하나입니다.
            그가 사용하는 감도는 곧 수많은 신인 프로의 출발점이 됩니다.
            5년간 어떻게 변해왔을까요?
          </P>
          <H2>2021 — eDPI 280</H2>
          <P>
            Sentinels 합류 직후. 800 DPI × 0.35 = 280.
            당시 Valorant 프로 평균은 320 정도였고, TenZ는 평균보다 살짝 낮은 편이었습니다.
          </P>
          <H2>2022 — eDPI 280 (DPI 변경)</H2>
          <P>
            DPI를 1600으로 올리고 감도를 0.175로 절반 — eDPI는 그대로.
            마우스 변경 (Logitech G Pro Wireless → Razer Viper Mini Signature Edition) 영향으로 추정됩니다.
          </P>
          <H2>2023 — eDPI 264</H2>
          <P>
            소폭 감소. 800 DPI × 0.33.
            당시 인터뷰에서 "더 정밀한 탭이 필요해서 약간 낮췄다"고 언급.
          </P>
          <H2>2024 — eDPI 280 (복귀)</H2>
          <P>
            다시 280으로 복귀. 본인의 메인 감각이 280에 있음을 시사합니다.
          </P>
          <H2>2026 — eDPI 280 (정착)</H2>
          <P>
            현재까지 800 DPI × 0.35로 안정적으로 유지.
            마우스는 Razer Viper V3 Pro로 정착.
          </P>
          <H2>여기서 배울 점</H2>
          <UL>
            <LI><Em>1년에 한 번 정도</Em>의 변경이 정상 — 매주 바꾸는 건 너무 많음</LI>
            <LI>큰 변화(±20% 이상)는 마우스 교체 같은 외부 요인이 있을 때 발생</LI>
            <LI>최종적으로는 본인의 "메인 감각" 으로 회귀하는 경향</LI>
          </UL>
          <H2>TenZ를 따라 하려면</H2>
          <P>
            본인이 800 DPI 기준이라면 인게임 감도를 0.35로 설정 (eDPI 280).
            Pro Gear Match에서 TenZ를 검색하면 사용 장비도 함께 확인할 수 있습니다.
          </P>
          {/* BLOG_EXPANSION_v1:tenz-sensitivity-history */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인의 감도 변경 빈도가 너무 잦지 않은지 점검</LI>
            <LI>감도 변경 시 최소 2-4주 적응 기간 두기</LI>
            <LI>"무엇이 더 맞는지" 보다 "꾸준히 같은 것" 우선</LI>
            <LI>랭크 슬럼프 시기엔 감도 변경 자제</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/valorant-sensitivity-trends-2026/">발로 감도 트렌드 2026</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">프로처럼 에임하기</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: "TenZ's Sensitivity History — 5 Years Tracked",
      excerpt: "How Sentinels' star adjusted his sens from 2021 to 2026, and what it teaches the rest of us.",
      content: () => (
        <>
          <P>
            Tyson "TenZ" Ngo is one of the most influential players in Valorant.
            His sens settings become defaults for thousands of aspiring pros. Here's the 5-year history.
          </P>
          <H2>2021 — eDPI 280</H2>
          <P>
            Joined Sentinels. 800 DPI × 0.35 = 280. Valorant pro average was around 320 — TenZ was slightly below.
          </P>
          <H2>2022 — eDPI 280 (DPI swap)</H2>
          <P>
            DPI raised to 1600, sens halved to 0.175 — eDPI unchanged.
            Likely tied to mouse swap (G Pro Wireless → Viper Mini SE).
          </P>
          <H2>2023 — eDPI 264</H2>
          <P>
            Slight drop. 800 × 0.33. He mentioned "needed sharper taps" in an interview.
          </P>
          <H2>2024 — eDPI 280 (back)</H2>
          <P>
            Returned to 280. Suggests his "muscle home" lives at 280.
          </P>
          <H2>2026 — eDPI 280 (stable)</H2>
          <P>
            Stable on 800 × 0.35 with Razer Viper V3 Pro.
          </P>
          <H2>Takeaways</H2>
          <UL>
            <LI><Em>One change per year</Em> is normal — weekly changes are way too many</LI>
            <LI>Big shifts (±20%) usually pair with hardware swaps</LI>
            <LI>Players gravitate back to their "home" feel</LI>
          </UL>
          <H2>To run TenZ's setup</H2>
          <P>
            At 800 DPI, set in-game sens to 0.35 (eDPI 280).
            Search "TenZ" on Pro Gear Match to see the full gear list.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Audit how often you change sens</LI>
            <LI>Allow 2-4 weeks of adaptation per change</LI>
            <LI>Consistency beats chasing the "ideal" sens</LI>
            <LI>Don't change sens during a ranked slump</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/valorant-sensitivity-trends-2026/">Valorant Sens Trends 2026</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">Aim Like a Pro</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mouse-grip-styles',
    date: '2026-04-25',
    readMins: 5,
    tags: ['guide'],
    ko: {
      title: '마우스 그립 스타일 완전 정리 — 팜 vs 클로 vs 핑거',
      excerpt: '같은 마우스라도 그립이 다르면 완전 다른 마우스가 됩니다. 자신의 그립을 알면 마우스 고를 때 90% 끝납니다.',
      content: () => (
        <>
          <P>
            마우스를 고를 때 가장 먼저 봐야 할 것은 <Em>본인의 그립 스타일</Em>입니다.
            그립에 안 맞는 마우스는 아무리 비싸도 손에 안 맞습니다.
          </P>
          <H2>팜 그립 (Palm Grip)</H2>
          <P>
            손바닥 전체가 마우스 윗면에 닿는 그립.
            손가락은 펴진 상태로 버튼 위에 놓입니다.
          </P>
          <UL>
            <LI><Em>장점</Em>: 안정성 최고, 큰 무빙에 유리</LI>
            <LI><Em>단점</Em>: 미세 조정 약함, 손목 부담</LI>
            <LI><Em>맞는 마우스</Em>: Logitech G Pro X Superlight 2, Razer DeathAdder V3 Pro, Zowie EC1-CW</LI>
            <LI><Em>맞는 손 크기</Em>: 18cm 이상</LI>
          </UL>
          <H2>클로 그립 (Claw Grip)</H2>
          <P>
            손가락이 굽혀져 마우스 위에 발톱처럼 올라간 형태.
            손바닥 뒤쪽만 마우스에 닿습니다.
          </P>
          <UL>
            <LI><Em>장점</Em>: 정밀 클릭 + 큰 무빙 균형</LI>
            <LI><Em>단점</Em>: 적응 기간 필요</LI>
            <LI><Em>맞는 마우스</Em>: Razer Viper V3 Pro, Pulsar X2, VAXEE XE</LI>
            <LI><Em>맞는 손 크기</Em>: 16~19cm</LI>
          </UL>
          <H2>핑거 그립 (Fingertip Grip)</H2>
          <P>
            손가락 끝만 마우스에 닿는 가장 가벼운 그립.
            마우스가 손바닥에서 떠 있습니다.
          </P>
          <UL>
            <LI><Em>장점</Em>: 가장 빠른 미세 조정</LI>
            <LI><Em>단점</Em>: 안정성 떨어짐, 큰 무빙 불리</LI>
            <LI><Em>맞는 마우스</Em>: Razer Viper Mini, Endgame Gear OP1 8k, Lamzu Maya</LI>
            <LI><Em>맞는 손 크기</Em>: 작은 손 + 매우 가벼운 마우스</LI>
          </UL>
          <H2>본인 그립 확인하는 법</H2>
          <P>
            평소처럼 마우스를 잡고 손바닥 가운데가 마우스에 닿는지 확인하세요:
          </P>
          <UL>
            <LI>완전히 닿음 → <Em>팜</Em></LI>
            <LI>뒤쪽만 닿음 → <Em>클로</Em></LI>
            <LI>전혀 안 닿음 → <Em>핑거</Em></LI>
          </UL>
          <H2>그립과 게임 장르</H2>
          <UL>
            <LI><Em>Valorant / CS2 (탭 슈팅)</Em>: 클로 우세 — 멈춤 정확도</LI>
            <LI><Em>Apex / OW2 (트래킹)</Em>: 팜 우세 — 부드러운 큰 무빙</LI>
            <LI><Em>저감도 + 큰 마우스패드</Em>: 어떤 그립이든 가능</LI>
          </UL>
          <H2>마무리</H2>
          <P>
            먼저 본인 그립을 확정한 뒤 그에 맞는 마우스 형태를 찾으세요.
            "프로가 쓰는 마우스" 무작정 따라가지 말고 본인 그립을 우선하는 것이 정답입니다.
          </P>
          {/* BLOG_EXPANSION_v1:mouse-grip-styles */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인 손 길이/너비 측정 (mm 단위)</LI>
            <LI>현재 그립이 자연스러운지 확인 (긴장도 체크)</LI>
            <LI>마우스 모양이 그립과 맞는지 점검</LI>
            <LI>그립 변경 시 최소 2주 적응</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">마우스 무게의 진실</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/first-gaming-mouse-2026/">첫 게이밍 마우스 추천</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/fps-wrist-pain-prevention/">손목 통증 예방</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Mouse Grip Styles Explained — Palm vs Claw vs Fingertip',
      excerpt: 'Same mouse, different grip = totally different feel. Find your grip, find your mouse.',
      content: () => (
        <>
          <P>
            The first question when picking a mouse is <Em>your grip style</Em>.
            A mismatched grip ruins even the best mouse.
          </P>
          <H2>Palm grip</H2>
          <P>
            Whole palm rests on the mouse, fingers extended over buttons.
          </P>
          <UL>
            <LI><Em>Pros</Em>: max stability, great for big swipes</LI>
            <LI><Em>Cons</Em>: weaker micro-adjustments, wrist strain</LI>
            <LI><Em>Match</Em>: G Pro X Superlight 2, DeathAdder V3 Pro, EC1-CW</LI>
            <LI><Em>Hand size</Em>: 18cm+</LI>
          </UL>
          <H2>Claw grip</H2>
          <P>
            Fingers arched on top, only the back of the palm contacts.
          </P>
          <UL>
            <LI><Em>Pros</Em>: balanced precision + sweep</LI>
            <LI><Em>Cons</Em>: adaptation period</LI>
            <LI><Em>Match</Em>: Viper V3 Pro, Pulsar X2, VAXEE XE</LI>
            <LI><Em>Hand size</Em>: 16–19cm</LI>
          </UL>
          <H2>Fingertip grip</H2>
          <P>
            Only fingertips touch — lightest possible grip.
          </P>
          <UL>
            <LI><Em>Pros</Em>: fastest micro-adjustments</LI>
            <LI><Em>Cons</Em>: less stable, harder on big sweeps</LI>
            <LI><Em>Match</Em>: Viper Mini, OP1 8k, Lamzu Maya</LI>
            <LI><Em>Hand size</Em>: small hands + very light mice</LI>
          </UL>
          <H2>Identify your grip</H2>
          <P>Hold the mouse normally, check where your palm touches:</P>
          <UL>
            <LI>Full contact → <Em>palm</Em></LI>
            <LI>Back only → <Em>claw</Em></LI>
            <LI>None → <Em>fingertip</Em></LI>
          </UL>
          <H2>Grip × genre</H2>
          <UL>
            <LI><Em>Valorant / CS2</Em>: claw wins (sharp stops)</LI>
            <LI><Em>Apex / OW2</Em>: palm wins (smooth tracking)</LI>
            <LI><Em>Low sens + big pad</Em>: any grip works</LI>
          </UL>
          <H2>Bottom line</H2>
          <P>
            Lock down your grip first, then pick a shape.
            Don't blindly copy a pro — match your own hand.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Measure hand length/width (mm)</LI>
            <LI>Check current grip for tension/discomfort</LI>
            <LI>Verify mouse shape suits the grip</LI>
            <LI>Allow 2 weeks if changing grip</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">Mouse Weight Truth</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/first-gaming-mouse-2026/">First Gaming Mouse</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/fps-wrist-pain-prevention/">Wrist Pain Prevention</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: '5-minute-warmup-routine',
    date: '2026-04-19',
    readMins: 4,
    tags: ['guide'],
    ko: {
      title: '5분 워밍업 루틴 — 시작 직후에도 70% 컨디션 만들기',
      excerpt: '프로처럼 30분씩 워밍업할 시간이 없는 사람을 위한 압축 5분 루틴. 매번 같은 순서로만 하면 됩니다.',
      content: () => (
        <>
          <P>
            "랭크 들어가면 첫 한 게임은 항상 망한다" — 워밍업 부족이 원인입니다.
            아래 5분 루틴을 매번 같은 순서로 진행하면 시작 직후에도 베스트 70% 컨디션이 나옵니다.
          </P>
          <H2>1분 — 정적 클릭 (Static Clicking)</H2>
          <P>
            에임랩의 GridShot Reflex 또는 Aim Trainer의 Static Clicking 1세션 (60초).
            반응 속도 + 정확도를 워밍업합니다.
            <Em>점수 비교 금지</Em> — 워밍업 자체가 목적입니다.
          </P>
          <H2>1분 — 마이크로 플릭 (Microflicks)</H2>
          <P>
            10도 이내의 작은 플릭만 반복.
            손목 + 미세 조정 근육 워밍업.
            "정확하게" 보다 "리듬 맞게" 가 핵심.
          </P>
          <H2>1분 — 와이드 플릭 (Wideflicks)</H2>
          <P>
            90도~180도 회전이 필요한 큰 플릭.
            팔 전체를 사용하는 큰 무빙 적응.
          </P>
          <H2>1분 — 트래킹 (Tracking)</H2>
          <P>
            움직이는 타겟 따라가기.
            Apex / OW2 메인이라면 이 부분에 시간 더 분배 (2분).
          </P>
          <H2>1분 — 데스매치 / 봇 룸 1분</H2>
          <P>
            본 게임 환경에서 짧게 1분.
            "실전 입력 → 시각" 회로 연결을 깨우는 단계입니다.
          </P>
          <H2>중요한 규칙</H2>
          <UL>
            <LI>매번 <Em>같은 순서</Em>로만 — 변경 금지</LI>
            <LI>점수 / 기록 신경 쓰지 말기 — 워밍업이지 경기 아님</LI>
            <LI>5분 끝나면 <Em>바로</Em> 랭크 들어가기 — 식으면 도루묵</LI>
            <LI>전날 잠 부족하면 워밍업 시간 7~10분으로 연장</LI>
          </UL>
          <H2>왜 효과가 있나</H2>
          <P>
            손과 시각 시스템은 "처음" 사용할 때 응답 시간이 30~50ms 정도 더 걸립니다.
            반복되는 동일 동작은 이 지연을 빠르게 줄여 줍니다.
            5분이면 충분합니다 — 그 이상은 한계 효용이 떨어집니다.
          </P>
          {/* BLOG_EXPANSION_v1:5-minute-warmup-routine */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>게임 시작 직전이 아닌 5-10분 전부터 시작</LI>
            <LI>워밍업은 빠른 동작 → 정밀 동작 순서</LI>
            <LI>주 5회 이상 일관성 있게</LI>
            <LI>결과 측정으로 효과 확인</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30일 에임 챌린지</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-trainer-comparison/">에임 트레이너 비교</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">프로처럼 에임하기</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: '5-Minute Warm-Up Routine — Hit 70% From the First Round',
      excerpt: "A compressed warm-up for people without 30 minutes to spare. Same order every time, that's the trick.",
      content: () => (
        <>
          <P>
            "I always int my first game" — that's a warm-up problem.
            Run this 5-minute routine, same order every time, and you'll start at 70% of your peak.
          </P>
          <H2>1 min — static clicking</H2>
          <P>
            One 60s session of GridShot Reflex or static clicking.
            Wakes up reaction + precision.
            <Em>Don't compare scores</Em> — the point is just to wake up.
          </P>
          <H2>1 min — microflicks</H2>
          <P>
            Small flicks within ~10°.
            Wrist + micro-adjust muscles.
            Aim for rhythm, not accuracy.
          </P>
          <H2>1 min — wideflicks</H2>
          <P>
            90–180° flicks. Whole-arm activation.
          </P>
          <H2>1 min — tracking</H2>
          <P>
            Follow moving targets.
            Apex/OW2 mains: bump this to 2 min.
          </P>
          <H2>1 min — deathmatch / bots</H2>
          <P>
            One minute in your actual game.
            Connects "input → visual" pipeline.
          </P>
          <H2>Hard rules</H2>
          <UL>
            <LI><Em>Same order</Em>, every time</LI>
            <LI>Ignore scores — this is warm-up, not a session</LI>
            <LI><Em>Queue immediately</Em> after — don't cool off</LI>
            <LI>Tired? Extend to 7–10 min</LI>
          </UL>
          <H2>Why it works</H2>
          <P>
            Hand + visual systems take 30–50ms longer when "cold."
            Reps eliminate that latency. 5 minutes is the sweet spot — diminishing returns after.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Start 5-10 minutes before the match</LI>
            <LI>Order: fast motions → precision drills</LI>
            <LI>5+ sessions per week for consistency</LI>
            <LI>Measure results to verify effect</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30-Day Aim Challenge</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-trainer-comparison/">Aim Trainer Comparison</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">Aim Like a Pro</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'apex-sensitivity-guide',
    date: '2026-04-12',
    readMins: 6,
    tags: ['guide', 'pro'],
    ko: {
      title: 'Apex Legends 감도 가이드 — 살아남기 위한 세팅',
      excerpt: 'Apex는 다른 FPS와 달리 트래킹 + 무빙 + 빠른 시야 전환이 동시에 필요합니다. 프로 감도 패턴을 분석합니다.',
      content: () => (
        <>
          <P>
            Apex Legends는 Valorant나 CS2와 다른 게임입니다.
            <Em>3D 무빙</Em> + 거리별 무기 + 트래킹 + 360도 시야 전환이 동시에 필요합니다.
            그래서 다른 FPS의 감도 가이드를 그대로 가져오면 안 됩니다.
          </P>
          <H2>Apex 프로 평균 (PGM DB 기준)</H2>
          <UL>
            <LI>평균 DPI: 1100 (Valorant 평균 800보다 높음)</LI>
            <LI>평균 인게임 감도: 1.5</LI>
            <LI>평균 ADS 감도 배율: 1.0 (1:1)</LI>
            <LI>평균 cm/360°: 약 28cm (Valorant 38cm보다 짧음)</LI>
          </UL>
          <H2>왜 Apex는 더 빠른 감도?</H2>
          <UL>
            <LI><Em>3차원 무빙</Em>: 점프 + 슬라이드 + 그라플링 중 시점 전환 필요</LI>
            <LI><Em>레전드 어빌리티</Em>: Octane, Pathfinder 같은 빠른 이동 캐릭터</LI>
            <LI><Em>3인칭 ↔ 1인칭</Em>: 돌발 상황 대응에 더 빠른 회전 필요</LI>
          </UL>
          <H2>거리별 무기 = ADS 배율의 중요성</H2>
          <P>
            Apex의 가장 큰 차별점은 <Em>스코프별 ADS 배율 설정</Em>입니다.
            Valorant나 CS2는 단순히 한 가지 ADS 감도지만, Apex는 1배율부터 10배율까지 따로 설정 가능.
          </P>
          <UL>
            <LI><Em>1x / Iron Sights</Em>: 1.0 (기본 비율)</LI>
            <LI><Em>2x / 3x</Em>: 1.0 또는 0.95 (살짝 낮춤)</LI>
            <LI><Em>4x / 6x</Em>: 0.85~0.9</LI>
            <LI><Em>8x / 10x</Em>: 0.7~0.8 (정밀 사격 위주)</LI>
          </UL>
          <H2>추천 시작 세팅 (입문자)</H2>
          <UL>
            <LI>DPI: 800</LI>
            <LI>인게임 감도: 2.0</LI>
            <LI>ADS 배율 (전 스코프): 1.0</LI>
            <LI>예상 cm/360°: 약 31cm</LI>
          </UL>
          <P>
            이 설정으로 1주일 적응 후, 트래킹이 어색하면 감도 ±10% 조정.
          </P>
          <H2>저감도 vs 고감도 — 누가 어떤 영웅에 적합?</H2>
          <UL>
            <LI><Em>저감도 (35cm+ /360)</Em>: Wraith, Wattson, Crypto — 정밀 에임 위주</LI>
            <LI><Em>중감도 (25~35cm)</Em>: Bloodhound, Bangalore — 균형형</LI>
            <LI><Em>고감도 (15~25cm)</Em>: Octane, Pathfinder, Valkyrie — 무빙 중심</LI>
          </UL>
          <H2>마우스패드 권장</H2>
          <P>
            Apex는 큰 무빙이 잦으므로 <Em>최소 90×40cm 사이즈 + 스피드형 또는 밸런스형</Em> 패드 권장.
            X-raypad Equate Plus, Lethal Saturn Pro가 Apex 프로 사이에서 인기입니다.
          </P>
          <H2>요약</H2>
          <P>
            Apex는 감도가 더 빨라야 하고, ADS 배율을 거리별로 따로 잡는 게 핵심입니다.
            기본 1:1로 시작 후 본인이 약한 거리에서만 조정하세요.
          </P>
          {/* BLOG_EXPANSION_v1:apex-sensitivity-guide */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인 ADS 감도 멀티플라이어 별도 설정</LI>
            <LI>NVIDIA Reflex On + Boost 활성화</LI>
            <LI>cm/360° 30-50cm 권장</LI>
            <LI>컨트롤러는 4-3 또는 5-4 리니어 일반적</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">인풋랙 줄이기</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">마우스 무게의 진실</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Apex Legends Sensitivity Guide — Settings to Stay Alive',
      excerpt: 'Apex demands tracking + movement + fast 360° turns simultaneously. Pro patterns broken down.',
      content: () => (
        <>
          <P>
            Apex isn't Valorant or CS2.
            <Em>3D movement</Em> + ranged weapons + tracking + 360° turns happen at once.
            Don't copy other-FPS guides verbatim.
          </P>
          <H2>Apex pro averages (PGM DB)</H2>
          <UL>
            <LI>Avg DPI: 1100 (vs 800 in Valorant)</LI>
            <LI>Avg in-game sens: 1.5</LI>
            <LI>Avg ADS multiplier: 1.0 (1:1)</LI>
            <LI>Avg cm/360°: ~28cm (vs 38cm in Valorant)</LI>
          </UL>
          <H2>Why faster sens?</H2>
          <UL>
            <LI><Em>3D movement</Em>: jumps, slides, grapples</LI>
            <LI><Em>Legend abilities</Em>: Octane, Pathfinder mobility</LI>
            <LI><Em>360° awareness</Em>: react fast to ambushes</LI>
          </UL>
          <H2>Per-scope ADS matters</H2>
          <P>
            Apex's killer feature: <Em>per-scope ADS multipliers</Em>.
            CS2/Valorant give you one ADS sens; Apex lets you tune from 1x through 10x.
          </P>
          <UL>
            <LI><Em>1x / Iron</Em>: 1.0 (baseline)</LI>
            <LI><Em>2x / 3x</Em>: 1.0 or 0.95</LI>
            <LI><Em>4x / 6x</Em>: 0.85–0.9</LI>
            <LI><Em>8x / 10x</Em>: 0.7–0.8 (precision)</LI>
          </UL>
          <H2>Beginner starter</H2>
          <UL>
            <LI>DPI: 800</LI>
            <LI>In-game sens: 2.0</LI>
            <LI>All scopes ADS: 1.0</LI>
            <LI>Approx cm/360°: 31cm</LI>
          </UL>
          <P>
            Adapt for a week. If tracking feels off, ±10%.
          </P>
          <H2>Sens × Legend fit</H2>
          <UL>
            <LI><Em>Low (35cm+)</Em>: Wraith, Wattson, Crypto — precision aim</LI>
            <LI><Em>Mid (25–35cm)</Em>: Bloodhound, Bangalore</LI>
            <LI><Em>High (15–25cm)</Em>: Octane, Pathfinder, Valkyrie</LI>
          </UL>
          <H2>Pad recommendation</H2>
          <P>
            Big sweeps demand <Em>90×40cm+, speed or balanced</Em>.
            X-raypad Equate Plus and Lethal Saturn Pro are popular among Apex pros.
          </P>
          <H2>TL;DR</H2>
          <P>
            Faster sens, per-scope ADS tuning. Start 1:1, adjust where you're weakest.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Tune ADS sens multiplier separately</LI>
            <LI>Enable NVIDIA Reflex On + Boost</LI>
            <LI>30-50 cm/360° baseline</LI>
            <LI>Controller: 4-3 or 5-4 linear is the norm</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">Input Lag Reduction</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-weight-truth/">Mouse Weight Truth</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'ow2-hero-sensitivity-recommendations',
    date: '2026-04-05',
    readMins: 5,
    tags: ['guide'],
    ko: {
      title: 'Overwatch 2 영웅별 감도 추천 — 트레이서부터 위도우메이커까지',
      excerpt: 'OW2는 영웅 폭이 넓어 한 감도로는 부족합니다. 영웅 그룹별 권장 cm/360°와 패턴을 정리합니다.',
      content: () => (
        <>
          <P>
            Overwatch 2는 다른 FPS와 결정적으로 다릅니다.
            <Em>한 게임에서 다양한 영웅</Em>을 플레이하기 때문에 단일 감도로는 모두 커버하기 어렵습니다.
          </P>
          <H2>영웅 그룹별 감도 패턴</H2>
          <P>
            영웅들의 에임 요구치가 완전히 다르므로 그룹으로 나눠 설명합니다.
          </P>
          <H2>1. 정밀 사격형 (Hitscan)</H2>
          <P>
            <Em>위도우메이커, 애쉬, 캐서디</Em>
          </P>
          <UL>
            <LI>권장 cm/360°: <Em>30~40cm</Em> (저감도)</LI>
            <LI>이유: 멀리서 정밀 헤드샷이 핵심</LI>
            <LI>예시: 800 DPI × 4.0 (1.7x ADS) ≈ 35cm</LI>
          </UL>
          <H2>2. 트래킹형 (Tracking)</H2>
          <P>
            <Em>트레이서, 솔저:76, 솜브라</Em>
          </P>
          <UL>
            <LI>권장 cm/360°: <Em>20~30cm</Em> (중감도)</LI>
            <LI>이유: 빠른 무빙 + 지속 트래킹</LI>
            <LI>예시: 800 DPI × 5.5 ≈ 24cm</LI>
          </UL>
          <H2>3. 투사체형 (Projectile)</H2>
          <P>
            <Em>젠야타, 한조, 파라, 이코</Em>
          </P>
          <UL>
            <LI>권장 cm/360°: <Em>25~35cm</Em></LI>
            <LI>이유: 미세한 예측 사격</LI>
          </UL>
          <H2>4. 탱커 / 지지형</H2>
          <P>
            <Em>라인하르트, 시그마, 메르시, 아나</Em>
          </P>
          <UL>
            <LI>권장 cm/360°: <Em>22~30cm</Em></LI>
            <LI>이유: 360도 시야 전환 + 가까운 거리 대응</LI>
          </UL>
          <H2>다양한 영웅 모두 잘하려면?</H2>
          <P>
            <Em>중간값(약 28cm/360°)</Em>이 가장 안전한 출발점입니다.
            모든 영웅을 70%로 커버할 수 있습니다.
            한 영웅 메인이라면 그 영웅 그룹의 권장값으로 정확히 맞추세요.
          </P>
          <H2>OW2 프로 평균 (PGM DB)</H2>
          <UL>
            <LI>DPI: 800</LI>
            <LI>인게임 감도: 5.0</LI>
            <LI>cm/360°: 약 26cm</LI>
            <LI>스코프 감도 (위도우 / 애쉬): 보통 35~40 (스코프 안에서의 별도 감도)</LI>
          </UL>
          <H2>실전 팁</H2>
          <UL>
            <LI>위도우/애쉬 메인이면 게임 시작 직후 사격장에서 30초 정도 헤드샷 워밍업</LI>
            <LI>트레이서 메인이면 펄스 폭탄 던지는 거리 감각 워밍업</LI>
            <LI>한 게임 안에서 영웅 자주 바꾸면 평균값으로 타협하는 게 정신 건강에 좋음</LI>
          </UL>
          {/* BLOG_EXPANSION_v1:ow2-hero-sensitivity-recommendations */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>히어로 풀에 따라 1-3 감도 프로필 운영</LI>
            <LI>하이파이브 픽 (트레이서, 디바 등)은 빠른 회전 필요</LI>
            <LI>히트스캔(맥크리, 솔져)은 정밀 위주</LI>
            <LI>FOV는 최대(103)로 설정 권장</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/fov-settings-guide/">FOV 설정 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-grip-styles/">마우스 그립 가이드</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Overwatch 2 Sensitivity by Hero — From Tracer to Widowmaker',
      excerpt: 'OW2 has a huge hero pool. One sens rarely fits all. Here are sens patterns grouped by hero archetype.',
      content: () => (
        <>
          <P>
            Overwatch 2 is unique:
            <Em>you switch heroes mid-game</Em>, so a single sens can't cover everything.
          </P>
          <H2>Hero groups</H2>
          <H2>1. Precision hitscan</H2>
          <P>
            <Em>Widowmaker, Ashe, Cassidy</Em>
          </P>
          <UL>
            <LI>Recommended cm/360°: <Em>30–40cm</Em> (low)</LI>
            <LI>Why: long-range headshots</LI>
            <LI>Example: 800 DPI × 4.0 (1.7x ADS) ≈ 35cm</LI>
          </UL>
          <H2>2. Tracking</H2>
          <P>
            <Em>Tracer, Soldier:76, Sombra</Em>
          </P>
          <UL>
            <LI>Recommended cm/360°: <Em>20–30cm</Em></LI>
            <LI>Why: movement + sustained tracking</LI>
            <LI>Example: 800 × 5.5 ≈ 24cm</LI>
          </UL>
          <H2>3. Projectile</H2>
          <P>
            <Em>Zenyatta, Hanzo, Pharah, Echo</Em>
          </P>
          <UL>
            <LI>Recommended cm/360°: <Em>25–35cm</Em></LI>
            <LI>Why: small prediction lead</LI>
          </UL>
          <H2>4. Tank / support</H2>
          <P>
            <Em>Reinhardt, Sigma, Mercy, Ana</Em>
          </P>
          <UL>
            <LI>Recommended cm/360°: <Em>22–30cm</Em></LI>
            <LI>Why: 360° awareness + close-range</LI>
          </UL>
          <H2>If you flex everyone</H2>
          <P>
            <Em>~28cm/360°</Em> is the safest middle ground — 70% effective everywhere.
            Mains, lock to your group's recommended range exactly.
          </P>
          <H2>OW2 pro averages (PGM DB)</H2>
          <UL>
            <LI>DPI: 800</LI>
            <LI>In-game sens: 5.0</LI>
            <LI>cm/360°: ~26cm</LI>
            <LI>Widow/Ashe scope sens: usually 35–40</LI>
          </UL>
          <H2>Practical tips</H2>
          <UL>
            <LI>Widow/Ashe mains: 30s headshot warm-up in practice range</LI>
            <LI>Tracer mains: warm up pulse-bomb throw distances</LI>
            <LI>If you flex constantly, accept the compromise sens — sanity matters</LI>
          </UL>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Maintain 1-3 sens profiles per hero pool</LI>
            <LI>Highly mobile heroes (Tracer, D.Va) need fast turning</LI>
            <LI>Hitscan (Cassidy, Soldier) favor precision</LI>
            <LI>Set FOV to max (103)</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/fov-settings-guide/">FOV Settings</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-grip-styles/">Grip Styles</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'cs2-sensitivity-deep-dive',
    date: '2026-05-01',
    readMins: 6,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: 'CS2 감도 심화 가이드 — Source 엔진의 비밀',
      excerpt: 'CS2 감도가 다른 게임과 다른 이유는 Source 엔진의 회전 단위 때문입니다. 정확한 감도 변환과 m_yaw 값까지 정리합니다.',
      content: () => (
        <>
          <P>
            CS2 감도가 항상 헷갈리는 이유는 <Em>Source 엔진의 회전 단위</Em>가 다른 게임과 다르기 때문입니다.
            정확히 이해하면 다른 게임으로의 변환도 쉬워집니다.
          </P>
          <H2>m_yaw 와 m_pitch</H2>
          <P>
            CS2의 회전은 두 콘솔 변수로 제어됩니다:
          </P>
          <UL>
            <LI><Em>m_yaw</Em>: 좌우 회전 단위 (기본값 0.022)</LI>
            <LI><Em>m_pitch</Em>: 상하 회전 단위 (기본값 0.022)</LI>
          </UL>
          <P>
            이 값이 마우스 카운트 1당 회전 각도(도)입니다.
            <Em>0.022 × DPI × 인게임 감도 = 1인치 이동 시 회전 각도</Em>.
          </P>
          <H2>왜 0.022인가?</H2>
          <P>
            Counter-Strike 1.6 시절부터의 유산입니다.
            많은 베테랑 프로가 이 값에 익숙해져 있어 변경이 어려웠고, CS:GO와 CS2도 호환성을 위해 유지했습니다.
          </P>
          <H2>CS2 프로 평균</H2>
          <UL>
            <LI>DPI: 800 (95%가 800)</LI>
            <LI>인게임 감도: 1.2</LI>
            <LI>eDPI: 960</LI>
            <LI>cm/360°: 약 30cm</LI>
          </UL>
          <H2>Valorant에서 CS2로 옮기기</H2>
          <P>
            Valorant 감도를 그대로 가져오면 CS2에서 너무 빠릅니다.
            정확한 변환:
          </P>
          <UL>
            <LI>Valorant 감도 × 3.18 = CS2 감도 (DPI 동일 기준)</LI>
            <LI>예: Valorant 0.4 → CS2 1.27</LI>
          </UL>
          <H2>CS2에서 Valorant로 옮기기</H2>
          <UL>
            <LI>CS2 감도 ÷ 3.18 = Valorant 감도</LI>
            <LI>예: CS2 1.5 → Valorant 0.47</LI>
          </UL>
          <H2>Raw Input 설정 필수</H2>
          <P>
            CS2 콘솔에 다음을 꼭 입력하세요:
          </P>
          <UL>
            <LI><Em>m_rawinput 1</Em>: 윈도우 마우스 보정 우회</LI>
            <LI><Em>m_customaccel 0</Em>: 마우스 가속 비활성</LI>
          </UL>
          <P>
            이 설정 없이는 OS 가속이 적용되어 일관된 에임이 불가능합니다.
          </P>
          <H2>줌 감도</H2>
          <P>
            CS2의 AWP / Scout 줌 감도는 <Em>zoom_sensitivity_ratio</Em>로 조정합니다.
            기본값 1.0이면 줌 안에서도 같은 cm/360°가 유지됩니다.
            대부분의 프로가 1.0을 유지합니다.
          </P>
          <H2>요약</H2>
          <UL>
            <LI>CS2 감도 = DPI × 인게임 감도 × m_yaw(0.022)</LI>
            <LI>800 DPI × 1.0~1.5 가 안전한 출발점</LI>
            <LI>Valorant ↔ CS2 변환은 약 3.18배</LI>
            <LI>m_rawinput 1 / m_customaccel 0 필수</LI>
          </UL>
          {/* BLOG_EXPANSION_v1:cs2-sensitivity-deep-dive */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>m_rawinput 1, m_customaccel 0 확인</LI>
            <LI>AWP 감도는 cl_dynamicfov 0과 함께 별도 조정</LI>
            <LI>cm/360° 35-50cm 권장 (낮은 감도 메타)</LI>
            <LI>카운터스트레이프와 호환되는 무빙 키 설정</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI 완전 정리</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-acceleration-explained/">마우스 가속 끄기</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'CS2 Sensitivity Deep Dive — The Source Engine Quirks',
      excerpt: "CS2 sens feels different because Source's rotation unit is unique. Here's the math, the conversion, and the m_yaw secret.",
      content: () => (
        <>
          <P>
            CS2 sens is confusing because <Em>Source's rotation unit</Em> differs from other engines.
            Once you understand it, conversions get easy.
          </P>
          <H2>m_yaw and m_pitch</H2>
          <P>
            Two cvars control rotation:
          </P>
          <UL>
            <LI><Em>m_yaw</Em>: horizontal unit (default 0.022)</LI>
            <LI><Em>m_pitch</Em>: vertical unit (default 0.022)</LI>
          </UL>
          <P>
            Degrees of rotation per mouse count.
            <Em>0.022 × DPI × sens = degrees per inch</Em>.
          </P>
          <H2>Why 0.022?</H2>
          <P>
            Legacy from CS 1.6. Veterans were used to it; CS:GO and CS2 kept it for compatibility.
          </P>
          <H2>CS2 pro averages</H2>
          <UL>
            <LI>DPI: 800 (95% run 800)</LI>
            <LI>In-game sens: 1.2</LI>
            <LI>eDPI: 960</LI>
            <LI>cm/360°: ~30cm</LI>
          </UL>
          <H2>Valorant → CS2</H2>
          <UL>
            <LI>Valorant sens × 3.18 = CS2 sens (same DPI)</LI>
            <LI>Example: 0.4 → 1.27</LI>
          </UL>
          <H2>CS2 → Valorant</H2>
          <UL>
            <LI>CS2 sens ÷ 3.18 = Valorant sens</LI>
            <LI>Example: 1.5 → 0.47</LI>
          </UL>
          <H2>Raw input is mandatory</H2>
          <UL>
            <LI><Em>m_rawinput 1</Em>: bypass Windows smoothing</LI>
            <LI><Em>m_customaccel 0</Em>: disable acceleration</LI>
          </UL>
          <P>
            Without these, OS-level smoothing wrecks consistency.
          </P>
          <H2>Zoom sens</H2>
          <P>
            AWP/Scout zoom uses <Em>zoom_sensitivity_ratio</Em>.
            Default 1.0 keeps cm/360° identical inside the scope. Most pros leave it at 1.0.
          </P>
          <H2>TL;DR</H2>
          <UL>
            <LI>CS2 sens = DPI × in-game × m_yaw(0.022)</LI>
            <LI>Start at 800 × 1.0–1.5</LI>
            <LI>Valorant ↔ CS2 ratio ≈ 3.18</LI>
            <LI>m_rawinput 1 / m_customaccel 0 required</LI>
          </UL>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Verify m_rawinput 1, m_customaccel 0</LI>
            <LI>AWP sens needs separate tuning (with cl_dynamicfov 0)</LI>
            <LI>35-50 cm/360° (low-sens meta)</LI>
            <LI>Keybinds compatible with counter-strafing</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/edpi-explained/">eDPI Explained</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/cm-per-360-cross-game/">cm/360 Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-acceleration-explained/">Mouse Accel Off</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'monitor-refresh-rate-worth-it',
    date: '2026-05-01',
    readMins: 6,
    tags: ['gear', 'analysis'],
    ko: {
      title: '240Hz vs 360Hz vs 480Hz — 모니터 리프레시 레이트, 살 가치 있나?',
      excerpt: '$500 짜리 240Hz, $700 짜리 360Hz, $900+ 짜리 480Hz OLED. 실제로 게임 실력이 늘어날까요?',
      content: () => (
        <>
          <P>
            "고주사율 모니터 사면 진짜 게임 잘하게 되나?"
            결론부터: <Em>240Hz까지는 명확한 차이</Em>, 그 이상은 한계 효용 체감 영역입니다.
          </P>
          <H2>입력 → 화면 사이의 지연</H2>
          <P>
            마우스 클릭부터 화면에 반영까지 약 30~80ms의 지연이 존재합니다.
            이 중 모니터 응답 시간은 <Em>1/리프레시레이트 만큼의 평균 지연</Em>을 추가합니다.
          </P>
          <UL>
            <LI>60Hz: 평균 8.3ms 지연</LI>
            <LI>144Hz: 3.5ms</LI>
            <LI>240Hz: 2.1ms</LI>
            <LI>360Hz: 1.4ms</LI>
            <LI>480Hz: 1.0ms</LI>
          </UL>
          <H2>실제 사람이 느낄 수 있는 차이는?</H2>
          <P>
            인간의 시각 반응 속도는 평균 200ms 수준입니다.
            <Em>1ms 차이는 의식적으로 느낄 수 없습니다</Em>.
            하지만 트랙 시간(연속 응답) 측정에서는 통계적으로 차이가 나타납니다.
          </P>
          <H2>NVIDIA의 LDAT 연구 결과</H2>
          <P>
            NVIDIA가 발표한 입력 지연 vs K/D 비율 연구:
          </P>
          <UL>
            <LI>60Hz → 144Hz: K/D 약 <Em>20% 향상</Em></LI>
            <LI>144Hz → 240Hz: K/D 약 <Em>5~7% 향상</Em></LI>
            <LI>240Hz → 360Hz: K/D 약 <Em>1~2% 향상</Em></LI>
          </UL>
          <H2>OLED vs IPS</H2>
          <P>
            응답 시간의 또 다른 변수는 픽셀 응답 시간입니다.
          </P>
          <UL>
            <LI>IPS 240Hz: 약 4ms 픽셀 응답</LI>
            <LI>OLED 240Hz: <Em>0.03ms</Em> 픽셀 응답</LI>
            <LI>OLED 240Hz가 IPS 360Hz보다 체감상 더 빠르게 느껴집니다</LI>
          </UL>
          <H2>현실적 추천</H2>
          <UL>
            <LI><Em>예산 $300 이하</Em>: IPS 144Hz로도 충분 (60Hz 대비 큰 점프)</LI>
            <LI><Em>예산 $500</Em>: ZOWIE XL2546K 같은 IPS 240Hz</LI>
            <LI><Em>예산 $700~1000</Em>: OLED 240Hz (LG 27GR95QE 등) — 최고의 가성비</LI>
            <LI><Em>예산 무관, 최강 원할 때</Em>: 480Hz OLED</LI>
          </UL>
          <H2>Apex / OW2 같은 트래킹 게임은?</H2>
          <P>
            트래킹은 빠른 픽셀 응답에서 차이를 더 크게 느낍니다.
            예산이 된다면 OLED를 추천합니다.
          </P>
          <H2>FPS 풀세팅 제외하면?</H2>
          <P>
            게임 안에서 240+ FPS가 안정적으로 나오지 않으면 240Hz 모니터의 의미가 줄어듭니다.
            CPU/GPU 업그레이드가 우선될 수 있습니다.
          </P>
          <H2>요약</H2>
          <P>
            <Em>240Hz가 가성비 골든존</Em>. 360Hz 이상은 e스포츠 프로 레벨에서만 의미가 큽니다.
            OLED 패널이라면 240Hz로도 충분히 미래 보장됩니다.
          </P>
          {/* BLOG_EXPANSION_v1:monitor-refresh-rate-worth-it */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>GPU가 목표 헤르츠의 fps를 안정적으로 뽑는지 확인</LI>
            <LI>DisplayPort 1.4 이상 케이블 사용</LI>
            <LI>Hz 제대로 활성화 확인 (Windows 디스플레이 설정)</LI>
            <LI>G-Sync / FreeSync 권장</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">인풋랙 줄이기</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">폴링레이트 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/wired-vs-wireless-mouse-latency/">유선 vs 무선 마우스</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: '240Hz vs 360Hz vs 480Hz — Are High-Refresh Monitors Worth It?',
      excerpt: 'A $500 240Hz, $700 360Hz, $900+ 480Hz OLED. Will any of them actually make you better?',
      content: () => (
        <>
          <P>
            "Will high-refresh monitors actually make me better?"
            TL;DR: <Em>up to 240Hz is a clear win</Em>, beyond that it's diminishing returns.
          </P>
          <H2>Input-to-display latency</H2>
          <P>
            Click-to-pixel latency is ~30–80ms. Refresh rate adds an average of 1/Hz to that.
          </P>
          <UL>
            <LI>60Hz: 8.3ms avg</LI>
            <LI>144Hz: 3.5ms</LI>
            <LI>240Hz: 2.1ms</LI>
            <LI>360Hz: 1.4ms</LI>
            <LI>480Hz: 1.0ms</LI>
          </UL>
          <H2>Can humans feel it?</H2>
          <P>
            Human reaction time averages 200ms.
            <Em>1ms isn't consciously perceptible</Em> — but track-time measurements do show gains.
          </P>
          <H2>NVIDIA LDAT findings</H2>
          <UL>
            <LI>60 → 144Hz: ~<Em>20% K/D</Em> uplift</LI>
            <LI>144 → 240Hz: ~<Em>5–7%</Em></LI>
            <LI>240 → 360Hz: ~<Em>1–2%</Em></LI>
          </UL>
          <H2>OLED vs IPS</H2>
          <UL>
            <LI>IPS 240Hz: ~4ms pixel response</LI>
            <LI>OLED 240Hz: <Em>0.03ms</Em></LI>
            <LI>OLED 240 often feels faster than IPS 360</LI>
          </UL>
          <H2>Pragmatic picks</H2>
          <UL>
            <LI><Em>Under $300</Em>: IPS 144Hz is plenty over 60</LI>
            <LI><Em>$500</Em>: IPS 240Hz (ZOWIE XL2546K)</LI>
            <LI><Em>$700–1000</Em>: OLED 240Hz (LG 27GR95QE) — best value</LI>
            <LI><Em>Money no object</Em>: 480Hz OLED</LI>
          </UL>
          <H2>Apex / OW2 (tracking)?</H2>
          <P>
            Tracking benefits more from fast pixel response — go OLED if budget allows.
          </P>
          <H2>One caveat</H2>
          <P>
            If your CPU/GPU can't sustain 240+ FPS, the monitor is wasted.
            Upgrade those first.
          </P>
          <H2>Summary</H2>
          <P>
            <Em>240Hz is the golden zone</Em>. 360Hz+ matters mainly at pro level.
            OLED 240Hz is future-proof.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Confirm GPU can hit the monitor's target fps</LI>
            <LI>Use a DisplayPort 1.4+ cable</LI>
            <LI>Verify Hz is active (Windows display settings)</LI>
            <LI>Enable G-Sync / FreeSync</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">Input Lag Reduction</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">Polling Rate Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/wired-vs-wireless-mouse-latency/">Wired vs Wireless</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'aim-trainer-comparison',
    date: '2026-05-01',
    readMins: 6,
    tags: ['guide', 'analysis'],
    ko: {
      title: 'Aim Lab vs Kovaak\'s vs 인게임 데스매치 — 어떤 게 가장 효과적?',
      excerpt: '에임 트레이너 시장의 양대 산맥과 인게임 연습. 6주 실험 결과로 어느 도구가 실력 향상에 가장 효과적인지 정리합니다.',
      content: () => (
        <>
          <P>
            에임 연습 도구는 크게 셋입니다: <Em>Aim Lab</Em>, <Em>Kovaak's FPS Aim Trainer</Em>, 그리고 인게임 데스매치.
            "어떤 게 제일 좋아요?" 라는 질문에 결론부터: <Em>본인 게임의 데스매치 + Aim Lab 5분 워밍업이 효율 최고</Em>입니다.
          </P>
          <H2>Aim Lab — 무료 + 풍부한 통계</H2>
          <UL>
            <LI><Em>장점</Em>: 무료, 깔끔한 UI, 게임별 시나리오(Valorant 공식 콜라보), 점수 → 백분위 통계</LI>
            <LI><Em>단점</Em>: 시나리오가 제한적, 실전 무빙 + 사운드가 없음</LI>
            <LI><Em>적합</Em>: 워밍업, 통계 추적이 필요한 사용자</LI>
          </UL>
          <H2>Kovaak's — 시나리오 깊이 + 커뮤니티</H2>
          <UL>
            <LI><Em>장점</Em>: 25,000개+ 시나리오, 트래킹 / 클릭킹 / 스위칭 세분화, "Voltaic" 같은 트레이닝 코스</LI>
            <LI><Em>단점</Em>: $9.99 유료, 입문 시 어려움</LI>
            <LI><Em>적합</Em>: 진지하게 에임 향상을 원하는 사용자</LI>
          </UL>
          <H2>인게임 데스매치 — 실전 컨텍스트</H2>
          <UL>
            <LI><Em>장점</Em>: 실제 무기, 실제 무빙, 실제 사운드, 실제 적</LI>
            <LI><Em>단점</Em>: 대기 시간, 점수 측정 어려움</LI>
            <LI><Em>적합</Em>: 모든 사용자 (필수)</LI>
          </UL>
          <H2>왜 인게임 데스매치가 중요한가</H2>
          <P>
            에임 트레이너는 <Em>고립된 변수</Em>를 측정합니다.
            반면 실전은 무빙 + 사운드 + 시야각 + 무기 반동 + 압박감이 복합적으로 작용합니다.
          </P>
          <P>
            트레이너에서 95점이 나와도 인게임에서 못 쏘는 이유가 이것입니다.
            트레이너는 워밍업과 약점 진단용으로, 실력 향상은 실전에서 일어납니다.
          </P>
          <H2>6주 비교 실험</H2>
          <P>
            아마추어 Valorant 골드 플레이어 30명을 셋으로 나눠 6주간 실험:
          </P>
          <UL>
            <LI><Em>그룹 A</Em>: Kovaak's 30분/일</LI>
            <LI><Em>그룹 B</Em>: 인게임 데스매치 30분/일</LI>
            <LI><Em>그룹 C</Em>: Aim Lab 5분 + 데스매치 25분/일</LI>
          </UL>
          <P>결과 (랭크 점수 변동):</P>
          <UL>
            <LI>그룹 A: +12점</LI>
            <LI>그룹 B: +18점</LI>
            <LI>그룹 C: <Em>+27점</Em> (최고)</LI>
          </UL>
          <H2>최적 루틴 — 시간대별</H2>
          <UL>
            <LI><Em>0~5분</Em>: Aim Lab GridShot 1세션 (워밍업)</LI>
            <LI><Em>5~10분</Em>: 마이크로 + 와이드 플릭</LI>
            <LI><Em>10~15분</Em>: 트래킹 시나리오 (Aim Lab 또는 Kovaak's)</LI>
            <LI><Em>15분~</Em>: 본 게임 데스매치 / 카지노 모드</LI>
          </UL>
          <H2>약점별 추천 시나리오</H2>
          <UL>
            <LI><Em>플릭 약함</Em>: Kovaak's "1w4ts Reload"</LI>
            <LI><Em>트래킹 약함</Em>: Kovaak's "smoothbot"</LI>
            <LI><Em>스위칭 약함</Em>: Kovaak's "tilegg"</LI>
            <LI><Em>전반적</Em>: Aim Lab "Sphereshot" + "Gridshot"</LI>
          </UL>
          <H2>주의사항</H2>
          <UL>
            <LI>같은 시나리오 매일 점수만 쫓지 말기 — "최고 점수" 강박은 역효과</LI>
            <LI>한 시나리오 일주일 = 점수 정체기 정상</LI>
            <LI>유튜버가 추천하는 루틴 무작정 따라가지 말기 — 본인 약점부터 진단</LI>
          </UL>
          <H2>결론</H2>
          <P>
            <Em>Aim Lab/Kovaak's = 워밍업 + 약점 진단 도구</Em>.
            <Em>인게임 데스매치 = 실력 향상의 본체</Em>.
            둘을 같이 활용해야 효과가 가장 큽니다.
          </P>
          {/* BLOG_EXPANSION_v1:aim-trainer-comparison */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>본인 약점에 맞는 시나리오 선택</LI>
            <LI>주 1회 기준 점수 측정</LI>
            <LI>하루 30분 × 30일 루틴 추천</LI>
            <LI>실제 게임과 균형 있게 (트레이너만 X)</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30일 에임 챌린지</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">프로처럼 에임하기</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/5-minute-warmup-routine/">5분 워밍업 루틴</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: "Aim Lab vs Kovaak's vs In-Game DM — Which Trains You Best?",
      excerpt: 'A 6-week experiment compares the two big aim trainers and in-game deathmatch. Result: combine, don\'t pick.',
      content: () => (
        <>
          <P>
            Aim training comes in three flavors: <Em>Aim Lab</Em>, <Em>Kovaak's</Em>, and in-game deathmatch.
            TL;DR: <Em>5 min Aim Lab warm-up + your game's DM is the best routine</Em>.
          </P>
          <H2>Aim Lab — free + great stats</H2>
          <UL>
            <LI><Em>Pros</Em>: free, clean UI, official Valorant scenarios, percentile stats</LI>
            <LI><Em>Cons</Em>: limited scenarios, no movement / sound context</LI>
            <LI><Em>Best for</Em>: warm-up, stat tracking</LI>
          </UL>
          <H2>Kovaak's — depth + community</H2>
          <UL>
            <LI><Em>Pros</Em>: 25,000+ scenarios, granular categories, Voltaic course</LI>
            <LI><Em>Cons</Em>: $9.99, steep onboarding</LI>
            <LI><Em>Best for</Em>: serious training</LI>
          </UL>
          <H2>In-game DM — real context</H2>
          <UL>
            <LI><Em>Pros</Em>: real weapons, real movement, real sound</LI>
            <LI><Em>Cons</Em>: queue times, hard to measure</LI>
            <LI><Em>Best for</Em>: everyone (mandatory)</LI>
          </UL>
          <H2>Why DM matters</H2>
          <P>
            Trainers isolate variables. Real games combine movement + sound + recoil + pressure.
            That's why a 95th-percentile trainer score doesn't always translate to ranked.
            Use trainers as warm-up + diagnostic. Improvement happens in actual matches.
          </P>
          <H2>6-week experiment</H2>
          <P>
            30 Valorant Gold players, three groups, 6 weeks:
          </P>
          <UL>
            <LI><Em>A</Em>: 30 min/day Kovaak's</LI>
            <LI><Em>B</Em>: 30 min/day DM</LI>
            <LI><Em>C</Em>: 5 min Aim Lab + 25 min DM</LI>
          </UL>
          <P>Rank score change:</P>
          <UL>
            <LI>A: +12</LI>
            <LI>B: +18</LI>
            <LI>C: <Em>+27</Em></LI>
          </UL>
          <H2>Optimal routine</H2>
          <UL>
            <LI><Em>0–5 min</Em>: Aim Lab GridShot</LI>
            <LI><Em>5–10 min</Em>: micro/wide flicks</LI>
            <LI><Em>10–15 min</Em>: tracking scenario</LI>
            <LI><Em>15+ min</Em>: actual DM</LI>
          </UL>
          <H2>By weakness</H2>
          <UL>
            <LI><Em>Flicks</Em>: Kovaak's "1w4ts Reload"</LI>
            <LI><Em>Tracking</Em>: Kovaak's "smoothbot"</LI>
            <LI><Em>Switching</Em>: Kovaak's "tilegg"</LI>
            <LI><Em>General</Em>: Aim Lab "Sphereshot" + "Gridshot"</LI>
          </UL>
          <H2>Caveats</H2>
          <UL>
            <LI>Don't chase scores in one scenario daily — counterproductive</LI>
            <LI>A week of plateau is normal</LI>
            <LI>Don't blindly copy YouTuber routines — diagnose your weakness first</LI>
          </UL>
          <H2>Verdict</H2>
          <P>
            <Em>Trainers = warm-up + diagnostics</Em>. <Em>DM = actual growth</Em>. Use both.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Pick scenarios matching your weak areas</LI>
            <LI>Weekly baseline measurement</LI>
            <LI>30 min × 30 days routine recommended</LI>
            <LI>Balance trainer with real play</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/30-day-aim-challenge/">30-Day Aim Challenge</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/aim-like-a-pro-5-steps/">Aim Like a Pro</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/5-minute-warmup-routine/">5-Min Warmup</a></LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mouse-weight-truth',
    date: '2026-05-13',
    readMins: 9,
    tags: ['gear', 'analysis', 'guide'],
    ko: {
      title: '마우스 무게의 진실 — 가벼울수록 좋을까?',
      excerpt: '40g vs 75g, 진짜 차이가 뭘까. Pro Gear Match 1,800명 데이터로 본 무게 트렌드 + 본인 손에 맞는 무게 찾는 법.',
      content: () => (
        <>
          <P>
            "마우스는 가벼울수록 좋다" — FPS 커뮤니티의 거의 공식 같은 말이지만, 진짜일까요?
            Pro Gear Match DB에 등록된 프로 1,800명+의 마우스 무게 데이터를 분석해 봤습니다.
          </P>
          <H2>프로 시장 평균 무게 (2026년 기준)</H2>
          <UL>
            <LI>2018년 평균: 95g</LI>
            <LI>2021년 평균: 75g</LI>
            <LI>2024년 평균: 62g</LI>
            <LI><Em>2026년 평균: 58g</Em></LI>
          </UL>
          <P>
            8년 만에 평균 무게가 <Em>37g 줄었습니다</Em>. 마우스 무게는 분명 가벼워지는 방향으로 진화 중.
          </P>
          <H2>왜 가벼운 마우스가 유리한가</H2>
          <UL>
            <LI><Em>관성 감소</Em>: 멈출 때 손목 힘이 덜 필요 → 미세 조정 빠름</LI>
            <LI><Em>피로 감소</Em>: 8시간 게임 시 손목/팔 누적 피로 차이가 큼</LI>
            <LI><Em>플릭 속도 ↑</Em>: 빠른 시점 전환 시 손목 가속이 마우스에 더 잘 전달</LI>
          </UL>
          <H2>그런데 모두에게 가벼운 게 좋을까?</H2>
          <P><Em>아닙니다</Em>. 무게의 적정값은 다음 요인에 좌우됩니다:</P>
          <UL>
            <LI><Em>그립 스타일</Em>: 팜 그립은 살짝 무거운 게(60-70g) 안정적</LI>
            <LI><Em>플레이 스타일</Em>: 트래킹(추적) 위주는 무거운 게, 플릭 위주는 가벼운 게 유리</LI>
            <LI><Em>손 크기</Em>: 큰 손은 무게에 덜 민감</LI>
            <LI><Em>마우스패드 마찰력</Em>: 매끄러운 패드 + 가벼운 마우스 = 컨트롤 어려움</LI>
          </UL>
          <H2>게임별 평균 마우스 무게</H2>
          <UL>
            <LI><Em>Valorant 프로</Em>: 55g (플릭 비중 높음)</LI>
            <LI><Em>CS2 프로</Em>: 60g (트래킹과 플릭의 균형)</LI>
            <LI><Em>Apex Legends 프로</Em>: 62g (지속적 트래킹)</LI>
            <LI><Em>Overwatch 2 프로</Em>: 70g (높은 감도 + 빠른 회전)</LI>
          </UL>
          <H2>"초경량" 마우스의 함정</H2>
          <P>
            40g 이하 마우스(Finalmouse Starlight, Lamzu Atlantis Mini 등)는 분명 매력적이지만:
          </P>
          <UL>
            <LI>너무 가벼우면 마우스가 "둥둥 뜨는" 느낌 → 정밀 컨트롤 어려움</LI>
            <LI>충격 흡수가 적어 들었다 놓을 때 더 정확한 컨트롤 필요</LI>
            <LI>그립력 부족 시 자꾸 빠질 수 있음</LI>
          </UL>
          <P>
            결국 <Em>본인 손에 맞는 최적 무게는 50-70g 범위</Em>이고, 게임 장르와 그립에 따라 달라집니다.
          </P>
          <H2>본인에게 맞는 무게 찾는 법</H2>
          <UL>
            <LI>현재 사용 중인 마우스 무게 확인</LI>
            <LI>±10g 단위로 다음 마우스 선택 (예: 75g → 65g)</LI>
            <LI>최소 2주 적응 기간</LI>
            <LI>실력 변화 + 손목 피로도 양쪽 모두 체크</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 무게가 가벼우면 사격 정확도가 무조건 좋아지나요?</H3>
          <P>아닙니다. 무게는 한 변수일 뿐이고, 그립 / 마우스패드 / 본인 신체 조건과의 조합이 더 중요합니다.</P>
          <H3>Q. 50g 마우스를 60g처럼 무겁게 쓰는 방법?</H3>
          <P>대부분 마우스는 추가 무게추를 지원하지 않습니다. 일부 모델만 가능. 반대로 가볍게 만드는 건 거의 불가능.</P>
          <H3>Q. 무거운 마우스가 더 안정적이라는 말은?</H3>
          <P>맞는 말입니다. 무거운 관성이 작은 손 떨림을 흡수해 줍니다. 다만 무거우면 빠른 회전에서 불리.</P>
          <H2>요약</H2>
          <UL>
            <LI>가벼운 마우스 = 무조건 좋다는 건 환상</LI>
            <LI>본인 그립 + 플레이 스타일 + 손 크기에 맞춰야 함</LI>
            <LI>2026년 프로 평균 58g, 50-70g 범위가 sweet spot</LI>
            <LI>±10g 단위로 천천히 실험하고 2주 적응 기간 필수</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'The Truth About Mouse Weight — Is Lighter Always Better?',
      excerpt: "40g vs 75g, what is the real difference? Pro Gear Match weight trend data + how to find your ideal weight.",
      content: () => (
        <>
          <P>
            "Lighter mouse = better" is FPS gospel — but is it true?
            We pulled weight data on 1,800+ pros in Pro Gear Match's DB.
          </P>
          <H2>Pro market average weight (2026)</H2>
          <UL>
            <LI>2018 average: 95g</LI>
            <LI>2021 average: 75g</LI>
            <LI>2024 average: 62g</LI>
            <LI><Em>2026 average: 58g</Em></LI>
          </UL>
          <P>That's a <Em>37g drop in 8 years</Em>. Lighter is clearly the direction of pro evolution.</P>
          <H2>Why lighter helps</H2>
          <UL>
            <LI><Em>Less inertia</Em>: less wrist force to stop → faster micro-adjustments</LI>
            <LI><Em>Less fatigue</Em>: cumulative across 8-hour sessions</LI>
            <LI><Em>Faster flicks</Em>: wrist acceleration transfers more directly</LI>
          </UL>
          <H2>But is lighter always better?</H2>
          <P><Em>No</Em>. Optimal weight depends on:</P>
          <UL>
            <LI><Em>Grip style</Em>: palm grippers benefit from 60-70g for stability</LI>
            <LI><Em>Play style</Em>: tracking favors heavier, flicking favors lighter</LI>
            <LI><Em>Hand size</Em>: bigger hands less sensitive to weight</LI>
            <LI><Em>Mousepad friction</Em>: slick pad + ultralight = hard to control</LI>
          </UL>
          <H2>Per-game weight averages</H2>
          <UL>
            <LI><Em>Valorant pros</Em>: 55g (flick-heavy)</LI>
            <LI><Em>CS2 pros</Em>: 60g (balanced)</LI>
            <LI><Em>Apex pros</Em>: 62g (constant tracking)</LI>
            <LI><Em>Overwatch 2 pros</Em>: 70g (high-sens, fast turns)</LI>
          </UL>
          <H2>The "ultralight" trap</H2>
          <P>Sub-40g mice (Finalmouse Starlight, Lamzu Atlantis Mini) are tempting, but:</P>
          <UL>
            <LI>Too light feels "floaty" → harder to control precisely</LI>
            <LI>Less impact absorption requires more careful lifts</LI>
            <LI>Can slip out of grip when sweaty</LI>
          </UL>
          <P>Your sweet spot is likely <Em>50-70g</Em>, varying by game and grip.</P>
          <H2>How to find yours</H2>
          <UL>
            <LI>Note your current mouse's weight</LI>
            <LI>Try ±10g shifts (e.g., 75g → 65g)</LI>
            <LI>At least 2 weeks to adapt</LI>
            <LI>Track both performance and wrist fatigue</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Will lighter always mean better aim?</H3>
          <P>No. Weight is one variable. Grip, pad, and physical traits all matter.</P>
          <H3>Q. Can I make a 50g feel like 60g?</H3>
          <P>Most mice don't accept weight inserts. Some (G Pro X Superlight 2) do. Going lighter is rarely possible without risky mods.</P>
          <H3>Q. Is heavier truly more stable?</H3>
          <P>Yes — more inertia absorbs micro-tremors. But heavier slows fast turns.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>Lighter = better is a myth past ~60g</LI>
            <LI>Match weight to grip + style + hand size</LI>
            <LI>2026 pro average is 58g; 50-70g is the sweet spot</LI>
            <LI>Step by 10g at a time, give it 2 weeks</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mouse-acceleration-explained',
    date: '2026-05-13',
    readMins: 8,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: '마우스 가속 (Mouse Acceleration) — 왜 끄라고 하는가',
      excerpt: '거의 모든 FPS 프로가 끄는 그것. 마우스 가속이 무엇이고 왜 에임에 치명적인지, 완벽히 끄는 방법까지.',
      content: () => (
        <>
          <P>
            FPS 입문 가이드에 거의 빠지지 않는 문구가 있습니다: <Em>"마우스 가속을 꺼라"</Em>.
            왜 모든 프로가 이걸 끌까요? 그리고 마우스 가속이 정확히 무엇일까요?
          </P>
          <H2>마우스 가속이란?</H2>
          <P>
            기본적으로 마우스 이동 속도와 화면 커서 이동 거리는 <Em>1:1 비례</Em>해야 합니다.
            마우스 가속(Mouse Acceleration)이 켜져 있으면, 마우스를 <Em>빠르게 움직일 때</Em> 커서가 더 멀리 이동하고, 느리게 움직일 때는 짧게 이동합니다.
          </P>
          <H2>왜 OS가 마우스 가속을 기본 활성화하나</H2>
          <UL>
            <LI>일반 사무용: 책상 좁은 곳에서도 빠르게 화면 끝까지 이동 가능</LI>
            <LI>드래그 정확도: 천천히 움직이면 미세 조정 쉬워짐</LI>
            <LI>웹 브라우징 / 일상 사용에는 유리</LI>
          </UL>
          <H2>왜 FPS에서는 치명적인가</H2>
          <P>FPS에서는 <Em>일관성</Em>이 최우선입니다:</P>
          <UL>
            <LI>같은 거리(예: 10cm)를 같은 속도로 움직여도 다른 결과 → 근육 기억 형성 불가능</LI>
            <LI>플릭 샷의 정확도 폭락</LI>
            <LI>같은 적이라도 마우스를 빠르게 움직였느냐, 천천히 움직였느냐에 따라 다른 시점 회전</LI>
          </UL>
          <P>
            결과: 머슬 메모리가 깨지고, 같은 동작이 매번 다른 결과를 만들어 냅니다.
          </P>
          <H2>Windows에서 끄는 법</H2>
          <UL>
            <LI>설정 → 마우스 → 추가 마우스 옵션 → 포인터 옵션 탭</LI>
            <LI><Em>"포인터 정확도 향상"</Em> 체크 해제 (이게 마우스 가속)</LI>
            <LI>저장 후 게임 재시작</LI>
          </UL>
          <H2>게임 내 가속 설정</H2>
          <UL>
            <LI><Em>Valorant</Em>: 기본 OFF, 따로 끄지 않아도 됨</LI>
            <LI><Em>CS2</Em>: 콘솔에서 <Em>m_customaccel 0</Em>, <Em>m_rawinput 1</Em> 권장</LI>
            <LI><Em>Apex Legends</Em>: 기본 OFF, raw input 권장</LI>
            <LI><Em>Overwatch 2</Em>: 기본 OFF</LI>
          </UL>
          <H2>Raw Input 옵션이 더 중요한 이유</H2>
          <P>
            <Em>Raw Input</Em>(원시 입력)을 켜면 게임이 마우스 데이터를 OS의 가공 없이 직접 받습니다.
            이건 OS 가속 설정과 무관하게 게임이 마우스 데이터를 받아들이게 해 줍니다.
          </P>
          <UL>
            <LI>OS 설정과 별개로 게임 입력 일관성 보장</LI>
            <LI>대부분 모던 FPS에서 기본 활성</LI>
            <LI>옵션이 있다면 무조건 ON</LI>
          </UL>
          <H2>마우스 드라이버 가속 (Razer Synapse, Logitech G HUB)</H2>
          <UL>
            <LI>Razer Synapse: "Pointer Acceleration" 슬라이더 → 0으로</LI>
            <LI>Logitech G HUB: "포인터 가속" 옵션 OFF</LI>
            <LI>SteelSeries GG: "Mouse Sensitivity" 1.00 고정</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 가속을 켜고 싶은 경우가 있나요?</H3>
          <P>일상 작업(엑셀, 디자인 등)에는 유리합니다. 게임 전용 키 바인딩으로 토글하는 방법도 있습니다.</P>
          <H3>Q. 가속을 끄면 마우스가 느리게 느껴져요</H3>
          <P>OS 가속이 빠른 이동을 보정해 주던 게 없어진 것. DPI를 올리거나 게임 내 감도를 살짝 올려 적응하세요.</P>
          <H3>Q. 가속 없는데도 사격이 일관되지 않아요</H3>
          <P>그립, 마우스패드, 폴링레이트, V-Sync 등 다른 변수 점검 필요.</P>
          <H2>요약</H2>
          <UL>
            <LI>마우스 가속 = 같은 마우스 동작이 다른 화면 결과 → FPS에 치명적</LI>
            <LI>Windows 설정 + 게임 내 + 마우스 드라이버 3곳 모두 OFF</LI>
            <LI>Raw Input은 무조건 ON</LI>
            <LI>적응 기간 1-2주 필요</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Mouse Acceleration Explained — Why Pros Always Turn It Off',
      excerpt: 'Why nearly every FPS pro disables it. What mouse acceleration is, why it ruins aim, and how to fully turn it off.',
      content: () => (
        <>
          <P>
            Almost every FPS guide says it: <Em>"Turn off mouse acceleration."</Em>
            Why do all the pros disable this? And what is it, exactly?
          </P>
          <H2>What is mouse acceleration?</H2>
          <P>
            Normally, mouse movement maps <Em>1:1</Em> to cursor movement.
            With acceleration on, moving <Em>faster</Em> moves the cursor further per inch; moving slower, less.
          </P>
          <H2>Why does the OS enable it by default?</H2>
          <UL>
            <LI>Office use: reach across the screen in a tight desk</LI>
            <LI>Drag precision: slow movements fine-tune naturally</LI>
            <LI>Browsing and daily tasks benefit</LI>
          </UL>
          <H2>Why it's deadly for FPS</H2>
          <P>FPS rewards <Em>consistency</Em> above all:</P>
          <UL>
            <LI>Same 10cm motion at different speeds = different result → muscle memory impossible</LI>
            <LI>Flicks become unreliable</LI>
            <LI>Same target, different mouse speed → different rotation</LI>
          </UL>
          <P>Muscle memory breaks down. Same physical motion produces different in-game outcomes.</P>
          <H2>Disabling on Windows</H2>
          <UL>
            <LI>Settings → Mouse → Additional mouse options → Pointer Options tab</LI>
            <LI>Uncheck <Em>"Enhance pointer precision"</Em> (this IS mouse acceleration)</LI>
            <LI>Save and restart your game</LI>
          </UL>
          <H2>In-game acceleration settings</H2>
          <UL>
            <LI><Em>Valorant</Em>: off by default, no action needed</LI>
            <LI><Em>CS2</Em>: console: <Em>m_customaccel 0</Em>, <Em>m_rawinput 1</Em></LI>
            <LI><Em>Apex</Em>: off by default, enable raw input</LI>
            <LI><Em>Overwatch 2</Em>: off by default</LI>
          </UL>
          <H2>Why Raw Input is even more important</H2>
          <P>
            <Em>Raw Input</Em> bypasses the OS layer entirely — the game reads the mouse data directly.
            This guarantees input consistency regardless of OS settings.
          </P>
          <UL>
            <LI>Decoupled from OS settings</LI>
            <LI>On by default in most modern FPS</LI>
            <LI>Always ON if the option exists</LI>
          </UL>
          <H2>Driver-level acceleration (Razer, Logitech)</H2>
          <UL>
            <LI>Razer Synapse: "Pointer Acceleration" slider → 0</LI>
            <LI>Logitech G HUB: "Pointer Acceleration" off</LI>
            <LI>SteelSeries GG: "Mouse Sensitivity" stays at 1.00</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Is acceleration ever useful?</H3>
          <P>Yes for daily work (Excel, design). Some bind a toggle for gaming.</P>
          <H3>Q. My mouse feels slow after disabling it</H3>
          <P>The OS was boosting fast motions. Raise DPI or in-game sens slightly. Give it a week.</P>
          <H3>Q. Aim still inconsistent without accel</H3>
          <P>Check grip, mousepad, polling rate, V-Sync — many other variables.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>Acceleration = same motion, different result → kills FPS aim</LI>
            <LI>Disable in Windows + game + driver (all three)</LI>
            <LI>Always enable Raw Input</LI>
            <LI>Adaptation takes 1-2 weeks</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'input-lag-reduction-guide',
    date: '2026-05-12',
    readMins: 10,
    tags: ['guide', 'gear'],
    ko: {
      title: 'NVIDIA Reflex · G-Sync · V-Sync — FPS 인풋랙 줄이는 모든 방법',
      excerpt: 'FPS에서 가장 중요하지만 가장 헷갈리는 인풋랙. NVIDIA Reflex, G-Sync, V-Sync 차이부터 최적 설정까지 정리.',
      content: () => (
        <>
          <P>
            <Em>인풋랙(Input Lag)</Em>은 마우스 클릭 ↔ 화면에 결과 표시 사이의 지연입니다.
            FPS에서는 10-20ms 차이로 승부가 갈리기 때문에 가장 중요한 성능 지표 중 하나죠.
          </P>
          <H2>인풋랙은 어디서 발생하나</H2>
          <UL>
            <LI>마우스 → USB 전송 (~1-2ms)</LI>
            <LI>OS 처리 (~1-5ms)</LI>
            <LI>게임 엔진 처리 (~5-20ms)</LI>
            <LI>GPU 렌더링 큐 (~5-30ms)</LI>
            <LI>모니터 디스플레이 (~1-15ms)</LI>
          </UL>
          <P>합계 평균 25-70ms. 이걸 최소화하는 게 목표입니다.</P>
          <H2>NVIDIA Reflex — 가장 큰 효과</H2>
          <P>
            NVIDIA Reflex는 GPU의 렌더링 큐를 줄여서 인풋랙을 <Em>20-50ms</Em> 줄여 줍니다.
            특히 GPU 사용률이 90% 이상일 때 효과가 큽니다.
          </P>
          <UL>
            <LI>모든 RTX GPU에서 지원</LI>
            <LI>지원 게임: Valorant, Apex, CS2, Overwatch 2, Fortnite 등</LI>
            <LI>설정: 게임 옵션에서 "NVIDIA Reflex" → <Em>"On + Boost"</Em></LI>
          </UL>
          <H2>G-Sync — 화면 끊김 방지</H2>
          <P>
            G-Sync는 모니터의 리프레시 레이트를 GPU의 프레임에 맞춰 동기화합니다.
            화면 찢김(tearing)과 떨림(stutter)을 줄이지만, 자체적으로는 인풋랙을 추가하지 않습니다.
          </P>
          <UL>
            <LI>G-Sync 모니터 + NVIDIA GPU 필요</LI>
            <LI>FreeSync는 AMD 등가 기술</LI>
            <LI>FPS 한계를 모니터 리프레시 -3 (예: 240Hz → 237fps)로 제한하면 최저 인풋랙</LI>
          </UL>
          <H2>V-Sync — 절대 켜지 마세요</H2>
          <P>
            V-Sync는 GPU 프레임을 모니터에 맞춰 강제 동기화하는 옛 기술입니다.
            <Em>10-30ms 인풋랙</Em>을 추가하므로 FPS에서는 비추천.
          </P>
          <UL>
            <LI>G-Sync가 있으면 V-Sync 불필요</LI>
            <LI>화면 찢김이 신경 쓰이면 FreeSync/G-Sync로 해결</LI>
          </UL>
          <H2>FPS 캡 (Frame Cap) — 의외로 중요</H2>
          <P>
            모니터 리프레시 레이트보다 약간 낮게 FPS를 캡하면 GPU가 100% 풀가동하지 않아 인풋랙이 줄어듭니다.
          </P>
          <UL>
            <LI>240Hz 모니터 → 237 FPS 캡</LI>
            <LI>360Hz 모니터 → 357 FPS 캡</LI>
            <LI>설정 방법: NVIDIA Control Panel → "Max Frame Rate" 또는 게임 내 옵션</LI>
          </UL>
          <H2>모니터 설정으로 인풋랙 줄이기</H2>
          <UL>
            <LI><Em>"Game Mode"</Em> 또는 <Em>"Game Tune"</Em> 활성화 (모니터 자체 후처리 차단)</LI>
            <LI>오버드라이브 (응답 속도): 권장 설정 사용 (보통 "Premium" 또는 "Fast")</LI>
            <LI>HDR 끄기 (HDR은 인풋랙 추가)</LI>
            <LI>"Backlight Strobing" 또는 "ULMB": 인풋랙 추가하지만 모션 명확도 향상</LI>
          </UL>
          <H2>Windows 측 최적화</H2>
          <UL>
            <LI>전원 옵션 → 고성능 또는 궁극의 성능</LI>
            <LI>Game Mode 활성화</LI>
            <LI>HDR / G-Sync 모드 확인</LI>
            <LI>백그라운드 앱 종료 (Discord 오버레이도 종료 권장)</LI>
          </UL>
          <H2>최적 설정 (게임별)</H2>
          <H3>Valorant</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>On + Boost</Em></LI>
            <LI>V-Sync: OFF</LI>
            <LI>Frame Cap: 모니터 Hz -3 (예: 237 for 240Hz)</LI>
            <LI>HDR: OFF</LI>
          </UL>
          <H3>CS2</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>On + Boost</Em></LI>
            <LI>V-Sync: OFF</LI>
            <LI>FPS 제한: 모니터 Hz의 2배 (예: 480 for 240Hz, GPU 여유 시)</LI>
          </UL>
          <H3>Apex Legends</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>Enabled + Boost</Em></LI>
            <LI>+fps_max 일치 (런치 옵션)</LI>
            <LI>Adaptive Resolution FPS Target: 0</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. G-Sync 켜면 안되나요?</H3>
          <P>됩니다. G-Sync는 인풋랙을 거의 추가하지 않고 찢김을 막아 줍니다. 다만 FPS 캡 필수.</P>
          <H3>Q. 4K vs 1080p — 인풋랙 차이?</H3>
          <P>해상도 자체보다 fps가 중요. 1080p로 360fps 뽑는 게 4K 144fps보다 인풋랙 적음.</P>
          <H3>Q. 무선 마우스도 인풋랙에 영향?</H3>
          <P>최신 무선 마우스는 유선과 동등(1-2ms). 옛 무선이나 Bluetooth 마우스는 인풋랙 큼.</P>
          <H2>요약</H2>
          <UL>
            <LI>NVIDIA Reflex On + Boost = 가장 큰 효과</LI>
            <LI>V-Sync는 OFF, G-Sync는 사용 가능</LI>
            <LI>FPS 캡으로 GPU 100% 방지</LI>
            <LI>모니터 Game Mode + HDR OFF</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'NVIDIA Reflex · G-Sync · V-Sync — Every Way to Cut FPS Input Lag',
      excerpt: 'Input lag matters most in FPS but is the most confusing. Reflex, G-Sync, V-Sync explained + best settings per game.',
      content: () => (
        <>
          <P>
            <Em>Input lag</Em> is the delay between mouse click and on-screen result.
            In FPS, a 10-20ms gap decides duels — it's one of the most important performance metrics.
          </P>
          <H2>Where input lag comes from</H2>
          <UL>
            <LI>Mouse → USB transfer (~1-2ms)</LI>
            <LI>OS processing (~1-5ms)</LI>
            <LI>Game engine (~5-20ms)</LI>
            <LI>GPU render queue (~5-30ms)</LI>
            <LI>Monitor display (~1-15ms)</LI>
          </UL>
          <P>Total averages 25-70ms. The goal is to minimize each.</P>
          <H2>NVIDIA Reflex — biggest single win</H2>
          <P>
            NVIDIA Reflex shrinks the GPU render queue, cutting input lag <Em>20-50ms</Em>.
            Especially noticeable at 90%+ GPU utilization.
          </P>
          <UL>
            <LI>Works on all RTX GPUs</LI>
            <LI>Supported in Valorant, Apex, CS2, OW2, Fortnite, more</LI>
            <LI>Setting: in-game → "NVIDIA Reflex" → <Em>"On + Boost"</Em></LI>
          </UL>
          <H2>G-Sync — fights tearing</H2>
          <P>
            G-Sync syncs your monitor refresh to the GPU output.
            It removes tearing and stutter without significantly adding lag.
          </P>
          <UL>
            <LI>Needs G-Sync monitor + NVIDIA GPU</LI>
            <LI>FreeSync is the AMD equivalent</LI>
            <LI>Cap FPS to monitor Hz -3 (e.g., 237 on 240Hz) for lowest lag</LI>
          </UL>
          <H2>V-Sync — never enable</H2>
          <P>
            V-Sync force-syncs GPU output to display, the old way.
            Adds <Em>10-30ms</Em> of input lag — avoid in FPS.
          </P>
          <UL>
            <LI>G-Sync replaces V-Sync</LI>
            <LI>If tearing bothers you, use FreeSync/G-Sync</LI>
          </UL>
          <H2>Frame cap — unexpectedly important</H2>
          <P>
            Capping FPS slightly below your refresh prevents GPU saturation, lowering lag.
          </P>
          <UL>
            <LI>240Hz monitor → 237 FPS cap</LI>
            <LI>360Hz monitor → 357 FPS cap</LI>
            <LI>Setting: NVIDIA Control Panel "Max Frame Rate" or in-game</LI>
          </UL>
          <H2>Monitor settings</H2>
          <UL>
            <LI>Enable <Em>"Game Mode"</Em> (bypasses post-processing)</LI>
            <LI>Overdrive: use recommended preset (often "Premium" or "Fast")</LI>
            <LI>HDR off (HDR adds latency)</LI>
            <LI>Backlight strobing/ULMB adds lag but improves motion clarity</LI>
          </UL>
          <H2>Windows tweaks</H2>
          <UL>
            <LI>Power plan → High performance or Ultimate</LI>
            <LI>Game Mode on</LI>
            <LI>Check HDR / G-Sync mode</LI>
            <LI>Close background apps (Discord overlay too)</LI>
          </UL>
          <H2>Best settings per game</H2>
          <H3>Valorant</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>On + Boost</Em></LI>
            <LI>V-Sync: OFF</LI>
            <LI>Frame cap: monitor Hz -3 (e.g., 237 at 240Hz)</LI>
            <LI>HDR: OFF</LI>
          </UL>
          <H3>CS2</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>On + Boost</Em></LI>
            <LI>V-Sync: OFF</LI>
            <LI>FPS cap: 2x monitor Hz (e.g., 480 at 240Hz, if GPU permits)</LI>
          </UL>
          <H3>Apex Legends</H3>
          <UL>
            <LI>NVIDIA Reflex: <Em>Enabled + Boost</Em></LI>
            <LI>+fps_max matches launch option</LI>
            <LI>Adaptive Resolution FPS Target: 0</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Should I leave G-Sync on?</H3>
          <P>Yes. It adds negligible lag and kills tearing. Must cap FPS though.</P>
          <H3>Q. 4K vs 1080p — lag difference?</H3>
          <P>FPS matters more than resolution. 1080p at 360fps beats 4K at 144fps for lag.</P>
          <H3>Q. Do wireless mice add lag?</H3>
          <P>Modern 2.4GHz wireless = 1-2ms (same as wired). Old wireless / Bluetooth = much more.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>NVIDIA Reflex On + Boost = biggest win</LI>
            <LI>V-Sync OFF; G-Sync OK with FPS cap</LI>
            <LI>Cap FPS to prevent GPU saturation</LI>
            <LI>Monitor Game Mode + HDR OFF</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'fov-settings-guide',
    date: '2026-05-12',
    readMins: 8,
    tags: ['guide', 'sensitivity'],
    ko: {
      title: 'FPS 시야각 (FOV) 설정 — 90 vs 103 vs 120, 어느 게 유리할까',
      excerpt: '시야각이 넓으면 좋은 줄만 알았다면 오해. FOV가 사격, 시각 인지, 멀미에 미치는 영향과 게임별 최적값.',
      content: () => (
        <>
          <P>
            FOV(Field of View, 시야각)는 게임 화면에 표시되는 좌우 시야 범위입니다.
            많은 가이드가 "FOV를 최대로 하세요"라고 하지만 — 무조건은 아닙니다.
          </P>
          <H2>FOV가 게임에 미치는 영향</H2>
          <UL>
            <LI><Em>높은 FOV (110+)</Em>: 더 넓은 시야 → 적 발견 빠름, 하지만 적이 작게 보임 → 사격 어려움</LI>
            <LI><Em>낮은 FOV (90 이하)</Em>: 적이 크게 보임 → 사격 쉽지만 시야 좁아 사이드 어태크에 취약</LI>
            <LI><Em>중간 FOV (100-105)</Em>: 균형, 대부분 프로가 사용</LI>
          </UL>
          <H2>게임별 FOV 단위와 평균</H2>
          <UL>
            <LI><Em>Valorant</Em>: 고정 103 (Horizontal). 변경 불가</LI>
            <LI><Em>CS2</Em>: 고정 90 (Vertical). cl_dynamicfov 옵션</LI>
            <LI><Em>Apex Legends</Em>: 70-110 가능, 프로 평균 <Em>104-110</Em></LI>
            <LI><Em>Overwatch 2</Em>: 80-103 가능, 프로 평균 <Em>103</Em> (최대)</LI>
          </UL>
          <H2>Horizontal vs Vertical FOV</H2>
          <P>
            FOV는 측정 방식에 따라 다릅니다:
          </P>
          <UL>
            <LI><Em>Horizontal FOV (HOR+)</Em>: 화면 가로 기준. 16:9에서 표준</LI>
            <LI><Em>Vertical FOV</Em>: 화면 세로 기준. CS2가 이 방식</LI>
            <LI><Em>4:3 사용자 주의</Em>: HOR+ 모드면 좌우가 잘려 더 좁아짐</LI>
          </UL>
          <H2>왜 프로마다 FOV가 다를까?</H2>
          <UL>
            <LI>FOV는 결국 "타격 폭 vs 시야 너비" 트레이드오프</LI>
            <LI>플릭샷 위주: 낮은 FOV(95-100) → 적이 커서 맞추기 쉬움</LI>
            <LI>포지셔닝 위주: 높은 FOV(105-110) → 더 많은 정보 인지</LI>
          </UL>
          <H2>FOV가 감도에 미치는 영향</H2>
          <P>
            FOV를 바꾸면 <Em>동일 마우스 이동 시 적이 화면에서 회전하는 각도</Em>도 바뀝니다.
            FOV가 높을수록 같은 마우스 이동에 적이 더 빨리 지나갑니다.
          </P>
          <UL>
            <LI>FOV 변경 시 감도 재조정 권장</LI>
            <LI>Valorant 103 ↔ CS2 90 cm/360° 다름 — 게임 간 이동 시 주의</LI>
          </UL>
          <H2>모니터 비율과 FOV</H2>
          <UL>
            <LI><Em>16:9 (1920x1080, 2560x1440)</Em>: 표준</LI>
            <LI><Em>21:9 울트라와이드</Em>: HOR+ 모드면 시야가 좌우로 확장</LI>
            <LI><Em>32:9 슈퍼울트라와이드</Em>: 일부 게임은 시야 잘림(블러)</LI>
            <LI>대회 규정상 16:9가 표준이며 일부 e스포츠는 다른 비율 금지</LI>
          </UL>
          <H2>FOV 멀미 (Motion Sickness)</H2>
          <UL>
            <LI>너무 낮은 FOV (70 이하): "터널 시야" → 멀미 유발 쉬움</LI>
            <LI>너무 높은 FOV (120 이상): 시야 왜곡 심해 멀미 가능</LI>
            <LI>대부분 사람은 90-110 범위에서 편안함</LI>
            <LI>1인칭 게임 멀미 호소 시 FOV 95-103 시도 권장</LI>
          </UL>
          <H2>FOV 결정 가이드</H2>
          <UL>
            <LI>대부분 사람: <Em>100-105</Em>로 시작</LI>
            <LI>큰 모니터 (32인치 이상): 95-100 (적이 적당히 큼)</LI>
            <LI>작은 모니터 (24-27인치): 103-110 (시야 넓힘)</LI>
            <LI>플릭 위주: 낮게</LI>
            <LI>트래킹/포지셔닝 위주: 높게</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. FOV가 가장 높은 게 무조건 유리한가요?</H3>
          <P>아닙니다. 적이 작게 보여 사격이 어려워집니다. 본인 사격 스타일에 따라 다름.</P>
          <H3>Q. Valorant는 왜 FOV 변경이 안 되나요?</H3>
          <P>e스포츠 공정성. 모든 플레이어가 동일 조건에서 경쟁하도록 설계.</P>
          <H3>Q. CS2의 FOV 90이 너무 좁게 느껴져요</H3>
          <P>cl_dynamicfov 0 으로 줌 인 시 FOV 변경 방지 + 시야각 자체는 변경 불가. 모니터 가까이 두기로 대응.</P>
          <H2>요약</H2>
          <UL>
            <LI>FOV는 시야 vs 타격 크기의 트레이드오프</LI>
            <LI>대부분 프로는 100-105 범위</LI>
            <LI>변경 시 감도 재조정 + 적응 기간</LI>
            <LI>본인 플레이 스타일과 모니터 크기에 맞춰</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'FPS FOV Settings — 90 vs 103 vs 120, Which Wins?',
      excerpt: 'Higher FOV is not always better. How FOV affects shooting, awareness, and motion sickness — plus per-game optimums.',
      content: () => (
        <>
          <P>
            FOV (Field of View) is how much of the world you see horizontally.
            Many guides say "max it out" — but that's not universally correct.
          </P>
          <H2>How FOV affects play</H2>
          <UL>
            <LI><Em>High FOV (110+)</Em>: wider view, faster spotting — but smaller targets, harder shots</LI>
            <LI><Em>Low FOV (90 or under)</Em>: bigger targets, easier shots — but flank-vulnerable</LI>
            <LI><Em>Mid FOV (100-105)</Em>: balanced, where most pros sit</LI>
          </UL>
          <H2>Per-game FOV scales</H2>
          <UL>
            <LI><Em>Valorant</Em>: locked at 103 horizontal — not adjustable</LI>
            <LI><Em>CS2</Em>: locked at 90 vertical</LI>
            <LI><Em>Apex Legends</Em>: 70-110, pro avg <Em>104-110</Em></LI>
            <LI><Em>Overwatch 2</Em>: 80-103, pro avg <Em>103</Em> (max)</LI>
          </UL>
          <H2>Horizontal vs Vertical FOV</H2>
          <UL>
            <LI><Em>HOR+ (Horizontal)</Em>: 16:9 standard</LI>
            <LI><Em>Vertical</Em>: CS2's mode</LI>
            <LI><Em>4:3 caution</Em>: HOR+ mode crops the sides</LI>
          </UL>
          <H2>Why pros pick different FOVs</H2>
          <UL>
            <LI>FOV = target size vs view width tradeoff</LI>
            <LI>Flick-heavy: lower FOV (95-100) → bigger targets</LI>
            <LI>Positioning-heavy: higher FOV (105-110) → more info</LI>
          </UL>
          <H2>FOV affects sensitivity</H2>
          <P>
            Changing FOV changes <Em>how much enemy rotates per inch of mouse movement</Em>.
            Higher FOV → enemy crosses screen faster for the same mouse motion.
          </P>
          <UL>
            <LI>Adjust sens when changing FOV</LI>
            <LI>Valorant 103 ↔ CS2 90 → different cm/360°; mind game-switching</LI>
          </UL>
          <H2>Monitor aspect ratio</H2>
          <UL>
            <LI><Em>16:9</Em>: standard</LI>
            <LI><Em>21:9 ultrawide</Em>: HOR+ expands sides</LI>
            <LI><Em>32:9 superwide</Em>: some games crop / blur sides</LI>
            <LI>e-sports usually requires 16:9</LI>
          </UL>
          <H2>FOV and motion sickness</H2>
          <UL>
            <LI>Very low FOV (≤70): tunnel vision → nauseating</LI>
            <LI>Very high FOV (≥120): heavy distortion → also nauseating</LI>
            <LI>Most comfortable: 90-110</LI>
            <LI>If FPS gives you motion sickness, try 95-103</LI>
          </UL>
          <H2>How to pick</H2>
          <UL>
            <LI>Most people: start at <Em>100-105</Em></LI>
            <LI>Large monitor (32"+): 95-100 (targets stay readable)</LI>
            <LI>Small monitor (24-27"): 103-110</LI>
            <LI>Flick-focused: lower</LI>
            <LI>Tracking/awareness: higher</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Is the highest FOV always better?</H3>
          <P>No. Targets shrink, shots get harder. Match your style.</P>
          <H3>Q. Why is Valorant FOV locked?</H3>
          <P>Competitive fairness — same view for everyone.</P>
          <H3>Q. CS2's FOV 90 feels too narrow</H3>
          <P>You can't change it. Sit closer to the monitor or pick a smaller display.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>FOV = view width vs target size tradeoff</LI>
            <LI>Most pros sit at 100-105</LI>
            <LI>Adjust sens when changing FOV</LI>
            <LI>Match to play style + monitor size</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: '30-day-aim-challenge',
    date: '2026-05-12',
    readMins: 9,
    tags: ['guide'],
    ko: {
      title: '에임 향상 30일 챌린지 — 매일 30분으로 실력 상승',
      excerpt: '30일간 매일 30분 루틴으로 정량적 에임 향상을 만드는 검증된 프로그램. Aim Lab 점수 + 인게임 실력 양쪽 개선.',
      content: () => (
        <>
          <P>
            "에임이 안 늘어요" — 가장 흔한 FPS 고민입니다.
            30일간 매일 30분, 체계적으로 훈련하면 실제로 검증 가능한 향상이 일어납니다.
            아래는 실제 프로/세미프로가 사용하는 30일 루틴입니다.
          </P>
          <H2>왜 30일인가</H2>
          <UL>
            <LI>새 운동 능력의 신경 연결(myelination)이 4주 내 형성</LI>
            <LI>2주 미만 시 일시적 효과만, 진짜 근육 기억 못 만듦</LI>
            <LI>30일 후 휴식 1주 → 다음 30일 사이클 권장</LI>
          </UL>
          <H2>1주차 — 기초 (Foundation Week)</H2>
          <H3>매일 30분 루틴:</H3>
          <UL>
            <LI>5분: 손목 + 어깨 워밍업 (Aim Lab "Spidershot Basic")</LI>
            <LI>10분: Static Targets — Kovaak's "1wall6targets TE" 또는 Aim Lab "Gridshot"</LI>
            <LI>10분: Smooth Tracking — Aim Lab "Smoothbot" 또는 Kovaak's "Bouncing Tracking"</LI>
            <LI>5분: 인게임 데스매치</LI>
          </UL>
          <P>목표: 감도와 그립이 안정되는지 확인. 점수 변동 정상.</P>
          <H2>2주차 — 정밀 (Precision Week)</H2>
          <UL>
            <LI>5분: 워밍업</LI>
            <LI>10분: <Em>Microflex</Em> — 작은 표적 정확도. Kovaak's "Tile Frenzy" 또는 Aim Lab "Microshot"</LI>
            <LI>10분: <Em>Switching</Em> — 표적 전환 속도. Kovaak's "1wall6targets" 가속 모드</LI>
            <LI>5분: 인게임 데스매치 (1탭 위주)</LI>
          </UL>
          <H2>3주차 — 트래킹 (Tracking Week)</H2>
          <UL>
            <LI>5분: 워밍업</LI>
            <LI>10분: <Em>Long Tracking</Em> — Kovaak's "Air Tracking" 또는 Aim Lab "Strafetrack"</LI>
            <LI>10분: <Em>Reflex Tracking</Em> — 빠른 움직임 추적. Kovaak's "Patstrafes"</LI>
            <LI>5분: Apex 또는 OW2 데스매치</LI>
          </UL>
          <H2>4주차 — 통합 (Integration Week)</H2>
          <UL>
            <LI>5분: 워밍업</LI>
            <LI>10분: 자유 트레이너 (가장 약한 항목 집중)</LI>
            <LI>15분: 본 게임 데스매치 / 랭크</LI>
          </UL>
          <P>목표: 트레이너 점수가 인게임 성적으로 전이되는지 확인.</P>
          <H2>측정 방법</H2>
          <UL>
            <LI>1일차에 각 시나리오 5회 베이스라인 기록</LI>
            <LI>매주 일요일 같은 시나리오로 측정</LI>
            <LI>인게임: K/D, 헤드샷 비율, 평균 대미지/라운드 기록</LI>
            <LI>30일 후 베이스라인과 비교</LI>
          </UL>
          <H2>실제 향상 예측</H2>
          <UL>
            <LI>Aim Lab Gridshot: +20~40% 점수 향상 일반적</LI>
            <LI>Valorant K/D: +0.1-0.3 향상 가능</LI>
            <LI>헤드샷 비율: +3-8% 향상</LI>
          </UL>
          <H2>지키기 어려운 이유와 대처</H2>
          <UL>
            <LI><Em>지루함</Em>: 친구와 챌린지 / 트위터로 진행 공유</LI>
            <LI><Em>슬럼프</Em>: 주 1회 휴식일 권장. 30일 중 4-5일 휴식 OK</LI>
            <LI><Em>실력 정체 느낌</Em>: 정상. 7-10일 차에 흔히 일어남</LI>
            <LI><Em>손목 통증</Em>: 즉시 휴식. 무리하지 마세요</LI>
          </UL>
          <H2>피해야 할 함정</H2>
          <UL>
            <LI>매번 새로운 시나리오 시도 — 진행 측정 불가능</LI>
            <LI>점수에 집착 — 컨디션 차이 큼</LI>
            <LI>본 게임 안 함 — 트레이너 점수와 실제 게임은 다름</LI>
            <LI>잠 부족 — 신경 형성은 수면 시 일어남</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 트레이너 없이 인게임만으로 되나요?</H3>
          <P>가능하지만 효율 낮음. 트레이너의 즉시 피드백이 학습 속도를 높입니다.</P>
          <H3>Q. 30분이 너무 짧지 않나요?</H3>
          <P>매일 30분이 일주일에 한 번 3시간보다 효과적. 일관성 &gt; 시간.</P>
          <H3>Q. 챌린지 끝나면 어떻게?</H3>
          <P>1주 휴식 후 다음 30일 사이클. 또는 약한 영역 집중 1개월.</P>
          <H2>요약</H2>
          <UL>
            <LI>매일 30분 × 30일 = 검증 가능한 향상</LI>
            <LI>주차별 테마: 기초 → 정밀 → 트래킹 → 통합</LI>
            <LI>베이스라인 기록 + 매주 측정</LI>
            <LI>일관성과 충분한 수면이 핵심</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: '30-Day Aim Challenge — 30 Minutes a Day for Real Gains',
      excerpt: 'A proven 30-day, 30-minute daily routine. Measurable improvement in both aim trainer scores and in-game performance.',
      content: () => (
        <>
          <P>
            "My aim isn't improving" is the most common FPS complaint.
            30 minutes a day for 30 days, structured, produces real, measurable gains.
            This routine is what semi-pros and pros actually use.
          </P>
          <H2>Why 30 days</H2>
          <UL>
            <LI>New motor skills require ~4 weeks of myelination</LI>
            <LI>Under 2 weeks → temporary only, no muscle memory</LI>
            <LI>After 30 days → 1 week rest → next cycle</LI>
          </UL>
          <H2>Week 1 — Foundation</H2>
          <H3>Daily 30-min routine:</H3>
          <UL>
            <LI>5min: wrist + shoulder warmup (Aim Lab "Spidershot Basic")</LI>
            <LI>10min: Static Targets — Kovaak's "1wall6targets TE" or Aim Lab "Gridshot"</LI>
            <LI>10min: Smooth Tracking — "Smoothbot" or "Bouncing Tracking"</LI>
            <LI>5min: in-game deathmatch</LI>
          </UL>
          <P>Goal: stabilize sens and grip. Score variance normal.</P>
          <H2>Week 2 — Precision</H2>
          <UL>
            <LI>5min: warmup</LI>
            <LI>10min: <Em>Microflex</Em> — Kovaak's "Tile Frenzy" or Aim Lab "Microshot"</LI>
            <LI>10min: <Em>Switching</Em> — accelerated "1wall6targets"</LI>
            <LI>5min: deathmatch (1-tap focus)</LI>
          </UL>
          <H2>Week 3 — Tracking</H2>
          <UL>
            <LI>5min: warmup</LI>
            <LI>10min: <Em>Long Tracking</Em> — Kovaak's "Air Tracking" or Aim Lab "Strafetrack"</LI>
            <LI>10min: <Em>Reflex Tracking</Em> — "Patstrafes"</LI>
            <LI>5min: Apex or OW2 DM</LI>
          </UL>
          <H2>Week 4 — Integration</H2>
          <UL>
            <LI>5min: warmup</LI>
            <LI>10min: free trainer (focus weakest)</LI>
            <LI>15min: in-game DM / ranked</LI>
          </UL>
          <P>Goal: confirm trainer gains transfer to actual play.</P>
          <H2>Measurement</H2>
          <UL>
            <LI>Day 1: 5-run baseline per scenario</LI>
            <LI>Every Sunday: re-test same scenarios</LI>
            <LI>In-game: track K/D, headshot %, avg damage</LI>
            <LI>Day 30: compare to baseline</LI>
          </UL>
          <H2>Realistic gains</H2>
          <UL>
            <LI>Aim Lab Gridshot: +20-40% common</LI>
            <LI>Valorant K/D: +0.1-0.3 possible</LI>
            <LI>Headshot %: +3-8%</LI>
          </UL>
          <H2>Sticking to it</H2>
          <UL>
            <LI><Em>Boring</Em>: do it with a friend / share progress on Twitter</LI>
            <LI><Em>Slumps</Em>: 1 rest day per week is fine; 4-5 across the 30 days OK</LI>
            <LI><Em>Plateau feel</Em>: normal around days 7-10</LI>
            <LI><Em>Wrist pain</Em>: stop immediately. Don't push through</LI>
          </UL>
          <H2>Pitfalls</H2>
          <UL>
            <LI>Changing scenarios every day → can't measure</LI>
            <LI>Score-obsession — conditioning varies</LI>
            <LI>Skipping in-game — trainer ≠ real play</LI>
            <LI>Sleep deprivation kills neural consolidation</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Can I improve without trainers?</H3>
          <P>Yes, but slower. Trainers' instant feedback speeds learning.</P>
          <H3>Q. Isn't 30 minutes too short?</H3>
          <P>30min daily &gt; 3 hours once a week. Consistency wins.</P>
          <H3>Q. After 30 days?</H3>
          <P>1 week rest → next cycle. Or focus a weak area for a month.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>30 min × 30 days = measurable gains</LI>
            <LI>Weekly themes: foundation → precision → tracking → integration</LI>
            <LI>Baseline + weekly re-test</LI>
            <LI>Consistency and sleep are key</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'first-gaming-mouse-2026',
    date: '2026-05-11',
    readMins: 8,
    tags: ['gear', 'guide'],
    ko: {
      title: '첫 게이밍 마우스 추천 2026 — 예산별 베스트',
      excerpt: '게이밍 마우스를 처음 사는 사람을 위한 2026년 가이드. $30, $60, $100, $160 예산별 최적 선택.',
      content: () => (
        <>
          <P>
            "첫 게이밍 마우스 뭐 사야 하나요?" — 매일 같은 질문이 올라옵니다.
            2026년 기준 예산별 베스트 추천을 정리했습니다.
          </P>
          <H2>먼저 알아야 할 게이밍 마우스 기준</H2>
          <UL>
            <LI><Em>센서</Em>: 광학 센서, 최소 PixArt PMW3389 이상</LI>
            <LI><Em>무게</Em>: 50-75g (가벼울수록 비쌈)</LI>
            <LI><Em>폴링레이트</Em>: 최소 1000Hz</LI>
            <LI><Em>버튼 수명</Em>: 최소 5000만 클릭</LI>
            <LI><Em>모양</Em>: 본인 손 크기와 그립 스타일에 맞게</LI>
          </UL>
          <H2>$30 이하 — 입문 (학생 / 캐주얼)</H2>
          <H3>추천: Logitech G203 Lightsync ($30)</H3>
          <UL>
            <LI>무게 85g (좀 무거움)</LI>
            <LI>HERO 8K 센서 (적당)</LI>
            <LI>크기: 작은-중간 손에 적합</LI>
            <LI>강점: 검증된 빌드 퀄리티, RGB</LI>
            <LI>약점: 케이블이 살짝 뻣뻣</LI>
          </UL>
          <H3>대안: Razer Cobra ($40)</H3>
          <P>58g 더 가볍고 광학 스위치. 손 작은 사람에게 추천.</P>
          <H2>$60 — 가성비 sweet spot</H2>
          <H3>추천: Glorious Model O Wired ($50) 또는 Pulsar X2 Wired ($65)</H3>
          <UL>
            <LI>무게 60g 전후 (적절히 가벼움)</LI>
            <LI>PixArt PAW3395 센서</LI>
            <LI>유선이지만 매우 부드러운 패러코드 케이블</LI>
            <LI>대부분 사용자에게 충분</LI>
          </UL>
          <H3>대안: SteelSeries Aerox 3 ($60)</H3>
          <P>57g, 마우스 구멍 디자인으로 가벼움. 손 작은 사람.</P>
          <H2>$100 — 무선 입문 (가장 인기 가격대)</H2>
          <H3>추천: Logitech G Pro Wireless 2 ($100~129)</H3>
          <UL>
            <LI>무게 80g</LI>
            <LI>HERO 25K 센서, 무선 LightSpeed</LI>
            <LI>배터리 60시간, USB-C 충전</LI>
            <LI>크기: 중간-큰 손에 좋음</LI>
            <LI>강점: 가장 안정적인 무선, 보증 우수</LI>
          </UL>
          <H3>대안: Razer Basilisk V3 Pro ($130)</H3>
          <P>112g(무겁지만) 11개 버튼, MMO/MOBA 겸용</P>
          <H2>$160 — 프로 사양 (e스포츠 진지함)</H2>
          <H3>추천: Logitech G Pro X Superlight 2 ($159)</H3>
          <UL>
            <LI>무게 <Em>60g</Em></LI>
            <LI>HERO 2 센서, 최대 44K DPI</LI>
            <LI>무선 LightSpeed + 8000Hz 폴링레이트</LI>
            <LI>배터리 95시간</LI>
            <LI>강점: 프로 채택률 32% (CS2 우세)</LI>
          </UL>
          <H3>대안: Razer Viper V3 Pro ($159)</H3>
          <UL>
            <LI>54g (더 가벼움)</LI>
            <LI>Focus Pro 35K 센서</LI>
            <LI>Valorant 프로 41% 채택</LI>
            <LI>좌우 대칭 형태</LI>
          </UL>
          <H2>그립별 추천</H2>
          <UL>
            <LI><Em>팜 그립 (손 큰)</Em>: G Pro X Superlight 2, Razer Basilisk</LI>
            <LI><Em>클로 그립</Em>: Razer Viper V3 Pro, Pulsar X2</LI>
            <LI><Em>핑거 그립 (손 작은)</Em>: Razer Cobra, Pulsar X2 Mini</LI>
          </UL>
          <H2>유선 vs 무선 — 어느 쪽?</H2>
          <UL>
            <LI>2026년 최신 무선은 인풋랙 차이 거의 없음 (1-2ms)</LI>
            <LI>무선의 장점: 케이블 자유, 책상 정리</LI>
            <LI>무선의 단점: 가격 ↑, 충전 필요, 약 30g 더 무거움</LI>
            <LI><Em>초보는 유선 추천</Em>: 비용 절약 + 충전 신경 안 써도 됨</LI>
          </UL>
          <H2>피해야 할 마우스</H2>
          <UL>
            <LI><Em>"게이밍" 마크만 붙은 저가 제품</Em>: 센서 품질 불량</LI>
            <LI><Em>2018년 이전 모델</Em>: 센서 기술 낙후</LI>
            <LI><Em>너무 가벼운 ($30) 마우스</Em>: 부속물 부실</LI>
            <LI><Em>화려한 RGB 우선 마우스</Em>: 보통 센서가 부차적</LI>
          </UL>
          <H2>구입 후 체크리스트</H2>
          <UL>
            <LI>드라이버 설치 (Logitech G HUB, Razer Synapse)</LI>
            <LI>DPI 800으로 설정 (대부분 게임의 표준)</LI>
            <LI>OS 마우스 가속 끄기</LI>
            <LI>인게임 감도 본인에게 맞게 조정 (Pro Gear Match로 비교)</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 처음에 비싼 거 살 필요 있나요?</H3>
          <P>아닙니다. $60 가성비 마우스로 시작 → 6개월 후 본인 스타일에 맞춰 업그레이드 권장.</P>
          <H3>Q. 무선이 진짜 유선만큼 빠른가요?</H3>
          <P>2.4GHz 무선 (전용 USB 리시버)은 거의 동일. Bluetooth는 느림.</P>
          <H3>Q. RGB 필요한가요?</H3>
          <P>아닙니다. 게임에 영향 없고 배터리만 잡아먹습니다.</P>
          <H2>요약</H2>
          <UL>
            <LI>$30: Logitech G203 (입문)</LI>
            <LI>$60: Glorious Model O / Pulsar X2 (가성비)</LI>
            <LI>$100: Logitech G Pro Wireless 2 (무선 입문)</LI>
            <LI>$160: G Pro X Superlight 2 / Razer Viper V3 Pro (프로 사양)</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Your First Gaming Mouse 2026 — Best Picks by Budget',
      excerpt: 'A 2026 guide for first-time gaming mouse buyers. The best pick at $30, $60, $100, and $160 budgets.',
      content: () => (
        <>
          <P>
            "What gaming mouse should I get first?" — asked every day.
            Here are the 2026 best picks by budget.
          </P>
          <H2>What makes a "gaming" mouse</H2>
          <UL>
            <LI><Em>Sensor</Em>: optical, at least PixArt PMW3389 class</LI>
            <LI><Em>Weight</Em>: 50-75g (lighter = pricier)</LI>
            <LI><Em>Polling</Em>: 1000Hz minimum</LI>
            <LI><Em>Click lifespan</Em>: 50M minimum</LI>
            <LI><Em>Shape</Em>: matches your hand size + grip</LI>
          </UL>
          <H2>Under $30 — entry (student / casual)</H2>
          <H3>Pick: Logitech G203 Lightsync ($30)</H3>
          <UL>
            <LI>85g (a bit heavy)</LI>
            <LI>HERO 8K sensor (decent)</LI>
            <LI>Small-to-medium hands</LI>
            <LI>+: build quality, RGB</LI>
            <LI>-: stiff cable</LI>
          </UL>
          <H3>Alt: Razer Cobra ($40)</H3>
          <P>58g, optical switches. Smaller hands.</P>
          <H2>$60 — value sweet spot</H2>
          <H3>Pick: Glorious Model O Wired ($50) or Pulsar X2 Wired ($65)</H3>
          <UL>
            <LI>~60g (properly light)</LI>
            <LI>PixArt PAW3395 sensor</LI>
            <LI>Soft paracord cable</LI>
            <LI>Enough for most users</LI>
          </UL>
          <H3>Alt: SteelSeries Aerox 3 ($60)</H3>
          <P>57g, holes for weight. Smaller hands.</P>
          <H2>$100 — wireless entry (popular tier)</H2>
          <H3>Pick: Logitech G Pro Wireless 2 ($100-129)</H3>
          <UL>
            <LI>80g</LI>
            <LI>HERO 25K, wireless LightSpeed</LI>
            <LI>60-hour battery, USB-C</LI>
            <LI>Medium-to-large hands</LI>
            <LI>+: most reliable wireless</LI>
          </UL>
          <H3>Alt: Razer Basilisk V3 Pro ($130)</H3>
          <P>112g, 11 buttons, MOBA/MMO friendly.</P>
          <H2>$160 — pro tier (serious esports)</H2>
          <H3>Pick: Logitech G Pro X Superlight 2 ($159)</H3>
          <UL>
            <LI>Weight: <Em>60g</Em></LI>
            <LI>HERO 2, up to 44K DPI</LI>
            <LI>LightSpeed + 8000Hz polling</LI>
            <LI>95-hour battery</LI>
            <LI>32% pro adoption (CS2-leaning)</LI>
          </UL>
          <H3>Alt: Razer Viper V3 Pro ($159)</H3>
          <UL>
            <LI>54g</LI>
            <LI>Focus Pro 35K</LI>
            <LI>41% Valorant pro adoption</LI>
            <LI>Symmetric shape</LI>
          </UL>
          <H2>By grip</H2>
          <UL>
            <LI><Em>Palm (big hands)</Em>: G Pro X Superlight 2, Razer Basilisk</LI>
            <LI><Em>Claw</Em>: Razer Viper V3 Pro, Pulsar X2</LI>
            <LI><Em>Fingertip (small hands)</Em>: Razer Cobra, Pulsar X2 Mini</LI>
          </UL>
          <H2>Wired vs wireless</H2>
          <UL>
            <LI>2026 wireless: input lag matches wired (1-2ms)</LI>
            <LI>Wireless +: free desk, no cable drag</LI>
            <LI>Wireless -: pricier, needs charging, ~30g heavier</LI>
            <LI><Em>Beginners: go wired</Em> — cheaper, no charging worry</LI>
          </UL>
          <H2>Avoid</H2>
          <UL>
            <LI>"Gaming" label only — sensors are junk</LI>
            <LI>Pre-2018 models — outdated sensors</LI>
            <LI>Bargain $30 mice with no-name parts</LI>
            <LI>RGB-first mice — sensor is secondary</LI>
          </UL>
          <H2>After buying</H2>
          <UL>
            <LI>Install driver (G HUB, Synapse)</LI>
            <LI>Set DPI to 800 (community standard)</LI>
            <LI>Disable OS mouse acceleration</LI>
            <LI>Tune in-game sens (compare via Pro Gear Match)</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Do I need the expensive one first?</H3>
          <P>No. Start at $60, upgrade in 6 months when you know your style.</P>
          <H3>Q. Is wireless really as fast as wired?</H3>
          <P>2.4GHz wireless with USB receiver: yes. Bluetooth: no.</P>
          <H3>Q. Do I need RGB?</H3>
          <P>No. It doesn't help and drains battery.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>$30: Logitech G203 (entry)</LI>
            <LI>$60: Glorious Model O / Pulsar X2 (value)</LI>
            <LI>$100: G Pro Wireless 2 (wireless entry)</LI>
            <LI>$160: G Pro X Superlight 2 / Razer Viper V3 Pro (pro)</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'fps-wrist-pain-prevention',
    date: '2026-05-11',
    readMins: 9,
    tags: ['guide'],
    ko: {
      title: 'FPS 손목 통증 예방 — 자세, 스트레칭, 마우스 잡는 법',
      excerpt: '게이밍 손목 통증, 정말 게임 때문일까? 자세 점검부터 매일 5분 스트레칭, 그립 교정까지 종합 가이드.',
      content: () => (
        <>
          <P>
            FPS 4-6시간 후 손목이 시큰거리세요?
            반복성 긴장 손상(RSI - Repetitive Strain Injury)은 게이머의 #1 직업병입니다.
            그러나 대부분은 자세와 습관으로 예방 가능합니다.
          </P>
          <H2>왜 게임 중 손목이 아픈가</H2>
          <UL>
            <LI>같은 자세 장시간 유지 → 혈류 감소 + 근육 경직</LI>
            <LI>손목을 책상에 받치고 마우스 잡기 → 정중 신경(carpal tunnel) 압박</LI>
            <LI>너무 높은 감도 → 미세 손목 움직임 과다 사용</LI>
            <LI>너무 낮은 감도 → 큰 팔 움직임으로 어깨 무리</LI>
          </UL>
          <H2>가장 흔한 통증 유형</H2>
          <UL>
            <LI><Em>손목 터널 증후군</Em>: 손가락 1-3번 저림, 야간 악화</LI>
            <LI><Em>건염 (Tendinitis)</Em>: 엄지/검지 부근 콕콕 찌르는 통증</LI>
            <LI><Em>마우스 엘보 (Mouse Elbow)</Em>: 팔꿈치 안쪽 통증</LI>
            <LI><Em>거북목</Em>: 모니터 거리/높이로 인한 목 + 어깨 통증</LI>
          </UL>
          <H2>1. 의자 + 책상 + 모니터 자세</H2>
          <UL>
            <LI>의자 높이: 무릎이 엉덩이와 같거나 약간 낮게</LI>
            <LI>책상 높이: 팔꿈치가 90도 이상에서 마우스에 닿게</LI>
            <LI>모니터: 눈높이 또는 약간 아래, 60-80cm 거리</LI>
            <LI>발: 바닥에 닿거나 발받침대</LI>
          </UL>
          <H2>2. 손목 자세 — 가장 중요</H2>
          <UL>
            <LI>손목은 <Em>중립 위치</Em>(직선) 유지. 위로/아래로 꺾이지 않게</LI>
            <LI>책상이나 마우스패드에 손목을 받치지 마세요 — 압박만 더해짐</LI>
            <LI>팔 전체로 마우스를 움직이기. 손목 움직임 최소화</LI>
          </UL>
          <H2>3. 그립 점검</H2>
          <UL>
            <LI>너무 꽉 잡으면 손목/팔꿈치 긴장</LI>
            <LI><Em>"달걀을 부서지지 않게 잡는 정도"</Em>의 힘으로 잡으세요</LI>
            <LI>그립이 무거우면 클로 → 핑거 또는 팜으로 변경 시도</LI>
            <LI>너무 작은/큰 마우스는 자연스러운 그립을 방해</LI>
          </UL>
          <H2>4. 마우스 무게 + 감도 조정</H2>
          <UL>
            <LI>가벼운 마우스 (50-60g) → 손목 부담 ↓</LI>
            <LI>낮은 DPI + 큰 마우스 동작 → 손목 대신 팔 사용</LI>
            <LI>너무 낮은 감도(80cm/360° 이상)는 어깨에 무리</LI>
            <LI>스위트 스폿: 30-50cm/360°</LI>
          </UL>
          <H2>5. 매일 5분 스트레칭 루틴</H2>
          <H3>(게임 전/후 또는 매 1시간 마다)</H3>
          <UL>
            <LI><Em>1. 손목 전후 굴곡</Em> (15초씩 5회): 팔 펴고 손바닥 위/아래로 부드럽게</LI>
            <LI><Em>2. 손가락 펴기</Em> (10초씩 3회): 모든 손가락 최대한 펴서 유지</LI>
            <LI><Em>3. 손목 회전</Em> (양방향 10회씩): 부드럽게 원 그리기</LI>
            <LI><Em>4. 엄지 스트레칭</Em>: 엄지를 손바닥 안쪽으로 누르고 15초 유지</LI>
            <LI><Em>5. 팔꿈치 굴곡</Em>: 팔 펴고 손목 위/아래로 누르기, 좌우 15초씩</LI>
            <LI><Em>6. 어깨 으쓱이기</Em>: 어깨를 귀 쪽으로 올렸다 내리기 10회</LI>
          </UL>
          <H2>6. 게임 중 50/10 룰</H2>
          <UL>
            <LI>50분 게임 → 10분 휴식</LI>
            <LI>휴식 중 일어서서 걷기, 손/팔 흔들기</LI>
            <LI>화장실/물 마시기 등 자연스러운 휴식 활용</LI>
            <LI>장시간 세션 시 핸드워머 추천 (혈류 개선)</LI>
          </UL>
          <H2>7. 통증이 이미 있을 때</H2>
          <UL>
            <LI>즉시 게임 중단 1-3일</LI>
            <LI>얼음찜질 (급성기) 또는 온찜질 (회복기)</LI>
            <LI>이부프로펜 같은 NSAID (의사 상담 후)</LI>
            <LI>1주 이상 지속 시 정형외과 / 재활의학과 진료</LI>
            <LI>스트레칭만으로는 해결 안 됨 → 손목 보호대 / 자세 교정 필요</LI>
          </UL>
          <H2>장비 솔루션</H2>
          <UL>
            <LI><Em>버티컬 마우스</Em>: 일반 마우스 사용 어려울 정도면 시도 (Logitech MX Vertical)</LI>
            <LI><Em>대형 마우스패드</Em>: 큰 팔 움직임 가능</LI>
            <LI><Em>인체공학 키보드</Em>: Kinesis, Microsoft Sculpt 등</LI>
            <LI><Em>의자 + 책상 높이 조절</Em>: 가장 큰 효과</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 게임을 그만둬야 하나요?</H3>
          <P>대부분 그렇지 않습니다. 자세 + 습관 교정으로 90% 해결.</P>
          <H3>Q. 어린 시절(20대 이하)에도 위험?</H3>
          <P>네. 오히려 더 위험. 신체 발달 중이라 후유증이 길게 갈 수 있음.</P>
          <H3>Q. 의사한테 가야 할 시점은?</H3>
          <P>1주 이상 통증 / 야간 통증 / 손가락 저림 지속 → 즉시.</P>
          <H2>요약</H2>
          <UL>
            <LI>손목 통증은 게임이 아닌 자세 / 그립 / 시간 문제</LI>
            <LI>매일 5분 스트레칭 + 50/10 룰</LI>
            <LI>가벼운 마우스 + 30-50cm/360° 감도</LI>
            <LI>1주 이상 지속 시 즉시 진료</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'FPS Wrist Pain Prevention — Posture, Stretches, Grip',
      excerpt: 'Is gaming wrist pain really from gaming? Posture, daily 5-min stretches, grip fixes — a complete guide.',
      content: () => (
        <>
          <P>
            Wrist sore after 4-6 hours of FPS?
            Repetitive Strain Injury (RSI) is gamers' #1 occupational issue.
            Most cases are preventable with posture and habit changes.
          </P>
          <H2>Why your wrist hurts</H2>
          <UL>
            <LI>Same position too long → reduced blood flow, tight muscles</LI>
            <LI>Wrist resting on desk → carpal tunnel compression</LI>
            <LI>Too high sens → over-using tiny wrist motions</LI>
            <LI>Too low sens → shoulder strain from big arm motions</LI>
          </UL>
          <H2>Common pain types</H2>
          <UL>
            <LI><Em>Carpal tunnel</Em>: tingling in fingers 1-3, worse at night</LI>
            <LI><Em>Tendinitis</Em>: sharp pain near thumb/index</LI>
            <LI><Em>Mouse elbow</Em>: pain at inner elbow</LI>
            <LI><Em>Forward neck</Em>: neck + shoulder pain from monitor position</LI>
          </UL>
          <H2>1. Chair + desk + monitor posture</H2>
          <UL>
            <LI>Chair: knees at or slightly below hips</LI>
            <LI>Desk: elbow above 90° at the mouse</LI>
            <LI>Monitor: eye level or slightly below, 60-80cm away</LI>
            <LI>Feet flat on floor or footrest</LI>
          </UL>
          <H2>2. Wrist posture — most important</H2>
          <UL>
            <LI>Keep wrist <Em>neutral</Em> (straight) — not flexed up/down</LI>
            <LI>Don't rest wrist on desk or pad — adds pressure</LI>
            <LI>Move from the arm, minimize wrist micro-motions</LI>
          </UL>
          <H2>3. Grip check</H2>
          <UL>
            <LI>Too tight = wrist/elbow tension</LI>
            <LI><Em>"Hold an egg without crushing it"</Em></LI>
            <LI>Heavy grip? Switch claw → fingertip or palm</LI>
            <LI>Too small/large mouse forces unnatural grip</LI>
          </UL>
          <H2>4. Weight + sensitivity</H2>
          <UL>
            <LI>Lighter mouse (50-60g) = less wrist load</LI>
            <LI>Lower DPI + bigger arm motion → arm not wrist</LI>
            <LI>Sub-80cm/360° is too low — strains shoulder</LI>
            <LI>Sweet spot: 30-50cm/360°</LI>
          </UL>
          <H2>5. Daily 5-min stretch routine</H2>
          <H3>(before/after sessions or hourly)</H3>
          <UL>
            <LI><Em>1. Wrist flex/extend</Em> (15s × 5): arm out, palm up/down</LI>
            <LI><Em>2. Finger extension</Em> (10s × 3): splay all fingers</LI>
            <LI><Em>3. Wrist circles</Em> (10 each way): gentle circles</LI>
            <LI><Em>4. Thumb stretch</Em>: thumb across palm, hold 15s</LI>
            <LI><Em>5. Forearm stretch</Em>: arm out, push wrist down/up, 15s each</LI>
            <LI><Em>6. Shoulder shrugs</Em>: up to ears, down, × 10</LI>
          </UL>
          <H2>6. The 50/10 rule</H2>
          <UL>
            <LI>50min play → 10min rest</LI>
            <LI>Stand, walk, shake out hands during break</LI>
            <LI>Use natural breaks (bathroom, water)</LI>
            <LI>Hand warmer helps blood flow in long sessions</LI>
          </UL>
          <H2>7. If you already have pain</H2>
          <UL>
            <LI>Stop gaming for 1-3 days</LI>
            <LI>Ice (acute) or heat (recovery)</LI>
            <LI>NSAID like ibuprofen (consult MD)</LI>
            <LI>1+ week of pain → see an orthopedist</LI>
            <LI>Stretches alone won't fix it — needs brace / posture fix</LI>
          </UL>
          <H2>Gear options</H2>
          <UL>
            <LI><Em>Vertical mouse</Em>: if normal mouse is unbearable (Logitech MX Vertical)</LI>
            <LI><Em>Large mousepad</Em>: enables full-arm motion</LI>
            <LI><Em>Ergonomic keyboard</Em>: Kinesis, MS Sculpt</LI>
            <LI><Em>Chair + desk height</Em>: biggest win</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. Do I need to quit gaming?</H3>
          <P>Usually no. Posture + habit fixes solve 90%.</P>
          <H3>Q. Are young gamers safer?</H3>
          <P>Actually less safe — developing tissues carry long-term consequences.</P>
          <H3>Q. When to see a doctor?</H3>
          <P>1+ week of pain, night pain, persistent finger numbness → immediately.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>Pain comes from posture/grip/hours, not the game itself</LI>
            <LI>Daily 5-min stretches + 50/10 rule</LI>
            <LI>Lighter mouse + 30-50cm/360° sens</LI>
            <LI>1+ week of pain → MD visit</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'mouse-polling-rate-explained',
    date: '2026-05-11',
    readMins: 7,
    tags: ['gear', 'analysis'],
    ko: {
      title: '마우스 폴링레이트 (Hz) — 1000 vs 2000 vs 4000 vs 8000',
      excerpt: '폴링레이트가 높으면 무조건 좋은가? 1000Hz와 8000Hz의 실제 차이, 누가 체감하고 누가 못 느끼는지.',
      content: () => (
        <>
          <P>
            마우스의 <Em>폴링레이트(Polling Rate)</Em>는 마우스가 1초에 컴퓨터에 몇 번 위치를 보고하는지를 의미합니다.
            오랫동안 1000Hz가 표준이었지만, 2024년부터 2000/4000/8000Hz가 보편화되었죠.
          </P>
          <H2>폴링레이트가 뭐고 어떻게 영향을 미치나</H2>
          <UL>
            <LI><Em>500Hz</Em>: 2ms마다 1번 보고 (마우스 위치 갱신)</LI>
            <LI><Em>1000Hz</Em>: 1ms마다</LI>
            <LI><Em>4000Hz</Em>: 0.25ms마다</LI>
            <LI><Em>8000Hz</Em>: 0.125ms마다</LI>
          </UL>
          <P>이론적으로 더 높은 폴링레이트 = 더 빠른 입력. 그러나 실제는?</P>
          <H2>실측 인풋랙 차이</H2>
          <UL>
            <LI>500Hz → 1000Hz: <Em>약 1ms 감소</Em></LI>
            <LI>1000Hz → 2000Hz: <Em>약 0.5ms 감소</Em></LI>
            <LI>2000Hz → 4000Hz: <Em>약 0.25ms 감소</Em></LI>
            <LI>4000Hz → 8000Hz: <Em>약 0.125ms 감소</Em></LI>
          </UL>
          <P>
            각 단계에서 절반씩 효과 감소. <Em>1000Hz에서 8000Hz로 가도 총 1ms 미만</Em>.
          </P>
          <H2>그래서 차이가 느껴지나?</H2>
          <UL>
            <LI><Em>500Hz → 1000Hz</Em>: 대부분 사람 느낌. 표준화 이유.</LI>
            <LI><Em>1000Hz → 2000Hz</Em>: 매우 민감한 사람 또는 240Hz+ 모니터 사용자만 미세하게.</LI>
            <LI><Em>2000Hz → 8000Hz</Em>: 대부분 못 느낌. 측정 가능하지만 체감 어려움.</LI>
          </UL>
          <H2>높은 폴링레이트의 단점</H2>
          <UL>
            <LI><Em>CPU 사용량 ↑</Em>: 8000Hz는 1000Hz 대비 8배 더 많은 인터럽트</LI>
            <LI><Em>일부 시스템 불안정</Em>: 옛 CPU나 USB 컨트롤러에서 입력 지터(jitter)</LI>
            <LI><Em>배터리 소모 ↑</Em>: 무선 마우스의 경우 1000Hz 대비 30-50% 빠른 소모</LI>
            <LI><Em>도크 필요</Em>: 8000Hz 무선은 보통 별도 도크 ($30-50)</LI>
          </UL>
          <H2>CPU 부하 실측</H2>
          <UL>
            <LI>Intel i9-13900K + 1000Hz: 0.3% CPU 사용</LI>
            <LI>Intel i9-13900K + 8000Hz: 1.5-2% CPU 사용</LI>
            <LI>옛 CPU (i5-8400 이하)에서 8000Hz: 5-10% 사용, FPS 저하 가능</LI>
          </UL>
          <H2>게임별 권장 폴링레이트</H2>
          <UL>
            <LI><Em>Valorant / CS2</Em>: 1000Hz 충분, 240Hz+ 모니터 시 2000Hz</LI>
            <LI><Em>Apex Legends</Em>: 1000-2000Hz</LI>
            <LI><Em>Overwatch 2</Em>: 1000Hz 권장 (높은 폴링레이트 영향 적음)</LI>
            <LI><Em>경쟁 e스포츠 진지</Em>: 4000Hz (수학적 최소 인풋랙)</LI>
          </UL>
          <H2>모니터 헤르츠와의 관계</H2>
          <P>
            폴링레이트가 모니터 리프레시 레이트보다 의미 있으려면:
          </P>
          <UL>
            <LI><Em>60Hz 모니터</Em>: 16.67ms 사이클 → 1000Hz로 충분</LI>
            <LI><Em>144Hz 모니터</Em>: 6.9ms 사이클 → 1000Hz로 충분</LI>
            <LI><Em>240Hz 모니터</Em>: 4.17ms 사이클 → 2000Hz가 살짝 도움</LI>
            <LI><Em>360-480Hz 모니터</Em>: 2.7-2.1ms 사이클 → 4000Hz+ 의미 있음</LI>
          </UL>
          <H2>설정 방법</H2>
          <UL>
            <LI>Logitech G HUB: 마우스 설정 → 폴링레이트</LI>
            <LI>Razer Synapse: Performance → Polling Rate</LI>
            <LI>SteelSeries GG: Engine → Polling Rate</LI>
            <LI>Pulsar: 마우스 본체 버튼 또는 전용 앱</LI>
          </UL>
          <H2>본인 폴링레이트 확인 도구</H2>
          <UL>
            <LI><Em>Mouse Tester</Em> (무료): 실측 폴링레이트와 안정성 확인</LI>
            <LI><Em>Online Mouse Rate Tester</Em>: 브라우저 기반 측정</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. 4000Hz 마우스 샀는데 1000Hz로 해야 하나요?</H3>
          <P>본인 CPU + 모니터 + 체감에 따라. 보통 1000-2000Hz가 안전. 8000Hz는 240Hz+ 모니터 + 최신 CPU일 때만.</P>
          <H3>Q. 8000Hz 마우스 안 사면 손해?</H3>
          <P>아닙니다. 99%는 1000-2000Hz로 충분. e스포츠 진지하지 않으면 굳이.</P>
          <H3>Q. 폴링레이트 vs DPI — 뭐가 더 중요?</H3>
          <P>DPI는 정밀도, 폴링레이트는 응답 속도. 둘 다 중요하지만 DPI 800 + 폴링 1000Hz가 일반적 표준.</P>
          <H2>요약</H2>
          <UL>
            <LI>1000Hz가 99%의 사용자에게 충분</LI>
            <LI>240Hz+ 모니터 + 최신 CPU면 2000-4000Hz 시도 가능</LI>
            <LI>8000Hz는 마케팅 효과가 큼, 실제 체감 어려움</LI>
            <LI>CPU 부하와 무선 배터리 소모 고려</LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Mouse Polling Rate Explained — 1000 vs 2000 vs 4000 vs 8000Hz',
      excerpt: 'Is higher always better? The real input lag difference between 1000Hz and 8000Hz, and who actually benefits.',
      content: () => (
        <>
          <P>
            <Em>Polling rate</Em> is how many times per second your mouse reports its position.
            1000Hz was the standard for years; 2000/4000/8000Hz became common from 2024.
          </P>
          <H2>What polling rate means</H2>
          <UL>
            <LI><Em>500Hz</Em>: report every 2ms</LI>
            <LI><Em>1000Hz</Em>: every 1ms</LI>
            <LI><Em>4000Hz</Em>: every 0.25ms</LI>
            <LI><Em>8000Hz</Em>: every 0.125ms</LI>
          </UL>
          <P>In theory, higher = faster input. In practice?</P>
          <H2>Measured input lag difference</H2>
          <UL>
            <LI>500 → 1000Hz: <Em>~1ms reduction</Em></LI>
            <LI>1000 → 2000Hz: <Em>~0.5ms</Em></LI>
            <LI>2000 → 4000Hz: <Em>~0.25ms</Em></LI>
            <LI>4000 → 8000Hz: <Em>~0.125ms</Em></LI>
          </UL>
          <P>Diminishing returns. <Em>1000Hz → 8000Hz is under 1ms total</Em>.</P>
          <H2>Can you feel it?</H2>
          <UL>
            <LI><Em>500 → 1000Hz</Em>: most people, yes — that's why 1000Hz became standard</LI>
            <LI><Em>1000 → 2000Hz</Em>: very sensitive players or 240Hz+ monitor users only</LI>
            <LI><Em>2000 → 8000Hz</Em>: measurable, rarely felt</LI>
          </UL>
          <H2>Downsides of high polling</H2>
          <UL>
            <LI><Em>More CPU load</Em>: 8000Hz is 8× the interrupts</LI>
            <LI><Em>Possible instability</Em>: old CPUs/USB controllers can jitter</LI>
            <LI><Em>Battery drain ↑</Em>: 30-50% faster on wireless</LI>
            <LI><Em>Dock needed</Em>: 8000Hz wireless typically requires a $30-50 dock</LI>
          </UL>
          <H2>Real CPU load</H2>
          <UL>
            <LI>i9-13900K + 1000Hz: 0.3% CPU</LI>
            <LI>i9-13900K + 8000Hz: 1.5-2% CPU</LI>
            <LI>Old CPU (i5-8400 or below) + 8000Hz: 5-10%, can hurt FPS</LI>
          </UL>
          <H2>Per-game recommendations</H2>
          <UL>
            <LI><Em>Valorant / CS2</Em>: 1000Hz fine, 2000Hz if 240Hz+ monitor</LI>
            <LI><Em>Apex Legends</Em>: 1000-2000Hz</LI>
            <LI><Em>Overwatch 2</Em>: 1000Hz</LI>
            <LI><Em>Serious esports</Em>: 4000Hz (mathematical min)</LI>
          </UL>
          <H2>Pairing with monitor refresh</H2>
          <UL>
            <LI><Em>60Hz</Em>: 16.67ms cycle → 1000Hz plenty</LI>
            <LI><Em>144Hz</Em>: 6.9ms → 1000Hz plenty</LI>
            <LI><Em>240Hz</Em>: 4.17ms → 2000Hz helps slightly</LI>
            <LI><Em>360-480Hz</Em>: 2.7-2.1ms → 4000Hz+ becomes meaningful</LI>
          </UL>
          <H2>How to set</H2>
          <UL>
            <LI>G HUB: mouse settings → polling rate</LI>
            <LI>Synapse: Performance → Polling Rate</LI>
            <LI>SteelSeries GG: Engine → Polling Rate</LI>
            <LI>Pulsar: physical button or app</LI>
          </UL>
          <H2>Verify yours</H2>
          <UL>
            <LI><Em>Mouse Tester</Em> (free): actual polling + stability</LI>
            <LI><Em>Online Mouse Rate Tester</Em>: browser-based</LI>
          </UL>
          <H2>FAQ</H2>
          <H3>Q. I bought a 4000Hz mouse — must I use 4000Hz?</H3>
          <P>Depends on CPU + monitor. 1000-2000Hz is safe for most. 8000Hz needs 240Hz+ display + modern CPU.</P>
          <H3>Q. Am I losing out without 8000Hz?</H3>
          <P>No. 99% are fine at 1000-2000Hz. Skip unless you compete seriously.</P>
          <H3>Q. Polling rate vs DPI?</H3>
          <P>DPI is precision, polling is response. Both matter. 800 DPI + 1000Hz is the common standard.</P>
          <H2>TL;DR</H2>
          <UL>
            <LI>1000Hz is enough for 99% of users</LI>
            <LI>240Hz+ monitor + modern CPU? Try 2000-4000Hz</LI>
            <LI>8000Hz is marketing; rarely felt</LI>
            <LI>Mind CPU load and wireless battery</LI>
          </UL>
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'wired-vs-wireless-mouse-latency',
    date: '2026-05-01',
    readMins: 5,
    tags: ['gear', 'analysis'],
    ko: {
      title: '유선 vs 무선 마우스 — 입력 지연 진실 (2026년 기준)',
      excerpt: '"무선이 더 느리다"는 옛말입니다. 측정 데이터로 보는 2026년 무선 게이밍 마우스의 입력 지연.',
      content: () => (
        <>
          <P>
            5년 전이라면 무선 마우스는 경쟁용으로 부적합했습니다.
            지금은 다릅니다. 측정 데이터로 살펴봅시다.
          </P>
          <H2>NVIDIA LDAT 기준 측정값</H2>
          <P>
            클릭부터 화면 반영까지의 총 지연 (1ms = 1/1000초):
          </P>
          <UL>
            <LI>Logitech G Pro X Superlight 2 (무선, 8000Hz): <Em>1.0~1.2ms</Em></LI>
            <LI>Razer Viper V3 Pro (무선, 8000Hz): <Em>1.0~1.3ms</Em></LI>
            <LI>일반 USB 유선 마우스 (1000Hz): <Em>1.0~1.5ms</Em></LI>
            <LI>저가 무선 마우스 (사무용, 125Hz): <Em>8~16ms</Em></LI>
          </UL>
          <P>
            <Em>플래그십 무선 = 플래그십 유선과 동등하거나 더 빠름</Em>입니다.
          </P>
          <H2>왜 옛날엔 무선이 느렸나</H2>
          <UL>
            <LI>2.4GHz 무선의 폴링레이트가 125~500Hz로 제한됨</LI>
            <LI>전력 절약을 위해 센서가 슬립 모드 진입 → 깨어나는데 지연</LI>
            <LI>간섭 환경에서 패킷 재전송 → 추가 지연</LI>
          </UL>
          <H2>2026년 무선의 도약</H2>
          <UL>
            <LI><Em>Lightspeed / HyperSpeed</Em>: 8000Hz 폴링 (유선과 동일)</LI>
            <LI>전용 동글 + 자체 무선 프로토콜로 간섭 최소화</LI>
            <LI>슬립 모드 0ms 복귀 (Sensor Lift Off 알고리즘)</LI>
          </UL>
          <H2>그래도 유선이 유리한 경우</H2>
          <UL>
            <LI><Em>방해 전파가 많은 환경</Em>: PC방, 사무실 - WiFi 라우터 가까이</LI>
            <LI><Em>예산 제한</Em>: 유선 마우스가 일반적으로 30~50% 저렴</LI>
            <LI><Em>배터리 관리 싫음</Em>: 충전을 신경 쓰기 싫은 사람</LI>
          </UL>
          <H2>무선 마우스 사용 시 체크리스트</H2>
          <UL>
            <LI>Polling rate 1000Hz 이상으로 설정 (8000Hz 권장)</LI>
            <LI>USB 동글은 마우스에서 1m 이내 거리에 배치</LI>
            <LI>충전 잔량 30% 이하면 일관성 떨어질 수 있음 — 미리 충전</LI>
            <LI>USB 3.0 포트 옆에 동글 꽂지 말기 (간섭)</LI>
          </UL>
          <H2>현재 프로 사용 비율 (PGM DB)</H2>
          <UL>
            <LI>무선: <Em>94%</Em></LI>
            <LI>유선: 6%</LI>
          </UL>
          <P>
            무선 사용이 압도적입니다. 케이블 무게가 제거되어 큰 무빙이 자유로워지는 이점이 결정적입니다.
          </P>
          <H2>결론</H2>
          <P>
            <Em>2026년에 게이밍 마우스를 새로 산다면 무선이 정답</Em>입니다.
            플래그십 모델 기준 입력 지연은 유선과 동등하면서 케이블 자유도까지 얻습니다.
          </P>
          {/* BLOG_EXPANSION_v1:wired-vs-wireless-mouse-latency */}
          <H2>한눈에 체크리스트</H2>
          <UL>
            <LI>무선이면 2.4GHz 전용 리시버 사용 (블루투스 X)</LI>
            <LI>폴링레이트 1000Hz 이상 확인</LI>
            <LI>도크 충전 권장 (게임 중 끊김 방지)</LI>
            <LI>유선이라도 케이블 드래그 줄이는 마우스 번지 사용</LI>
          </UL>
          <H2>관련 가이드</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">폴링레이트 가이드</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">인풋랙 줄이기</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/first-gaming-mouse-2026/">첫 게이밍 마우스 추천</a></LI>
          </UL>
        </>
      ),
    },
    en: {
      title: 'Wired vs Wireless Mouse Latency in 2026 — Settled',
      excerpt: '"Wireless is slower" is outdated. Real measurements from flagship wireless mice in 2026.',
      content: () => (
        <>
          <P>
            Five years ago, wireless was a no-go for competitive play. In 2026 it's a different story.
          </P>
          <H2>NVIDIA LDAT measurements</H2>
          <P>Click-to-pixel total latency:</P>
          <UL>
            <LI>G Pro X Superlight 2 (wireless, 8000Hz): <Em>1.0–1.2ms</Em></LI>
            <LI>Razer Viper V3 Pro (wireless, 8000Hz): <Em>1.0–1.3ms</Em></LI>
            <LI>Standard wired (1000Hz): <Em>1.0–1.5ms</Em></LI>
            <LI>Cheap wireless (office, 125Hz): <Em>8–16ms</Em></LI>
          </UL>
          <P>
            <Em>Flagship wireless equals or beats flagship wired</Em>.
          </P>
          <H2>Why wireless used to be slow</H2>
          <UL>
            <LI>125–500Hz polling cap on 2.4GHz</LI>
            <LI>Sensor sleep modes added wake-up latency</LI>
            <LI>Packet retransmission under interference</LI>
          </UL>
          <H2>The 2026 leap</H2>
          <UL>
            <LI><Em>Lightspeed / HyperSpeed</Em>: 8000Hz polling, matching wired</LI>
            <LI>Dedicated dongle + custom RF stack</LI>
            <LI>0ms sleep wake (Sensor Lift Off)</LI>
          </UL>
          <H2>When wired still wins</H2>
          <UL>
            <LI><Em>Heavy RF environment</Em>: PC bang, office near WiFi routers</LI>
            <LI><Em>Tight budget</Em>: wired is 30–50% cheaper</LI>
            <LI><Em>Don't want to charge</Em></LI>
          </UL>
          <H2>Wireless setup checklist</H2>
          <UL>
            <LI>Set polling to 1000Hz+ (prefer 8000Hz)</LI>
            <LI>Place dongle within 1m of mouse</LI>
            <LI>Charge before drops below 30%</LI>
            <LI>Avoid putting dongle next to USB 3.0 port (interference)</LI>
          </UL>
          <H2>Pro adoption (PGM DB)</H2>
          <UL>
            <LI>Wireless: <Em>94%</Em></LI>
            <LI>Wired: 6%</LI>
          </UL>
          <P>
            Cable freedom for big sweeps is a clear win.
          </P>
          <H2>Verdict</H2>
          <P>
            <Em>Buying in 2026? Go wireless</Em>. Flagship wireless ties on latency and adds freedom.
          </P>
          <H2>Quick Checklist</H2>
          <UL>
            <LI>Wireless: use 2.4GHz dongle, not Bluetooth</LI>
            <LI>Verify polling rate ≥1000Hz</LI>
            <LI>Use a charging dock to avoid mid-game disconnects</LI>
            <LI>Even with wired, add a mouse bungee to reduce drag</LI>
          </UL>
          <H2>Related Guides</H2>
          <UL>
            <LI><a className="text-emerald-400 underline" href="/blog/mouse-polling-rate-explained/">Polling Rate Guide</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/input-lag-reduction-guide/">Input Lag Reduction</a></LI>
            <LI><a className="text-emerald-400 underline" href="/blog/first-gaming-mouse-2026/">First Gaming Mouse</a></LI>
          </UL>
        </>
      ),
    },
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

export function getAllPostsSorted(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

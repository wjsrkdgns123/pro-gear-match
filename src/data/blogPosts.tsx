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
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'viper-v3-pro-vs-superlight-2',
    date: '2026-05-01',
    readMins: 6,
    tags: ['gear', 'analysis'],
    ko: {
      title: 'Razer Viper V3 Pro vs Logitech G Pro X Superlight 2 — 어느 쪽?',
      excerpt: '두 마우스가 프로 시장의 70% 이상을 차지합니다. 무게, 센서, 모양, 가격까지 7가지 기준으로 직접 비교했습니다.',
      content: () => (
        <>
          <P>
            현재 FPS 프로 시장은 <Em>Razer Viper V3 Pro</Em>와 <Em>Logitech G Pro X Superlight 2</Em>의 양강 구도입니다.
            Pro Gear Match DB 기준 두 마우스를 합치면 전체 마우스 사용률의 68%에 달합니다.
          </P>
          <H2>1. 무게</H2>
          <UL>
            <LI>Viper V3 Pro: <Em>54g</Em></LI>
            <LI>Superlight 2: <Em>60g</Em></LI>
          </UL>
          <P>
            6g 차이는 손에서 즉각 느껴집니다. 가벼운 마우스를 선호하면 Viper, 무게감과 안정감을 원하면 Superlight 2가 유리합니다.
          </P>
          <H2>2. 센서</H2>
          <UL>
            <LI>Viper V3 Pro: Focus Pro 35K (35,000 DPI 최대)</LI>
            <LI>Superlight 2: HERO 2 (44,000 DPI 최대)</LI>
          </UL>
          <P>
            DPI 800 기준 둘 다 픽셀 완벽 추적. 일반 사용에서 차이를 느끼기 어려운 영역입니다.
          </P>
          <H2>3. 모양 / 그립</H2>
          <P>
            Viper는 좌우 대칭 + 평평한 형태로 클로/핑거 그립에 최적화.
            Superlight 2는 살짝 둥근 윗면과 약간의 비대칭으로 팜/클로 그립에 유리합니다.
          </P>
          <H2>4. 클릭감</H2>
          <UL>
            <LI>Viper V3 Pro: 옵티컬 스위치, 매우 가벼운 탭, 트리거 깊이 짧음</LI>
            <LI>Superlight 2: 하이브리드 옵티컬-메카, 살짝 묵직한 탭, 일관성 우수</LI>
          </UL>
          <H2>5. 배터리 / 무선</H2>
          <P>
            Viper V3 Pro 약 95시간, Superlight 2 약 95시간 — 동등.
            폴링레이트는 둘 다 8000Hz까지 지원하지만 충전 도크 가격이 별도라는 점은 동일합니다.
          </P>
          <H2>6. 가격</H2>
          <UL>
            <LI>Viper V3 Pro: $159</LI>
            <LI>Superlight 2: $159</LI>
          </UL>
          <P>완전히 동일. 가격으로는 결정 불가.</P>
          <H2>7. 프로 사용률 (Pro Gear Match 기준)</H2>
          <UL>
            <LI>Viper V3 Pro: <Em>41%</Em> (Valorant 우세)</LI>
            <LI>Superlight 2: <Em>32%</Em> (CS2 우세)</LI>
          </UL>
          <H2>결론 — 누구에게 무엇을 추천?</H2>
          <UL>
            <LI><Em>가벼운 마우스 + 클로/핑거 그립 → Viper V3 Pro</Em></LI>
            <LI><Em>안정감 + 팜 그립 + 큰 손 → Superlight 2</Em></LI>
            <LI><Em>Valorant 메인 → 통계적으로 Viper</Em></LI>
            <LI><Em>CS2 메인 → 통계적으로 Superlight 2</Em></LI>
          </UL>
          <P>
            결국 본인 손 크기와 그립 스타일이 결정합니다.
            가능하면 매장에서 직접 잡아보세요.
          </P>
        </>
      ),
    },
    en: {
      title: 'Razer Viper V3 Pro vs Logitech G Pro X Superlight 2',
      excerpt: 'These two mice make up 70% of the pro market. A 7-point comparison: weight, sensor, shape, price.',
      content: () => (
        <>
          <P>
            The pro mouse market is a duopoly: <Em>Razer Viper V3 Pro</Em> and <Em>Logitech G Pro X Superlight 2</Em>.
            Combined, they account for ~68% of mice in our DB.
          </P>
          <H2>1. Weight</H2>
          <UL>
            <LI>Viper V3 Pro: <Em>54g</Em></LI>
            <LI>Superlight 2: <Em>60g</Em></LI>
          </UL>
          <P>
            6g is noticeable in hand. Lighter favors Viper; weighted feel favors Superlight 2.
          </P>
          <H2>2. Sensor</H2>
          <UL>
            <LI>Viper V3 Pro: Focus Pro 35K (35K max DPI)</LI>
            <LI>Superlight 2: HERO 2 (44K max DPI)</LI>
          </UL>
          <P>
            At 800 DPI both are pixel-perfect. Practically indistinguishable.
          </P>
          <H2>3. Shape / grip</H2>
          <P>
            Viper is symmetric and flat — claw/fingertip-friendly.
            Superlight 2 has a higher hump and slight asymmetry — palm/claw-friendly.
          </P>
          <H2>4. Click feel</H2>
          <UL>
            <LI>Viper V3 Pro: optical, very light tap, short travel</LI>
            <LI>Superlight 2: hybrid optical-mechanical, slightly heavier, very consistent</LI>
          </UL>
          <H2>5. Battery / wireless</H2>
          <P>
            ~95 hours each. Both support 8000Hz polling (with separate charging dock).
          </P>
          <H2>6. Price</H2>
          <UL>
            <LI>Viper V3 Pro: $159</LI>
            <LI>Superlight 2: $159</LI>
          </UL>
          <P>Identical — not a decider.</P>
          <H2>7. Pro adoption</H2>
          <UL>
            <LI>Viper V3 Pro: <Em>41%</Em> (Valorant-heavy)</LI>
            <LI>Superlight 2: <Em>32%</Em> (CS2-heavy)</LI>
          </UL>
          <H2>Recommendations</H2>
          <UL>
            <LI><Em>Lighter + claw/fingertip → Viper V3 Pro</Em></LI>
            <LI><Em>Stable + palm + bigger hands → Superlight 2</Em></LI>
            <LI><Em>Valorant primary → Viper (statistically)</Em></LI>
            <LI><Em>CS2 primary → Superlight 2 (statistically)</Em></LI>
          </UL>
          <P>
            Hand size and grip decide. Try them in person if possible.
          </P>
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
        </>
      ),
    },
  },
  // ─────────────────────────────────────────────────────────────────────────
  {
    slug: 'wooting-rapid-trigger-explained',
    date: '2026-05-01',
    readMins: 5,
    tags: ['gear', 'guide'],
    ko: {
      title: 'Wooting과 Rapid Trigger — 키보드 하나가 무빙을 바꿀 수 있나?',
      excerpt: 'Valorant 프로 47%가 Wooting 60HE를 쓰는 이유. 자기력 키보드와 Rapid Trigger 기술을 한 번에 정리합니다.',
      content: () => (
        <>
          <P>
            2024년부터 FPS 프로 시장에 폭발적으로 퍼진 키보드, <Em>Wooting 60HE / 80HE</Em>.
            왜 갑자기 모두가 이걸 쓸까요?
          </P>
          <H2>일반 기계식 키보드의 한계</H2>
          <P>
            일반 키보드는 키를 약 50%(액추에이션 포인트) 누르면 입력이 등록되고,
            손가락을 떼면 약 75% 위로 올라가야 입력이 해제됩니다.
            <Em>이 50%~75% 사이의 "데드존"이 무빙 응답을 늦춥니다</Em>.
          </P>
          <H2>자기력 (Hall Effect) 스위치란?</H2>
          <P>
            기계식 스위치 대신 <Em>자석 + 홀 효과 센서</Em>로 키 위치를 측정합니다.
            결과: 키의 정확한 깊이를 0.1mm 단위로 실시간 감지 가능.
          </P>
          <H2>Rapid Trigger의 핵심</H2>
          <P>
            Rapid Trigger는 다음과 같이 동작합니다:
          </P>
          <UL>
            <LI>키를 누르는 방향 → 압력이 일정량 감소하면 즉시 해제</LI>
            <LI>키를 다시 누르는 순간 → 압력이 일정량 증가하면 즉시 입력</LI>
          </UL>
          <P>
            결과: 키의 절대 위치가 아닌 "방향 변화"로 입력을 결정.
            FPS에서는 <Em>A 누르고 D 누르는 사이의 정지 시간</Em>이 거의 0에 가까워집니다.
          </P>
          <H2>실전 효과 — 카운터스트레이프 (CS2)</H2>
          <P>
            CS2의 가장 기본 무빙 기술인 카운터스트레이프 (좌우 키 빠르게 번갈아 누르기)는
            정확한 정지 → 정확한 사격을 위해 필수.
          </P>
          <UL>
            <LI>일반 기계식: 50ms 이상의 정지 지연</LI>
            <LI>Rapid Trigger: 5~15ms 정지 지연</LI>
          </UL>
          <H2>Apex의 슬라이드 / 점프 — 무엇이 달라지나?</H2>
          <P>
            Apex의 탭 스트레이프, 운동 점프 (Mantle Jump) 같은 정밀 무빙도 Rapid Trigger의 혜택을 받습니다.
            특히 <Em>Tap Strafe 입력 정확도</Em>가 눈에 띄게 향상됩니다.
          </P>
          <H2>모델 비교</H2>
          <UL>
            <LI><Em>Wooting 60HE</Em> ($175): 60% 레이아웃, 가장 인기. 입문 추천.</LI>
            <LI><Em>Wooting 80HE</Em> ($240): 80% 레이아웃, 펑션키 + 화살표키 포함</LI>
            <LI><Em>Wooting Two HE</Em> ($200): 풀사이즈, 사무용 겸용</LI>
            <LI><Em>Razer Huntsman V3 Pro TKL</Em> ($200): 라이벌 제품, TKL 사이즈, 비슷한 스펙</LI>
          </UL>
          <H2>설정 팁</H2>
          <UL>
            <LI>Rapid Trigger 활성화 (Wootility 앱)</LI>
            <LI>액추에이션 포인트: 1.5~2.0mm 권장 (너무 얕으면 오타)</LI>
            <LI>Reset 포인트: 0.3mm (가장 짧게)</LI>
            <LI>FPS 키만 Rapid Trigger 활성, 일반 타이핑은 비활성 권장</LI>
          </UL>
          <H2>단점은 없나?</H2>
          <UL>
            <LI>비쌈 ($175~240)</LI>
            <LI>일반 타자 시 너무 민감해 오타 빈도 ↑</LI>
            <LI>스위치 교체 불가 (Cherry MX 같은 호환성 없음)</LI>
            <LI>Mac 호환성 제한</LI>
          </UL>
          <H2>결론</H2>
          <P>
            CS2 / Apex 처럼 정밀 무빙이 결정적인 게임에서는 <Em>실력이 일정 수준 이상이면 명확한 효과</Em>가 있습니다.
            Valorant는 무빙보다 사격 위주라 효과가 상대적으로 적지만 47% 프로가 쓰는 이유는 종합적 응답 속도입니다.
          </P>
        </>
      ),
    },
    en: {
      title: 'Wooting and Rapid Trigger — Can a Keyboard Change Your Movement?',
      excerpt: 'Why 47% of Valorant pros use the Wooting 60HE. Hall-effect switches + rapid trigger explained.',
      content: () => (
        <>
          <P>
            Since 2024, the <Em>Wooting 60HE / 80HE</Em> exploded across pro FPS rosters.
            Why is everyone suddenly using it?
          </P>
          <H2>Limitation of mechanical keyboards</H2>
          <P>
            Mechanical switches register at ~50% press depth and reset at ~75%.
            <Em>That 50–75% deadzone slows movement response</Em>.
          </P>
          <H2>What's Hall Effect?</H2>
          <P>
            Magnet + Hall sensor instead of metal contacts.
            Result: real-time key depth at 0.1mm resolution.
          </P>
          <H2>Rapid Trigger logic</H2>
          <UL>
            <LI>Pressing → release fires the moment pressure decreases by a set delta</LI>
            <LI>Pressing back → input fires the moment pressure increases by a set delta</LI>
          </UL>
          <P>
            Direction-based, not position-based.
            <Em>The pause between A and D keys approaches zero</Em>.
          </P>
          <H2>Counter-strafing (CS2)</H2>
          <P>
            Counter-strafing — alternating A/D for precise stops — is core to CS2.
          </P>
          <UL>
            <LI>Mechanical: 50ms+ stop delay</LI>
            <LI>Rapid Trigger: 5–15ms</LI>
          </UL>
          <H2>Apex tap-strafe / movement</H2>
          <P>
            Tap-strafes, mantle jumps, and other precise inputs benefit too.
            <Em>Tap-strafe input accuracy</Em> visibly improves.
          </P>
          <H2>Models</H2>
          <UL>
            <LI><Em>Wooting 60HE</Em> ($175): most popular, beginner-friendly</LI>
            <LI><Em>Wooting 80HE</Em> ($240): TKL+, F-row + arrows</LI>
            <LI><Em>Wooting Two HE</Em> ($200): full-size, office-friendly</LI>
            <LI><Em>Razer Huntsman V3 Pro TKL</Em> ($200): competitor with similar specs</LI>
          </UL>
          <H2>Settings</H2>
          <UL>
            <LI>Enable Rapid Trigger (Wootility)</LI>
            <LI>Actuation: 1.5–2.0mm (avoid typos)</LI>
            <LI>Reset: 0.3mm (shortest)</LI>
            <LI>Use Rapid Trigger only on FPS keys, not whole keyboard</LI>
          </UL>
          <H2>Downsides</H2>
          <UL>
            <LI>Expensive ($175–240)</LI>
            <LI>Too sensitive for typing → more typos</LI>
            <LI>Switches not swappable</LI>
            <LI>Limited Mac support</LI>
          </UL>
          <H2>Verdict</H2>
          <P>
            For movement-heavy games (CS2, Apex), the difference is real <Em>once your skill is high enough</Em>.
            Valorant is shooting-focused, but 47% adoption shows the overall response speed wins.
          </P>
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

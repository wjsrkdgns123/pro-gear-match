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
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

export function getAllPostsSorted(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

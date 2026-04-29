import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { translations, Language } from '../translations';
import { PageType } from '../utils/pageType';

export function StaticPageView({ page, theme, lang, onNavigate }: {
  page: PageType;
  theme: 'dark' | 'light';
  lang: Language;
  t: typeof translations['en'];
  onNavigate: (p: PageType) => void;
}) {
  const isDark = theme === 'dark';
  const isKo = lang === 'ko';

  type Section = { heading: string; body: React.ReactNode };
  type PageData = { title: string; subtitle: string; emoji: string; sections: Section[] };

  const pages: Record<string, PageData> = {
    'how-it-works': {
      title: isKo ? '작동 방식' : 'How It Works',
      subtitle: isKo ? 'Pro Gear Match가 나의 프로 트윈을 찾는 방법' : 'How Pro Gear Match finds your pro twin',
      emoji: '🎯',
      sections: [
        {
          heading: isKo ? '1단계 — 설정 입력' : 'Step 1 — Enter Your Setup',
          body: isKo
            ? '게임을 선택하고 마우스 DPI, 인게임 감도, 사용 중인 마우스·키보드·모니터·마우스패드를 입력하세요. 장비 정보를 모두 알 필요는 없습니다. DPI와 감도만 입력해도 매칭이 가능합니다. 입력 필드 옆 "현재 프로 평균" 힌트를 참고해 내 설정이 프로 기준으로 어느 수준인지 바로 확인할 수 있습니다.'
            : 'Select your game and enter your mouse DPI, in-game sensitivity, and your gear (mouse, keyboard, monitor, mousepad). You don\'t need all fields — DPI and sensitivity alone are enough to get a match. Use the "Pro Average" hints next to each field to gauge where your settings stand.',
        },
        {
          heading: isKo ? '2단계 — eDPI 알고리즘 매칭' : 'Step 2 — eDPI Algorithm Matching',
          body: isKo
            ? 'eDPI(Effective DPI) = DPI × 인게임 감도. 이 단일 수치로 서로 다른 마우스·게임 설정을 동일한 기준에서 비교할 수 있습니다. Pro Gear Match는 입력된 eDPI를 데이터베이스의 모든 프로 선수와 비교해 가장 가까운 eDPI를 가진 선수를 1순위로 매칭하고, 동일 장비 사용 여부를 추가 점수로 반영합니다.'
            : 'eDPI (Effective DPI) = DPI × In-Game Sensitivity. This single number lets us compare setups across different hardware and games on equal footing. We compare your eDPI against every pro in the database and rank matches by closeness, with additional weight given to gear overlap.',
        },
        {
          heading: isKo ? '3단계 — 결과 분석' : 'Step 3 — Analyze Your Results',
          body: isKo
            ? '매칭 결과 카드에서 다음을 확인할 수 있습니다: ① 매칭된 프로의 이름·팀·프로필 링크 ② eDPI 분포 히스토그램 (같은 게임 전체 프로 중 내 위치) ③ 프로의 사용 장비 이미지 및 아마존 구매 링크 ④ 비슷한 설정의 다른 프로들 (캐러셀로 탐색 가능). 완벽한 매칭 외에 비슷한 매칭도 함께 제공되어 여러 프로를 참고할 수 있습니다.'
            : 'Your result card shows: ① Matched pro\'s name, team, and profile link ② eDPI histogram showing your position among all pros in that game ③ Pro\'s gear with product images and Amazon buy links ④ Similar matches navigable via a carousel. Beyond your top match, you also get similar matches to explore multiple reference points.',
        },
        {
          heading: isKo ? 'eDPI 범위 참고표' : 'eDPI Reference Ranges',
          body: (
            <div className="space-y-2 mt-2">
              {[
                { game: 'Valorant', range: '200 – 500', note: isKo ? '낮은 감도 선호 경향' : 'Low sensitivity tendency', color: 'text-rose-400' },
                { game: 'CS2',      range: '600 – 1200', note: isKo ? '중간 감도 선호 경향' : 'Mid sensitivity tendency', color: 'text-orange-400' },
                { game: 'Overwatch 2', range: '1200 – 2800', note: isKo ? '히어로별 차이 큼' : 'Varies widely by hero', color: 'text-sky-400' },
                { game: 'Apex Legends', range: '800 – 1800', note: isKo ? '중~높은 감도 경향' : 'Mid-to-high sensitivity tendency', color: 'text-red-400' },
              ].map(g => (
                <div key={g.game} className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 rounded-none ${isDark ? 'bg-[#111] border border-[#1e1e1e]' : 'bg-[#f9fafb] border border-[#e5e7eb]'}`}>
                  <span className={`font-bold text-sm ${isDark ? 'text-[#bbb]' : 'text-[#374151]'}`}>{g.game}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-bold text-sm ${g.color}`}>{g.range}</span>
                    <span className={`text-[10px] font-mono ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`}>{g.note}</span>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
      ],
    },

    about: {
      title: isKo ? 'Pro Gear Match 소개' : 'About Pro Gear Match',
      subtitle: isKo ? '프로게이머의 설정으로 당신의 게임을 업그레이드하세요' : 'Find your pro twin. Upgrade your setup.',
      emoji: '🏆',
      sections: [
        {
          heading: isKo ? '서비스 소개' : 'What Is Pro Gear Match?',
          body: isKo
            ? 'Pro Gear Match는 FPS e스포츠 팬과 게이머를 위한 무료 감도 매칭 도구입니다. Valorant, CS2, Overwatch 2, Apex Legends 4개 게임에서 활동하는 프로 선수 300명 이상의 마우스 DPI, 인게임 감도, 사용 장비 데이터를 수집·분석하여, 사용자의 설정과 가장 유사한 프로를 찾아드립니다. 완전 무료로 운영되며 회원가입 없이 즉시 이용 가능합니다.'
            : 'Pro Gear Match is a free sensitivity matching tool for FPS esports fans and gamers. We collect and analyze mouse DPI, in-game sensitivity, and gear data from 300+ professional players across Valorant, CS2, Overwatch 2, and Apex Legends to find the pro whose setup most closely matches yours. It\'s completely free and requires no sign-up.',
        },
        {
          heading: isKo ? '우리의 미션' : 'Our Mission',
          body: isKo
            ? '올바른 감도 설정을 찾는 것은 생각보다 어렵습니다. 수많은 유튜브 영상과 커뮤니티 글을 뒤지다 결국 "프로는 어떻게 하지?"라고 생각한 적이 있다면, Pro Gear Match가 그 해답을 드립니다. 나와 비슷한 감도를 쓰는 프로를 기준점으로 삼아 빠르게 최적 설정에 다가가세요.'
            : 'Finding the right sensitivity is harder than it sounds. If you\'ve ever thought "what do the pros use?" while tweaking your settings, Pro Gear Match gives you that answer. Use a pro with similar settings as your reference point and get to your optimal setup faster.',
        },
        {
          heading: isKo ? '데이터 출처 및 신뢰성' : 'Data Sources & Reliability',
          body: isKo
            ? '모든 프로 선수 데이터는 다음 공개 출처에서 수집됩니다: ProSettings.net, Liquipedia, 각 팀 공식 SNS. 데이터는 정기적으로 검증·업데이트되며, 선수의 설정 변경 사항이 반영됩니다. 단, 선수의 설정은 언제든 변경될 수 있으며 본 사이트의 데이터가 항상 최신임을 보장하지는 않습니다. 데이터 오류 발견 시 이메일로 제보해 주시면 빠르게 수정합니다.'
            : 'All pro player data is sourced from: ProSettings.net, Liquipedia, and official team social media. Data is regularly verified and updated to reflect settings changes. However, pro settings can change at any time and we cannot guarantee our data is always current. If you find an error, email us and we\'ll fix it quickly.',
        },
        {
          heading: isKo ? '지원 게임' : 'Supported Games',
          body: (
            <div className="grid grid-cols-2 gap-3 mt-2">
              {[
                { game: 'VALORANT', emoji: '🎯', note: isKo ? '타이틀 경쟁 FPS' : 'Tactical FPS' },
                { game: 'CS2', emoji: '🔫', note: isKo ? '전설의 FPS 타이틀' : 'Legendary FPS' },
                { game: 'Overwatch 2', emoji: '🛡️', note: isKo ? '히어로 FPS' : 'Hero FPS' },
                { game: 'Apex Legends', emoji: '🏃', note: isKo ? '배틀로얄 FPS' : 'Battle Royale FPS' },
              ].map(g => (
                <div key={g.game} className={`flex items-center gap-3 p-3 rounded-none ${isDark ? 'bg-[#111] border border-[#1e1e1e]' : 'bg-[#f9fafb] border border-[#e5e7eb]'}`}>
                  <span className="text-xl">{g.emoji}</span>
                  <div>
                    <p className={`text-sm font-bold ${isDark ? 'text-[#ddd]' : 'text-[#111]'}`}>{g.game}</p>
                    <p className={`text-[10px] font-mono ${isDark ? 'text-[#555]' : 'text-[#9ca3af]'}`}>{g.note}</p>
                  </div>
                </div>
              ))}
            </div>
          ),
        },
        {
          heading: isKo ? '문의하기' : 'Contact Us',
          body: (
            <div className="space-y-2">
              <p className={`text-sm ${isDark ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                {isKo ? '데이터 오류 제보, 서비스 제안, 광고 문의 등 모든 내용을 아래 이메일로 보내주세요.' : 'For data corrections, feature suggestions, or business inquiries, reach us at:'}
              </p>
              <a href="mailto:wjsrkdgns123a@gmail.com" className={`inline-flex items-center gap-2 font-mono text-sm font-bold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'} transition-colors`}>
                📧 wjsrkdgns123a@gmail.com
              </a>
            </div>
          ),
        },
      ],
    },

    privacy: {
      title: isKo ? '개인정보처리방침' : 'Privacy Policy',
      subtitle: isKo ? '최종 업데이트: 2026년 4월' : 'Last updated: April 2026',
      emoji: '🔒',
      sections: [
        {
          heading: isKo ? '개요' : 'Overview',
          body: isKo
            ? 'Pro Gear Match(이하 "서비스")는 사용자의 개인정보 보호를 중요하게 생각합니다. 본 방침은 서비스 이용 시 어떤 정보가 수집되고 어떻게 사용되는지를 설명합니다.'
            : 'Pro Gear Match ("the Service") takes user privacy seriously. This policy explains what information is collected when you use the Service and how it is used.',
        },
        {
          heading: isKo ? '1. 수집하는 정보' : '1. Information We Collect',
          body: isKo
            ? '• 서비스 이용 데이터: DPI·감도·게임 선택 등 매칭을 위해 입력하는 정보는 서버에 저장되지 않으며, 브라우저 세션에서만 사용됩니다.\n• 댓글 데이터: 댓글 작성 시 닉네임(선택)과 댓글 내용이 Firebase(Google)에 저장됩니다.\n• 로그 데이터: 일반적인 서버 접근 로그(IP 주소, 접속 시간 등)가 자동으로 기록될 수 있습니다.'
            : '• Usage data: Settings you enter (DPI, sensitivity, game) are not stored on servers and only exist in your browser session.\n• Comment data: If you post a comment, your nickname (optional) and comment text are stored in Firebase (Google).\n• Log data: Standard server access logs (IP address, timestamp) may be automatically recorded.',
        },
        {
          heading: isKo ? '2. 정보 이용 목적' : '2. How We Use Information',
          body: isKo
            ? '수집된 정보는 다음 목적으로만 사용됩니다:\n• 매칭 알고리즘 실행 (설정 데이터)\n• 댓글 서비스 운영 (댓글 데이터)\n\n사용자 정보를 제3자에게 판매하거나 마케팅 목적으로 사용하지 않습니다.'
            : 'Collected information is used only for:\n• Running the matching algorithm (settings data)\n• Operating the comment feature (comment data)\n\nWe do not sell user information or use it for marketing.',
        },
        {
          heading: isKo ? '3. 제3자 서비스' : '3. Third-Party Services',
          body: isKo
            ? '본 서비스는 다음 제3자 서비스를 사용하며, 각각의 개인정보처리방침이 별도로 적용됩니다:\n• Firebase / Google Cloud (데이터 저장 및 인증)\n• Google AdSense (광고)\n• Amazon Associates (제휴 링크)'
            : 'The Service uses the following third-party services, each governed by their own privacy policies:\n• Firebase / Google Cloud (data storage & auth)\n• Google AdSense (advertising)\n• Amazon Associates (affiliate links)',
        },
        {
          heading: isKo ? '4. 쿠키 및 광고' : '4. Cookies & Advertising',
          body: isKo
            ? '본 사이트는 Google AdSense를 통해 광고를 표시합니다. Google은 광고 개인화를 위해 쿠키를 사용할 수 있습니다. 브라우저 설정에서 쿠키를 비활성화하거나 Google의 광고 설정 페이지(adssettings.google.com)에서 개인화 광고를 끌 수 있습니다.'
            : 'This site displays ads via Google AdSense. Google may use cookies to personalize ads. You can disable cookies in your browser settings or opt out of personalized ads at adssettings.google.com.',
        },
        {
          heading: isKo ? '5. 데이터 보안 및 보존' : '5. Data Security & Retention',
          body: isKo
            ? '댓글 데이터는 Firebase 보안 규칙으로 보호되며, 비인가 수정·삭제가 차단됩니다. 댓글 삭제를 원하시면 이메일로 요청해 주세요. 매칭 입력 데이터는 서버에 저장되지 않으므로 별도의 삭제 절차가 없습니다.'
            : 'Comment data is protected by Firebase security rules that block unauthorized modification or deletion. To request comment deletion, contact us by email. Matching input data is never stored on servers, so no deletion process is needed.',
        },
        {
          heading: isKo ? '6. 문의' : '6. Contact',
          body: (
            <a href="mailto:wjsrkdgns123a@gmail.com" className={`font-mono text-sm font-bold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'} transition-colors`}>
              wjsrkdgns123a@gmail.com
            </a>
          ),
        },
      ],
    },

    terms: {
      title: isKo ? '서비스 이용약관' : 'Terms of Service',
      subtitle: isKo ? '최종 업데이트: 2026년 4월' : 'Last updated: April 2026',
      emoji: '📋',
      sections: [
        {
          heading: isKo ? '1. 약관 동의' : '1. Acceptance of Terms',
          body: isKo
            ? 'Pro Gear Match 웹사이트(이하 "서비스")를 이용함으로써 본 약관에 동의하는 것으로 간주됩니다. 본 약관에 동의하지 않는 경우 서비스 이용을 중단해 주세요.'
            : 'By accessing or using the Pro Gear Match website ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, please discontinue use of the Service.',
        },
        {
          heading: isKo ? '2. 서비스 설명' : '2. Description of Service',
          body: isKo
            ? 'Pro Gear Match는 프로 e스포츠 선수의 장비·감도 데이터를 기반으로 사용자와 유사한 설정을 가진 프로를 찾아주는 무료 참고 도구입니다. 서비스는 참고 목적으로만 제공되며, 게임 실력 향상을 보장하지 않습니다.'
            : 'Pro Gear Match is a free reference tool that helps users find professional esports players with similar gear and sensitivity settings. The Service is provided for informational purposes only and does not guarantee any improvement in gaming performance.',
        },
        {
          heading: isKo ? '3. 데이터 정확성' : '3. Data Accuracy',
          body: isKo
            ? '프로 선수 데이터는 공개 출처에서 수집되며, 정확성이나 최신성을 보장하지 않습니다. 선수의 설정은 언제든지 변경될 수 있습니다. 데이터 오류 발견 시 wjsrkdgns123a@gmail.com으로 제보해 주세요.'
            : 'Pro player data is collected from public sources. We do not guarantee its accuracy or currency. Player settings may change at any time. If you find an error, please report it to wjsrkdgns123a@gmail.com.',
        },
        {
          heading: isKo ? '4. 금지 행위' : '4. Prohibited Conduct',
          body: isKo
            ? '다음 행위를 금지합니다:\n• 서비스를 통한 자동화 크롤링 또는 스크래핑\n• 서비스 인프라에 과도한 부하를 주는 행위\n• 타인을 사칭하거나 허위 정보를 댓글로 작성하는 행위'
            : 'The following are prohibited:\n• Automated crawling or scraping of the Service\n• Actions that place excessive load on Service infrastructure\n• Impersonating others or posting false information in comments',
        },
        {
          heading: isKo ? '5. 지적 재산권' : '5. Intellectual Property',
          body: isKo
            ? '본 사이트의 디자인, 소스코드, 로고, 브랜드명은 Pro Gear Match에 귀속됩니다. 프로 선수 데이터는 각 공개 출처의 저작권 정책을 따릅니다. 사이트 콘텐츠를 무단으로 복제·배포하는 것을 금지합니다.'
            : 'The site\'s design, source code, logo, and brand name belong to Pro Gear Match. Pro player data follows the copyright policies of their respective public sources. Unauthorized reproduction or distribution of site content is prohibited.',
        },
        {
          heading: isKo ? '6. 면책 조항' : '6. Disclaimer of Warranties',
          body: isKo
            ? '서비스는 "있는 그대로(AS IS)" 제공되며, 명시적 또는 묵시적 보증이 없습니다. 서비스 이용으로 인한 직접적·간접적 손해에 대해 Pro Gear Match는 책임을 지지 않습니다. 여기에는 데이터 오류, 서비스 중단, 매칭 결과로 인한 손해가 포함됩니다.'
            : 'The Service is provided "AS IS" without warranties of any kind, express or implied. Pro Gear Match is not liable for any direct or indirect damages arising from use of the Service, including data errors, service interruptions, or decisions made based on match results.',
        },
        {
          heading: isKo ? '7. 서비스 변경 및 중단' : '7. Changes & Termination',
          body: isKo
            ? '서비스는 사전 고지 없이 변경, 일시 중단, 영구 종료될 수 있습니다. 서비스 변경으로 인한 손해에 대해 책임을 지지 않습니다. 약관은 서비스 개선에 따라 변경될 수 있으며, 변경 시 본 페이지에 게시됩니다.'
            : 'The Service may be modified, suspended, or terminated at any time without notice. We are not liable for damages resulting from service changes. These Terms may be updated as the Service evolves; changes will be posted on this page.',
        },
        {
          heading: isKo ? '8. 문의' : '8. Contact',
          body: (
            <a href="mailto:wjsrkdgns123a@gmail.com" className={`font-mono text-sm font-bold ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'} transition-colors`}>
              wjsrkdgns123a@gmail.com
            </a>
          ),
        },
      ],
    },

    affiliate: {
      title: isKo ? '제휴 마케팅 공시' : 'Affiliate Disclosure',
      subtitle: isKo ? 'Amazon Associates 프로그램 참여 공시 (FTC 준수)' : 'Amazon Associates Program Disclosure — FTC Compliant',
      emoji: '🔗',
      sections: [
        {
          heading: isKo ? 'Amazon Associates 프로그램 참여' : 'Amazon Associates Participation',
          body: isKo
            ? 'Pro Gear Match는 Amazon Services LLC Associates Program의 참여자입니다. 이 프로그램은 Amazon.com 및 제휴 사이트로의 광고 링크를 통해 수수료를 받을 수 있도록 설계된 제휴 광고 프로그램입니다.'
            : 'Pro Gear Match is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com and affiliated sites.',
        },
        {
          heading: isKo ? '제휴 링크 식별' : 'Identifying Affiliate Links',
          body: isKo
            ? '매칭 결과 페이지의 "아마존" 또는 "가격 확인" 버튼, 메인 페이지의 "TOP 5 장비" 섹션의 "아마존" 버튼은 제휴 링크입니다. 해당 링크를 통해 구매하시면 추가 비용 없이 소정의 수수료가 발생하며, 이는 서비스 운영·데이터베이스 유지에 사용됩니다.'
            : 'The "Amazon" and "Check Price" buttons on match result pages, and "Amazon" buttons in the Top 5 Gear section, are affiliate links. Purchases made through these links may earn us a small commission at no additional cost to you. Commissions support service operations and database maintenance.',
        },
        {
          heading: isKo ? '추천 공정성' : 'Editorial Independence',
          body: isKo
            ? '제휴 관계는 콘텐츠의 공정성에 영향을 미치지 않습니다. 장비 데이터는 실제 프로 선수의 사용 여부를 기준으로 수집되며, 제휴 수수료 발생 여부와 무관하게 동일하게 처리됩니다. 제휴 링크가 없는 장비의 경우 아마존 검색 링크가 제공됩니다.'
            : 'Our affiliate relationship does not influence content fairness. Gear data is collected based solely on actual pro usage — not on whether an affiliate link exists. Gear without affiliate links is provided with a general Amazon search link.',
        },
        {
          heading: isKo ? 'FTC 공시 (미국 연방거래위원회)' : 'FTC Disclosure',
          body: isKo
            ? '미국 연방거래위원회(FTC) 16 CFR Part 255 지침에 따라, 본 사이트의 일부 링크는 제휴 링크임을 명시합니다. 당사는 해당 링크를 통한 구매 시 수수료를 받을 수 있으나, 이는 추천 내용이나 데이터의 객관성에 영향을 주지 않습니다.'
            : 'In accordance with FTC 16 CFR Part 255 guidelines, we explicitly disclose that some links on this site are affiliate links. We may receive commissions on purchases made through these links. This does not affect the objectivity of our recommendations or data.',
        },
        {
          heading: isKo ? '가격 및 재고 정보' : 'Pricing & Availability',
          body: isKo
            ? '제품 가격 및 재고는 수시로 변동되며, 최종 가격은 Amazon 사이트에서 직접 확인하시기 바랍니다. 당사는 Amazon을 통해 구매된 제품의 품질, 배송, 환불 등에 대해 책임을 지지 않습니다.'
            : 'Product prices and availability are subject to change without notice. Please verify all pricing and availability directly on Amazon. We are not responsible for product quality, shipping, or returns for purchases made through Amazon.',
        },
      ],
    },
  };

  const content = pages[page] ?? pages['about'];
  const allPages: { key: PageType; label: string }[] = [
    { key: 'how-it-works', label: isKo ? '작동 방식' : 'How It Works' },
    { key: 'about',        label: isKo ? '소개'      : 'About' },
    { key: 'privacy',      label: isKo ? '개인정보'  : 'Privacy' },
    { key: 'terms',        label: isKo ? '이용약관'  : 'Terms' },
    { key: 'affiliate',    label: isKo ? '제휴 공시' : 'Affiliate' },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#050507] text-[#e0e0e0]' : 'bg-[#f0f2f5] text-[#1a1a1a]'} font-sans`}>
      {isDark && (
        <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(16,185,129,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.02) 1px, transparent 1px)', backgroundSize: '44px 44px' }} />
      )}

      <nav className={`sticky top-0 z-50 border-b ${isDark ? 'bg-[#050507]/95 border-[#1a1a1a]' : 'bg-white/95 border-[#e5e7eb]'} backdrop-blur-md`}>
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest transition-colors ${isDark ? 'text-[#555] hover:text-emerald-400' : 'text-[#9ca3af] hover:text-emerald-600'}`}
            >
              <ArrowLeft size={12} /> {isKo ? '홈' : 'Home'}
            </button>
            <span className={isDark ? 'text-[#222]' : 'text-[#d1d5db]'}>|</span>
            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{content.title}</span>
          </div>
          <div className="hidden md:flex items-center gap-1">
            {allPages.map(p => (
              <button
                key={p.key}
                onClick={() => onNavigate(p.key)}
                className={`px-3 py-1.5 rounded-none text-[10px] font-mono uppercase tracking-widest transition-colors ${
                  page === p.key
                    ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                    : isDark ? 'text-[#555] hover:text-[#888]' : 'text-[#9ca3af] hover:text-[#6b7280]'
                }`}
              >{p.label}</button>
            ))}
          </div>
        </div>
      </nav>

      <div className={`border-b ${isDark ? 'border-[#111]' : 'border-[#e5e7eb]'} py-14 px-6`}>
        <div className="max-w-5xl mx-auto">
          <div className="text-5xl mb-5">{content.emoji}</div>
          <h1 className={`text-4xl md:text-5xl font-black uppercase tracking-tighter mb-3 ${isDark ? 'text-white' : 'text-[#111]'}`}>
            {content.title}
          </h1>
          <p className={`text-sm font-mono ${isDark ? 'text-[#555]' : 'text-[#6b7280]'} uppercase tracking-widest`}>
            {content.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14 space-y-6">
        {content.sections.map((section, i) => (
          <div key={i} className={`p-6 md:p-8 rounded-none border ${isDark ? 'bg-[#0c0c0e] border-[#1a1a1e]' : 'bg-white border-[#e5e7eb]'}`}>
            <h2 className={`text-sm font-black uppercase tracking-widest mb-4 pb-3 border-b ${isDark ? 'text-emerald-400 border-[#1e1e22]' : 'text-emerald-600 border-[#f3f4f6]'}`}>
              {section.heading}
            </h2>
            {typeof section.body === 'string' ? (
              <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                {section.body}
              </p>
            ) : (
              <div className={`text-sm ${isDark ? 'text-[#888]' : 'text-[#4b5563]'}`}>
                {section.body}
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs rounded-none transition-colors"
          >
            <ArrowLeft size={12} /> {isKo ? '홈으로 돌아가기' : 'Back to Home'}
          </button>
          {allPages.filter(p => p.key !== page).slice(0, 3).map(p => (
            <button
              key={p.key}
              onClick={() => onNavigate(p.key)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-none text-xs font-bold uppercase tracking-widest transition-colors border ${isDark ? 'border-[#222] text-[#555] hover:text-emerald-400 hover:border-emerald-500/40' : 'border-[#e5e7eb] text-[#9ca3af] hover:text-emerald-600 hover:border-emerald-300'}`}
            >{p.label}</button>
          ))}
        </div>
      </div>

      <footer className={`border-t ${isDark ? 'border-[#111] bg-[#080808]' : 'border-[#e5e7eb] bg-[#f8f9fa]'} py-10 px-6`}>
        <div className="max-w-5xl mx-auto">
          <div className={`mb-6 p-3 rounded-none text-center text-[11px] ${isDark ? 'bg-[#0d0d0d] border border-[#1a1a1a] text-[#555]' : 'bg-[#f0fdf4] border border-[#d1fae5] text-[#6b7280]'}`}>
            <span className={isDark ? 'text-emerald-500 font-semibold' : 'text-emerald-600 font-semibold'}>Amazon Associates</span>
            {' '}{isKo ? '— 이 사이트는 Amazon 제휴 링크를 포함하며, 구매 시 수수료가 발생할 수 있습니다.' : '— This site contains Amazon affiliate links. We may earn a commission on qualifying purchases.'}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <button onClick={() => onNavigate('home')} className={`text-base font-black uppercase tracking-tighter ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Pro Gear Match
              </button>
              <p className={`text-[10px] font-mono mt-1 ${isDark ? 'text-[#444]' : 'text-[#9ca3af]'}`}>
                {isKo ? '© 2025 Pro Gear Match. 무단 복제 금지.' : '© 2025 Pro Gear Match. All rights reserved.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {allPages.map(p => (
                <button
                  key={p.key}
                  onClick={() => onNavigate(p.key)}
                  className={`px-3 py-1.5 rounded-none text-[10px] font-mono uppercase tracking-widest transition-colors ${
                    page === p.key
                      ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                      : isDark ? 'text-[#444] hover:text-[#888]' : 'text-[#9ca3af] hover:text-[#6b7280]'
                  }`}
                >{p.label}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

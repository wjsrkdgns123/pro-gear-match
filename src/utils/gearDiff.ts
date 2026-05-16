// Generates a short, plain-language explanation of how the user's
// gear differs from the matched pro's gear. Returns null when we
// don't have enough data to produce a meaningful comparison.
//
// Bilingual (ko + en) — picks the right text based on the lang prop.
import {
  getMouseSpec, getKeyboardSpec, getMonitorSpec, getMousepadSpec,
  type MouseSpec, type KeyboardSpec, type MonitorSpec, type MousepadSpec,
} from '../data/gearSpecs';

type Lang = 'ko' | 'en';
type GearField = 'mouse' | 'keyboard' | 'monitor' | 'mousepad';

export function gearDiffText(
  field: GearField,
  userName: string,
  proName: string,
  lang: Lang,
): string | null {
  const u = userName.trim();
  const p = proName.trim();
  if (!u || !p) return null;
  if (u.toLowerCase() === p.toLowerCase()) return null;

  switch (field) {
    case 'mouse':    return mouseDiff(u, p, lang);
    case 'keyboard': return keyboardDiff(u, p, lang);
    case 'monitor':  return monitorDiff(u, p, lang);
    case 'mousepad': return mousepadDiff(u, p, lang);
  }
}

// ─── MOUSE ───
function mouseDiff(userName: string, proName: string, lang: Lang): string | null {
  const us = getMouseSpec(userName);
  const ps = getMouseSpec(proName);
  if (!us || !ps) return null;

  const parts: string[] = [];

  const wDelta = ps.weight - us.weight;
  if (Math.abs(wDelta) >= 5) {
    if (lang === 'ko') {
      parts.push(
        wDelta < 0
          ? `프로 마우스가 ${Math.abs(wDelta)}g 더 가벼움 (${ps.weight}g vs ${us.weight}g) → 빠른 플릭에 유리`
          : `프로 마우스가 ${wDelta}g 더 무거움 (${ps.weight}g vs ${us.weight}g) → 안정적 트래킹에 유리`,
      );
    } else {
      parts.push(
        wDelta < 0
          ? `Pro's mouse is ${Math.abs(wDelta)}g lighter (${ps.weight}g vs ${us.weight}g) → favors faster flicks`
          : `Pro's mouse is ${wDelta}g heavier (${ps.weight}g vs ${us.weight}g) → favors stable tracking`,
      );
    }
  }

  if (us.shape !== ps.shape) {
    const shapeKo: Record<MouseSpec['shape'], string> = {
      'sym': '좌우 대칭', 'erg': '에르고노믹', 'small-sym': '소형 대칭', 'asym': '비대칭',
    };
    const shapeEn: Record<MouseSpec['shape'], string> = {
      'sym': 'symmetric', 'erg': 'ergonomic', 'small-sym': 'small symmetric', 'asym': 'asymmetric',
    };
    if (lang === 'ko') {
      parts.push(`모양 다름: 본인은 ${shapeKo[us.shape]}, 프로는 ${shapeKo[ps.shape]} — 그립 적합도 다를 수 있음`);
    } else {
      parts.push(`Different shape: yours is ${shapeEn[us.shape]}, pro's is ${shapeEn[ps.shape]} — grip fit differs`);
    }
  }

  if (us.wireless !== ps.wireless) {
    if (lang === 'ko') {
      parts.push(
        ps.wireless
          ? '프로는 무선, 본인은 유선 — 최신 무선은 인풋랙 차이 거의 없음'
          : '프로는 유선, 본인은 무선 — 케이블 드래그 차이 점검',
      );
    } else {
      parts.push(
        ps.wireless
          ? "Pro is wireless, you're wired — modern wireless has near-identical input lag"
          : "Pro is wired, you're wireless — mind cable drag and battery cycles",
      );
    }
  }

  return parts.length ? parts.join(' · ') : null;
}

// ─── KEYBOARD ───
function keyboardDiff(userName: string, proName: string, lang: Lang): string | null {
  const us = getKeyboardSpec(userName);
  const ps = getKeyboardSpec(proName);
  if (!us || !ps) return null;

  const parts: string[] = [];

  if (us.layout !== ps.layout) {
    if (lang === 'ko') {
      parts.push(`레이아웃 다름: 본인 ${us.layout}, 프로 ${ps.layout} — 작은 레이아웃은 책상 공간 + 마우스 스윕 거리 확보`);
    } else {
      parts.push(`Layout differs: yours ${us.layout}, pro's ${ps.layout} — smaller layout frees mouse-swing space`);
    }
  }

  if (us.rapidTrigger !== ps.rapidTrigger) {
    if (lang === 'ko') {
      parts.push(
        ps.rapidTrigger
          ? '프로 키보드는 Rapid Trigger 지원 → 카운터스트레이프 + 무빙 응답 5-15ms 빠름'
          : '본인 키보드만 Rapid Trigger 지원 → 무빙 응답 면에서 이미 프로보다 유리',
      );
    } else {
      parts.push(
        ps.rapidTrigger
          ? "Pro's keyboard has Rapid Trigger → 5-15ms faster movement / counter-strafe"
          : "Yours has Rapid Trigger, pro's doesn't → you have the edge on movement",
      );
    }
  } else if (us.switchType !== ps.switchType) {
    const swKo: Record<KeyboardSpec['switchType'], string> = {
      'hall-effect': 'Hall Effect (자기력)', 'mechanical': '기계식', 'optical': '광학',
    };
    const swEn: Record<KeyboardSpec['switchType'], string> = {
      'hall-effect': 'Hall Effect', 'mechanical': 'mechanical', 'optical': 'optical',
    };
    if (lang === 'ko') {
      parts.push(`스위치 종류 다름: 본인 ${swKo[us.switchType]}, 프로 ${swKo[ps.switchType]}`);
    } else {
      parts.push(`Switch type differs: yours ${swEn[us.switchType]}, pro's ${swEn[ps.switchType]}`);
    }
  }

  return parts.length ? parts.join(' · ') : null;
}

// ─── MONITOR ───
function monitorDiff(userName: string, proName: string, lang: Lang): string | null {
  const us = getMonitorSpec(userName);
  const ps = getMonitorSpec(proName);
  if (!us || !ps) return null;

  const parts: string[] = [];

  const hzDelta = ps.hz - us.hz;
  if (Math.abs(hzDelta) >= 30) {
    if (lang === 'ko') {
      parts.push(
        hzDelta > 0
          ? `프로 모니터가 ${hzDelta}Hz 더 높음 (${ps.hz}Hz vs ${us.hz}Hz) → 화면 갱신 ${(ps.hz / us.hz).toFixed(1)}배 빠름, 반응 속도 유리`
          : `본인 모니터가 ${Math.abs(hzDelta)}Hz 더 높음 (${us.hz}Hz vs ${ps.hz}Hz) → 본인이 화면 갱신 면에선 유리`,
      );
    } else {
      parts.push(
        hzDelta > 0
          ? `Pro's monitor is ${hzDelta}Hz higher (${ps.hz}Hz vs ${us.hz}Hz) → screen updates ${(ps.hz / us.hz).toFixed(1)}× more often`
          : `Your monitor is ${Math.abs(hzDelta)}Hz higher (${us.hz}Hz vs ${ps.hz}Hz) → you have the refresh advantage`,
      );
    }
  }

  if (us.panelType !== ps.panelType && us.panelType && ps.panelType) {
    if (lang === 'ko') {
      parts.push(`패널 다름: 본인 ${us.panelType}, 프로 ${ps.panelType} — 잔상/응답 속도 차이 있음`);
    } else {
      parts.push(`Panel differs: yours ${us.panelType}, pro's ${ps.panelType} — ghosting and response vary`);
    }
  }

  if (us.resolution !== ps.resolution && us.resolution && ps.resolution) {
    if (lang === 'ko') {
      parts.push(`해상도 다름: 본인 ${us.resolution}, 프로 ${ps.resolution} — 프로는 보통 1080p로 fps 우선`);
    } else {
      parts.push(`Resolution differs: yours ${us.resolution}, pro's ${ps.resolution} — pros usually prefer 1080p for fps`);
    }
  }

  return parts.length ? parts.join(' · ') : null;
}

// ─── MOUSEPAD ───
function mousepadDiff(userName: string, proName: string, lang: Lang): string | null {
  const us = getMousepadSpec(userName);
  const ps = getMousepadSpec(proName);
  if (!us || !ps) return null;

  const parts: string[] = [];

  if (us.friction !== ps.friction) {
    const frKo: Record<MousepadSpec['friction'], string> = {
      'speed': '스피드 (빠름)', 'control': '컨트롤 (제동력 높음)', 'hybrid': '하이브리드',
    };
    const frEn: Record<MousepadSpec['friction'], string> = {
      'speed': 'speed (low friction)', 'control': 'control (high friction)', 'hybrid': 'hybrid',
    };
    if (lang === 'ko') {
      parts.push(`표면 마찰 다름: 본인 ${frKo[us.friction]}, 프로 ${frKo[ps.friction]} — 글라이드 + 제동력 차이 큼`);
    } else {
      parts.push(`Surface friction differs: yours ${frEn[us.friction]}, pro's ${frEn[ps.friction]} — glide and stopping power differ`);
    }
  }

  const sizeOrder: Record<MousepadSpec['size'], number> = { S: 1, M: 2, L: 3, XL: 4, XXL: 5 };
  const sizeDelta = sizeOrder[ps.size] - sizeOrder[us.size];
  if (Math.abs(sizeDelta) >= 1) {
    if (lang === 'ko') {
      parts.push(
        sizeDelta > 0
          ? `프로 마우스패드가 더 큼 (${ps.size} vs ${us.size}) → 낮은 감도 + 큰 팔 동작 가능`
          : `본인 마우스패드가 더 큼 (${us.size} vs ${ps.size}) → 본인이 더 큰 동작 여유 있음`,
      );
    } else {
      parts.push(
        sizeDelta > 0
          ? `Pro's pad is larger (${ps.size} vs ${us.size}) → enables lower sens + bigger arm motion`
          : `Your pad is larger (${us.size} vs ${ps.size}) → you have more room for big motions`,
      );
    }
  }

  return parts.length ? parts.join(' · ') : null;
}

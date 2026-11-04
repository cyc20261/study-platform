/**
 * 图集加载器 —— 把 53 张贴图合并成 1 次请求。
 *
 * 背景：鲸鱼娘的三张贴图拆成 53 个独立 PNG，在本地的 GitHub Pages 上
 * 单张要 0.6~2s，串起来首屏要等 30 秒以上。合并成一张图集后只需 1 个请求。
 *
 * 用法：
 *   const load = await makeAtlasLoader('./assets/whale/whale/');
 *   createWhaleFigure(undefined, { asset: p => p, loadImage: load });
 *
 * 返回的每个"图"都是一个 <canvas>，rig.js 直接 texImage2D 上传，行为与 <img> 一致。
 * 图集缺失或解码失败时自动回退到逐张加载原图 —— 慢但不至于没图。
 */

function decodeToImage(url) {
  return new Promise(function (ok, bad) {
    const im = new Image();
    im.decoding = 'async';
    im.onload = function () { ok(im); };
    im.onerror = function () { bad(new Error('image load failed: ' + url)); };
    im.src = url;
  });
}

export async function makeAtlasLoader(dir) {
  dir = dir || './assets/whale/whale/';
  const fallback = function (p) {
    return decodeToImage(p.charAt(0) === '/' || /^https?:/.test(p) ? p : dir + p);
  };

  let meta = null;
  let atlas = null;
  try {
    const [m, im] = await Promise.all([
      fetch(dir + 'atlas.json', { cache: 'force-cache' }).then(function (r) {
        if (!r.ok) throw new Error('atlas.json ' + r.status);
        return r.json();
      }),
      decodeToImage(dir + 'atlas.webp'),
    ]);
    if (m && m.frames && im && im.width && im.height === m.h && im.width === m.w) {
      meta = m;
      atlas = im;
    } else if (m && im) {
      // 坐标表和图片对不上（例如图重建过但 json 是旧的），宁可慢也不能画错
      console.warn('[atlas] 尺寸不符 json=%sx%s img=%sx%s，回退逐张加载',
        m.w, m.h, im.width, im.height);
    }
  } catch (e) {
    // 图集不可用时静默退化，别让桌宠整个挂掉
    console.warn('[atlas] 图集不可用，回退逐张加载：', e && e.message);
  }

  const cache = new Map();

  return function loadImage(p) {
    if (!meta) return fallback(p);
    let hit = cache.get(p);
    if (hit) return hit;

    let frame = meta.frames[p];
    if (!frame && p.indexOf('tex/') === 0) frame = meta.frames[p.replace('tex/', '')];
    if (!frame && p.indexOf('feat/') === 0) frame = meta.frames[p.replace('feat/', '')];
    if (!frame) {
      // 图集里没有这张（例如别的换装配色），单独取
      hit = fallback(p);
      cache.set(p, hit);
      return hit;
    }

    const x = frame[0], y = frame[1], w = frame[2], h = frame[3];
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    if (!g) { hit = fallback(p); cache.set(p, hit); return hit; }
    g.imageSmoothingEnabled = false;
    g.drawImage(atlas, x, y, w, h, 0, 0, w, h);
    hit = Promise.resolve(c);
    cache.set(p, hit);
    return hit;
  };
}

export default makeAtlasLoader;

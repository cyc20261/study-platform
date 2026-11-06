/* ============================================================
   小云 · 桌宠互动层 pet-brain
   ------------------------------------------------------------
   把 dsh-whale-musume 的 whale-moe-core（MIT）接到本页面已经有的
   3D 鲸鱼上：摸头、摸肚子、摸尾巴、投喂、三连击、好感度升级、
   每日任务、成就墙、接蛋糕小游戏，以及背单词 / 番茄钟 / 待办的场景联动。

   内核负责「数值 + 台词 + 判定」，这一层只负责「接到 DOM 和鲸鱼表情」。
   ============================================================ */
(function () {
  'use strict';

  var C = window.DshWhaleMoeCore;
  if (!C) { console.warn('[pet-brain] 缺少 whale-moe-core.js，互动层未启动'); return; }

  /* ---------------- 称呼：台词里 主人 / 鲸鱼娘 会被替换 ---------------- */
  var TITLE = '闯子';   // 台词里的「主人」
  var SELF = '小云';    // 台词里的「鲸鱼娘」

  /* ---------------- 宿主钩子 ---------------- */
  var H = {
    getDB: function () { return {}; },
    save: function () {},
    expr: function () {},
    word: function () {},
    spark: function () {},
    toast: function () {},
    exportSave: function () {},
    importSave: function () {},
    openChat: function () {},
    petBox: null,
    isPinned: function () { return false; },
    togglePin: function () {},
    openWardrobe: function () {},
    dance: function () {},
    act: function () {},
    wearTop: function () { return null; },
    baseDate: null
  };

  var S = {
    ready: false,
    lastPatAt: 0,
    patStreak: 0,
    lastTripleAt: 0,
    lastInteract: Date.now(),
    sayTimer: 0,
    tapTimer: 0,
    lastTapAt: 0,
    recent: [],
    menuEl: null,
    actsEl: null,
    panelEl: null,
    game: null,
    timer: 0,
    idleNudgedAt: 0,
    sessionStart: Date.now(),
    /* 睡觉模式（借 dsh-pet 的做法：睡下后完全安静、只偶尔说梦话、点一下叫醒） */
    asleep: false,
    dreamTimer: 0,
    lastDreamAt: 0,
    voice: false,          /* 语音朗读开关，默认关 */
    voiceLang: 'zh-CN'
  };

  function $(sel) { return document.querySelector(sel); }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function nowMs() { return Date.now(); }

  /* ---------------- 存档 ---------------- */
  function P() {
    var d = H.getDB() || {};
    if (!d.pet) d.pet = {};
    var p = d.pet;
    if (!p.growth) p.growth = Object.assign({}, C.DEFAULT_GROWTH);
    if (!p.stats) p.stats = {};
    var st = p.stats;
    st.pat = st.pat | 0;
    st.feed = st.feed | 0;
    st.triple = st.triple | 0;
    st.zone = st.zone || { head: 0, belly: 0, tail: 0 };
    st.study = st.study | 0;
    st.fail = st.fail | 0;
    st.success = st.success | 0;
    st.messages = st.messages | 0;
    st.keyword = st.keyword | 0;
    st.code = st.code | 0;
    st.games = st.games || { plays: 0, wins: 0, highscore: 0, comboMax: 0, records: 0 };
    st.games.records = st.games.records | 0;
    if (!p.meta) p.meta = {};
    var m = p.meta;
    if (!m.firstSeen) m.firstSeen = nowMs();
    if (!m.lastSeen) m.lastSeen = nowMs();
    if (!m.lastInteract) m.lastInteract = nowMs();
    if (!p.quests) p.quests = null;
    if (!p.recent) p.recent = [];
    return p;
  }
  function commit() { try { H.save(); } catch (e) {} }

  /* ---------------- 气泡 ---------------- */
  var sayEl = null;

  /* 桌宠在屏幕上会走动，气泡 / 点击判定都要按「她此刻的包围盒」算，
     拿不到就先退回整个舞台（老版是 124px 的小按钮）。 */
  function petRect() {
    var b = null;
    try { b = H.petBox && H.petBox(); } catch (e) { b = null; }
    if (b && b.width > 0 && b.height > 0) return b;
    var fab = document.getElementById('aiFab');
    if (!fab) return { left: 0, top: 0, width: 1, height: 1 };
    var r = fab.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  /* 气泡挂在 body 上、用 fixed 定位跟着桌宠走。 */
  function placeSay() {
    if (!sayEl || !sayEl.classList.contains('on')) return;
    var r = petRect();
    var w = sayEl.offsetWidth;
    var left = clamp(r.left + r.width / 2 - w / 2, 8, Math.max(8, window.innerWidth - w - 8));
    // 她头上戴了装饰时，气泡还要再往上让一截，别糊住舞狮头套
    var topY = r.top;
    try {
      var wt = H.wearTop && H.wearTop();
      if (typeof wt === 'number' && isFinite(wt)) topY = Math.min(topY, wt);
    } catch (e) {}
    sayEl.style.left = left + 'px';
    sayEl.style.bottom = (window.innerHeight - topY + 10) + 'px';
  }

  function say(text, opts) {
    if (!text) return '';
    opts = opts || {};
    /* 睡着时完全安静——只有梦话（opts.dream）能穿透 */
    if (S.asleep && !opts.dream) return '';
    var line = C.applyNames(text, TITLE, SELF);
    // 源头台词里有「本 鲸鱼娘」这类写法，换成自称后会多一个空格
    line = line.replace(/本\s+小云/g, '本小云');
    if (!sayEl) {
      sayEl = document.createElement('div');
      sayEl.className = 'pet-say';
      document.body.appendChild(sayEl);
    }
    sayEl.textContent = line;
    sayEl.classList.remove('on');
    void sayEl.offsetWidth;
    sayEl.classList.add('on');
    placeSay();
    clearTimeout(S.sayTimer);
    S.sayTimer = setTimeout(function () {
      if (sayEl) sayEl.classList.remove('on');
    }, opts.ms || 3200);
    if (S.voice && !opts.noVoice) speakOut(line);
    return line;
  }

  /* ---------------- 语音朗读（Web Speech，纯浏览器、零依赖） ---------------- */
  function speakOut(text) {
    try {
      if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
      // 去掉 emoji 与语气符号，避免念成「笑脸」之类
      var t = String(text)
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{2190}-\u{21FF}]/gu, '')
        .replace(/\s+/g, ' ').trim().slice(0, 60);
      if (!t) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(t);
      u.lang = S.voiceLang;
      u.rate = 1.05;
      u.pitch = 1.15;
      u.volume = 0.9;
      var vs = window.speechSynthesis.getVoices() || [];
      var zh = null;
      for (var i = 0; i < vs.length; i++) {
        if (/^zh|Chinese/i.test(vs[i].lang || '')) { zh = vs[i]; break; }
      }
      if (zh) u.voice = zh;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
  function voiceSet(on) {
    S.voice = !!on;
    try {
      if (!S.voice && window.speechSynthesis) window.speechSynthesis.cancel();
    } catch (e) {}
    return S.voice;
  }

  /* ---------------- 台词挑取：避免短时间内重复 ---------------- */
  function pick(bank, event) {
    var counter = (P().growth.affinity | 0) + S.recent.length;
    var line = C.pickDialogueAvoidRecent(bank, event, counter, Math.random, S.recent);
    if (!line) return '';
    S.recent.push(line);
    if (S.recent.length > 6) S.recent.shift();
    return line;
  }

  function cheer(bank, event, exprName, emoji) {
    var line = pick(bank, event);
    if (exprName) H.expr(exprName, 2.4);
    if (emoji) H.spark(emoji);
    return say(line, { ms: 3400 });
  }

  /* ---------------- 成长 ---------------- */
  var BONUS = {
    // 学习场景给的额外好感，让升级节奏落在「几十个单词」这一档
    study: { mood: 4, affinity: 8 },
    pomo: { mood: 10, affinity: 26 },
    quiz: { mood: 8, affinity: 18 },
    todo: { mood: 4, affinity: 8 },
    wrong: { mood: 1, affinity: 2 }
  };

  function levelOf(aff) { return Math.max(1, Math.floor(aff / C.GROWTH.LEVEL_STEP) + 1); }

  /**
   * @param {string} type core 认识的事件类型
   * @param {object} [extra] 额外加成 {mood,affinity}
   * @returns {{growth,leveledUp,unlocks}}
   */
  function grow(type, extra) {
    var p = P();
    var res = C.computeGrowth(p.growth, { type: type }, nowMs(), p.stats.pat);
    var g = res.growth;
    if (extra) {
      if (extra.mood) g.mood = clamp(g.mood + extra.mood, 0, C.GROWTH.MOOD_MAX);
      if (extra.affinity) g.affinity = clamp(g.affinity + extra.affinity, 0, C.GROWTH.AFFINITY_MAX);
      var lv = levelOf(g.affinity);
      if (lv > g.level) { g.level = lv; res.leveledUp = true; }
    }
    p.growth = g;
    p.meta.lastInteract = nowMs();
    return res;
  }

  /* ---------------- 成就 ---------------- */
  /* 只保留在学习平台上「能被真实触发」的成就，保证徽章墙最终可以集满。 */
  var ACH_KEEP = {
    'first-pat': 1, 'ten-pats': 1, 'hundred-pats': 1, 'first-feed': 1, 'first-triple': 1, 'thanks': 1,
    'lv5': 1, 'lv10': 1, 'signin3': 1, 'signin7': 1, 'night-owl': 1, 'comeback': 1,
    'day1': 1, 'day7': 1, 'day30': 1, 'day100': 1, 'day365': 1,
    'first-tool': 1, 'tools-10': 1, 'tools-50': 1, 'tools-100': 1,
    'first-code': 1, 'code-20': 1, 'first-success': 1, 'success-10': 1,
    'first-failure': 1, 'fail-10': 1, 'messages-100': 1, 'messages-500': 1,
    'keyword-master': 1, 'night-work': 1,
    'game-first': 1, 'game-win': 1, 'game-combo10': 1, 'game-highscore': 1,
    'quest-first': 1, 'quest-all': 1, 'week-signin7': 1, 'bond-action': 1, 'bond-badge': 1
  };
  var ACH_LIST = C.ACHIEVEMENTS.filter(function (a) { return ACH_KEEP[a.id]; });
  var ACH_BY_ID = {};
  ACH_LIST.forEach(function (a) { ACH_BY_ID[a.id] = a; });

  function haveAch(id) { return (P().growth.achievements || []).indexOf(id) !== -1; }

  /** 依据当前数值重新判定全部成就，返回新解锁的 id 列表 */
  function scanAch() {
    var p = P(), g = p.growth, st = p.stats, meta = p.meta;
    var out = [];
    function hit(id, cond) {
      if (cond && !haveAch(id)) out.push(id);
    }
    hit('ten-pats', st.pat >= 10);
    hit('hundred-pats', st.pat >= 100);
    hit('lv5', g.level >= 5);
    hit('lv10', g.level >= 10);
    hit('bond-action', g.level >= 3);
    hit('bond-badge', g.level >= 5);
    hit('signin3', g.signinStreak >= 3);
    hit('signin7', g.signinStreak >= 7);
    var days = Math.floor((nowMs() - meta.firstSeen) / 86400000);
    hit('day1', days >= 1);
    hit('day7', days >= 7);
    hit('day30', days >= 30);
    hit('day100', days >= 100);
    hit('day365', days >= 365);
    hit('first-tool', st.study >= 1);
    hit('tools-10', st.study >= 10);
    hit('tools-50', st.study >= 50);
    hit('tools-100', st.study >= 100);
    hit('first-code', st.code >= 1);
    hit('code-20', st.code >= 20);
    hit('first-success', st.success >= 1);
    hit('success-10', st.success >= 10);
    hit('first-failure', st.fail >= 1);
    hit('fail-10', st.fail >= 10);
    hit('messages-100', st.messages >= 100);
    hit('messages-500', st.messages >= 500);
    hit('keyword-master', st.keyword >= 10);
    hit('game-first', st.games.plays >= 1);
    hit('game-win', st.games.wins >= 1);
    hit('game-combo10', st.games.comboMax >= 10);
    hit('game-highscore', st.games.records >= 1);
    if (p.quests && p.quests.slots) {
      hit('quest-first', p.quests.slots.some(function (s) { return s.claimed; }));
      hit('quest-all', !!p.quests.allClaimed);
    }
    if (out.length) {
      g.achievements = (g.achievements || []).concat(out);
    }
    return out;
  }

  var unlockQueue = [];
  var unlocking = false;

  function flushUnlocks() {
    if (unlocking || !unlockQueue.length) return;
    unlocking = true;
    var id = unlockQueue.shift();
    var a = ACH_BY_ID[id];
    if (!a) { unlocking = false; flushUnlocks(); return; }
    var el = document.createElement('div');
    el.className = 'pet-unlock';
    el.innerHTML = '<div class="pu-ico"></div><div><div class="pu-t">成就解锁</div>' +
      '<div class="pu-n"></div><div class="pu-d"></div></div>';
    el.querySelector('.pu-ico').textContent = a.icon;
    el.querySelector('.pu-n').textContent = a.name;
    el.querySelector('.pu-d').textContent = C.applyNames(a.desc, TITLE, SELF);
    document.body.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); unlocking = false; flushUnlocks(); }, 320);
    }, 2800);
    H.spark('🏅');
    cheer('interact', 'achievement', 'happy');
  }

  function announce(ids) {
    ids.forEach(function (id) { if (unlockQueue.indexOf(id) === -1) unlockQueue.push(id); });
    if (ids.length) setTimeout(flushUnlocks, 420);
  }

  /* 统一收口：成长 → 成就扫描 → 升级提示 → 存盘 */
  function settle(res) {
    var p = P();
    var more = scanAch();
    commit();
    updateBadge();
    announce(more);
    if (res && res.leveledUp) {
      setTimeout(function () {
        H.expr('excited', 2.6);
        H.spark('🎆');
        say(pick('daily', 'levelup'), { ms: 3800 });
      }, more.length ? 900 : 260);
    }
    return more;
  }

  /* ---------------- 每日任务 ---------------- */
  function quests() {
    var p = P();
    var q = C.refreshQuests(p.quests, nowMs(), Math.random);
    p.quests = q;
    return q;
  }
  function questSignal(metric, amount) {
    var p = P();
    var r = C.computeQuests(p.quests, { metric: metric, amount: amount || 1 }, nowMs());
    p.quests = r.quests;
    return r;
  }

  /* ---------------- 徽章 ---------------- */
  function updateBadge() {
    var fab = document.getElementById('aiFab');
    if (!fab) return;
    var lv = P().growth.level;
    var el = fab.querySelector('.pet-badge');
    if (!el) {
      el = document.createElement('div');
      el.className = 'pet-badge';
      fab.appendChild(el);
    }
    var txt = 'Lv' + lv;
    if (el.textContent !== txt) {
      el.textContent = txt;
      el.classList.remove('bump');
      void el.offsetWidth;
      el.classList.add('bump');
    }
  }

  /* ---------------- 互动：摸头 / 肚子 / 尾巴 / 三连击 ---------------- */
  var ZONE_EVENT = { head: 'pat', belly: 'belly', tail: 'tail' };
  var ZONE_TEXT = { head: 'pat', belly: 'belly', tail: 'tail' };
  var ZONE_EXPR = { head: 'happy', belly: 'shy', tail: 'surprised' };
  var ZONE_EMOJI = { head: '💫', belly: '🤭', tail: '💢' };

  function pat(nx, ny) {
    var p = P();
    S.lastInteract = nowMs();
    p.meta.lastInteract = S.lastInteract;

    var zone = C.hitZone(nx, ny, 'full');
    var t = nowMs();
    S.patStreak = (t - S.lastPatAt < 1100) ? S.patStreak + 1 : 1;
    S.lastPatAt = t;

    var event = ZONE_EVENT[zone] || 'pat';
    p.stats.pat += 1;
    p.stats.zone[zone] = (p.stats.zone[zone] | 0) + 1;

    var isTriple = S.patStreak >= 3 && t - S.lastTripleAt > 2600;
    if (isTriple) {
      S.lastTripleAt = t;
      S.patStreak = 0;
      p.stats.triple += 1;
      var rTriple = grow('triple');
      questSignal('pat', 1);
      H.expr('love', 2.8);
      H.spark('💗');
      H.spark('🎉');
      settle(rTriple);
      say(pick('interact', 'triple'), { ms: 4000 });
      return 'triple';
    }
    // 冷却期里继续连点就当普通摸头，别攒着等下一下突然爆炸
    if (S.patStreak >= 3) S.patStreak = 0;

    var res = grow(event);
    questSignal('pat', 1);
    if (!haveAch('first-pat')) p.growth.achievements.push('first-pat');
    H.expr(ZONE_EXPR[zone] || 'happy', 2.0);
    if (zone === 'head') H.spark('✨');
    settle(res);
    say(pick('interact', ZONE_TEXT[zone] || 'pat'), { ms: 3000 });
    return zone;
  }

  function feed() {
    var p = P();
    S.lastInteract = nowMs();
    p.stats.feed += 1;
    p.meta.lastInteract = S.lastInteract;
    var rFeed = grow('feed');
    questSignal('feed', 1);
    H.expr('excited', 2.4);
    H.spark('🍰');
    H.spark('✨');
    settle(rFeed);
    say(pick('interact', 'feed'), { ms: 3400 });
    closeMenu();
    return true;
  }

  /* ---------------- 场景联动：学习事件 ---------------- */
  /**
   * @param {'word'|'wrong'|'pomo'|'todo'|'quiz'|'code'|'chat'} kind
   */
  function study(kind, detail) {
    detail = detail || {};
    var p = P();
    S.lastInteract = nowMs();
    p.meta.lastInteract = S.lastInteract;

    // 聊天只计数，不产生成长
    if (kind === 'chat') {
      p.stats.messages += 1;
      commit();
      updateBadge();
      return;
    }

    /* 开始学习 = 该醒着了：静默唤醒（不抢后面学习那句台词） */
    if (S.asleep) {
      S.asleep = false;
      stopDream();
      try { H.wake(); } catch (e) {}
      try { if (H.onSleep) H.onSleep(false); } catch (e2) {}
    }

    var res = null, line = '', hold = 2800;

    if (kind === 'word') {
      p.stats.study += 1;
      p.stats.success += 1;
      res = grow('success', BONUS.study);
      questSignal('success', 1);
      questSignal('tool', 1);
      H.expr('happy', 2.2);
      H.spark('✅');
      line = pick('work', 'success');
    } else if (kind === 'wrong') {
      p.stats.fail += 1;
      res = grow('failure', BONUS.wrong);
      H.expr('worried', 2.2);
      line = detail.word ? '这个先收进生词本，等会儿再来一次就好。' : pick('work', 'failure');
    } else if (kind === 'pomo') {
      p.stats.study += 1;
      p.stats.success += 1;
      res = grow('success', BONUS.pomo);
      questSignal('success', 1);
      H.expr('excited', 2.8);
      H.spark('🍅');
      H.spark('✨');
      line = pick('work', 'doneall');
      hold = 3800;
    } else if (kind === 'todo') {
      p.stats.study += 1;
      p.stats.success += 1;
      res = grow('success', BONUS.todo);
      questSignal('success', 1);
      H.expr('happy', 2.2);
      H.spark('☑️');
      line = pick('work', 'success');
      hold = 2600;
    } else if (kind === 'quiz') {
      p.stats.study += 1;
      p.stats.success += 1;
      res = grow('success', BONUS.quiz);
      questSignal('success', 1);
      H.expr(detail.pct >= 80 ? 'excited' : 'happy', 2.6);
      H.spark('📝');
      line = detail.pct >= 80 ? pick('work', 'success') : pick('work', 'gentle');
      hold = 3200;
    } else if (kind === 'code') {
      p.stats.code += 1;
      p.stats.study += 1;
      res = grow('success', BONUS.todo);
      H.expr('determined', 2.0);
      line = pick('work', 'tool');
      hold = 2600;
    }

    settle(res);
    if (line) say(line, { ms: hold });
  }

  /* ---------------- 聊天关键词 ---------------- */
  function talk(text) {
    var p = P();
    S.lastInteract = nowMs();
    p.meta.lastInteract = S.lastInteract;
    var kw = C.matchKeyword(text, true);
    if (!kw) return '';
    p.stats.keyword += 1;
    var res = null;
    if (/谢/.test(text) || /thank/i.test(text)) {
      res = grow('thanks');
    } else if (/厉害|棒|强|牛/.test(text)) {
      res = grow('praise');
    }
    H.expr(kw === 'tired' ? 'worried' : kw === 'praise' ? 'shy' : 'happy', 2.2);
    H.spark('💬');
    var line = pick('keyword', kw);
    settle(res);
    return say(line, { ms: 3600 });
  }

  /* ---------------- 分时问候 / 回归 / 签到 ---------------- */
  function greet() {
    var p = P();
    var t = nowMs();
    var lastSeen = p.meta.lastSeen || 0;
    var awayMin = (t - lastSeen) / 60000;
    p.meta.lastSeen = t;

    // 每日签到
    var res = C.computeGrowth(p.growth, { type: 'signin' }, t, p.stats.pat);
    var signedToday = res.growth.lastSignin !== p.growth.lastSignin;
    p.growth = res.growth;
    if (signedToday) questSignal('signin', 1);

    var line = '';
    if (awayMin >= 120) {
      line = pick('daily', 'comeback');
      if (!haveAch('comeback')) p.growth.achievements.push('comeback');
    } else if (signedToday) {
      line = pick('daily', 'signin');
      if (t - lastSeen > 60000) line = pick('greet', C.greetBucket(new Date().getHours()));
    } else {
      line = pick('greet', C.greetBucket(new Date().getHours()));
    }

    // 第一次见面：说清楚怎么玩，因为单击不再是打开聊天了
    if (!p.meta.hinted) {
      p.meta.hinted = 1;
      line = '点我头／肚子／尾巴有不同反应，连点三下还有彩蛋～双击我聊天，右键有菜单🐋';
    }

    // 深夜 / 深夜学习
    var h = new Date().getHours();
    if ((h >= 22 || h < 6) && !haveAch('night-owl')) p.growth.achievements.push('night-owl');

    settle(res);
    H.expr('happy', 2.2);
    H.spark('👋');
    say(line, { ms: 4200 });
    return line;
  }

  /* ---------------- 环境提醒：摸鱼 / 深夜 / 饿 ---------------- */
  function ambient() {
    var p = P();
    var t = nowMs();
    /* 睡着时一律不打扰：不衰减以外什么都不做（饱食度照常随时间走） */
    if (S.asleep) {
      p.growth = C.computeGrowth(p.growth, { type: 'tick', deltaMin: 1 }, t, p.stats.pat).growth;
      p.meta.lastSeen = t;
      commit();
      return false;
    }
    var idleMin = (t - S.lastInteract) / 60000;
    var g = p.growth;

    // 饱食度随时间衰减
    var decay = C.computeGrowth(g, { type: 'tick', deltaMin: 1 }, t, p.stats.pat);
    p.growth = decay.growth;

    var speak = false;
    if (idleMin >= 25 && t - S.idleNudgedAt > 12 * 60000) {
      S.idleNudgedAt = t;
      say(pick('daily', 'nudge'), { ms: 3800 });
      H.expr('smug', 2.2);
      speak = true;
    } else if (p.growth.satiety < 22 && t - S.idleNudgedAt > 20 * 60000) {
      S.idleNudgedAt = t;
      say('肚子有点空了……投喂一块小点心吧🍰', { ms: 3800 });
      H.expr('pout', 2.2);
      speak = true;
    }

    p.meta.lastSeen = t;
    commit();
    return speak;
  }

  /* ---------------- 睡觉模式 ----------------
     借 dsh-pet 的契约：右键/S 键睡下 → 完全安静（随机动作、碎碎念、气泡全停，
     工作状态与余额类的打扰一律不弹），只按周期说梦话；点一下或菜单叫醒。
     底层睡姿用内核自带的 act('sleep')，唤醒走 walkTo(原地) 的 wake 过渡。 */
  var SLEEP_LINES = [
    '呼…那我先眯一会儿，有事戳我一下就好。',
    '好，睡啦。你学习的时候我就在旁边打盹～',
    '唔…三分钟后叫我…（大概率会睡很久）',
    '那我趴一会儿。别学太晚哦。'
  ];
  var WAKE_LINES = [
    '唔…几点了？（揉眼睛）',
    '醒了醒了！刚才梦见一堆鱼干…',
    '呼啊——我睡了多久？你学到哪儿了？',
    '（伸了个懒腰）好啦，继续陪你。'
  ];
  var DREAMS = [
    '呼…鱼干…再来一条…',
    '唔…abandon…放弃…（说梦话）',
    '……指针别乱指……',
    '（梦话）这道题我会…我会的…',
    '呼…小云是最棒的鲸鱼娘…',
    '……再背五个就睡……'
  ];
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function sleep(on) {
    if (on === undefined) on = !S.asleep;
    on = !!on;
    if (on === S.asleep) return S.asleep;
    closeMenu();
    closePanel();
    if (on) {
      say(rand(SLEEP_LINES), { ms: 3000, noVoice: true });
      S.asleep = true;
      S.lastDreamAt = nowMs();
      try { H.act('sleep'); } catch (e) {}
      startDream();
    } else {
      S.asleep = false;
      stopDream();
      S.lastInteract = nowMs();
      try { H.wake(); } catch (e) { try { H.act('stretch'); } catch (e2) {} }
      say(rand(WAKE_LINES), { ms: 3000 });
    }
    commit();
    /* 通知宿主持久化睡/醒状态（刷新后还睡着，和 dsh-pet 的首拉补状态一致） */
    try { if (H.onSleep) H.onSleep(S.asleep); } catch (e) {}
    return S.asleep;
  }
  function startDream() {
    stopDream();
    S.dreamTimer = setInterval(function () {
      if (!S.asleep) return;
      // 不是每一轮都说，太规律反而吵
      if (Math.random() < 0.45) {
        say(rand(DREAMS), { ms: 4200, dream: true, noVoice: true });
      }
    }, 60000);
  }
  function stopDream() {
    if (S.dreamTimer) { clearInterval(S.dreamTimer); S.dreamTimer = 0; }
  }

  /* ---------------- 菜单 ---------------- */
  function closeMenu() {
    if (S.menuEl) { S.menuEl.remove(); S.menuEl = null; }
    if (S.actsEl) { S.actsEl.remove(); S.actsEl = null; }
    document.removeEventListener('pointerdown', onDocDown, true);
  }
  function onDocDown(e) {
    if (S.menuEl && S.menuEl.contains(e.target)) return;
    if (S.actsEl && S.actsEl.contains(e.target)) return;
    closeMenu();
  }

  /* ---------------- 动作面板 ----------------
     动作全来自深寻鲸鱼娘的动作表：飞 / 游 / 盘旋是从上游「Plus」分支摘来的，
     其余四个（摸头、欢呼、伸懒腰、探头）是照同一套骨架自绘的手势。
     上游那批窗口攀爬（perch / climb / cling）要一整套窗口物理，这里没搬。 */
  var ACTS = [
    { id: 'fly',     e: '🕊️', t: '飞起来' },
    { id: 'swim',    e: '🌊', t: '游一圈' },
    { id: 'soar',    e: '☁️', t: '盘旋' },
    { id: 'pat',     e: '🙈', t: '摸摸头' },
    { id: 'cheer',   e: '🙌', t: '欢呼' },
    { id: 'stretch', e: '🙆', t: '伸懒腰' },
    { id: 'peek',    e: '👀', t: '探头看' },
    { id: 'wave',    e: '👋', t: '打招呼' },
    { id: 'dance',   e: '💃', t: '跳个舞', dance: true },
    { id: 'spin',    e: '🌀', t: '转个圈' },
    { id: 'dizzy',   e: '😵', t: '装晕' },
    { id: 'sit',     e: '🪑', t: '坐下' }
  ];

  function openActs() {
    closeMenu();
    var el = document.createElement('div');
    el.className = 'pet-acts';
    el.innerHTML = '<div class="pa-hd">🎬 让小云做点什么</div><div class="pa-grid"></div>';
    var grid = el.querySelector('.pa-grid');
    ACTS.forEach(function (a) {
      var b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = '<span class="pa-e"></span><span class="pa-t"></span>';
      b.querySelector('.pa-e').textContent = a.e;
      b.querySelector('.pa-t').textContent = a.t;
      b.addEventListener('click', function () {
        closeMenu();
        S.lastInteract = nowMs();
        try {
          if (a.dance) H.dance(); else H.act(a.id);
        } catch (e) {}
        if (a.id === 'sit') say('坐一会儿，你看书我就安静待着～', { ms: 2600 });
        else if (a.id === 'swim') say('水里凉快，你要不要也歇会儿？', { ms: 2600 });
        else if (a.id === 'fly') say('飞起来啦——看得好远！', { ms: 2400 });
      });
      grid.appendChild(b);
    });
    document.body.appendChild(el);
    var box = null;
    try { box = H.petBox && H.petBox(); } catch (e) {}
    var r = el.getBoundingClientRect();
    var px = box ? box.cx : window.innerWidth - 120;
    var py = box ? box.top : window.innerHeight - 260;
    el.style.left = clamp(px - r.width / 2, 8, window.innerWidth - r.width - 8) + 'px';
    el.style.top = clamp(py - r.height - 12, 8, window.innerHeight - r.height - 8) + 'px';
    S.actsEl = el;
    setTimeout(function () { document.addEventListener('pointerdown', onDocDown, true); }, 0);
  }

  function sleepItem() {
    return S.asleep
      ? { ico: '☀️', label: '叫醒她', sub: 'S 键 / 点一下也行',
          fn: function () { sleep(false); } }
      : { ico: '😴', label: '让她睡下', sub: 'S 键 · 睡着就不打扰了',
          fn: function () { sleep(true); } };
  }
  function voiceItem() {
    return S.voice
      ? { ico: '🔇', label: '关掉朗读', sub: '让她安静说话',
          fn: function () { closeMenu(); voiceSet(false); commit(); say('好，我安静一点。', { ms: 2200, noVoice: true }); } }
      : { ico: '🔊', label: '让她念出来', sub: '用系统语音读气泡',
          fn: function () { closeMenu(); voiceSet(true); commit(); say('那我说的话就念给你听啦～', { ms: 2600 }); } };
  }
  /* 会自己走动的桌宠得能「拴住」，不然看资料时她一直在动 */
  function pinItem() {    var pinned = false;
    try { pinned = !!(H.isPinned && H.isPinned()); } catch (e) {}
    return pinned
      ? { ico: '🚶', label: '解开固定', sub: '让她继续走动',
          fn: function () { closeMenu(); try { H.togglePin(); } catch (e) {} } }
      : { ico: '📌', label: '固定住她', sub: '别让她乱跑',
          fn: function () { closeMenu(); try { H.togglePin(); } catch (e) {} } };
  }

  function openMenu(x, y) {
    closeMenu();
    var p = P();
    var el = document.createElement('div');
    el.className = 'pet-menu';
    /* 睡着时只留「叫醒 / 固定」，其余菜单项一律不接——拒绝打扰 */
    var items = S.asleep ? [sleepItem(), pinItem()] : [
      { ico: '🍰', label: '投喂小点心', sub: '饱食度 +30', fn: feed },
      { ico: '🫧', label: '接蛋糕小游戏', sub: '30 秒', fn: function () { closeMenu(); openGame(); } },
      { ico: '🎖️', label: '成长与成就', sub: 'Lv' + p.growth.level, fn: function () { closeMenu(); openPanel(); } },
      { ico: '💬', label: '和她说说话', sub: '双击也可以', fn: function () { closeMenu(); H.openChat(); } },
      { sep: true },
      { ico: '🎬', label: '挑个动作', sub: '飞 / 游 / 欢呼…', fn: function () { openActs(); } },
      sleepItem(),
      voiceItem(),
      pinItem(),
      { ico: '👋', label: '打个招呼', sub: '', fn: function () { closeMenu(); greet(); } }
    ];
    items.forEach(function (it) {
      if (it.sep) { el.appendChild(document.createElement('hr')); return; }
      var b = document.createElement('button');
      b.innerHTML = '<span class="pm-ico"></span><span class="pm-l"></span><span class="pm-sub"></span>';
      b.querySelector('.pm-ico').textContent = it.ico;
      b.querySelector('.pm-l').textContent = it.label;
      b.querySelector('.pm-sub').textContent = it.sub || '';
      b.addEventListener('click', it.fn);
      el.appendChild(b);
    });
    document.body.appendChild(el);
    // 贴着点击位置弹出，别飞出屏幕
    var r = el.getBoundingClientRect();
    var left = clamp(x - r.width + 12, 8, window.innerWidth - r.width - 8);
    var top = clamp(y - r.height - 10, 8, window.innerHeight - r.height - 8);
    el.style.left = left + 'px';
    el.style.top = top + 'px';
    S.menuEl = el;
    setTimeout(function () { document.addEventListener('pointerdown', onDocDown, true); }, 0);
  }

  /* ---------------- 成长面板 ---------------- */
  function closePanel() {
    if (S.panelEl) { S.panelEl.remove(); S.panelEl = null; }
  }

  function meter(name, cls, val, max, extra) {
    return '<div class="pp-meter">' +
      '<div class="pm-row"><span class="pm-name">' + name + '</span>' +
      '<span class="pm-val">' + Math.round(val) + ' / ' + max + (extra || '') + '</span></div>' +
      '<div class="pp-track ' + cls + '"><i style="width:' + clamp(val / max * 100, 0, 100).toFixed(1) + '%"></i></div>' +
      '</div>';
  }

  function openPanel() {
    if (S.panelEl) { closePanel(); return; }
    var p = P();
    var g = p.growth;
    var q = quests();
    var cur = g.affinity - (g.level - 1) * C.GROWTH.LEVEL_STEP;

    var el = document.createElement('div');
    el.className = 'pet-panel';

    var qHtml = (q.slots || []).map(function (s) {
      var def = null;
      C.QUEST_POOL.forEach(function (d) { if (d.id === s.id) def = d; });
      if (!def) return '';
      var pct = clamp(s.progress / def.target * 100, 0, 100);
      var can = s.progress >= def.target && !s.claimed;
      return '<div class="pp-quest' + (s.claimed ? ' done' : '') + '">' +
        '<span class="pq-desc">' + def.desc + '</span>' +
        '<span class="pq-bar"><i style="width:' + pct.toFixed(0) + '%"></i></span>' +
        '<button class="pq-btn" data-q="' + s.id + '"' + (can ? '' : ' disabled') + '>' +
        (s.claimed ? '已领' : can ? '领取' : s.progress + '/' + def.target) + '</button></div>';
    }).join('');

    var achHtml = ACH_LIST.map(function (a) {
      var got = (g.achievements || []).indexOf(a.id) !== -1;
      return '<div class="pp-ach' + (got ? ' got' : '') + '" title="' + a.name + '：' + a.desc + '">' +
        '<span>' + a.icon + '</span>' + (got ? '<span class="pa-name">' + a.name + '</span>' : '') + '</div>';
    }).join('');

    el.innerHTML =
      '<div class="pp-head">' +
      '<span class="pp-title">🐋 小云的成长</span>' +
      '<span class="pp-lv">Lv' + g.level + '</span>' +
      '<button class="pp-x" aria-label="关闭">✕</button>' +
      '</div><div class="pp-body">' +
      meter('💗 好感度', 'love', cur, C.GROWTH.LEVEL_STEP, ' · 距离 Lv' + (g.level + 1)) +
      meter('😊 心情', 'mood', g.mood, C.GROWTH.MOOD_MAX) +
      meter('🍰 饱食度', 'belly', g.satiety, C.GROWTH.SATIETY_MAX) +
      '<div class="pp-sec">今日任务 · ' + (q.date || '') + '</div>' +
      '<div class="pp-quests">' + (qHtml || '<div class="pp-empty">今天还没有任务</div>') + '</div>' +
      '<div class="pp-sec">成就 ' + (g.achievements || []).length + ' / ' + ACH_LIST.length + '</div>' +
      '<div class="pp-achv">' + achHtml + '</div>' +
      '<div class="pp-sec">存档</div>' +
      '<div class="pp-tools">' +
      '<button class="pp-tool" data-act="export">⬇️ 导出存档</button>' +
      '<button class="pp-tool" data-act="import">⬆️ 导入存档</button>' +
      '</div>' +
      '<div class="pp-hint">等级、好感、成就都存在这台浏览器的本地，清缓存或换设备会断档。换之前导出一份，新设备上导入就能接上。</div>' +
      '</div>';

    el.querySelector('.pp-x').addEventListener('click', closePanel);
    el.querySelectorAll('.pq-btn').forEach(function (b) {
      b.addEventListener('click', function () { claim(b.dataset.q); });
    });
    el.querySelectorAll('.pp-tool').forEach(function (b) {
      b.addEventListener('click', function () {
        if (b.dataset.act === 'export') { closePanel(); H.exportSave(); }
        else { closePanel(); H.importSave(); }
      });
    });
    document.body.appendChild(el);
    S.panelEl = el;
  }

  function claim(id) {
    var p = P();
    var r = C.claimQuest(p.quests, id, nowMs());
    if (!r.claimed) { H.toast('还没完成哦'); return; }
    p.quests = r.quests;
    var res = grow('quest');
    if (r.newlyAll) grow('questAll');
    settle(res);
    H.toast('任务奖励已领取');
    H.expr('happy', 2.0);
    H.spark('🎁');
    closePanel(); openPanel();
  }

  /* ---------------- 接蛋糕小游戏 ---------------- */
  function gameGradeText(grade) {
    return ({
      S: '完美配合！',
      A: '漂亮，手感在线',
      B: '还不错哦',
      C: '再练一手',
      D: '下次一定'
    })[grade] || '加油';
  }

  function openGame() {
    if (S.game) return;
    var mask = document.createElement('div');
    mask.className = 'pet-game-mask';
    mask.innerHTML =
      '<div class="pet-game">' +
      '<div class="pg-head"><span class="pg-t">🫧 接蛋糕</span>' +
      '<span class="pg-hud"></span></div>' +
      '<div class="pg-stage"><div class="pg-basket">🧺</div></div>' +
      '<div class="pg-foot"><span class="pg-hint">移动鼠标 / 手指接住 🍰 和 ⭐，躲开 💣</span>' +
      '<button class="pg-btn ghost" data-act="close">退出</button></div>' +
      '</div>';
    document.body.appendChild(mask);

    var stage = mask.querySelector('.pg-stage');
    var basket = mask.querySelector('.pg-basket');
    var hud = mask.querySelector('.pg-hud');
    var state = C.catchNewState(nowMs(), Math.random);
    var itemEls = [];
    var raf = 0;
    var ended = false;

    S.game = { mask: mask, state: state, close: stop };

    function pointerX(e) {
      var r = stage.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      S.game.state = C.catchMove(S.game.state, x);
      state = S.game.state;
      basket.style.left = (state.basketX * 100) + '%';
    }
    function onMove(e) { pointerX(e); }
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerdown', onMove);

    basket.style.left = '50%';
    basket.style.top = (C.CATCH.BASKET_Y * 100) + '%';

    function pop(text, x, y, color) {
      var s = document.createElement('span');
      s.className = 'pg-pop';
      s.textContent = text;
      s.style.left = (x * 100) + '%';
      s.style.top = (y * 100) + '%';
      s.style.color = color || 'var(--accent)';
      stage.appendChild(s);
      setTimeout(function () { s.remove(); }, 760);
    }

    function loop() {
      if (ended) return;
      var t = nowMs();
      var res = C.catchTick(S.game.state, t, Math.random);
      state = res.state;
      S.game.state = state;

      // 事件气泡
      res.events.forEach(function (ev) {
        if (ev.kind === 'caught') {
          if (ev.item === 'bomb') pop('-20', state.basketX, CATCH_Y(), '#e5484d');
          else if (ev.item === 'star') pop('+30', state.basketX, CATCH_Y(), '#f59e0b');
          else pop('+10', state.basketX, CATCH_Y(), '#16a34a');
        } else if (ev.kind === 'missed' && ev.item !== 'bomb') {
          pop('miss', state.basketX, CATCH_Y(), 'var(--muted)');
        }
      });

      // 同步 DOM
      var items = state.items;
      while (itemEls.length < items.length) {
        var d = document.createElement('div');
        d.className = 'pg-item';
        stage.appendChild(d);
        itemEls.push(d);
      }
      while (itemEls.length > items.length) {
        var rm = itemEls.pop();
        rm.remove();
      }
      for (var i = 0; i < items.length; i++) {
        var it = items[i];
        var el = itemEls[i];
        el.textContent = it.kind === 'bomb' ? '💣' : it.kind === 'star' ? '⭐' : '🍰';
        el.style.left = (it.x * 100) + '%';
        el.style.top = (it.y * 100) + '%';
      }

      var left = Math.ceil(state.remainingMs / 1000);
      hud.textContent = '得分 ' + state.score + ' · 连击 ' + state.combo + ' · ' + left + 's';

      if (state.status === 'ended') { finish(); return; }
      raf = requestAnimationFrame(loop);
    }
    function CATCH_Y() { return C.CATCH.BASKET_Y; }

    function finish() {
      if (ended) return;
      ended = true;
      cancelAnimationFrame(raf);
      var r = C.catchResult(state);
      var p = P();
      p.stats.games.plays += 1;
      if (r.score >= 200) p.stats.games.wins += 1;
      p.stats.games.comboMax = Math.max(p.stats.games.comboMax, r.comboMax || 0);
      var isHigh = r.score > p.stats.games.highscore;
      if (isHigh) p.stats.games.highscore = r.score;
      if (r.score >= 200) grow('game-win');
      else if (r.score >= 80) grow('game-draw');
      else grow('game-lose');
      if (isHigh) grow('high-score');
      settle({});
      H.spark(r.score >= 200 ? '🎉' : '🍰');

      var body = mask.querySelector('.pg-stage');
      var foot = mask.querySelector('.pg-foot');
      body.style.display = 'none';
      foot.style.display = 'none';
      var box = mask.querySelector('.pet-game');
      var res = document.createElement('div');
      res.className = 'pg-result';
      res.innerHTML =
        '<div class="pr-ico">' + (r.score >= 200 ? '🏆' : r.score >= 80 ? '🎉' : '🍰') + '</div>' +
        '<div class="pr-score">' + r.score + '</div>' +
        '<div class="pr-grade">' + gameGradeText(r.grade) + ' · 接住 ' + r.caught + ' 个 · 最高连击 ' + (r.comboMax || 0) + '</div>' +
        '<div class="pr-line"></div>' +
        '<button class="pg-btn" data-act="again">再来一局</button> ' +
        '<button class="pg-btn ghost" data-act="close">收下奖励</button>';
      res.querySelector('.pr-line').textContent = say(
        r.score >= 200 ? pick('work', 'success') : pick('work', 'gentle'), { ms: 200 }
      );
      box.appendChild(res);
      res.querySelector('[data-act="again"]').addEventListener('click', function () {
        stop(); openGame();
      });
      res.querySelector('[data-act="close"]').addEventListener('click', stop);
    }

    function stop() {
      ended = true;
      cancelAnimationFrame(raf);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerdown', onMove);
      if (mask.parentNode) mask.remove();
      S.game = null;
    }

    mask.querySelector('[data-act="close"]').addEventListener('click', stop);
    mask.addEventListener('click', function (e) {
      if (e.target === mask) stop();
    });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape' && S.game) { stop(); document.removeEventListener('keydown', esc); }
    });

    raf = requestAnimationFrame(loop);
  }

  /* ---------------- 单击 / 双击手势 ---------------- */
  function tap(e) {
    var t = nowMs();
    if (S.suppressTap) { S.suppressTap = false; return 'skipped'; }
    /* 睡着时单击就是叫醒，不播点击回应（dsh-pet 的做法） */
    if (S.asleep) { sleep(false); return 'wake'; }
    var r = petRect();
    var cx = (e && e.clientX) || r.left + r.width / 2;
    var cy = (e && e.clientY) || r.top + r.height * 0.35;
    var nx = (cx - r.left) / Math.max(1, r.width);
    var ny = (cy - r.top) / Math.max(1, r.height);

    if (S.tapTimer && t - S.lastTapAt < 300) {
      clearTimeout(S.tapTimer);
      S.tapTimer = 0;
      S.lastTapAt = 0;
      H.openChat();
      return 'dbl';
    }
    S.lastTapAt = t;
    S.tapTimer = setTimeout(function () {
      S.tapTimer = 0;
      pat(nx, ny);
    }, 265);
    return 'single';
  }

  /* ---------------- 初始化 ---------------- */
  function init(cfg) {
    if (S.ready) return;
    Object.assign(H, cfg || {});
    S.ready = true;

    var fab = document.getElementById('aiFab');
    if (fab) {
      fab.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        S.suppressTap = true;
        openMenu(e.clientX, e.clientY);
      });
      // 移动端没有右键：长按 620ms 叫出菜单（拖拽时会被 pointerup 取消）
      var lpTimer = 0;
      fab.addEventListener('pointerdown', function (e) {
        clearTimeout(lpTimer);
        lpTimer = setTimeout(function () {
          S.suppressTap = true;
          openMenu(e.clientX, e.clientY);
        }, 620);
      });
      ['pointerup', 'pointercancel', 'pointermove'].forEach(function (ev) {
        fab.addEventListener(ev, function () { clearTimeout(lpTimer); });
      });
      updateBadge();
    }

    // 首屏问候
    setTimeout(function () { try { greet(); } catch (e) { console.warn('[pet] greet', e); } }, 900);

    // 每分钟：饱食度衰减 + 摸鱼提醒
    S.timer = setInterval(function () {
      try { ambient(); } catch (e) { console.warn('[pet] ambient', e); }
    }, 60000);

    // 气泡跟随桌宠（被拖来拖去时也贴在头上）
    setInterval(placeSay, 160);
    window.addEventListener('resize', placeSay);

    /* S 键切换睡 / 醒（输入框里打字不算，带修饰键也不算） */
    document.addEventListener('keydown', function (e) {
      if (e.key !== 's' && e.key !== 'S') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      try { sleep(); } catch (err) {}
    });

    window.addEventListener('beforeunload', function () {
      try { var p = P(); p.meta.lastSeen = nowMs(); commit(); } catch (e) {}
    });

    console.log('[pet-brain] 已启动：' + C.dialogueCount() + ' 条台词 / ' + ACH_LIST.length + ' 个成就');
  }

  /* ---------------- 对外 ---------------- */
  window.PetBrain = {
    init: init,
    tap: tap,
    pat: pat,
    feed: feed,
    study: study,
    talk: talk,
    say: say,
    greet: greet,
    panel: openPanel,
    menu: openMenu,
    game: openGame,
    /* 睡觉模式（借 dsh-pet）：sleep(true/false/空=切换) · asleep() 查询 */
    sleep: sleep,
    asleep: function () { return !!S.asleep; },
    /* 语音朗读开关 */
    voice: voiceSet,
    voiceOn: function () { return !!S.voice; },
    /* 说一句「工作状态」：睡着时不打扰，返回是否真的说了 */
    status: function (text, opts) {
      if (S.asleep) return '';
      return say(text, opts);
    },
    closeAll: function () { closePanel(); closeMenu(); },
    stats: function () {
      var p = P();
      return { growth: p.growth, stats: p.stats, quests: p.quests, achievements: p.growth.achievements.slice() };
    },
    speaking: function () { return !!(sayEl && sayEl.classList.contains('on')); },
    lines: function () { return C.dialogueCount(); },
    achievements: function () { return ACH_LIST.slice(); },
    _core: C
  };
})();

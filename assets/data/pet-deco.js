/* ============================================================
   桌宠装饰品（纯手绘 SVG，无外部图片）
   ------------------------------------------------------------
   每个装饰以「viewBox 底边中点」为锚点：渲染时该点对准头顶。
   w / h 是尺寸（单位：桌宠模型单位，乘缩放系数得 px）。
   ox / oy 是锚点微调（同单位，正 oy = 往下压，帽子才盖得住头顶）。
   __I__ 会被替换成唯一后缀，避免多个实例的渐变 id 冲突。
   ============================================================ */
window.PET_DECO = [
  /* ---------------- 醒狮头套（主推） ---------------- */
  {
    id: 'lion', name: '醒狮头套', tag: '热门',
    desc: '红绒金角、大眼绒球，过年那味儿',
    w: 232, h: 211, ox: 0, oy: 95,
    svg: `<svg viewBox="0 0 220 200" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="lr__I__" x1="0" y1="0" x2=".15" y2="1">
      <stop offset="0" stop-color="#ff6b5e"/><stop offset=".45" stop-color="#e8262e"/><stop offset="1" stop-color="#a80f1c"/>
    </linearGradient>
    <linearGradient id="lgd__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff3c4"/><stop offset=".45" stop-color="#f8ce4e"/><stop offset="1" stop-color="#cf8f18"/>
    </linearGradient>
    <radialGradient id="lbal__I__" cx=".34" cy=".28" r=".78">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#f4f0ea"/><stop offset="1" stop-color="#d8d2c8"/>
    </radialGradient>
    <radialGradient id="leye__I__" cx=".4" cy=".32" r=".8">
      <stop offset="0" stop-color="#ffffff"/><stop offset=".62" stop-color="#f7fbff"/><stop offset="1" stop-color="#c9dbe8"/>
    </radialGradient>
    <linearGradient id="lrib__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ff8a5c"/><stop offset="1" stop-color="#e8452f"/>
    </linearGradient>
  </defs>

  <!-- 两侧飘带（会摆） -->
  <g class="pw-rib" style="transform-origin:26px 112px">
    <path d="M28 112 C12 134 8 156 16 176" fill="none" stroke="url(#lrib__I__)" stroke-width="11" stroke-linecap="round" opacity=".92"/>
    <path d="M28 112 C12 134 8 156 16 176" fill="none" stroke="#ffe9a0" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 9" opacity=".8"/>
  </g>
  <g class="pw-rib" style="transform-origin:194px 112px;animation-delay:-1.4s">
    <path d="M192 112 C208 134 212 156 204 176" fill="none" stroke="url(#lrib__I__)" stroke-width="11" stroke-linecap="round" opacity=".92"/>
    <path d="M192 112 C208 134 212 156 204 176" fill="none" stroke="#ffe9a0" stroke-width="3" stroke-linecap="round" stroke-dasharray="7 9" opacity=".8"/>
  </g>

  <!-- 压在头发上的投影，戴上才不飘 -->
  <ellipse cx="110" cy="182" rx="56" ry="9" fill="#5d0a12" opacity=".22"/>

  <!-- 白色绒底 + 颗粒毛边 -->
  <path d="M30 84 C30 44 62 24 110 24 C158 24 190 44 190 84 L186 130 C184 162 150 182 110 182 C70 182 36 162 34 130 Z"
        fill="#fdf8f1"/>
  <path d="M30 84 C30 44 62 24 110 24 C158 24 190 44 190 84 L186 130 C184 162 150 182 110 182 C70 182 36 162 34 130 Z"
        fill="none" stroke="#fffdf8" stroke-width="19" stroke-linecap="round" stroke-dasharray="0.1 17"/>

  <!-- 红色绒面主体 -->
  <path d="M36 86 C36 50 66 32 110 32 C154 32 184 50 184 86 L180 128 C178 156 148 174 110 174 C72 174 42 156 40 128 Z"
        fill="url(#lr__I__)"/>
  <!-- 绒面暗纹 -->
  <path d="M60 44 C78 36 96 33 110 33 C124 33 142 36 160 44" fill="none" stroke="#ff9d8f" stroke-width="4" stroke-linecap="round" opacity=".45"/>
  <path d="M50 62 C58 54 66 48 74 45" fill="none" stroke="#ffb4a6" stroke-width="3" stroke-linecap="round" opacity=".4"/>

  <!-- 金色包边 -->
  <path d="M36 86 C36 50 66 32 110 32 C154 32 184 50 184 86 L180 128 C178 156 148 174 110 174 C72 174 42 156 40 128 Z"
        fill="none" stroke="url(#lgd__I__)" stroke-width="5"/>

  <!-- 两只金角 -->
  <g>
    <path d="M64 40 C54 22 60 6 78 2 C74 14 74 26 80 38 Z" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.5"/>
    <path d="M70 32 C68 22 70 14 74 8" fill="none" stroke="#fff6cf" stroke-width="2" stroke-linecap="round" opacity=".8"/>
    <path d="M156 40 C166 22 160 6 142 2 C146 14 146 26 140 38 Z" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.5"/>
    <path d="M150 32 C152 22 150 14 146 8" fill="none" stroke="#fff6cf" stroke-width="2" stroke-linecap="round" opacity=".8"/>
  </g>

  <!-- 额头绒球 -->
  <g class="pw-bob" style="transform-origin:110px 58px">
    <circle cx="110" cy="58" r="21" fill="url(#lbal__I__)"/>
    <circle cx="110" cy="58" r="21" fill="none" stroke="#e8ddcc" stroke-width="1.6"/>
    <circle cx="110" cy="58" r="8.5" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.2"/>
    <circle cx="103" cy="50" r="6" fill="#fff" opacity=".9"/>
  </g>

  <!-- 眼睛 -->
  <g>
    <circle cx="78" cy="100" r="25" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.6"/>
    <circle cx="78" cy="100" r="19.5" fill="url(#leye__I__)"/>
    <circle cx="80" cy="101" r="10.5" fill="#151a2e"/>
    <circle cx="75.5" cy="96" r="4.2" fill="#fff" opacity=".95"/>
    <circle cx="84" cy="106" r="2" fill="#fff" opacity=".5"/>
    <circle cx="142" cy="100" r="25" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.6"/>
    <circle cx="142" cy="100" r="19.5" fill="url(#leye__I__)"/>
    <circle cx="144" cy="101" r="10.5" fill="#151a2e"/>
    <circle cx="139.5" cy="96" r="4.2" fill="#fff" opacity=".95"/>
    <circle cx="148" cy="106" r="2" fill="#fff" opacity=".5"/>
  </g>

  <!-- 鼻与嘴 -->
  <path d="M110 118 L124 130 L110 138 L96 130 Z" fill="url(#lgd__I__)" stroke="#b8791a" stroke-width="1.4"/>
  <path d="M86 148 C96 142 124 142 134 148 C130 162 118 168 110 168 C102 168 90 162 86 148 Z" fill="#8e1020"/>
  <path d="M92 148 C100 145 120 145 128 148" fill="none" stroke="#ffd9a0" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M100 154 L104 161 L108 154 Z" fill="#fff8e6"/>
  <path d="M112 154 L116 161 L120 154 Z" fill="#fff8e6"/>
</svg>`
  },

  /* ---------------- 小皇冠 ---------------- */
  {
    id: 'crown', name: '小皇冠', tag: '',
    desc: '金灿灿，今天也是被宠着的一天',
    w: 138, h: 104, ox: 0, oy: 84,
    svg: `<svg viewBox="0 0 140 106" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="cg__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff7cd"/><stop offset=".42" stop-color="#fbd24e"/><stop offset="1" stop-color="#c98a12"/>
    </linearGradient>
    <radialGradient id="cgem__I__" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#ff9ec4"/><stop offset="1" stop-color="#c2185b"/>
    </radialGradient>
  </defs>
  <path d="M14 82 L8 30 L40 54 L70 16 L100 54 L132 30 L126 82 Z" fill="url(#cg__I__)" stroke="#a86f0e" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M24 76 L20 46 L44 62 L70 34 L96 62 L120 46 L116 76 Z" fill="#fff3b8" opacity=".42"/>
  <rect x="12" y="78" width="116" height="18" rx="8" fill="url(#cg__I__)" stroke="#a86f0e" stroke-width="2.2"/>
  <circle cx="70" cy="87" r="6" fill="url(#cgem__I__)" stroke="#8d1b45" stroke-width="1.2"/>
  <circle cx="38" cy="87" r="4.4" fill="#7ec8ff" stroke="#2b6fa8" stroke-width="1"/>
  <circle cx="102" cy="87" r="4.4" fill="#7ec8ff" stroke="#2b6fa8" stroke-width="1"/>
  <circle cx="8" cy="28" r="5.5" fill="#fff6cf" stroke="#c98a12" stroke-width="1.4"/>
  <circle cx="70" cy="13" r="5.5" fill="#fff6cf" stroke="#c98a12" stroke-width="1.4"/>
  <circle cx="132" cy="28" r="5.5" fill="#fff6cf" stroke="#c98a12" stroke-width="1.4"/>
  <g class="pw-twinkle"><path d="M112 24 l2.6 6.4 6.4 2.6 -6.4 2.6 -2.6 6.4 -2.6 -6.4 -6.4 -2.6 6.4 -2.6 Z" fill="#fff" opacity=".95"/></g>
</svg>`
  },

  /* ---------------- 蝴蝶结 ---------------- */
  {
    id: 'bow', name: '蝴蝶结', tag: '',
    desc: '斜斜地别一朵，软乎乎的',
    w: 170, h: 125, ox: 36, oy: 92,
    svg: `<svg viewBox="0 0 150 110" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="bw__I__" x1=".1" y1="0" x2=".9" y2="1">
      <stop offset="0" stop-color="#ffb3d1"/><stop offset=".45" stop-color="#f472b6"/><stop offset="1" stop-color="#c02d7a"/>
    </linearGradient>
    <linearGradient id="bw2__I__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffd6e7"/><stop offset="1" stop-color="#f07bb0"/>
    </linearGradient>
  </defs>
  <path d="M72 56 C52 34 22 28 14 48 C6 68 30 84 72 64 Z" fill="url(#bw__I__)" stroke="#a32565" stroke-width="2"/>
  <path d="M78 56 C98 34 128 28 136 48 C144 68 120 84 78 64 Z" fill="url(#bw__I__)" stroke="#a32565" stroke-width="2"/>
  <path d="M64 54 C48 40 30 38 24 48 C18 58 34 70 64 62 Z" fill="url(#bw2__I__)" opacity=".55"/>
  <path d="M86 54 C102 40 120 38 126 48 C132 58 116 70 86 62 Z" fill="url(#bw2__I__)" opacity=".55"/>
  <path d="M70 72 C64 90 54 100 40 108 C54 106 66 94 76 78 Z" fill="url(#bw__I__)" stroke="#a32565" stroke-width="1.6"/>
  <path d="M80 72 C86 90 96 100 110 108 C96 106 84 94 74 78 Z" fill="url(#bw__I__)" stroke="#a32565" stroke-width="1.6"/>
  <ellipse cx="75" cy="59" rx="15" ry="13" fill="url(#bw2__I__)" stroke="#a32565" stroke-width="2"/>
  <ellipse cx="71" cy="55" rx="5" ry="3.6" fill="#fff" opacity=".75" transform="rotate(-25 71 55)"/>
</svg>`
  },

  /* ---------------- 猫耳 ---------------- */
  {
    id: 'cat', name: '猫耳', tag: '',
    desc: '会轻轻抖一下的那种',
    w: 176, h: 111, ox: 0, oy: 76,
    svg: `<svg viewBox="0 0 200 126" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="ce__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#7183de"/><stop offset="1" stop-color="#39479b"/>
    </linearGradient>
    <linearGradient id="ci__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffd3e2"/><stop offset="1" stop-color="#f08fb2"/>
    </linearGradient>
  </defs>
  <g class="pw-ear-l" style="transform-origin:56px 124px">
    <path d="M24 124 C22 92 36 62 64 40 C90 62 106 92 108 124 Z" fill="url(#ce__I__)" stroke="#2c3877" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M42 116 C42 96 50 78 64 62 C78 78 86 96 86 116 Z" fill="url(#ci__I__)" opacity=".92"/>
    <path d="M46 104 C48 88 54 76 60 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/>
  </g>
  <g class="pw-ear-r" style="transform-origin:144px 124px;animation-delay:-2.1s">
    <path d="M176 124 C178 92 164 62 136 40 C110 62 94 92 92 124 Z" fill="url(#ce__I__)" stroke="#2c3877" stroke-width="2.6" stroke-linejoin="round"/>
    <path d="M158 116 C158 96 150 78 136 62 C122 78 114 96 114 116 Z" fill="url(#ci__I__)" opacity=".92"/>
    <path d="M154 104 C152 88 146 76 140 66" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".3"/>
  </g>
</svg>`
  },

  /* ---------------- 耳机 ---------------- */
  {
    id: 'headset', name: '头戴耳机', tag: '',
    desc: 'study with me，世界安静了',
    w: 240, h: 176, ox: 0, oy: 168,
    svg: `<svg viewBox="0 0 240 178" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="hs__I__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#4b5568"/><stop offset=".5" stop-color="#2b3243"/><stop offset="1" stop-color="#1a1f2c"/>
    </linearGradient>
    <linearGradient id="hp__I__" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffb0d0"/><stop offset="1" stop-color="#e0417f"/>
    </linearGradient>
  </defs>
  <path d="M34 132 C34 48 74 16 120 16 C166 16 206 48 206 132" fill="none" stroke="url(#hs__I__)" stroke-width="17" stroke-linecap="round"/>
  <path d="M40 128 C40 54 76 24 120 24 C164 24 200 54 200 128" fill="none" stroke="#7d8aa6" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  <g>
    <rect x="11" y="94" width="46" height="80" rx="23" fill="url(#hs__I__)" stroke="#11161f" stroke-width="2.2"/>
    <rect x="20" y="106" width="28" height="56" rx="14" fill="url(#hp__I__)"/>
    <rect x="26" y="114" width="8" height="20" rx="4" fill="#fff" opacity=".35"/>
    <rect x="183" y="94" width="46" height="80" rx="23" fill="url(#hs__I__)" stroke="#11161f" stroke-width="2.2"/>
    <rect x="192" y="106" width="28" height="56" rx="14" fill="url(#hp__I__)"/>
    <rect x="198" y="114" width="8" height="20" rx="4" fill="#fff" opacity=".35"/>
  </g>
  <circle cx="120" cy="30" r="5.5" fill="#ffd166" opacity=".9"/>
</svg>`
  },

  /* ---------------- 花环 ---------------- */
  {
    id: 'wreath', name: '樱花花环', tag: '',
    desc: '一圈小樱花，春天戴在头上',
    w: 214, h: 122, ox: 0, oy: 104,
    svg: `<svg viewBox="0 0 216 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="wl__I__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#8ac95f"/><stop offset="1" stop-color="#3f7d33"/>
    </linearGradient>
    <radialGradient id="wf__I__" cx=".4" cy=".35" r=".75">
      <stop offset="0" stop-color="#fff5fa"/><stop offset=".5" stop-color="#ffc2da"/><stop offset="1" stop-color="#ee8fb6"/>
    </radialGradient>
  </defs>
  <path d="M26 112 C26 54 64 20 108 20 C150 20 186 52 186 104" fill="none" stroke="url(#wl__I__)" stroke-width="9" stroke-linecap="round"/>
  <g fill="url(#wl__I__)" opacity=".95">
    <ellipse cx="40" cy="66" rx="13" ry="6" transform="rotate(-42 40 66)"/>
    <ellipse cx="172" cy="70" rx="13" ry="6" transform="rotate(44 172 70)"/>
    <ellipse cx="70" cy="34" rx="12" ry="5.5" transform="rotate(-18 70 34)"/>
    <ellipse cx="146" cy="36" rx="12" ry="5.5" transform="rotate(20 146 36)"/>
  </g>
  <g class="pw-flower">
    <g transform="translate(108 22)">
      <circle r="6.5" fill="#ffd166"/>
      <g fill="url(#wf__I__)" stroke="#e07aa6" stroke-width="1">
        <ellipse cy="-11" rx="7" ry="9"/><ellipse cy="11" rx="7" ry="9"/>
        <ellipse cx="-11" rx="9" ry="7"/><ellipse cx="11" rx="9" ry="7"/>
        <ellipse cx="-8" cy="-8" rx="7" ry="8" transform="rotate(-45 -8 -8)"/>
        <ellipse cx="8" cy="8" rx="7" ry="8" transform="rotate(-45 8 8)"/>
      </g>
      <circle r="5" fill="#ffd166"/>
    </g>
    <g transform="translate(48 44) scale(.8)">
      <g fill="url(#wf__I__)" stroke="#e07aa6" stroke-width="1">
        <ellipse cy="-11" rx="7" ry="9"/><ellipse cy="11" rx="7" ry="9"/>
        <ellipse cx="-11" rx="9" ry="7"/><ellipse cx="11" rx="9" ry="7"/>
      </g>
      <circle r="6" fill="#ffd166"/>
    </g>
    <g transform="translate(168 46) scale(.85)">
      <g fill="url(#wf__I__)" stroke="#e07aa6" stroke-width="1">
        <ellipse cy="-11" rx="7" ry="9"/><ellipse cy="11" rx="7" ry="9"/>
        <ellipse cx="-11" rx="9" ry="7"/><ellipse cx="11" rx="9" ry="7"/>
      </g>
      <circle r="6" fill="#ffd166"/>
    </g>
  </g>
  <g transform="translate(183 92) scale(.68)">
      <g fill="url(#wf__I__)" stroke="#e07aa6" stroke-width="1">
        <ellipse cy="-11" rx="7" ry="9"/><ellipse cy="11" rx="7" ry="9"/>
        <ellipse cx="-11" rx="9" ry="7"/><ellipse cx="11" rx="9" ry="7"/>
      </g>
      <circle r="6" fill="#ffd166"/>
    </g>
</svg>`
  },

  /* ---------------- 学士帽 ---------------- */
  {
    id: 'grad', name: '学士帽', tag: '',
    desc: '毕业季限定，流苏会晃',
    w: 188, h: 120, ox: 0, oy: 96,
    svg: `<svg viewBox="0 0 190 120" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="gd__I__" x1="0" y1="0" x2=".3" y2="1">
      <stop offset="0" stop-color="#3b4256"/><stop offset="1" stop-color="#1b2030"/>
    </linearGradient>
  </defs>
  <path d="M62 68 L62 92 C62 100 82 108 95 108 C108 108 128 100 128 92 L128 68 Z" fill="#232a3a" stroke="#12161f" stroke-width="2"/>
  <path d="M95 24 L16 58 L95 92 L174 58 Z" fill="url(#gd__I__)" stroke="#0f131b" stroke-width="2.4" stroke-linejoin="round"/>
  <path d="M52 72 L52 96 C52 106 74 114 95 114 C116 114 138 106 138 96 L138 72" fill="none" stroke="#f5c542" stroke-width="3" opacity=".9"/>
  <circle cx="95" cy="58" r="6.5" fill="#f5c542" stroke="#a97c0a" stroke-width="1.4"/>
  <g class="pw-tassel" style="transform-origin:95px 58px">
    <path d="M95 58 C122 62 140 70 146 86" fill="none" stroke="#f5c542" stroke-width="3.4" stroke-linecap="round"/>
    <path d="M140 82 L153 90 L139 99 L134 88 Z" fill="#f5c542" stroke="#a97c0a" stroke-width="1.2"/>
    <path d="M138 88 L149 94" stroke="#fff2b8" stroke-width="1.2"/>
  </g>
</svg>`
  },

  /* ---------------- 天使光环 ---------------- */
  {
    id: 'halo', name: '天使光环', tag: '',
    desc: '悬在头顶上方，自带柔光',
    w: 190, h: 93, ox: 0, oy: 44,
    svg: `<svg viewBox="0 0 160 78" xmlns="http://www.w3.org/2000/svg" overflow="visible">
  <defs>
    <linearGradient id="hl__I__" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff6c9"/><stop offset=".5" stop-color="#ffd95e"/><stop offset="1" stop-color="#e0a11b"/>
    </linearGradient>
    <filter id="hg__I__" x="-60%" y="-120%" width="220%" height="340%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <ellipse cx="80" cy="40" rx="54" ry="15" fill="none" stroke="url(#hl__I__)" stroke-width="13" opacity=".55" filter="url(#hg__I__)" class="pw-breathe" style="transform-origin:80px 40px"/>
  <ellipse cx="80" cy="40" rx="54" ry="15" fill="none" stroke="url(#hl__I__)" stroke-width="7"/>
  <ellipse cx="80" cy="40" rx="54" ry="15" fill="none" stroke="#fffbe6" stroke-width="2" opacity=".85"/>
</svg>`
  }
];

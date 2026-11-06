/* 桌宠配饰库
 *
 * 坐标空间 = 桌宠的 logo 空间（和 model.json 的 parts/box 同一个空间：
 * x=128 是身体中线，y=256 是脚底）。图片以 <image> 塞进 #petG，
 * 所以位置 / 旋转 / 挤压 / 左右翻转全都由骨骼变换带着走，不需要每帧对位。
 *
 * w  : 图片在 logo 空间里的宽
 * ar : 高 / 宽（按原图像素算，保证不拉伸）
 * ay : 图片**下沿**的 y——决定她"戴"在头上的高度
 * ax : 相对头部中线（x=138）的横向偏移，一般 0
 *
 * 小云的头在 logo 空间里大约：发顶 y≈46，下巴 y≈152，左右 x≈80..195，头中线 x≈138。
 */
window.PET_ACC = [
  {
    id: 'lion', name: '醒狮头套', tag: '热门',
    desc: '红绒金纹的南狮头，白毛边加流苏，罩在头上就是一只小狮子',
    file: 'assets/whale/acc/lion.png',
    w: 110, ar: 509 / 512, ay: 124, ax: 0
  },
  {
    id: 'cat', name: '黑猫发箍',
    desc: '一对黑猫耳，内侧粉色，耳尖的绒毛会跟着走动轻轻摇',
    file: 'assets/whale/acc/cat.png',
    w: 100, ar: 445 / 512, ay: 78, ax: 0
  },
  {
    id: 'bunny', name: '白兔长耳',
    desc: '竖起来的白兔耳，内侧淡粉，最显高的一顶',
    file: 'assets/whale/acc/bunny.png',
    w: 92, ar: 512 / 412, ay: 74, ax: 0
  },
  {
    id: 'sakura', name: '樱花花环',
    desc: '粉樱配嫩叶编的环，戴上去整个人都软下来了',
    file: 'assets/whale/acc/sakura.png',
    w: 100, ar: 488 / 512, ay: 120, ax: 0
  },
  {
    id: 'crown', name: '蓝宝小皇冠',
    desc: '金冠镶蓝宝石和珍珠，小云自称"海之公主"时戴的就是它',
    file: 'assets/whale/acc/crown.png',
    w: 56, ar: 334 / 512, ay: 62, ax: 0
  },
  {
    id: 'grad', name: '学士帽',
    desc: '深蓝方帽配金流苏，四六级上岸那天可以戴着照相',
    file: 'assets/whale/acc/grad.png',
    w: 90, ar: 381 / 512, ay: 82, ax: 0
  },
  {
    id: 'halo', name: '天使光环',
    desc: '一圈金色细光，浮在头顶上方——她说这叫"云的天使形态"',
    file: 'assets/whale/acc/halo.png',
    w: 76, ar: 503 / 512, ay: 62, ax: 0
  },
  {
    id: 'headset', name: '头戴耳机',
    desc: '淡蓝发光耳机带麦克风，背书时她会假装在给自己放白噪音',
    file: 'assets/whale/acc/headset.png',
    w: 104, ar: 512 / 468, ay: 180, ax: 0
  }
];

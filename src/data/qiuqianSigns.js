// 求签卡数据 —— hackathon demo 用
// 每个人设固定抽到一支签 + 精修解读
// TODO[Boss]: 把 interpretation 文本替换成精修版本

export const SIGN_POOL = [
  {
    id: 'shang-shang',
    tier: '上上签',
    order: '第一',
    number: '0008918',
    title: '',
    poem: '魏魏独步向云间，玉殿千官第一班。\n富贵荣华天付汝，福如东海寿如山。',
    xie: '功名遂　福禄全　讼得理　病即愈　婚姻圆　诸事如意',
    interpText: '此签大吉，功名遂意，福禄双全。所谋之事，皆可成就。富贵荣华，天赐于汝，福寿绵长，诸事如意。',
    footerLabel: '签诗出处',
    footerContent: '观音灵签 · 第一签',
    accent: '#5C3D2E',
  },
  {
    id: 'shang',
    tier: '上签',
    order: '第二',
    number: '0026',
    title: '柳暗花明',
    poem: '山重水复疑无路，柳暗花明又一村。\n欲渡黄河冰塞川，将登太行雪满山。',
    accent: '#C4A882',
    aspects: [
      { key: '婚姻', value: '迟则得吉' },
      { key: '功名', value: '终有所成' },
      { key: '病', value: '渐次安康' },
      { key: '求子', value: '春末逢喜' },
      { key: '出行', value: '近凶远吉' },
      { key: '解讼', value: '宜和不宜争' },
    ],
  },
  {
    id: 'zhong',
    tier: '中签',
    order: '第三',
    number: '0045',
    title: '心如止水',
    poem: '风过疏竹不留声，雁渡寒潭不留影。\n君子之心事，事来心始现。',
    accent: '#C4A882',
    aspects: [
      { key: '婚姻', value: '随缘则吉' },
      { key: '功名', value: '守静待时' },
      { key: '病', value: '宜静养' },
      { key: '求子', value: '心安则得' },
      { key: '出行', value: '平稳无忧' },
      { key: '解讼', value: '不诉为吉' },
    ],
  },
  {
    id: 'xia',
    tier: '下签',
    order: '第四',
    number: '0072',
    title: '深夜独行',
    poem: '残烛照影夜将阑，独坐空堂念故山。\n莫向人前轻吐意，且将冷处暖三分。',
    accent: '#C4A882',
    aspects: [
      { key: '婚姻', value: '宜守不宜进' },
      { key: '功名', value: '时未至' },
      { key: '病', value: '慎防反复' },
      { key: '求子', value: '迟而后得' },
      { key: '出行', value: '不利远行' },
      { key: '解讼', value: '退一步则安' },
    ],
  },
];

// 人设 → 抽到的签 + 精修解读（demo 只用「上上签」和「上签」，去掉中下签）
export const PERSONA_TO_SIGN = {
  shuangyu: {
    signId: 'shang-shang',
    interpretation:
      '这支签来得不偶然。这七天你刷了太多关于"放下"的内容，算法看见了，月亮也看见了。\n\n「风过疏竹不留声」—— 那个人在你心里走过的痕迹，你以为还留着，其实风早就把它带走了，是你自己反复回头去捡。\n\n双鱼的水会记住每一滴雨，但水的好处是会蒸发。这周不要再点开那个聊天框。下次再刷到悲伤治愈类视频，向左滑。',
  },
  coder: {
    signId: 'shang-shang',
    interpretation:
      '凌晨 3 点 17 分，你又在刷副业视频。这支签是金牛座的转机签。\n\n「山重水复疑无路」—— 你最近搜的关键词暴露了你：副业、焦虑、裸辞。但「柳暗花明又一村」不在下一份工作里，在你这周还没回的那条消息里。\n\n金牛宫位的转机往往从一次小决定开始。今晚 12 点前关手机睡觉，明天上午做一件你拖了三周的事。这就是转折。',
  },
  shuangzi: {
    signId: 'shang-shang',
    interpretation:
      '期末周抽到上上签，这不是运气，是算法对你的偏爱。\n\n「云开见月分外明」—— 你这周搜了 14 次「运势」，但你不需要运势，你只是需要有人告诉你「会过去的」。\n\n双子的智商一直都在，只是你这两天被焦虑遮住了。明早 9 点之前把最难的那门复习完，下午就奖励自己刷两小时抖音。「贵人暗中迎」—— 那个贵人是早睡的你。',
  },
};

export function inferDimensionFromKnowledgePoint(knowledgePoint: string): string {
  const kp = knowledgePoint?.toLowerCase() || '';

  // 认知能力
  if (kp.includes('理解') || kp.includes('分析') || kp.includes('问题')) return 'COG_UNDERSTANDING';
  if (kp.includes('推理') || kp.includes('逻辑') || kp.includes('判断')) return 'COG_REASONING';
  if (kp.includes('迁移') || kp.includes('应用')) return 'COG_TRANSFER';

  // 技能能�?  if (kp.includes('基础') || kp.includes('操作') || kp.includes('工具')) return 'SKL_BASIC';
  if (kp.includes('进阶') || kp.includes('综合') || kp.includes('解决')) return 'SKL_APPLICATION';
  if (kp.includes('效率') || kp.includes('质量') || kp.includes('速度')) return 'SKL_EFFICIENCY';

  // 综合素养
  if (kp.includes('专注') || kp.includes('细心') || kp.includes('注意')) return 'QLT_ATTENTION';
  if (kp.includes('表达') || kp.includes('创意') || kp.includes('沟�?)) return 'QLT_EXPRESSION';
  if (kp.includes('态度') || kp.includes('潜力') || kp.includes('积极�?)) return 'QLT_ATTITUDE';

  // 创新思维
  if (kp.includes('创新') || kp.includes('创�?)) return 'INN_CREATIVITY';
  if (kp.includes('探索') || kp.includes('好奇')) return 'INN_EXPLORATION';
  if (kp.includes('设计') || kp.includes('迭代') || kp.includes('优化')) return 'INN_DESIGN';

  // 协作沟�?  if (kp.includes('团队') || kp.includes('协作') || kp.includes('合作')) return 'COL_TEAMWORK';
  if (kp.includes('分享') || kp.includes('互助')) return 'COL_SHARING';

  // AI伦理
  if (kp.includes('伦理') || kp.includes('道德')) return 'ETH_AWARENESS';
  if (kp.includes('安全') || kp.includes('责任') || kp.includes('隐私')) return 'ETH_RESPONSIBILITY';
  if (kp.includes('人文') || kp.includes('价�?)) return 'ETH_HUMANISTIC';

  return 'COG_UNDERSTANDING';
}

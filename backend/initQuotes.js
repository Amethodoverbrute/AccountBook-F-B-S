// 初始化名言数据脚本
// 功能：向数据库中插入一些预定义的名言数据

// 连接数据库
const dbConnect = require('./db/db');
const QuoteModel = require('./models/quoteModel');

// 预定义的名言数据
const quotesData = [
  // 励志类
  {
    content: '生活不是缺少美，而是缺少发现美的眼睛。',
    author: '罗丹',
    category: '励志',
  },
  {
    content: '世上无难事，只要肯登攀。',
    author: '毛泽东',
    category: '励志',
  },
  {
    content: '天生我材必有用，千金散尽还复来。',
    author: '李白',
    category: '励志',
  },
  {
    content: '成功的秘诀，在于永不改变既定的目的。',
    author: '卢梭',
    category: '励志',
  },
  {
    content: '天才是百分之一的灵感，加上百分之九十九的汗水。',
    author: '爱迪生',
    category: '励志',
  },
  // 财务类
  {
    content: '节约每一分钱，因为它都是你未来的种子。',
    author: '本杰明·富兰克林',
    category: '财务',
  },
  {
    content: '不要把鸡蛋放在一个篮子里。',
    author: '詹姆斯·托宾',
    category: '财务',
  },
  {
    content: '投资是时间的朋友，投机是时间的敌人。',
    author: '沃伦·巴菲特',
    category: '财务',
  },
  {
    content: '量入为出是理财的基础。',
    author: '本杰明·富兰克林',
    category: '财务',
  },
  {
    content: '每一分节省下来的钱都是未来的保障。',
    author: '安德鲁·卡内基',
    category: '财务',
  },
  // 生活类
  {
    content: '健康是最大的财富，知识是最大的乐趣。',
    author: '罗伯特·欧文',
    category: '生活',
  },
  {
    content: '时间就像海绵里的水，只要愿挤，总还是有的。',
    author: '鲁迅',
    category: '生活',
  },
  {
    content: '幸福的家庭都是相似的，不幸的家庭各有各的不幸。',
    author: '列夫·托尔斯泰',
    category: '生活',
  },
  {
    content: '生活的理想，就是为了理想的生活。',
    author: '张闻天',
    category: '生活',
  },
  {
    content: '简单生活，幸福人生。',
    author: '梭罗',
    category: '生活',
  },
  // 学习类
  {
    content: '学而不思则罔，思而不学则殆。',
    author: '孔子',
    category: '学习',
  },
  {
    content: '书到用时方恨少，事非经过不知难。',
    author: '陆游',
    category: '学习',
  },
  {
    content: '学到老，活到老。',
    author: '荀子',
    category: '学习',
  },
  {
    content: '读万卷书，行万里路。',
    author: '顾炎武',
    category: '学习',
  },
  {
    content: '知识就是力量。',
    author: '培根',
    category: '学习',
  },
  // 工作类
  {
    content: '业精于勤，荒于嬉；行成于思，毁于随。',
    author: '韩愈',
    category: '工作',
  },
  {
    content: '天才在于积累，聪明在于勤奋。',
    author: '华罗庚',
    category: '工作',
  },
  {
    content: '不积跬步，无以至千里；不积小流，无以成江海。',
    author: '荀子',
    category: '工作',
  },
  {
    content: '成功来自于99%的汗水和1%的灵感。',
    author: '爱迪生',
    category: '工作',
  },
  {
    content: '细节决定成败。',
    author: '老子',
    category: '工作',
  },
];

// 连接数据库并初始化数据
dbConnect(() => {
  console.log('数据库连接成功，开始初始化名言数据...');

  // 清空现有的名言数据
  QuoteModel.deleteMany({})
    .then(() => {
      console.log('已清空现有名言数据');

      // 插入新的名言数据
      return QuoteModel.insertMany(quotesData);
    })
    .then((result) => {
      console.log(`成功插入 ${result.length} 条名言数据`);
      console.log('名言数据初始化完成！');
      process.exit(0);
    })
    .catch((error) => {
      console.error('初始化名言数据失败:', error);
      process.exit(1);
    });
});

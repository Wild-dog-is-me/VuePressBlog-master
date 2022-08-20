const { title } = require("../.vuepress/config");

module.exports = [
  {
    title: "数据库",
    collapsable: true,
    children: [
      { title: "mysql基础篇", path: "/guide/notes/数据库/mysql基础篇.md" },
      { title: "Redis基础篇", path: "/guide/notes/数据库/Redis基础篇.md" },
    ],
  },
  {
    title: "Spring全家桶",
    collapsable: true,
    children: [
      { title: "SpringBoot整合Mybatis", path: "/guide/notes/Spring全家桶/SpringBoot整合Mybatis.md" },
      { title: "浅谈Get、Put、Post、Delete", path: "/guide/notes/Spring全家桶/浅谈Get、Put、Post、Delete.md" },
      { title: "SpringCloud学习笔记（一）", path: "/guide/notes/Spring全家桶/SpringCloud学习笔记（一）.md"},
      { title: "SpringCloud学习笔记（二）", path: "/guide/notes/Spring全家桶/SpringCloud学习笔记（二）.md"},
      { title: "Spring中的一些注解", path: "/guide/notes/Spring全家桶/Spring中的一些注解.md"},
      { title: "idea快速生成日志", path: "/guide/notes/Spring全家桶/idea快速生成日志.md"}
    ]
  },
  {
    title: "持久层框架",
    collapsable: true,
    children: [
      { title: "MyBatis学习笔记", path: "/guide/notes/持久层框架/Mybatis学习笔记.md" },
      { title: "Mybatis-动态sql", path: "/guide/notes/持久层框架/Mybatis-动态sql.md" },
    ],
  },
  {
    title: "运维&部署",
    collapsable: true,
    children: [
      { title: "Centos 7.6操作系统安装JAVA环境", path: "/guide/notes/运维&部署/Centos 7.6操作系统安装JAVA环境.md" },
      { title: "解决腾讯云重装系统之后ssh连接失败问题", path: "/guide/notes/运维&部署/解决腾讯云重装系统之后ssh连接失败问题.md" },
      { title: "git入门", path: "/guide/notes/运维&部署/git入门.md" },
    ],
  },
  {
    title: "java设计模式",
    collapsable: true,
    children: [
      { title: "简述java23种设计模式", path: "/guide/notes/java设计模式/简述java23种设计模式.md" },
    ],
  },
  {
    title: "前端",
    collapsable: true,
    children: [
      { title: "Vue中使用外部字体", path: "/guide/notes/前端/Vue中使用外部字体.md" },
      { title: "Node版本管理—自动切换", path: "/guide/notes/前端/Node版本管理—自动切换.md" },
      { title: "element-ui导航栏高度问题", path: "/guide/notes/前端/element-ui导航栏高度问题.md" },
    ],
  },
  {
    title: "消息队列",
    collapsable: true,
    children: [
      { title: "消息队列简介", path: "/guide/notes/消息队列/消息队列简介.md" },
      { title: "RabbitMQ消息的收发", path: "/guide/notes/消息队列/RabbitMQ消息的收发.md" },
      { title: "RabbitMQ安装以及管理界面", path: "/guide/notes/消息队列/RabbitMQ安装以及管理界面.md" },
      { title: "RabbitMQ四种交换机", path: "/guide/notes/消息队列/RabbitMQ四种交换机.md" },
      { title: "RabbitMQ消息有效期", path: "/guide/notes/消息队列/RabbitMQ消息有效期.md" },
      { title: "RabbitMQ消费可靠性", path: "/guide/notes/消息队列/RabbitMQ消费可靠性.md" },
      { title: "RabbitMQ发送可靠性", path: "/guide/notes/消息队列/RabbitMQ发送可靠性.md" },
      { title: "RabbitMQ集群搭建", path: "/guide/notes/消息队列/RabbitMQ集群搭建.md" },
    ],
  },
];

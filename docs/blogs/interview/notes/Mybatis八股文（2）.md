## 1.1Mybatis是什么

- `Mybatis`是一款优秀的持久层框架
- 它支持定制化 `SQL`、存储过程以及高级映射
- 与传统的`jdbc`相比， `MyBatis`避免了几乎所有的 `JDBC`代码和手动设置参数以及获取结果集

## 1.2ORM是什么

- `ORM（Object Relational Mapping）`，对象关系映射，是一种为了解决关系型数据库数据与简单Java对象`（POJO）`的映射关系的技术。
- `ORM`是通过使用描述对象和数据库之间映射的元数据，将程序中的对象自动持久化到关系型数据库中。

## 1.3传统的JDBC开发存在的问题

- 代码繁琐，重复度高,冗余度高
- 数据库的连接对象的多次创建，造成系统资源的浪费
- 代码维护难度高，需要修改的代码难度大（牵一发动全身）

## 1.4Mybatis工作原理

- 通过IO流读取 MyBatis配置文件：解析mybatis-config.xml配置文件， 配置了 MyBatis的运行环境等信息，例如数据库连接信息。
- 加载映射文件。映射文件即 SQL映射文件，该文件中配置了操作数据库的SQL语句，需要在 MyBatis 配置文件 mybatis-config.xml中加载。
- 构造会话工厂：通过 MyBatis的环境等配置信息构建会话工厂 SqlSessionFactory。
- 创建会话对象：由会话工厂创建 SqlSession对象，该对象中包含了执行SQL 语句的所有方法。
- Executor执行器：MyBatis 底层定义了一个 Executor接口来操作数据库，它将根据 SqlSession传递的参数动态地生成需要执行的 SQL语句，同时负责查询缓存的维护。
- MappedStatement对象：在 Executor 接口的执行方法中有一个 MappedStatement 类型的参数，该参数是对映射信息的封装，用于存储要映射的 SQL语句的 id、参数等信息。
- 输入参数映射：输入参数类型可以是 Map、List 等集合类型，也可以是基本数据类型和 POJO类型。
- 输出结果映射：输出结果类型可以是 Map、 List 等集合类型，也可以是基本数据类型和POJO类型。

## 1.5Mybatis都有哪些Executor执行器，以及他们的区别

- `SimpleExecutor`：就开启一个Statement对象，用完立刻关闭Statement对象
- `ReuseExecutor(重复)`：开启Statement对象后，并不立即关闭该对象，重复利用该对象
- `BatchExecutor（批处理）`：将Statement对象依次添加，统一处理

## 1.6#和$的区别

- \#{}是占位符，**预编译处理**；${}是拼接符，字符串替换，没有**预编译处理**
- \#{} 可以有效的防止`SQL`注入，提高系统安全性；${} 不能防止`SQL`注入
- 变量替换后，#{} 对应的变量自动加上单引号 ‘’；变量替换后，${} 对应的变量不会加上单引号 ‘’

## 1.7当实体类中属性名与数据库表中字段不一样怎么办

- 起别名
- 通过`resultMap`来映射字段名和实体类属性名的一一对应的关系。

## 1.8Mybatis动态sql有哪些，简述一下动态sql的执行原理

- `Mybatis`提供了9种动态`sql`标签`trim|where|set|foreach|if|choose|when|otherwise|bind`
- 原理：`sql`语句的拼接

## 1.9Mybatis实现一对一，一对多，多对一有几种方式，如何操作

- 方式： 联合查询和嵌套查询
- `association`(联系)：单个关联查询`association`
- `collection`(集合)：多个关联查询 `collection`

## 1.10Mybatis的一级，二级缓存

- 一级缓存默认是开启的，只在一次`SqlSession`中有效，也就是拿到连接到关闭连接这个区间段!
- 只要开启了二级缓存，在同一个Mapper下就有效 `<!<setting name="cacheEnabled" value="true"/>`

## 1.11生命周期和作用域

1. **SqlSessionFactoryBuilder**

- 一旦创建了SqlSessionFactory，就不再需要它了
- 局部变量

1. **SqlSessionFactory**

- 说白了就是可以想象为 ：数据库连接池
- SqlSessionFactory 一旦被创建就应该在应用的运行期间一直存在，没有任何理由丢弃它或重新创建另一个实例。
- 因此 SqlSessionFactory 的最佳作用域是应用作用域。
- 最简单的就是使用单例模式或者静态单例模式。

1. **SqlSession**

- 连接到连接池的一个请求！
- SqlSession 的实例不是线程安全的，因此是不能被共享的，所以它的最佳的作用域是请求或方法作用域。
- 用完之后需要赶紧关闭，否则资源被占用！
- 这里面的每一个Mapper，就代表一个具体的业务！
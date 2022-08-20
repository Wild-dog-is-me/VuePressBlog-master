## 1、Mybatis简介

1.1什么是Mybatis

```xml
<!-- https://mvnrepository.com/artifact/org.mybatis/mybatis -->
<dependency>
    <groupId>org.mybatis</groupId>
    <artifactId>mybatis</artifactId>
    <version>3.5.6</version>
</dependency>
```

### 1.2持久化

数据的持久化

1. 持久化就是将程序的数据在持久状态和瞬时状态转化的过程
2. 内存：断电就失去

为什么需要持久化

1. 不想丢掉一些对象
2. 内存较为宝贵

### 1.3持久层

1. Dao层（有时也称为Mapper层）：全称Data Access Object。Dao层比较底层，负责与数据库打交道具体到对某个表、某个实体的增删改查。
2. Service层：又叫服务层或业务层，封装Dao层的操作，使一个方法对外表现为实现一种功能，例如：网购生成订单时，不仅要插入订单信息记录，还要查询商品库存是否充足，购买是否超过限制等等。
3. Controller层像是一个服务员，他把客人（前端）点的菜（数据、请求的类型等）进行汇总什么口味、咸淡、量的多少，交给厨师长（Service层），厨师长则告诉沾板厨师（Dao 1）、汤料房（Dao 2）、配菜厨师（Dao 3）等（统称Dao层）我需要什么样的半成品，副厨们（Dao层）就负责完成厨师长（Service）交代的任务。
4. pojo层：存放Java对象，即数据库中对象的原型

### 1.4为什么需要MyBatis

1. 方便帮助我们将数据存入数据库里
2. 比传统JDBC方便许多

## 2、第一个MyBatis程序

### 2.1搭建环境

1. 搭建数据库

2. 新建项目

    - 新建一个普通的maven项目

    - 删除src目录

    - 导入maven依赖

      ```xml
      <?xml version="1.0" encoding="UTF-8"?>
      <project xmlns="http://maven.apache.org/POM/4.0.0"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
          <modelVersion>4.0.0</modelVersion>
      
          <groupId>org.example</groupId>
          <artifactId>MyBatis-review</artifactId>
          <version>1.0-SNAPSHOT</version>
      
          <properties>
              <maven.compiler.source>8</maven.compiler.source>
              <maven.compiler.target>8</maven.compiler.target>
          </properties>
          <!--导入依赖-->
          <dependencies>
              <!--mysqlq驱动-->
              <dependency>
                  <groupId>mysql</groupId>
                  <artifactId>mysql-connector-java</artifactId>
                  <version>8.0.12</version>
              </dependency>
              <!--mybatis-->
              <dependency>
                  <groupId>org.mybatis</groupId>
                  <artifactId>mybatis</artifactId>
                  <version>3.5.4</version>
              </dependency>
              <!--junit-->
              <dependency>
                  <groupId>junit</groupId>
                  <artifactId>junit</artifactId>
                  <version>4.12</version>
                  <scope>test</scope>
              </dependency>
          </dependencies>
      
          <build>
              <resources>
                  <resource>
                      <directory>src/main/java</directory>
                      <includes>
                          <include>**/*.xml</include>
                          <include>**/*.properties</include>
                      </includes>
                      <filtering>true</filtering>
                  </resource>
      
                  <resource>
                      <directory>src/main/resources</directory>
                      <includes>
                          <include>**/*.xml</include>
                          <include>**/*.properties</include>
                      </includes>
                      <filtering>true</filtering>
                  </resource>
              </resources>
          </build>
      
      </project>
      ```

###  2.2创建一个模块

1. 编写MyBatis的核心配置文件

   ```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
        PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
        "http://mybatis.org/dtd/mybatis-3-config.dtd">
<!--configuration core file-->
<configuration>

    <environments default="development">
        <environment id="development">
            <transactionManager type="JDBC"/>
            <dataSource type="POOLED">
                <property name="driver" value="com.mysql.cj.jdbc.Driver"/>
                <property name="url" value= "jdbc:mysql://localhost:3306/mybatis?characterEncoding=utf-8&amp;serverTimezone=UTC&amp;useSSL=false"/>
                <property name="username" value="root"/>
                <property name="password" value="123456"/>
            </dataSource>
        </environment>
    </environments>

    <!--a Mapper.xml need regist in Mybatis core configuration file-->
    <mappers>
        <mapper resource="com/kuang/dao/UserMapper.xml"/>
    </mappers>
</configuration>
   ```

2. 编写mybatis工具类

   ```java
   //SqlSessionFactory -->SqlSession
   //每个基于 MyBatis 的应用都是以一个 SqlSessionFactory 的实例为核心的。
   //SqlSessionFactory 的实例可以通过 SqlSessionFactoryBuilder 获得。
   //而 SqlSessionFactoryBuilder 则可以从 XML 配置文件或一个预先配置的 Configuration 实例来构建出 SqlSessionFactory 实例。
   
   public class MybatisUtils {
   
       private static SqlSessionFactory sqlSessionFactory;
       static {
   
           try {
               //使用Mybaties第一步：获取sqlSessionFactory对象
               String resource = "mybatis-config.xml";
               InputStream inputStream = Resources.getResourceAsStream(resource);
               sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
           } catch (Exception e) {
               e.printStackTrace();
           }
       }
   
       //既然有了 SqlSessionFactory，顾名思义，我们可以从中获得 SqlSession 的实例。
       // SqlSession 提供了在数据库执行 SQL 命令所需的所有方法。你可以通过 SqlSession 实例来直接执行已映射的 SQL 语句。
       public static SqlSession getSqlSession(){
   //        SqlSession sqlSession =  sqlSessionFactory.openSession();
   //        return sqlSession;
   
           return sqlSessionFactory.openSession();
       }
   
   }
   ```

### 2.3编写代码

1. 实体类

```java
   //实体类
   public class User {
       private int id;
       private String name;
       private String pwd;

       public User() {
       }
       
       public User(int id, String name, String pwd) {
           this.id = id;
           this.name = name;
           this.pwd = pwd;
       }
       
       public int getId() {
           return id;
       }
       
       public void setId(int id) {
           this.id = id;
       }
       
       public String getName() {
           return name;
       }
       
       public void setName(String name) {
           this.name = name;
       }
       
       public String getPwd() {
           return pwd;
       }
       
       public void setPwd(String pwd) {
           this.pwd = pwd;
       }
       
       @Override
       public String toString() {
           return "User{" +
                   "id=" + id +
                   ", name='" + name + '\'' +
                   ", pwd='" + pwd + '\'' +
                   '}';
       }
   }
```

2. Dao接口

   ```java
   public interface UserDao {
       List<User> getUserList();
   }
   ```

3. Dao接口的实现类有原来的UuserDaoImpl转化为一个xml配置文件

   ```xml
   <?xml version="1.0" encoding="UTF-8" ?>
   <!DOCTYPE mapper
           PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN"
           "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
   
   <mapper namespace="com.kuang.dao.UserDao">
   
       <!--sql-->
       <select id="getUserList" resultType="com.kuang.pojo.User">
           select * from mybatis.user
       </select>
   </mapper>
   ```

### 2.4测试类

   ```java
@Test
    public void test(){
        //第一步：获得SqlSession对象
        SqlSession sqlSession = MybatisUtils.getSqlSession();

        //方式一：getMapper
        UserDao userDao = sqlSession.getMapper(UserDao.class);
        List<User> userList = userDao.getUserList();

        for (User user : userList) {
            System.out.println(user);
        }

        //关闭SqlSession
        sqlSession.close();
        
    }
   ```

## 

## 3、增删改查

### 3.1namespace

namespace中的包名要和Dao Mapper接口包中的一致

### 3.2	select

选择，查询语句

1. id就是对应的namespace中的方法名

2. resultType：sql语句执行的返回值

3. parameterType：参数类型

   编写接口

   ```java
   //根据id查询用户
       User getUserById(int id);
   ```

   编写mapper中对应的sql语句

   ```xml
   	<select id="getUserById" parameterType="int" resultType="com.kuang.pojo.User">
           select * from mybatis.user where id = #{id}
   	</select>
   ```

   测试

   ```java
   @Test
       public void getUserById(){
           SqlSession sqlSession = MybatisUtils.getSqlSession();
   
           UserMapper mapper = sqlSession.getMapper(UserMapper.class);
           User user = mapper.getUserById(1);
           System.out.println(user);
   
           //关闭SqlSession
           sqlSession.close();
       }
   ```

### 3.3Insert

   ```xml
	<insert id="addUser" parameterType="com.kuang.pojo.User">
        insert into mybatis.user (id,name,pwd) values (#{id},#{name},#{pwd})
    </insert>
   ```

### 3.4 update

   ```xml
	<insert id="addUser" parameterType="com.kuang.pojo.User">
        insert into mybatis.user (id,name,pwd) values (#{id},#{name},#{pwd})
    </insert>
   ```

### 3.5delete

   ```xml
	<insert id="addUser" parameterType="com.kuang.pojo.User">
        insert into mybatis.user (id,name,pwd) values (#{id},#{name},#{pwd})
    </insert>
   ```

注意 ：增删改需要使用commit提交事务

### 3.6万能Map

假设我们的实体类，数据库中的表字段参数过多，可以考虑使用Map

```java
//万能的map，假如我们的实体类，数据库中的字段参数表达过多，可以考虑使用map
int addUser2(Map<String , Object> map);
```

```xml
<!--对象中的属性，可以直接取出来  传递map的key-->
    <insert id="addUser2" parameterType="map">
        insert into mybatis.user (id,pwd) values (#{userid},#{password})
    </insert>
```

```java
    @Test
    public void addUser2(){
        SqlSession sqlSession = MyBatisUtils.getSqlSession();
        UserMapper mapper = sqlSession.getMapper(UserMapper.class);
        Map<String,Object> map = new HashMap<String, Object>();
        map.put("userid",7);
        map.put("userpwd","1234556");
        mapper.addUser2(map);
        sqlSession.close();
    }
```

Map传递参数，直接在sql中取出key即可 parameterType="map"

对象传递参数，直接在sql中取对象属性即可 parameterType=“Object”

只有一个基本类型参数的情况下，可以直接在sql中取到！多个参数用Map

### 3.7模糊查询

1. java代码执行的时候，传递通配符% %

   ```xml
   List<User> userList = mapper.getUserLike("%李%");
   ```

2. sql语句

   ```sql
   <select id="getUserLike" parameterType="String" resultType="User">
           select * from user where name like #{value}
       </select>
   ```



## 4、配置解析

### 4.1核心配置文件

mybatis-config.xml

```xml
configuration（配置）
properties（属性）
settings（设置）
typeAliases（类型别名）
typeHandlers（类型处理器）
objectFactory（对象工厂）
plugins（插件）
environments（环境配置）
environment（环境变量）
transactionManager（事务管理器）
dataSource（数据源）
databaseIdProvider（数据库厂商标识）
mappers（映射器）
```

### 4.2属性

我们可以通过properties属性来实现引用配置文件

编写一个配置文件
db.properties

```properties
driver=com.mysql.jdbc.Driver
url=jdbc:mysql://localhost:3306/mybatis?useSSL=false&useUnicode=true&characterEncoding=UTF-8
username=root
password=123456
```

在核心配置文件中引入

```xml
<properties resource="db.properties"/>
```

1. 可以直接引入外部配置文件
2. 可以在其中增加一些属性配置
3. 如果两个文件有同一个字段，优先使用**外部配置文件**的

### 4.3类型别名

类型别名是为Java类型设置一个短名字

存在的意义是用来减少类完全限定名的冗余

```xml
	<!--可以给实体类起别名-->
    <typeAliases>
        <typeAlias type="com.kuang.pojo.User" alias="User" />
    </typeAliases>
```

也可以指定一个包名，MyBatis会在包名下面搜索需要的JavaBean。

比如扫描实体类的包，它的默认别名就为这个类的类名，首字母为小写

```xml
	<!--可以给实体类起别名-->
    <typeAliases>
        <package name="com.kuang.pojo"/>
    </typeAliases>
```

在实体类比较少的时候，使用第一种方式。
如果实体类十分多，建议使用第二种。
第一种可以DIY别名，第二种则不行，如果非要改，需要在实体上增加注解

```java
@Alias("user")
//实体类
public class User {}
```

### 4.4映射器

MapperRegistry：注册绑定我们的Mapper文件

方式一：推荐使用

```xml
    <!--每一个Mapper.xml都需要在Mybatis核心配置文件中注册！-->
    <mappers>
        <mapper resource="com/kuang/dao/UserMapper.xml"/>
    </mappers>
```

方式二：使用class文件绑定注册

```xml
    <!--每一个Mapper.xml都需要在Mybatis核心配置文件中注册！-->
    <mappers>
        <mapper class="com.kuang.dao.UserMapper"/>
    </mappers>
```

注意点

1. 接口和它的Mapper配置文件必须同名
2. 接口和它的Mapper配置文件必须在同一个包下

### 4.5生命周期和作用域

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201023104621506.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xpNjQzOTM3NTc5,size_16,color_FFFFFF,t_70#pic_center)

**SqlSessionFactoryBuilder**

一旦创建了SqlSessionFactory，就不再需要它了。

**SqlSessionFactory：**

1. 可以理解为数据库连接池
2. SqlSessionFactory一旦被创建就应该在应用运行期间一直存在，没有任何理由丢弃她或者重新创建另一个实例

**SqlSession:**

1. 连接到连接池的一个请求
2. SqlSession的实例不是线程安全的，因此是不能被共享的
3. 用完后需及时关闭，否则会占用资源

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201023104427946.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L2xpNjQzOTM3NTc5,size_16,color_FFFFFF,t_70#pic_center)

这里每一个Mapper，就代表一个具体的业务。

## 5、解决属性名和字段名不一致的问题

实体类与数据库中字段不一致

解决办法：

1. 起别名

   ```xml
     <select id="getUserById" parameterType="int" resultType="user">
         select id,name,pwd as password from mybatis.user where id = #{id}
     </select>
   ```

2. resultMap

   结果集映射

   ```xml
       <!--  结果集映射  -->
       <resultMap id="UserMap" type="User">
           <!--column数据库中的字段，property实体类中的属性-->
           <result column="id" property="id" />
           <result column="name" property="name" />
           <result column="pwd" property="password" />
       </resultMap>
   
       <select id="getUserById" parameterType="int" resultMap="UserMap">
           select * from mybatis.user where id = #{id}
       </select>
   ```



## 6、分页

### 6.1使用limit分页

```sql
SELECT * from user limit startIndex,pageSize
SELECT  * from user limit 3 #[0,n]
```

使用mybatis分页，核心sql

**方式1：**

1. 接口

   ```java
   List<User> getUserByLimit(int startIndex,int endIndex);
   ```

2. Mapper.xml

   ```xml
   <select id="getUserByLimit" parameterType="int" resultType="com.kuang.pojo.User">
           select *
           from USER 
           limit #{param1},#{param2};
       </select>
   ```

3. 测试

   ```java
   @Test
       public void getUserByLimit1(){
           SqlSession sqlSession =MyBatisUtils.getSqlSession();
           UserMapper mapper = sqlSession.getMapper(UserMapper.class);
           List<User> userByLimit = mapper.getUserByLimit(1, 5);
           for (User user : userByLimit) {
               System.out.println(user);
           }
       }
   ```

   **方式2：**

4. 接口

   ```java
       //分页
       List<User> getUserByLimit(Map<String,Integer> map);
   ```

5. Mapper.xml

   ```xml
   <!--    分页-->
       <select id="getUserByLimit" parameterType="map">
           select * from mybatis.user limit #{startIndex},#{pageSize}
       </select>
   ```

6. 测试

   ```java
       @Test
       public void getUserByLimit(){
           SqlSession sqlSession = MybatisUtils.getSqlSession();
           UserMapper mapper = sqlSession.getMapper(UserMapper.class);
   
           HashMap<String, Integer> map = new HashMap<String, Integer>();
           map.put("startIndex",0);
           map.put("pageSize",2);
   
           List<User> userList = mapper.getUserByLimit(map);
           for (User user : userList) {
               System.out.println(user);
           }
           
           sqlSession.close();
       }
   ```

### 6.2RowBounds分页（不推荐）

不再使用sql分页

1. 接口

   ```java
       //分页2
       List<User> getUserByRowBounds();
   ```

2. Mapper.xml

   ```xml
   <!--    分页2-->
       <select id="getUserByRowBounds">
           select * from mybatis.user
       </select>
   ```

3. 测试

   ```java
       @Test
       public void getUserByRowBounds(){
           SqlSession sqlSession = MybatisUtils.getSqlSession();
   
           //RowBounds实现
           RowBounds rowBounds = new RowBounds(0, 2);
   
           //通过java代码层面实现分页
           List<User> userList = sqlSession.selectList("com.kuang.dao.UserMapper.getUserByRowBounds",null,rowBounds);
   
           for (User user : userList) {
               System.out.println(user);
           }
           
           sqlSession.close();
       }
   ```



## 7、使用注解开发

### 7.1注解的使用

1. 注解在UserMapper接口上实现，并删除UserMapper.xml文件

   ```java
       @Select("select * from user")
       List<User> getUsers();
   ```

2. 需要在mybatis-config.xml文件中绑定接口

   ```xml
       <!--绑定接口！-->
       <mappers>
           <mapper class="com.kuang.dao.UserMapper" />
       </mappers>
   ```

3. 测试

   ```java
       @Test
       public void getUsers(){
           SqlSession sqlSession = MybatisUtils.getSqlSession();
           UserMapper mapper = sqlSession.getMapper(UserMapper.class);
           List<User> users = mapper.getUsers();
   
           for (User user : users) {
               System.out.println(user);
           }
   
           sqlSession.close();
       }
   ```

   本质：反射机制实现
   底层：动态代理！

### 7.2CRUD(增删改查)

1. 在MyBatisUtils工具类创建的时候实现自动提交事务！

   ```java
       public static SqlSession getSqlSession(){
           return sqlSessionFactory.openSession(true);
       }
   ```

2. 编写接口，增加注解

   ```java
   public interface UserMapper {
   
       @Select("select * from user")
       List<User> getUsers();
   
       //方法存在多个参数，所有参数前面必须加上@Param("id")注解
       @Select("select * from user where id=#{id}")
       User getUserById(@Param("id") int id);
   
       @Insert("insert into user (id,name,pwd) values(#{id},#{name},#{password})")
       int addUser(User user);
   
       @Update("update user set name=#{name},pwd=#{password} where id=#{id}")
       int updateUser(User user);
   
       @Delete("delete from user where id = #{uid}")
       int deleteUser(@Param("uid") int id);
       
   }
   ```

## 8、Lombok

使用步骤：


1. 在idea中安装lombok插件

2. 在项目pom.xml文件中导入Lombok的jar包

   ```xml
       <!-- https://mvnrepository.com/artifact/org.projectlombok/lombok -->
                    <dependency>
                        <groupId>org.projectlombok</groupId>
                        <artifactId>lombok</artifactId>
                        <version>1.18.10</version>
                    </dependency>
   ```



3. 在实体类上加上注解@Data即可(@Data:无参构造、get、set、toString、hashCode、equals)toString方法需自行编写

## 9、多对一处理

多对一：

- 多个学生，对应一个老师

- 对于学生而言，**关联**–多个学生，关联一个老师【多对一】

- 对于老师而言，**集合**–一个老师，有很多个学生【一对多】


**按照结果嵌套处理**


```xml
	  <!--按照结果嵌套处理    -->
      <select id="getStudent2" resultMap="StudentTeacher2">
          select s.id sid,s.name sname,t.name tname
          from mybatis.student s,mybatis.teacher t
          where s.tid = t.id
      </select>
  
      <resultMap id="StudentTeacher2" type="Student">
          <result property="id" column="sid"/>
          <result property="name" column="sname"/>
          <association property="teacher" javaType="Teacher">
              <result property="name" column="tname"/>
          </association>
      </resultMap>
```

**按照查询嵌套处理**

```xml
    <!--
      思路：
          1.查询所有的学生信息
          2.根据查询出来的学生的tid，寻找对应的老师！ 子查询-->
    <select id="getStudent" resultMap="StudentTeacher">
        select * from mybatis.student
    </select>

    <resultMap id="StudentTeacher" type="Student">
        <result property="id" column="id"/>
        <result property="name" column="name"/>
        <!--  复杂的属性，我们需要单独处理 对象：association 集合：collection      -->
        <association property="teacher" column="tid" javaType="Teacher" select="getTeacher"/>
    </resultMap>

    <select id="getTeacher" resultType="Teacher">
        select * from mybatis.teacher where id = #{id}
    </select>
```

回顾Mysql多对一查询方式：

- 子查询
- 联表查询

## 

## 10、一对多处理

比如：一个老师拥有多个学生！
对于老师而言，就是一对多的关系！

**实体类**

```java
@Data
public class Student {
    private int id;
    private String name;
    private int tid;

}

@Data
public class Teacher {
    private int id;
    private String name;

    //一个老师拥有多个学生
    private List<Student> students;
}
```

**按照结果嵌套处理**

```xml
    <!--    按结果嵌套查询-->
    <select id="getTeacher" resultMap="TeacherStudent">
            SELECT  s.id sid,s.name sname,t.name tname,t.id,tid
            from student s,teacher t
            where s.tid = t.id and t.id = #{tid}
    </select>

    <resultMap id="TeacherStudent" type="Teacher">
        <result property="id" column="tid"/>
        <result property="name" column="tname"/>
        <!--  复杂的属性，我们需要单独处理 对象：association 集合：collection
             javaType="" 指定属性的类型！
             集合中的泛型信息，我们使用ofType获取
             -->
        <collection property="students" ofType="Student">
            <result property="id" column="sid"/>
            <result property="name" column="sname"/>
            <result property="tid" column="tid"/>
        </collection>
    </resultMap>
```

**按照查询嵌套处理**

```xml
    <select id="getTeacher2" resultMap="TeacherStudent2">
        select * from mybatis.teacher where id = #{tid}
    </select>

    <resultMap id="TeacherStudent2" type="Teacher">
        <collection property="students" javaType="ArrayList" ofType="Student" select="getStudentByTeacherId" column="id"/>
    </resultMap>

    <select id="getStudentByTeacherId" resultType="Student">
        select * from  mybatis.student where tid = #{tid}
    </select>
```

**小结**

1. 关联-association【多对一】
2. 集合-collection【一对多】
3. javaType & ofType
    1. javaType 用来指定实体类中属性的类型
    2. ofType 用来指定映射到List或者集合中的pojo类型，泛型中的约束类型！

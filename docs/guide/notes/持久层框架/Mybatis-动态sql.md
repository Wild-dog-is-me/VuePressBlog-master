动态 SQL 是 [MyBatis](https://so.csdn.net/so/search?q=MyBatis&spm=1001.2101.3001.7020) 的强大特性之一。如果你使用过 JDBC 或其它类似的框架，你应该能理解根据不同条件拼接 SQL 语句有多痛苦，例如拼接时要确保不能忘记添加必要的空格，还要注意去掉列表最后一个列名的逗号。利用动态 SQL，可以彻底摆脱这种痛苦。

使用动态 SQL 并非一件易事，但借助可用于任何 SQL 映射语句中的强大的动态 SQL 语言，MyBatis 显著地提升了这一特性的易用性。

如果你之前用过 JSTL 或任何基于类 XML 语言的文本处理器，你对动态 SQL 元素可能会感觉似曾相识。在 MyBatis 之前的版本中，需要花时间了解大量的元素。借助功能强大的基于 OGNL 的表达式，MyBatis 3 替换了之前的大部分元素，大大精简了元素种类，现在要学习的元素种类比原来的一半还要少。

- if
- choose (when, otherwise)
- trim (where, set)
- foreach

在mybatis的动态语句中常常可能会用到以下几个运算和逻辑判断符：

```
① "!=" : 表示不等于

② "="：表示等于。注意是一个等号。

③ "and" : 逻辑与(小写)

④ "or" ： 逻辑或(小写)
1234567
```

------

# 【1】if元素

该元素是我们经常会用到的，常用语判断传入的某个参数是否为null或者为某个指定的值，例如下面的语句。

```
<select id=”selectUsers” parameterType=”int” resultType=”User”>
    select
       user_id as "id",
       user_name as "userName",
       hashed_password as "hashedPassword"
    from some_table
    <if test="id != null and id!=''">
           where id = #{id}
    </if>
   </select>
12345678910
```

该语句的意思是`判断参数id是否不为null以及不为空字符串`，如果是则查询指定id的记录，不然查询全部的记录。元素里面的test属性，顾名思义就是测试的意思，即测试指定的表达式是否成立，test后面指定的参数为传入的参数。

使用动态 SQL 最常见情景是根据条件包含 where 子句的一部分。比如：

```xml
<select id="findActiveBlogWithTitleLike"
     resultType="Blog">
  SELECT * FROM BLOG
  WHERE state = 'ACTIVE'
  <if test="title != null">
    AND title like #{title}
  </if>
</select>
12345678
```

这条语句提供了可选的查找文本功能。如果不传入 “title”，那么所有处于 “ACTIVE” 状态的 BLOG 都会返回；如果传入了 “title” 参数，那么就会对 “title” 一列进行模糊查找并返回对应的 BLOG 结果（细心的读者可能会发现，`“title” 的参数值需要包含查找掩码或通配符字符`）。

如果希望通过 `“title” 和 “author”` 两个参数进行可选搜索该怎么办呢？首先，我想先将语句名称修改成更名副其实的名称；接下来，只需要加入另一个条件即可。

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG WHERE state = ‘ACTIVE’
  <if test="title != null">
    AND title like #{title}
  </if>
  <if test="author != null and author.name != null">
    AND author_name like #{author.name}
  </if>
</select>
12345678910
```

------

# **【2】choose、when和otherwise**

有时候，我们不想使用所有的条件，而只是想从多个条件中选择一个使用。针对这种情况，MyBatis 提供了 choose 元素，它有点像 Java 中的 switch 语句。

还是上面的例子，但是策略变为：`传入了 “title” 就按 “title” 查找，传入了 “author” 就按 “author” 查找的情形。若两者都没有传入，就返回标记为 featured 的 BLOG`（这可能是管理员认为，与其返回大量的无意义随机 Blog，还不如返回一些由管理员精选的 Blog）。

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG WHERE state = 'ACTIVE'
  <choose>
    <when test="title != null">
      AND title like #{title}
    </when>
    <when test="author != null and author.name != null">
      AND author_name like #{author.name}
    </when>
    <otherwise>
      AND featured = 1
    </otherwise>
  </choose>
</select>
123456789101112131415
```

这3个元素是组合起用的，表达一种 if…else…的意义。更多示例如下：

```
<select id=”selectUsers” parameterType=”int” resultType=”User”>
    select
       user_id as "id",
       user_name as "userName",
       hashed_password as "hashedPassword"
    from some_table
    <choose>
      <when test="id != null">
             where id = #{id}
      </when>
      <otherwise>
             where id = '123'
      </otherwise>
   </select>
1234567891011121314
```

上面表达的意思是，如果参数id不为空，则查询指定id的记录，否则查询id为123的记录。这里只列举了一个when，其实可以连续的添加多个，但是otherwise只能有一个。

------

# **【3】trim、where、set**

前面几个例子已经方便地解决了一个臭名昭著的动态 SQL 问题。现在回到之前的 `“if” 示例，这次我们将 “state = ‘ACTIVE’”` 设置成动态条件，看看会发生什么。

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG
  WHERE
  <if test="state != null">
    state = #{state}
  </if>
  <if test="title != null">
    AND title like #{title}
  </if>
  <if test="author != null and author.name != null">
    AND author_name like #{author.name}
  </if>
</select>
1234567891011121314
```

如果没有匹配的条件会怎么样？最终这条 SQL 会变成这样：

```sql
SELECT * FROM BLOG
WHERE
12
```

这会导致查询失败。如果匹配的只是第二个条件又会怎样？这条 SQL 会是这样:

```sql
SELECT * FROM BLOG
WHERE
AND title like ‘someTitle’
123
```

这个查询也会失败。这个问题不能简单地用条件元素来解决。这个问题是如此的难以解决，以至于解决过的人不会再想碰到这种问题。

MyBatis 有一个简单且适合大多数场景的解决办法。而在其他场景中，可以对其进行自定义以符合需求。而这，只需要一处简单的改动：

```xml
<select id="findActiveBlogLike"
     resultType="Blog">
  SELECT * FROM BLOG
  <where>
    <if test="state != null">
         state = #{state}
    </if>
    <if test="title != null">
        AND title like #{title}
    </if>
    <if test="author != null and author.name != null">
        AND author_name like #{author.name}
    </if>
  </where>
</select>
123456789101112131415
```

**where 元素只会在子元素返回任何内容的情况下才插入 “WHERE” 子句。而且，若子句的开头为 “AND” 或 “OR”，where 元素也会将它们去除。**

如果 where 元素与你期望的不太一样，你也可以通过自定义 trim 元素来定制 where 元素的功能。比如，`和 where 元素等价的自定义 trim 元素为`：

```xml
<trim prefix="WHERE" prefixOverrides="AND |OR ">
  ...
</trim>
123
```

`prefixOverrides` 属性会忽略通过`管道符分隔的文本序列（注意此例中的空格是必要的）`。上述例子会移除所有 prefixOverrides 属性中指定的内容，并且插入 prefix 属性中指定的内容。

`用于动态更新语句的类似解决方案叫做 set。set 元素可以用于动态包含需要更新的列，忽略其它不更新的列`。比如：

```xml
<update id="updateAuthorIfNecessary">
  update Author
    <set>
      <if test="username != null">username=#{username},</if>
      <if test="password != null">password=#{password},</if>
      <if test="email != null">email=#{email},</if>
      <if test="bio != null">bio=#{bio}</if>
    </set>
  where id=#{id}
</update>
12345678910
```

这个例子中，`set 元素会动态地在行首插入 SET 关键字，并会删掉额外的逗号（这些逗号是在使用条件语句给列赋值时引入的）`。

来看看与 set 元素等价的自定义 trim 元素吧：

```xml
<trim prefix="SET" suffixOverrides=",">
  ...
</trim>
123
```

注意，我们覆盖了后缀值设置，并且自定义了前缀值。

这3个元素主要功能就是帮助我们去除多余的关键字。where对应sql语句中的where关键字，set对应更新语句中的set关键字。

------

## **trim元素**

该元素的目的就是却掉前后执行的内容，其表达式如下：

```xml
<trim prefix="" prefixOverrides="" suffix="" suffixOverrides="" ></trim>

prefix="":前缀：trim标签体中是整个字符串拼串 后的结果。prefix给拼串后的整个字符串加一个前缀 
prefixOverrides="":前缀覆盖： 去掉整个字符串前面多余的字符
suffix="":后缀,suffix给拼串后的整个字符串加一个后缀 
suffixOverrides="":后缀覆盖：去掉整个字符串后面多余的字符
123456
```

**prefixOverrides**：表示在trim包含的sql语句中，要被覆写的前缀`，可以用"|"或者"||"来`分割。

示例如下：

```
<trim  prefixOverrides="and | or" ></trim> 
// 这里面的and和or不区分大小写。
12
```

`prefix：与prefixOverrides搭配使用`，它们俩总是同时出现。`该属性表示由prefixOverrides指定的前缀要被覆写成的内容-即 prefix 覆盖 prefixOverrides`。

示例如下：

```
<trim prefix="" prefixOverrides="and | or" ></trim>   
//表示把第一个and或者or变为空

<trim prefix="where" prefixOverrides="and " ></trim>  
//表示把第一个and变为where
12345
```

------

suffixOverrides和suffix和上面两个的规则是一样的，只是这两个是处理语句的最后，而上面两个是处理语句的最前。

把上面的例子改为下面的方式：

```
<select id="findActiveBlogLike"  parameterType="Blog" resultType="Blog">
    SELECT * FROM BLOG
    <trim prefix="where" prefixOverrides="and | or">        
         <if test="state != null">
              state = #{state}
        </if>
        <if test="title != null">
              AND title like #{title}
          <!--  此处为完全匹配，可以选择使用模糊查询 ！！！ -->
           <!--AND title like  "%"#{name}"%"    或者
            AND title  like CONCAT('%','${name}','%')-->
        </if>
        <if test="author != null and author.name != null">
               AND title like #{author.name}
         </if>
</select>  

12345678910111213141516
```

此时如果条件1和条件2成立，则形成的SQL为：

```
SELECT * FROM BLOG where state = #{state} AND title like #{title}
1
```

可以发现，虽然state前面没有and或者or，但是trim会为语句加上where。

如果条件2和条件3成立，则形成的SQL为：

```
SELECT * FROM BLOG WHERE title like #{title} AND title like #{author.name}
1
```

这时，会把trim元素中的SQL语句的前缀AND变为where。

**上面的效果和下面是一样的：**

```
<select id="findActiveBlogLike" parameterType="Blog" resultType="Blog">
     SELECT * FROM BLOG WHERE
    <trim prefix="" prefixOverrides="and | or">        
         <if test="state != null">
              state = #{state}
        </if>
        <if test="title != null">
              AND title like #{title}
        </if>
        <if test="author != null and author.name != null">
               AND title like #{author.name}
         </if>
</select>  
12345678910111213
```

------

我们再加上对suffix的使用，示例如下：

```
<select id="findActiveBlogLike"
  parameterType="Blog" resultType="Blog">
         SELECT * FROM BLOG
    <trim prefix="where" prefixOverrides="and | or"  suffix="" suffixOverrides=",">        
         <if test="state != null">
              state = #{state}
        </if>
        <if test="title != null">
              AND title like #{title}
        </if>
        <if test="author != null and author.name != null">
               AND title like #{author.name} ，
         </if>
</select> 
1234567891011121314
```

------

这时，如果条件3成立，会除掉最后的逗号","。

trim元素非常灵活，可以中在任何的位置，但由于我们在实际的使用中，where语句的后面和set语句的后面是最需要要处理的，所以mybatis又特意为我们定义了where元素和set元素。

------

## **where元素**

先举例如下：

```
<select id=”findActiveBlogLike”
     parameterType=”Blog” resultType=”Blog”>
 SELECT * FROM BLOG
 <where>
     <if test=”state != null”>
          state = #{state}
     </if>
     <if test=”title != null”>
          AND title like #{title}
     </if>
     <if test=”author != null and author.name != null”>
          AND title like #{author.name}
     </if>
</where>
1234567891011121314
```

如果第一个if不成立，第2个if才成立，那么where元素会去掉AND。

------

## **set元素**

set元素会动态前置SET关键字，而且也会消除任意无关的逗号。

```
<update id="updateAuthorIfNecessary" parameterType="domain.blog.Author">
 update Author
 <set>
      <if test="username != null">username=#{username},</if>
      <if test="password != null">password=#{password},</if>
      <if test="email != null">email=#{email},</if>
      <if test="bio != null">bio=#{bio}</if>
 </set>
 where id=#{id}
</update>
12345678910
```

如果第一个条件不成立，那么会消除第一条语句后面的 ","其他类同。

等价于如下：

```
<trim  preffix="SET" suffixOverrides=","> .......</trim>
1
```

------

# **【4】foreach元素**

foreach元素是非常强大的，它允许你指定一个集合，声明集合项和索引变量，它们可以用在元素体内。它也允许你指定开放和关闭的字符串，在迭代之间放置分隔符。这个元素是很智能的，它不会偶然地附加多余的分隔符。通常是构建在IN条件中的。

动态 SQL 的另一个常见使用场景是对集合进行遍历（尤其是在构建 IN 条件语句的时候）。比如：

示例如下：

```
<select id="selectPostIn" resultType="domain.blog.Post">
    SELECT *
    FROM POST P
    WHERE ID in
      <foreach item="item" index="index" collection="list" open="(" separator="," close=")">
                 #{item}
       </foreach>
</select>
12345678
```

注意：你可以传递一个List实例或者数组作为参数对象传给MyBatis。当你这么做的时候，MyBatis会自动将它包装在一个Map中，用名称作为键`。List实例将会以“list”作为键，而数组实例将会以“array”作为键`。

① `item="item"`：这里指定的是集合遍历的时候每个元素的名字，就好比为集合中的对象定义了一个名字，我们可以通过该名字来使用对象，这里的例子取名为`“item”`，我们可以随意的改名。如果这个名字指定的是一个对象，那么我们也可以这么使用：`#{item.name}`，即访问对象中的name属性。

② `collection="list"`：如果我们传递的参数是个对象，然后是要遍历对象中的某个集合，那么我们可以这么使用：collection=“param.list”，即：传入的参数名为param，该对象里面有个名为list的集合属性。

**提示** 你可以将任何可迭代对象（如 List、Set 等）、Map 对象或者数组对象作为集合参数传递给 foreach。当使用可迭代对象或者数组时，index 是当前迭代的序号，item 的值是本次迭代获取到的元素。当使用 Map 对象（或者 Map.Entry 对象的集合）时，index 是键，item 是值。

**使用foreach进行批量插入**示例如下：

```
insert into Author (username ,password ,email )  values 
<foreach collection="list" item="item" index="index" separator="," > 
    (#{item.username},#{item.password},#{item.email }) 
</foreach>
1234
```

**属性总结如下**

> collection：指定要遍历的集合：
> list类型的参数会特殊处理封装在map中，map的key就叫list
> item：将当前遍历出的元素赋值给指定的变量
> separator:每个元素之间的分隔符
> open：遍历出所有结果拼接一个开始的字符
> close:遍历出所有结果拼接一个结束的字符
> index:索引。遍历list的时候是index就是索引，item就是当前值. 遍历map的时候index表示的就是map的key，item就是map的值
> \#{变量名}就能取出变量的值也就是当前遍历出的元素

# 【5】其他支持

## script

要在带注解的映射器接口类中使用动态 SQL，可以使用 script 元素。比如:

```xml
@Update({"<script>",
  "update Author",
  "  <set>",
  "    <if test='username != null'>username=#{username},</if>",
  "    <if test='password != null'>password=#{password},</if>",
  "    <if test='email != null'>email=#{email},</if>",
  "    <if test='bio != null'>bio=#{bio}</if>",
  "  </set>",
  "where id=#{id}",
  "</script>"})
void updateAuthorValues(Author author);
1234567891011
```

## bind

bind 元素允许你在 OGNL 表达式以外创建一个变量，并将其绑定到当前的上下文。比如：

```xml
<select id="selectBlogsLike" resultType="Blog">
  <bind name="pattern" value="'%' + _parameter.getTitle() + '%'" />
  SELECT * FROM BLOG
  WHERE title LIKE #{pattern}
</select>
12345
```

## 多数据库支持

如果配置了 databaseIdProvider，你就可以在动态代码中使用名为 `“_databaseId”` 的变量来为不同的数据库构建特定的语句。比如下面的例子：

```xml
<insert id="insert">
  <selectKey keyProperty="id" resultType="int" order="BEFORE">
    <if test="_databaseId == 'oracle'">
      select seq_users.nextval from dual
    </if>
    <if test="_databaseId == 'db2'">
      select nextval for seq_users from sysibm.sysdummy1"
    </if>
  </selectKey>
  insert into users values (#{id}, #{name})
</insert>
1234567891011
```

## 动态 SQL 中的插入脚本语言

MyBatis 从 3.2 版本开始支持插入脚本语言，这允许你插入一种语言驱动，并基于这种语言来编写动态 SQL 查询语句。

可以通过实现以下接口来插入一种语言：

```java
public interface LanguageDriver {
  ParameterHandler createParameterHandler(MappedStatement mappedStatement, Object parameterObject, BoundSql boundSql);
  SqlSource createSqlSource(Configuration configuration, XNode script, Class<?> parameterType);
  SqlSource createSqlSource(Configuration configuration, String script, Class<?> parameterType);
}
12345
```

实现自定义语言驱动后，你就可以在 mybatis-config.xml 文件中将它设置为默认语言：

```xml
<typeAliases>
  <typeAlias type="org.sample.MyLanguageDriver" alias="myLanguage"/>
</typeAliases>
<settings>
  <setting name="defaultScriptingLanguage" value="myLanguage"/>
</settings>
123456
```

或者，你也可以使用 lang 属性为特定的语句指定语言：

```xml
<select id="selectBlog" lang="myLanguage">
  SELECT * FROM BLOG
</select>
123
```

或者，在你的 mapper 接口上添加 `@Lang` 注解：

```java
public interface Mapper {
  @Lang(MyLanguageDriver.class)
  @Select("SELECT * FROM BLOG")
  List<Blog> selectBlog();
}
12345
```

提示 可以使用 Apache Velocity 作为动态语言，更多细节请参考 MyBatis-Velocity 项目。

你前面看到的所有 xml 标签都由默认 MyBatis 语言提供，而它由语言驱动 `org.apache.ibatis.scripting.xmltags.XmlLanguageDriver`（别名为 xml）所提供。

注意：`xml中特殊符号如”,>,<等这些都需要使用转义字符`

## OGNL

（Object Graph Navigation Language ）对象图导航语言，这是一种强大的表达式语言，通过它可以非常方便的来操作对象属性。类似于我们的EL，SpEL等

| 访问对象属性      | person.name                                     |
| ----------------- | ----------------------------------------------- |
| 调用方法          | person.getName()                                |
| 调用静态属性/方法 | @java.lang.Math@PI @java.util.UUID@randomUUID() |
| 调用构造方法      | new com.atguigu.bean.Person(‘admin’).name       |
| 运算符            | +,-*,/,%                                        |
| 逻辑运算符        | in,not in,>,>=,<,<=,==,!=                       |

**访问集合属性**

| 类型           | 伪属性        | 伪属性对应的Java 方法                      |
| -------------- | ------------- | ------------------------------------------ |
| List、Set、Map | size、isEmpty | List/Set/Map.size(),List/Set/Map.isEmpty() |
| List、Set      | iterator      | List.iterator()、Set.iterator()            |
| Map            | keys、values  | Map.keySet()、Map.values()                 |
| Iterator       | next、hasNext | Iterator.next()、Iterator.hasNext()        |

## 内置参数

不只是方法传递过来的参数可以被用来判断，取值。mybatis默认还有两个内置参数：

- _parameter:代表整个参数
  单个参数：_parameter就是这个参数
  多个参数：参数会被封装为一个map；_parameter就是代表这个map
- _databaseId:如果配置了databaseIdProvider标签。 _databaseId就是代表当前数据库的别名

```xml
<select id="getEmpsTestInnerParameter" resultType="com.bean.Employee">
	<!-- bind：可以将OGNL表达式的值绑定到一个变量中，方便后来引用这个变量的值 -->
	<bind name="_lastName" value="'%'+lastName+'%'"/>
	<if test="_databaseId=='mysql'">
		select * from tbl_employee
		<if test="_parameter!=null">
			where last_name like #{_lastName}
		</if>
	</if>
	<if test="_databaseId=='oracle'">
		select * from employees
		<if test="_parameter!=null">
			where last_name like #{_parameter.lastName}
		</if>
	</if>
</select>
```
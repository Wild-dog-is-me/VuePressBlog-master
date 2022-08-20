## SpringBoot整合Mybatis

首先导入依赖

```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.2.0</version>
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
</dependency>
```

编写配置

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/dbname?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC
    username: root
    password: root
    driver-class-name: com.mysql.cj.jdbc.Driver
```

url连接分析

```java
jdbc:mysql://localhost:3306/dbname
```

- 连接本地mysql数据库名是dbname
- localhost是本机的IP地址也就是127.0.0.1
- 3306是对应本地的端口号，一般是mysql数据库的连接端口

```java
useUnicode=true&characterEncoding=UTF-8
```

- 解决乱码问题
- 系统编码类型为UTF-8，当数据库编码格式为GBA，也不会出现乱码

```
serverTimezone=UTC
```

- 数据库时区设置，UTC为世界时间
- 世界时间比北京时间早8个钟
- 时区设置为东八区时会出现各种陷阱，可直接修改mysql的配置文件
  或者设置serverTimezone=Asia/Shanghai

```
useSSL=true
```

- 这个参数可以使JDBC兼容更高版本的数据库

```yaml
mybatis:
  mapper-locations: classpath:com.dog.mapper/*xml
  # 返回自定义entity
  type-aliases-package: com.dog.entity
  configuration: 
    # 指定mybatis全局配置文件中的相关配置项
    # 当为true时：mybatis-plus会将Java对象的驼峰式命名的常量转成下划线的方式，再与数据库表列字段进行匹配，这样会造成错误。 此时需要利用@TableField注解指定常量在表中的列名。
    # 当为false时：此时就需要数据库里每列都是下划线的命名方式。
    map-underscore-to-camel-case: true
    # mybatis打印输出日志配置
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

```


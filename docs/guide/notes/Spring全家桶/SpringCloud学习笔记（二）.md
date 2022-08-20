# Nacos配置中心

Nacos除了可以做注册中心，同样可以做配置管理来使用。

当微服务部署的实例越来越多，达到数十、数百时，逐个修改微服务配置就会让人抓狂，而且很容易出错。**我们需要一种统一配置管理方案，可以集中管理所有实例的配置。**

[![img](https://pic.imgdb.cn/item/62dfdf17f54cd3f937bfcaec.png)](https://cdn.xn2001.com/img/2021/20210901092150.png)





Nacos 一方面可以将配置集中管理，另一方可以在配置变更时，及时通知微服务，**实现配置的热更新。**

## 创建配置



在 Nacos 控制面板中添加配置文件

[![img](https://pic.imgdb.cn/item/62dfdf17f54cd3f937bfcb42.png)](https://cdn.xn2001.com/img/2021/20210901092159.png)





然后在弹出的表单中，填写配置信息：

[![img](https://pic.imgdb.cn/item/62dfdf17f54cd3f937bfcbb2.png)](https://cdn.xn2001.com/img/2021/20210901092206.png)





**注意**：项目的核心配置，需要热更新的配置才有放到 nacos 管理的必要。基本不会变更的一些配置(例如数据库连接)还是保存在微服务本地比较好。

## 拉取配置



首先我们需要了解 Nacos 读取配置文件的环节是在哪一步，在没加入 Nacos 配置之前，获取配置是这样：

[![img](https://pic.imgdb.cn/item/62dfdf17f54cd3f937bfcc84.png)](https://cdn.xn2001.com/img/2021/20210901092215.png)





加入 Nacos 配置，它的读取是在 application.yml 之前的：

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfcce9.png)](https://cdn.xn2001.com/img/2021/20210901092223.png)





这时候如果把 nacos 地址放在 application.yml 中，显然是不合适的，**Nacos 就无法根据地址去获取配置了。**

因此，nacos 地址必须放在优先级最高的 bootstrap.yml 文件。

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfcd9a.png)](https://cdn.xn2001.com/img/2021/20210901092228.png)





**引入 nacos-config 依赖**

首先，在 user-service 服务中，引入 nacos-config 的客户端依赖：

```xml
<!--nacos配置管理依赖-->
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-config</artifactId>
</dependency>
```

**添加 bootstrap.yml**

然后，在 user-service 中添加一个 bootstrap.yml 文件，内容如下：

```yaml
spring:
  application:
    name: userservice # 服务名称
  profiles:
    active: dev #开发环境，这里是dev 
  cloud:
    nacos:
      server-addr: localhost:8848 # Nacos地址
      config:
        file-extension: yaml # 文件后缀名
```

根据 spring.cloud.nacos.server-addr 获取 nacos地址，再根据`${spring.application.name}-${spring.profiles.active}.${spring.cloud.nacos.config.file-extension}`作为文件id，来读取配置。

在这个例子例中，就是去读取 `userservice-dev.yaml`

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfcdb7.png)](https://cdn.xn2001.com/img/2021/20210901092237.png)





使用代码来验证是否拉取成功

在 user-service 中的 UserController 中添加业务逻辑，读取 pattern.dateformat 配置并使用：

```java
@Value("${pattern.dateformat}")
private String dateformat;

@GetMapping("now")
public String now(){
    //格式化时间
    return LocalDateTime.now().format(DateTimeFormatter.ofPattern(dateformat));
}
```

![image-20220726203747854](https://pic.imgdb.cn/item/62dfe01cf54cd3f937c6d33f.png)

## 配置热更新



我们最终的目的，是修改 nacos 中的配置后，微服务中无需重启即可让配置生效，也就是**配置热更新**。

有两种方式：1. 用 `@value` 读取配置时，搭配 `@RefreshScope`；2. 直接用 `@ConfigurationProperties` 读取配置

### @RefreshScope

方式一：在 `@Value` 注入的变量所在类上添加注解 `@RefreshScope`

![image-20220726203845685](https://pic.imgdb.cn/item/62dfe056f54cd3f937c85498.png)



### @ConfigurationProperties

方式二：使用 `@ConfigurationProperties` 注解读取配置文件，就不需要加 `@RefreshScope` 注解。

在 user-service 服务中，添加一个 PatternProperties 类，读取 `patterrn.dateformat` 属性

```java
@Data
@Component
@ConfigurationProperties(prefix = "pattern")
public class PatternProperties {
    public String dateformat;
}
@Autowired
private PatternProperties patternProperties;

@GetMapping("now2")
public String now2(){
    //格式化时间
    return LocalDateTime.now().format(DateTimeFormatter.ofPattern(patternProperties.dateformat));
}
```

## 配置共享



其实在服务启动时，nacos 会读取多个配置文件，例如：

- `[spring.application.name]-[spring.profiles.active].yaml`，例如：userservice-dev.yaml
- `[spring.application.name].yaml`，例如：userservice.yaml

这里的 `[spring.application.name].yaml` 不包含环境，**因此可以被多个环境共享**。

**添加一个环境共享配置**

我们在 nacos 中添加一个 userservice.yaml 文件：

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfcf36.png)](https://cdn.xn2001.com/img/2021/20210901092323.png)





**在 user-service 中读取共享配置**

在 user-service 服务中，修改 PatternProperties 类，读取新添加的属性：

![image-20220726212116762](https://pic.imgdb.cn/item/62dfea4df54cd3f9370b90da.png)



在 user-service 服务中，修改 UserController，添加一个方法：

![image-20220726212143180](https://pic.imgdb.cn/item/62dfea67f54cd3f9370c5235.png)





**运行两个 UserApplication，使用不同的profile**

修改 UserApplication2 这个启动项，改变其profile值：

![image-20220726212219213](https://pic.imgdb.cn/item/62dfea8bf54cd3f9370d50b1.png)

![image-20220726212256040](https://pic.imgdb.cn/item/62dfeab0f54cd3f9370e57df.png)

这样，UserApplication(8081) 使用的 profile 是 dev，UserApplication2(8082) 使用的 profile 是test

启动 UserApplication 和 UserApplication2

访问地址：http://localhost:8081/user/prop，结果：

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfd2f0.png)](https://cdn.xn2001.com/img/2021/20210901092400.png)





访问地址：http://localhost:8082/user/prop，结果：

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfd2ed.png)](https://cdn.xn2001.com/img/2021/20210901092419.png)





可以看出来，不管是 dev，还是 test 环境，都读取到了 envSharedValue 这个属性的值。

上面的都是同一个微服务下，**那么不同微服务之间可以环境共享吗？**

通过下面的两种方式来指定：

- extension-configs
- shared-configs

```yml
spring: 
  cloud:
    nacos:
      config:
        file-extension: yaml # 文件后缀名
        extends-configs: # 多微服务间共享的配置列表
          - dataId: common.yaml # 要共享的配置文件id
spring: 
  cloud:
    nacos:
      config:
        file-extension: yaml # 文件后缀名
        shared-configs: # 多微服务间共享的配置列表
          - dataId: common.yaml # 要共享的配置文件id
```

## 配置优先级



当 nacos、服务本地同时**出现相同属性时**，优先级有高低之分。

[![img](https://pic.imgdb.cn/item/62dfdf18f54cd3f937bfd393.png)](https://cdn.xn2001.com/img/2021/20210901092501.png)





更细致的配置

[![img](https://pic.imgdb.cn/item/62dfdf19f54cd3f937bfd549.png)](https://cdn.xn2001.com/img/2021/20210901092520.png)





# Nacos集群



## 架构介绍



[![img](https://pic.imgdb.cn/item/62dfdf19f54cd3f937bfd59c.png)](https://cdn.xn2001.com/img/2021/202108181959897.png)





其中包含 3 个Nacos 节点，然后一个负载均衡器 Nginx 代理 3 个 Nacos，我们计划的 Nacos 集群如下图，MySQL 的主从复制后续再添加。

[![img](https://pic.imgdb.cn/item/62dfdf19f54cd3f937bfd6c3.png)](https://cdn.xn2001.com/img/2021/202108182000220.png)





三个 Nacos 节点的地址

| 节点   | ip            | port |
| :----- | :------------ | :--- |
| nacos1 | 192.168.150.1 | 8845 |
| nacos2 | 192.168.150.1 | 8846 |
| nacos3 | 192.168.150.1 | 8847 |

## 初始化数据库



Nacos 默认数据存储在内嵌数据库 Derby 中，不属于生产可用的数据库。官方推荐的最佳实践是使用带有主从的高可用数据库集群，主从模式的高可用数据库。这里我们以单点的数据库为例。

首先新建一个数据库，命名为 nacos，而后导入下面的 SQL

## 配置Nacos



进入 nacos 的 conf 目录，修改配置文件 cluster.conf.example，重命名为 cluster.conf

[![img](https://pic.imgdb.cn/item/62dfdf19f54cd3f937bfd6c0.png)](https://cdn.xn2001.com/img/2021/202108182004564.png)





添加内容

```
127.0.0.1:8845
127.0.0.1.8846
127.0.0.1.8847
```

然后修改 application.properties 文件，添加数据库配置

```properties
spring.datasource.platform=mysql
db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true&useUnicode=true&useSSL=false&serverTimezone=UTC
db.user.0=root
db.password.0=123456
```

将 nacos 文件夹复制三份，分别命名为：nacos1、nacos2、nacos3

[![img](https://pic.imgdb.cn/item/62dfdf19f54cd3f937bfd7bd.png)](https://cdn.xn2001.com/img/2021/202108182004103.png)





然后分别修改三个文件夹中的 application.properties，

nacos1

```properties
server.port=8845
```

nacos2

```properties
server.port=8846
```

nacos3

```properties
server.port=8847
```

然后分别启动三个 nacos

```
startup.cmd
```

## Nginx反向代理



修改 nginx 文件夹下的 conf/nginx.conf 文件，配置如下

```nginx
upstream nacos-cluster {
    server 127.0.0.1:8845;
	server 127.0.0.1:8846;
	server 127.0.0.1:8847;
}

server {
    listen       80;
    server_name  localhost;

    location /nacos {
        proxy_pass http://nacos-cluster;
    }
}
```

启动 nginx，在浏览器访问：http://localhost/nacos

在代码中的 application.yml 文件配置改为如下：

```yaml
spring:
  cloud:
    nacos:
      server-addr: localhost:80 # Nacos地址
```

实际部署时，需要给做反向代理的 Nginx 服务器设置一个域名，这样后续如果有服务器迁移 Nacos 的客户端也无需更改配置。Nacos 的各个节点应该部署到多个不同服务器，做好容灾和隔离工作。


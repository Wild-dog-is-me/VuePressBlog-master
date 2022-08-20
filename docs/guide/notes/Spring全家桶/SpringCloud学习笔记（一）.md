# 认识微服务



## 单体架构



**单体架构**：将业务的所有功能集中在一个项目中开发，打成一个包部署。

[![img](https://pic.imgdb.cn/item/62df8479f54cd3f937cedb6e.png)](https://cdn.xn2001.com/img/2021/20210901083809.png)





**优点**：架构简单，部署成本低

**缺点**：耦合度高（维护困难、升级困难）

## 分布式架构



**分布式架构**：根据业务功能对系统做拆分，每个业务功能模块作为独立项目开发，称为一个服务。

[![img](https://pic.imgdb.cn/item/62df8479f54cd3f937cedc12.png)](https://cdn.xn2001.com/img/2021/20210901092921.png)





**优点**：降低服务耦合，有利于服务升级和拓展

**缺点**：服务调用关系错综复杂

分布式架构虽然降低了服务耦合，但是服务拆分时也有很多问题需要思考：

- 服务拆分的粒度如何界定？
- 服务之间如何调用？
- 服务的调用关系如何管理？

**人们需要制定一套行之有效的标准来约束分布式架构。**

## 微服务



微服务的架构特征：

- 单一职责：微服务拆分粒度更小，每一个服务都对应唯一的业务能力，做到单一职责
- 自治：团队独立、技术独立、数据独立，独立部署和交付
- 面向服务：服务提供统一标准的接口，与语言和技术无关
- 隔离性强：服务调用做好隔离、容错、降级，避免出现级联问题

[![img](https://pic.imgdb.cn/item/62df8479f54cd3f937cedbd4.png)](https://cdn.xn2001.com/img/2022/202205162352847.png)





微服务的上述特性**其实是在给分布式架构制定一个标准**，进一步降低服务之间的耦合度，提供服务的独立性和灵活性。做到高内聚，低耦合。

**因此，可以认为微服务是一种经过良好架构设计的分布式架构方案 。**

其中在 Java 领域最引人注目的就是 SpringCloud 提供的方案了。

## SpringCloud



SpringCloud 是目前国内使用最广泛的微服务框架。官网地址：https://spring.io/projects/spring-cloud。

SpringCloud 集成了各种微服务功能组件，并基于 SpringBoot 实现了这些组件的自动装配，从而提供了良好的开箱即用体验。

其中常见的组件包括：

[![img](https://pic.imgdb.cn/item/62df8479f54cd3f937cedbc9.png)](https://cdn.xn2001.com/img/2021/20210901083717.png)





另外，SpringCloud 底层是依赖于 SpringBoot 的，并且有版本的兼容关系，如下：

[![img](https://pic.imgdb.cn/item/62df8479f54cd3f937cedbce.png)](https://cdn.xn2001.com/img/2021/20210901084050.png)





## 内容知识



[![需要学习的微服务知识内容](https://pic.imgdb.cn/item/62df847af54cd3f937cede7a.png)](https://cdn.xn2001.com/img/2021/20210901092925.png)

[需要学习的微服务知识内容](https://cdn.xn2001.com/img/2021/20210901092925.png)



[![技术栈](https://pic.imgdb.cn/item/62df847bf54cd3f937cee207.png)](https://cdn.xn2001.com/img/2021/20210901084131.png)

[技术栈](https://cdn.xn2001.com/img/2021/20210901084131.png)



[![自动化部署](https://pic.imgdb.cn/item/62df847bf54cd3f937cee210.png)](https://cdn.xn2001.com/img/2021/20210901090737.png)

[自动化部署](https://cdn.xn2001.com/img/2021/20210901090737.png)



## 技术栈对比



[![img](https://pic.imgdb.cn/item/62df847bf54cd3f937cee209.png)](https://cdn.xn2001.com/img/2021/20210901090726.png)





# 服务拆分



> 代码参考：
>
> Gitee：https://gitee.com/xn2001/cloudcode/tree/master/01-cloud-demo
>
> GitHub：https://github.com/lexinhu/cloudcode/tree/master/01-cloud-demo

**服务拆分注意事项**

单一职责：不同微服务，不要重复开发相同业务

数据独立：不要访问其它微服务的数据库

面向服务：将自己的业务暴露为接口，供其它微服务调用

[![img](https://pic.imgdb.cn/item/62df847af54cd3f937cede6b.png)](https://cdn.xn2001.com/img/2021/20210901090745.png)





cloud-demo：父工程，管理依赖

- order-service：订单微服务，负责订单相关业务
- user-service：用户微服务，负责用户相关业务

要求：

- 订单微服务和用户微服务都必须有**各自的数据库**，相互独立
- 订单服务和用户服务**都对外暴露 Restful 的接口**
- 订单服务如果需要查询用户信息，**只能调用用户服务的 Restful 接口**，不能查询用户数据库

微服务项目下，打开 idea 中的 Service，可以很方便的启动。

[![img](https://pic.imgdb.cn/item/62df847bf54cd3f937cee27b.png)](https://cdn.xn2001.com/img/2021/20210901090750.png)





启动完成后，访问 http://localhost:8080/order/101

[![img](https://pic.imgdb.cn/item/62df847bf54cd3f937cee4ee.png)](https://cdn.xn2001.com/img/2021/20210901090757.png)





# 远程调用



正如上面的服务拆分要求中所提到，订单服务如果需要查询用户信息，**只能调用用户服务的 Restful 接口**，不能查询用户数据库

因此我们需要知道 Java 如何去发送 http 请求，Spring 提供了一个 RestTemplate 工具，只需要把它创建出来即可。（即注入 Bean）

![image-20220726140740412](https://pic.imgdb.cn/item/62df84adf54cd3f937cffa92.png)

发送请求，自动序列化为 Java 对象。

![image-20220726140818005](https://pic.imgdb.cn/item/62df84d2f54cd3f937d0d327.png)

启动完成后，访问：http://localhost:8080/order/101

[![img](https://pic.imgdb.cn/item/62df847bf54cd3f937cee4ea.png)](https://cdn.xn2001.com/img/2021/20210901090909.png)



在上面代码的 url 中，我们可以发现调用服务的地址采用硬编码，这在后续的开发中肯定是不理想的，这就需要**服务注册中心**（Eureka）来帮我们解决这个事情。

# Eureka注册中心

最广为人知的注册中心就是 Eureka，其结构如下：

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f40d.png)](https://cdn.xn2001.com/img/2021/20210901090919.png)





**order-service 如何得知 user-service 实例地址？**

- user-service 服务实例启动后，将自己的信息注册到 eureka-server(Eureka服务端)，叫做**服务注册**
- eureka-server 保存服务名称到服务实例地址列表的映射关系
- order-service 根据服务名称，拉取实例地址列表，这个叫**服务发现**或服务拉取

**order-service 如何从多个 user-service 实例中选择具体的实例？**

order-service从实例列表中利用**负载均衡算法**选中一个实例地址，向该实例地址发起远程调用

**order-service 如何得知某个 user-service 实例是否依然健康，是不是已经宕机？**

- user-service 会**每隔一段时间(默认30秒)向 eureka-server 发起请求**，报告自己状态，称为**心跳**
- 当超过一定时间没有发送心跳时，eureka-server 会认为微服务实例故障，将该实例从服务列表中剔除
- order-service 拉取服务时，就能将故障实例排除了

------

接下来我们动手实践的步骤包括

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f498.png)](https://cdn.xn2001.com/img/2021/20210901090932.png)





## 搭建注册中心

**搭建 eureka-server**

引入 SpringCloud 为 eureka 提供的 starter 依赖，注意这里是用 **server**

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
</dependency>
```

**编写启动类**

注意要添加一个 `@EnableEurekaServer` **注解**，开启 eureka 的**注册中心**功能

```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class EurekaApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaApplication.class, args);
    }
}
```

**编写配置文件**

编写一个 application.yml 文件，内容如下：

```yml
server:
  port: 10086
spring:
  application:
    name: eureka-server
eureka:
  client:
    service-url: 
      defaultZone: http://127.0.0.1:10086/eureka
```

其中 `default-zone` 是因为前面配置类开启了注册中心所需要配置的 eureka 的**地址信息**，因为 eureka 本身也是一个微服务，这里也要将自己注册进来，当后面 eureka **集群**时，这里就可以填写多个，使用 “,” 隔开。

启动完成后，访问 http://localhost:10086/

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f4aa.png)](https://cdn.xn2001.com/img/2021/20210901090945.png)





## 服务注册



> 将 user-service、order-service 都注册到 eureka

引入 SpringCloud 为 eureka 提供的 starter 依赖，注意这里是用 **client**

```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
</dependency>
```

在启动类上添加注解：`@EnableEurekaClient`

在 application.yml 文件，添加下面的配置：

```yml
spring:
  application:
  	#name：orderservice
    name: userservice
eureka:
  client:
    service-url: 
      defaultZone: http:127.0.0.1:10086/eureka
```

3个项目启动后，访问 http://localhost:10086/

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f3cc.png)](https://cdn.xn2001.com/img/2021/20210901090958.png)





这里另外再补充个小技巧，我们可以通过 idea 的多实例启动，来查看 Eureka 的集群效果。

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f469.png)





4个项目启动后，访问 http://localhost:10086/

[![img](https://pic.imgdb.cn/item/62df8507f54cd3f937d1f574.png)](https://cdn.xn2001.com/img/2021/20210901091015.png)





## 服务拉取



> 在 order-service 中完成服务拉取，然后通过负载均衡挑选一个服务，实现远程调用

下面我们让 order-service 向 eureka-server 拉取 user-service 的信息，实现服务发现。

首先给 `RestTemplate` 这个 Bean 添加一个 `@LoadBalanced` **注解**，用于开启**负载均衡**。（后面会讲）

```java
@Bean
@LoadBalanced
public RestTemplate restTemplate(){
    return new RestTemplate();
}
```

修改 OrderService 访问的url路径，用**服务名**代替ip、端口：

![image-20220726141049731](https://pic.imgdb.cn/item/62df856af54cd3f937d40be3.png)

spring 会自动帮助我们从 eureka-server 中，根据 userservice 这个服务名称，获取实例列表后去完成负载均衡。

# Ribbon负载均衡



> 代码参考：
>
> Gitee：https://gitee.com/xn2001/cloudcode/tree/master/04-cloud-ribbon
>
> GitHub：https://github.com/lexinhu/cloudcode/tree/master/04-cloud-ribbon

我们添加了 `@LoadBalanced` 注解，即可实现负载均衡功能，这是什么原理呢？

**SpringCloud 底层提供了一个名为 Ribbon 的组件，来实现负载均衡功能。**

[![img](https://pic.imgdb.cn/item/62df8599f54cd3f937d518ae.png)](https://cdn.xn2001.com/img/2021/20210901091242.png)





## 源码跟踪



为什么我们只输入了 service 名称就可以访问了呢？为什么不需要获取ip和端口，这显然有人帮我们根据 service 名称，获取到了服务实例的ip和端口。它就是`LoadBalancerInterceptor`，这个类会在对 RestTemplate 的请求进行拦截，然后从 Eureka 根据服务 id 获取服务列表，随后利用负载均衡算法得到真实的服务地址信息，替换服务 id。

我们进行源码跟踪：

[![img](https://pic.imgdb.cn/item/62df8599f54cd3f937d518b2.png)](https://cdn.xn2001.com/img/2021/20210901091323.png)





这里的 `intercept()` 方法，拦截了用户的 HttpRequest 请求，然后做了几件事：

- `request.getURI()`：获取请求uri，即 http://user-service/user/8
- `originalUri.getHost()`：获取uri路径的主机名，其实就是服务id `user-service`
- `this.loadBalancer.execute()`：处理服务id，和用户请求

这里的 `this.loadBalancer` 是 `LoadBalancerClient` 类型

继续跟入 `execute()` 方法：

[![img](https://pic.imgdb.cn/item/62df8599f54cd3f937d5194c.png)](https://cdn.xn2001.com/img/2021/20210901091330.png)





- `getLoadBalancer(serviceId)`：根据服务id获取 `ILoadBalancer`，而 `ILoadBalancer` 会拿着服务 id 去 eureka 中获取服务列表。
- `getServer(loadBalancer)`：利用内置的负载均衡算法，从服务列表中选择一个。在图中**可以看到获取了8082端口的服务**

可以看到获取服务时，通过一个 `getServer()` 方法来做负载均衡:

[![img](https://pic.imgdb.cn/item/62df8599f54cd3f937d519ba.png)](https://cdn.xn2001.com/img/2021/20210901091345.png)





我们继续跟入：

[![img](https://pic.imgdb.cn/item/62df8599f54cd3f937d519ad.png)](https://cdn.xn2001.com/img/2021/20210901091355.png)





继续跟踪源码 `chooseServer()` 方法，发现这么一段代码：

[![img](https://pic.imgdb.cn/item/62df859af54cd3f937d51acd.png)](https://cdn.xn2001.com/img/2021/20210901091414.png)





我们看看这个 `rule` 是谁：

[![img](https://pic.imgdb.cn/item/62df859af54cd3f937d51b5a.png)](https://cdn.xn2001.com/img/2021/20210901091432.png)





这里的 rule 默认值是一个 `RoundRobinRule` ，看类的介绍：

[![img](https://pic.imgdb.cn/item/62df859af54cd3f937d51b39.png)](https://cdn.xn2001.com/img/2021/20210901091442.png)





负载均衡默认使用了轮训算法，当然我们也可以自定义。

## 流程总结



SpringCloud Ribbon 底层采用了一个拦截器，拦截了 RestTemplate 发出的请求，对地址做了修改。

基本流程如下：

- 拦截我们的 `RestTemplate` 请求 http://userservice/user/1
- `RibbonLoadBalancerClient` 会从请求url中获取服务名称，也就是 user-service
- `DynamicServerListLoadBalancer` 根据 user-service 到 eureka 拉取服务列表
- eureka 返回列表，localhost:8081、localhost:8082
- `IRule` 利用内置负载均衡规则，从列表中选择一个，例如 localhost:8081
- `RibbonLoadBalancerClient` 修改请求地址，用 localhost:8081 替代 userservice，得到 http://localhost:8081/user/1，发起真实请求

[![img](https://pic.imgdb.cn/item/62df859af54cd3f937d51c0f.png)](https://cdn.xn2001.com/img/2021/20210901091755.png)





## 负载均衡策略



负载均衡的规则都定义在 IRule 接口中，而 IRule 有很多不同的实现类：

[![img](https://pic.imgdb.cn/item/62df859af54cd3f937d51c0b.png)](https://cdn.xn2001.com/img/2021/20210901091811.png)





不同规则的含义如下：

| **内置负载均衡规则类**    | **规则描述**                                                 |
| :------------------------ | :----------------------------------------------------------- |
| RoundRobinRule            | 简单轮询服务列表来选择服务器。它是Ribbon默认的负载均衡规则。 |
| AvailabilityFilteringRule | 对以下两种服务器进行忽略：（1）在默认情况下，这台服务器如果3次连接失败，这台服务器就会被设置为“短路”状态。短路状态将持续30秒，如果再次连接失败，短路的持续时间就会几何级地增加。 （2）并发数过高的服务器。如果一个服务器的并发连接数过高，配置了AvailabilityFilteringRule 规则的客户端也会将其忽略。并发连接数的上限，可以由客户端设置。 |
| WeightedResponseTimeRule  | 为每一个服务器赋予一个权重值。服务器响应时间越长，这个服务器的权重就越小。这个规则会随机选择服务器，这个权重值会影响服务器的选择。 |
| **ZoneAvoidanceRule**     | 以区域可用的服务器为基础进行服务器的选择。使用Zone对服务器进行分类，这个Zone可以理解为一个机房、一个机架等。而后再对Zone内的多个服务做轮询。 |
| BestAvailableRule         | 忽略那些短路的服务器，并选择并发数较低的服务器。             |
| RandomRule                | 随机选择一个可用的服务器。                                   |
| RetryRule                 | 重试机制的选择逻辑                                           |

默认的实现就是 `ZoneAvoidanceRule`，**是一种轮询方案**。

## 自定义策略



通过定义 IRule 实现可以修改负载均衡规则，有两种方式：

1 代码方式在 order-service 中的 OrderApplication 类中，定义一个新的 IRule：

![image-20220726141225760](https://pic.imgdb.cn/item/62df85caf54cd3f937d61d20.png)

2 配置文件方式：在 order-service 的 application.yml 文件中，添加新的配置也可以修改规则：

```yml
userservice: # 给需要调用的微服务配置负载均衡规则，orderservice服务去调用userservice服务
  ribbon:
    NFLoadBalancerRuleClassName: com.netflix.loadbalancer.RandomRule # 负载均衡规则 
```

**注意**：一般用默认的负载均衡规则，不做修改。

## 饥饿加载



当我们启动 orderservice，第一次访问时，时间消耗会大很多，这是因为 Ribbon 懒加载的机制。

[![img](https://pic.imgdb.cn/item/62df8610f54cd3f937d79d0f.png)

Ribbon 默认是采用懒加载，即第一次访问时才会去创建 LoadBalanceClient，拉取集群地址，所以请求时间会很长。

而饥饿加载则会在项目启动时创建 LoadBalanceClient，降低第一次访问的耗时，通过下面配置开启饥饿加载：

```yml
ribbon:
  eager-load:
    enabled: true
    clients: userservice # 项目启动时直接去拉取userservice的集群，多个用","隔开
```

# Nacos注册中心

SpringCloudAlibaba 推出了一个名为 Nacos 的注册中心，在国外也有大量的使用。

[![img](https://pic.imgdb.cn/item/62df8610f54cd3f937d79de9.png)](https://cdn.xn2001.com/img/2021/20210901091857.png)





解压启动 Nacos，详细请看 [Nacos安装指南](https://www.xn2001.com/archives/661.html)

```
startup.cmd -m standalone
```

访问：http://localhost:8848/nacos/

[![img](https://pic.imgdb.cn/item/62df8610f54cd3f937d79de6.png)](https://cdn.xn2001.com/img/2021/20210901091904.png)





## 服务注册



这里上来就直接服务注册，很多东西可能有疑惑，其实 Nacos 本身就是一个 SprintBoot 项目，这点你从启动的控制台打印就可以看出来，所以就不再需要去额外搭建一个像 Eureka 的注册中心。

**引入依赖**

在 cloud-demo 父工程中引入 SpringCloudAlibaba 的依赖：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-alibaba-dependencies</artifactId>
    <version>2.2.6.RELEASE</version>
    <type>pom</type>
    <scope>import</scope>
</dependency>
```

然后在 user-service 和 order-service 中的pom文件中引入 nacos-discovery 依赖：

```xml
<dependency>
    <groupId>com.alibaba.cloud</groupId>
    <artifactId>spring-cloud-starter-alibaba-nacos-discovery</artifactId>
</dependency>
```

**配置nacos地址**

在 user-service 和 order-service 的 application.yml 中添加 nacos 地址：

```yaml
spring:
  cloud:
    nacos:
      server-addr: 127.0.0.1:8848
```

项目重新启动后，可以看到三个服务都被注册进了 Nacos

[![img](https://pic.imgdb.cn/item/62df8610f54cd3f937d79e50.png)](https://cdn.xn2001.com/img/2021/20210901091918.png)





浏览器访问：http://localhost:8080/order/101，正常访问，同时负载均衡也正常。

## 分级存储模型



一个**服务**可以有多个**实例**，例如我们的 user-service，可以有:

- 127.0.0.1:8081
- 127.0.0.1:8082
- 127.0.0.1:8083

假如这些实例分布于全国各地的不同机房，例如：

- 127.0.0.1:8081，在上海机房
- 127.0.0.1:8082，在上海机房
- 127.0.0.1:8083，在杭州机房

Nacos就将同一机房内的实例，划分为一个**集群**。

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a049.png)](https://cdn.xn2001.com/img/2021/20210901091928.png)





微服务互相访问时，应该尽可能访问同集群实例，因为本地访问速度更快。**当本集群内不可用时，才访问其它集群。**例如：杭州机房内的 order-service 应该优先访问同机房的 user-service。

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d79fbd.png)](https://cdn.xn2001.com/img/2021/20210901091937.png)





## 配置集群



接下来我们给 user-service **配置集群**

修改 user-service 的 application.yml 文件，添加集群配置：

```yml
spring:
  cloud:
    nacos:
      server-addr: localhost:8848
      discovery:
        cluster-name: HZ # 集群名称 HZ杭州
```

重启两个 user-service 实例后，我们再去启动一个上海集群的实例。

```
-Dserver.port=8083 -Dspring.cloud.nacos.discovery.cluster-name=SH
```

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a00a.png)](https://cdn.xn2001.com/img/2021/20210901091947.png)





查看 nacos 控制台

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a134.png)](https://cdn.xn2001.com/img/2021/20210901091957.png)





## NacosRule



Ribbon的默认实现 `ZoneAvoidanceRule` 并不能实现根据同集群优先来实现负载均衡，我们把规则改成 **NacosRule** 即可。我们是用 orderservice 调用 userservice，所以在 orderservice 配置规则。

```java
@Bean
public IRule iRule(){
    //默认为轮询规则，这里自定义为随机规则
    return new NacosRule();
}
```

另外，你同样可以使用配置的形式来完成，具体参考上面的 Ribbon 栏目。

```yml
userservice:
  ribbon:
    NFLoadBalancerRuleClassName: com.alibaba.cloud.nacos.ribbon.NacosRule #负载均衡规则 
```

然后，再对 orderservice 配置集群。

```yml
spring:
  cloud:
    nacos:
      server-addr: localhost:8848
      discovery:
        cluster-name: HZ # 集群名称
```

现在我启动了四个服务，分别是：

- orderservice - HZ
- userservice - HZ
- userservice1 - HZ
- userservice2 - SH

访问地址：http://localhost:8080/order/101

在访问中我们发现，只有同在一个 HZ 集群下的 userservice、userservice1 会被调用，并且是随机的。

我们试着把 userservice、userservice2 停掉。依旧可以访问。

在 userservice3 控制台可以看到发出了一串的警告，因为 orderservice 本身是在 HZ 集群的，这波 HZ 集群没有了 userservice，就会去别的集群找。

## 权重配置



实际部署中会出现这样的场景：

服务器设备性能有差异，部分实例所在机器性能较好，另一些较差，我们希望性能好的机器承担更多的用户请求。但默认情况下 NacosRule 是同集群内随机挑选，不会考虑机器的性能问题。

因此，Nacos 提供了**权重配置来控制访问频率**，0~1 之间，权重越大则访问频率越高，权重修改为 0，则该实例永远不会被访问。

在 Nacos 控制台，找到 user-service 的实例列表，点击编辑，即可修改权重。

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a1f0.png)](https://cdn.xn2001.com/img/2021/20210901092020.png)





在弹出的编辑窗口，修改权重

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a2ce.png)](https://cdn.xn2001.com/img/2021/20210901092026.png)





另外，在服务升级的时候，有一种较好的方案：我们也可以通过调整权重来进行平滑升级，例如：先把 userservice 权重调节为 0，让用户先流向 userservice2、userservice3，升级 userservice后，再把权重从 0 调到 0.1，让一部分用户先体验，用户体验稳定后就可以往上调权重啦。

## 环境隔离



Nacos 提供了 namespace 来实现环境隔离功能。

- Nacos 中可以有多个 namespace
- namespace 下可以有 group、service 等
- 不同 namespace 之间**相互隔离**，例如不同 namespace 的服务互相不可见

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a47b.png)](https://cdn.xn2001.com/img/2021/20210901092032.png)





### 创建namespace

默认情况下，所有 service、data、group 都在同一个 namespace，名为 public(保留空间)：

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a39e.png)](https://cdn.xn2001.com/img/2021/20210901092038.png)





我们可以点击页面新增按钮，添加一个 namespace：

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a3c0.png)](https://cdn.xn2001.com/img/2021/20210901092050.png)





然后，填写表单：

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a3ae.png)](https://cdn.xn2001.com/img/2021/20210901092059.png)





就能在页面看到一个新的 namespace：

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a3f2.png)](https://cdn.xn2001.com/img/2021/20210901092114.png)





### 配置namespace

给微服务配置 namespace 只能通过修改配置来实现。

例如，修改 order-service 的 application.yml 文件：

```yaml
spring:
  cloud:
    nacos:
      server-addr: localhost:8848
      discovery:
        cluster-name: HZ
        namespace: 492a7d5d-237b-46a1-a99a-fa8e98e4b0f9 # 命名空间ID
```

重启 order-service 后，访问控制台。

**public**

[![img](https://pic.imgdb.cn/item/62df8611f54cd3f937d7a4df.png)](https://cdn.xn2001.com/img/2021/20210901092143.png)





**dev**

[![img](https://pic.imgdb.cn/item/62df8612f54cd3f937d7a536.png)](https://cdn.xn2001.com/img/2021/20210901092130.png)





此时访问 order-service，因为 namespace 不同，会导致找不到 userservice，控制台会报错。

## 临时实例



Nacos 的服务实例分为两种类型：

- **临时实例**：如果实例宕机超过一定时间，会从服务列表剔除，**默认的类型**。
- 非临时实例：如果实例宕机，不会从服务列表剔除，也可以叫永久实例。

配置一个服务实例为永久实例：

```yaml
spring:
  cloud:
    nacos:
      discovery:
        ephemeral: false # 设置为非临时实例
```

另外，Nacos 集群**默认采用AP方式(可用性)**，当集群中存在非临时实例时，**采用CP模式(一致性)**；而 Eureka 采用AP方式，不可切换。

# 
### RabbitMQ 架构简介

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZsLOQAWvXCKmag8rlBomSxnWSsRb1iaZXOAicy51iaEbCsiaK6Pr8GkC2yg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

这张图中涉及到如下一些概念：

1. 生产者（Publisher）：发布消息到 RabbitMQ 中的交换机（Exchange）上。

2. 交换机（Exchange）：和生产者建立连接并接收生产者的消息。

3. 消费者（Consumer）：监听 RabbitMQ 中的 Queue 中的消息。

4. 队列（Queue）：Exchange 将消息分发到指定的 Queue，Queue 和消费者进行交互。

5. 路由（Routes）：交换机转发消息到队列的规则。

### 准备工作

先导入依赖

![image-20220731213117111](https://pic.imgdb.cn/item/62e684258c61dc3b8e078158.png)

接下来进行mq的配置

```properties
# 配置 RabbitMQ 基本信息
# RabbitMQ 地址
spring.rabbitmq.host=121.5.67.187
# RabbitMQ 的端口号
spring.rabbitmq.port=5672
spring.rabbitmq.username=guest
spring.rabbitmq.password=guest
# 这个可以不用给，默认就是 /
spring.rabbitmq.virtual-host=/
```

接下来进行 RabbitMQ 配置，在 RabbitMQ 中，所有的消息生产者提交的消息都会交由 Exchange 进行再分配，Exchange 会根据不同的策略将消息分发到不同的 Queue 中。

RabbitMQ 官网介绍了如下几种消息分发的形式：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZhxpIb3JEX32Izgl9PhQ4C9nwnIBiafAEV78hS6alAqk19l42MNUhvyQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZoOWNTRDmh11aLIR1qyBW6QzM7gXreW743YWegSvq5dpTzLfEiaC6fuQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZHpWWnD4MyU9gYAxnddrtp9iafns6GmViaGPkoJiaxL2RoibMLhxutLTkuQ/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

下面主要介绍前六种策略，第七种是消息确认，参考下面的文章。

- [四种策略确保 RabbitMQ 消息发送可靠性！你用哪种？](https://mp.weixin.qq.com/s?__biz=MzI1NDY0MTkzNQ==&mid=2247494501&idx=1&sn=82de6d7ab3b18c5aa5ed59dcacff540a&scene=21#wechat_redirect)
- [RabbitMQ 高可用之如何确保消息成功消费](https://mp.weixin.qq.com/s?__biz=MzI1NDY0MTkzNQ==&mid=2247494749&idx=1&sn=5a26f75a88fdd95081b2302faa76d62f&scene=21#wechat_redirect)

## 消息收发

### hello-world

我们需要提供一个生产者一个队列以及一个消费者。消息传播图如下：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZsacvtKDqOiclkhfruVxvvNrVLSJGKFtrI4iaic1cjuwY3qx8H6GAlY5ibw/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### 队列的定义：

```java
@Configuration
public class RabbitConfig {

  public static final String QUEUE_NAME = "Odin_queue";

  /**
   * 创建队列
   * @return
   */
  @Bean
  Queue odinQueue() {
    // Param1 : 队列名称
    // Param2 : 持久化
    // Param3 : 排他性 TODO: 有排他性的只能被创建其的 Connection 处理
    // Param4 : 如果该队列没有消费者，那么是否自动删除该队列
    return new Queue(QUEUE_NAME, true, false, false);
  }

}
```

#### 消息消费者的定义：

```java
@Component
public class MsgReceiver {

  /**
   * 通过 @RabbitListener 注解指定该方法监听的消息队列，该注解的参数就是消息队列的名字
   * @param msg
   */
  @RabbitListener(queues = RabbitConfig.QUEUE_NAME)
  public void handleMsg(String msg) {
    System.out.println("msg = " + msg);
  }
}
```

#### 消息发送：

```java
@SpringBootTest
class RabbitmqdemoApplicationTests {

    @Autowired
    RabbitTemplate rabbitTemplate;


    @Test
    void contextLoads() {
        rabbitTemplate.convertAndSend(HelloWorldConfig.HELLO_WORLD_QUEUE_NAME, "hello");
    }

}
```

#### 执行结果如下：

![image-20220731221638815](https://pic.imgdb.cn/item/62e68ec78c61dc3b8e132afc.png)

这个时候使用的其实是默认的直连交换机（DirectExchange），DirectExchange 的路由策略是将消息队列绑定到一个 DirectExchange 上，当一条消息到达 DirectExchange 时会被转发到与该条消息 `routing key` 相同的 Queue 上，例如消息队列名为 “Odin_queue”，则 routingkey 为 “Odin_queue” 的消息会被该消息队列接收。

### Work queues

#### 队列的定义

一个生产者，一个默认的交换机（DirectExchange），一个队列，两个消费者，如下图：

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57ZbWpEb854dXE4vojZoibyJroibIRpAAZahFh9gkTuYZ54VjG1oZ2WFPnA/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

一个队列对应了多个消费者，默认情况下，由队列对消息进行平均分配，消息会被分到不同的消费者手中。消费者可以配置各自的并发能力，进而提高消息的消费能力，也可以配置手动 ack，来决定是否要消费某一条消息。

#### 并发配置

先来看并发能力的配置，如下：

```java
@Component
public class HelloWorldConsumer {
    @RabbitListener(queues = HelloWorldConfig.HELLO_WORLD_QUEUE_NAME)
    public void receive(String msg) {
        System.out.println("receive = " + msg);
    }
    @RabbitListener(queues = HelloWorldConfig.HELLO_WORLD_QUEUE_NAME,concurrency = "10")
    public void receive2(String msg) {
        System.out.println("receive2 = " + msg+"------->"+Thread.currentThread().getName());
    }
```

可以看到，第二个消费者我配置了 concurrency 为 10，此时，对于第二个消费者，将会同时存在 10 个子线程去消费消息。

启动项目，在 RabbitMQ 后台也可以看到一共有 11 个消费者。

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57Zwjo14IbqHMtCmgRv2aJDgr7ZsCY9CNrbFHpg9P8RGjnIqxqymzBlAg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

此时，如果生产者发送 10 条消息，就会一下都被消费掉。

#### 消息发送方式如下：

```java
@SpringBootTest
class RabbitmqdemoApplicationTests {

    @Autowired
    RabbitTemplate rabbitTemplate;


    @Test
    void contextLoads() {
        for (int i = 0; i < 10; i++) {
            rabbitTemplate.convertAndSend(HelloWorldConfig.HELLO_WORLD_QUEUE_NAME, "hello");
        }
    }

}
```

#### 结果如下

![图片](https://mmbiz.qpic.cn/mmbiz_png/GvtDGKK4uYkQuwiab3o4x3ZE1ugPGl57Z9bczupEpmia797XxbhZ0rS0EnAG3fgEfpr7POyDgxfHpmcMQJV2lVrg/640?wx_fmt=png&wxfrom=5&wx_lazy=1&wx_co=1)

#### ack机制

在处理消息的过程中，消费者的服务器在处理消息的时候出现异常，那么可能这条正在处理的消息就没有完成消息消费，数据就会丢失。为了确保数据不会丢失，RabbitMQ支持消息确定-ACK。

当然消息消费者也可以开启手动 ack，这样可以自行决定是否消费 RabbitMQ 发来的消息，SpringBoot中默认开启ack。配置手动 ack 的方式如下：

```properties
spring.rabbitmq.listener.simple.acknowledge-mode=manual
```

消费代码如下：

```java
@Component
public class MsgReceiver {
  @RabbitListener(queues = RabbitConfig.QUEUE_NAME)
  public void handleMsg1(Message msg, Channel channel) throws IOException {
    System.out.println("receive = " + msg.getPayload());
    // 确认消息，告诉mq，这条消息已经消费成功了。
    channel.basicAck(((Long) msg.getHeaders().get(AmqpHeaders.DELIVERY_TAG)),false);
  }

  /**
   * TODO:concurrency 指的是并发数量，将会同时存在 20 个子线程去消费消息。
   * @param msg
   */
  @RabbitListener(queues = RabbitConfig.QUEUE_NAME,concurrency = "20")
  public void handleMsg2(Message msg, Channel channel) throws IOException {
    // 拒绝消费该消息，此条消息将会重新进入队列
    channel.basicReject(((Long) msg.getHeaders().get(AmqpHeaders.DELIVERY_TAG)), true);
  }
}
```

运行结果：

![image-20220801001347063](https://pic.imgdb.cn/item/62e6aa3c8c61dc3b8e2fac7d.png)

此时第二个消费者拒绝了所有消息，第一个消费者消费了所有消息。

这就是 Work queues 这种情况。
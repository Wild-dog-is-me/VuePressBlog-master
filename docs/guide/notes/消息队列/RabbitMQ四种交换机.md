## Publish/Subscribe

发布订阅模式，这种情况是这样：

一个生产者，多个消费者，每一个消费者都有自己的一个队列，生产者没有将消息直接发送到队列，而是发送到了交换机，每个队列绑定交换机，生产者发送的消息经过交换机，到达队列，实现一个消息被多个消费者获取的目的。需要注意的是，如果将消息发送到一个没有队列绑定的 Exchange上面，那么该消息将会丢失，这是因为在 RabbitMQ 中 Exchange 不具备存储消息的能力，只有队列具备存储消息的能力，如下图：

![image-20220801164531877](https://pic.imgdb.cn/item/62e792ac8c61dc3b8ee71481.png)

这种情况下，我们有四种交换机可供选择，分别是：

- Direct
- Fanout
- Topic
- Header

## Direct

DirectExchange 的路由策略是将消息队列绑定到一个 DirectExchange 上，当一条消息到达 DirectExchange 时会被转发到与该条消息 routing key 相同的 Queue 上，例如消息队列名为 “hello-queue”，则 routingkey 为 “hello-queue” 的消息会被该消息队列接收。DirectExchange 的配置如下：

```java
@Configuration
public class RabbitConfig {

  public static final String DIRECT_QUEUE_NAME1 = "direct_queue_name1";
  public static final String DIRECT_QUEUE_NAME2 = "direct_queue_name2";
  public static final String DIRECT_EXCHANGE_NAME = "direct_exchange_name";

  @Bean
  Queue directQueue1() {
    return new Queue(DIRECT_QUEUE_NAME1, true, false, false);
  }

  @Bean
  Queue directQueue2() {
    return new Queue(DIRECT_QUEUE_NAME2, true, false, false);
  }

  /**
   * 定义一个交换机
   * @return
   */
  @Bean
  DirectExchange directExchange() {
    // Param1 : 交换机持久化
    // Param2 : 交换机本身能否持久化
    // Param3 : 如果该队列没有与之绑定的队列，那么是否自动删除该交换机
    return new DirectExchange(DIRECT_EXCHANGE_NAME, true, false);
  }

  /**
   * 这个定义是将交换机和队列绑定起来
   * @return
   */
  @Bean
  Binding directBind1() {
    return BindingBuilder
      // 设置绑定的队列
      .bind(directQueue1())
      // 设置绑定的交换机
      .to(directExchange())
      // 设置 routing_key
      .with(DIRECT_QUEUE_NAME1);
  }

  @Bean
  Binding directBind2() {
    return BindingBuilder
      .bind(directQueue2())
      .to(directExchange())
      .with(DIRECT_QUEUE_NAME2);
  }
}
```

- 首先提供一个消息队列Queue，然后创建一个DirectExchange对象，三个参数分别是名字，重启后是否依然有效以及长期未用时是否删除。
- 创建一个Binding对象将Exchange和Queue绑定在一起。
- DirectExchange和Binding两个Bean的配置可以省略掉，即如果使用DirectExchange，可以只配置一个Queue的实例即可。

### 消费者：

```java
@Component
public class MsgReceiver {

  @RabbitListener(queues = RabbitConfig.DIRECT_QUEUE_NAME1)
  public void msgHandler1(String msg) {
    System.out.println("msg1 : " + msg);
  }

  @RabbitListener(queues = RabbitConfig.DIRECT_QUEUE_NAME2)
  public void msgHandler2(String msg) {
    System.out.println("msg2 : " + msg);
  }
}
```

### 单元测试

两个消费者分别消费两个消息队列中的消息，然后在单元测试中发送消息，如下：

```java
@SpringBootTest
class PublisherApplicationTests {

  @Resource
  private RabbitTemplate rabbitTemplate;

  @Test
  void contextLoads() {
    rabbitTemplate.convertAndSend(RabbitConfig.DIRECT_EXCHANGE_NAME,RabbitConfig.DIRECT_QUEUE_NAME1,"此消息发送给队列1");
    rabbitTemplate.convertAndSend(RabbitConfig.DIRECT_EXCHANGE_NAME,RabbitConfig.DIRECT_QUEUE_NAME2,"此消息发送给队列2");
  }

}
```

### 测试结果

![image-20220801095913121](https://pic.imgdb.cn/item/62e733718c61dc3b8e826975.png)

## Fanout

FanoutExchange 的数据交换策略是把所有到达 FanoutExchange 的消息转发给所有与它绑定的 Queue 上，在这种策略中，routingkey 将不起任何作用，FanoutExchange 配置方式如下：

```java
@Configuration
public class RabbitFanoutConfig {
    public final static String FANOUTNAME = "sang-fanout";
    @Bean
    FanoutExchange fanoutExchange() {
        return new FanoutExchange(FANOUTNAME, true, false);
    }
    @Bean
    Queue queueOne() {
        return new Queue("queue-one");
    }
    @Bean
    Queue queueTwo() {
        return new Queue("queue-two");
    }
    @Bean
    Binding bindingOne() {
        return BindingBuilder.bind(queueOne()).to(fanoutExchange());
    }
    @Bean
    Binding bindingTwo() {
        return BindingBuilder.bind(queueTwo()).to(fanoutExchange());
    }
}
```

在这里首先创建 FanoutExchange，参数含义与创建 DirectExchange 参数含义一致，然后创建两个 Queue，再将这两个 Queue 都绑定到 FanoutExchange 上。接下来创建两个消费者，如下：

```java
@Component
public class FanoutReceiver {
    @RabbitListener(queues = "queue-one")
    public void handler1(String message) {
        System.out.println("FanoutReceiver:handler1:" + message);
    }
    @RabbitListener(queues = "queue-two")
    public void handler2(String message) {
        System.out.println("FanoutReceiver:handler2:" + message);
    }
}
```

两个消费者分别消费两个消息队列中的消息，然后在单元测试中发送消息，如下：

```java
@Test
  void test01() {
    rabbitTemplate.convertAndSend(FanoutConfig.FANOUT_EXCHANGE_NAME,null,"hello fanout");
  }
```



注意这里发送消息时不需要 `routingkey`，指定 `exchange` 即可，`routingkey` 可以直接传一个 `null`。

最终执行日志如下：

![image-20220801113147253](https://pic.imgdb.cn/item/62e749238c61dc3b8e982e56.png)

## Topic

![image-20220801142405102](https://pic.imgdb.cn/item/62e7769f8c61dc3b8ec5b931.png)

一个生产者，一个交换机，两个队列，两个消费者，生产者创建 Topic 的 Exchange 并且绑定到队列中，这次绑定可以通过 `*` 和 `#` 关键字，对指定 `RoutingKey` 内容，编写时注意格式 `xxx.xxx.xxx` 去编写。

### 通配符模式

例如：

topic.#那么这个队列会会接收topic开头的消息

topic.*.queue那么这个队列会接收topic.aaaa.queue这样格式的消息，不接收能topic.aaaa.bbbb.queue这样格式的消息

### 消费者：

```java
@Configuration
public class TopicConfig {

  public static final String XIAOMI_QUEUE_NAME = "xiaomi_queue_name";
  public static final String HUAWEI_QUEUE_NAME = "huawei_queue_name";
  public static final String PHONE_QUEUE_NAME = "phone_queue_name";

  public static final String TOPIC_EXCHANGE_NAME = "topic_queue_name";

  @Bean
  Queue xiaomiQueue() {
    return new Queue(XIAOMI_QUEUE_NAME, true, false, false);
  }

  @Bean
  Queue huaweiQueue() {
    return new Queue(HUAWEI_QUEUE_NAME, true, false, false);
  }

  @Bean
  Queue phoneQueue() {
    return new Queue(PHONE_QUEUE_NAME, true, false, false);
  }

  @Bean
  TopicExchange topicExchange() {
    return new TopicExchange(TOPIC_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding xiaomiBinding() {
    return BindingBuilder
      .bind(xiaomiQueue())
      .to(topicExchange())
      // # 表示通配符，表示将来消息的 routing_key 只要是以 xiaomi 开头，都将被路由到 xiaomiQueue
      .with("xiaomi.#");
  }

  @Bean
  Binding huaweiBinding() {
    return BindingBuilder
      .bind(huaweiQueue())
      .to(topicExchange())
      .with("huawei.#");
  }

  @Bean
  Binding phoneBinding() {
    return BindingBuilder
      .bind(phoneQueue())
      .to(topicExchange())
      // # 表示通配符，表示将来消息的 routing_key 只要是包含phone，都将被路由到 phoneQueue
      .with("#.phone.#");
  }
}
```

### 订阅者：

```java
@Component
public class TopicReceiver {
  @RabbitListener(queues = TopicConfig.HUAWEI_QUEUE_NAME)
  public void msgHandler1(Message msg, Channel channel) throws IOException {
    System.out.println("HUAWEI : " + msg.getPayload());
    channel.basicAck(((Long) msg.getHeaders().get(AmqpHeaders.DELIVERY_TAG)),false);
  }

  @RabbitListener(queues = TopicConfig.XIAOMI_QUEUE_NAME)
  public void msgHandler2(Message msg, Channel channel) throws IOException {
    System.out.println("XIAOMI : " + msg.getPayload() );
    channel.basicAck(((Long) msg.getHeaders().get(AmqpHeaders.DELIVERY_TAG)), false);
  }

  @RabbitListener(queues = TopicConfig.PHONE_QUEUE_NAME)
  public void msgHandler3(Message msg, Channel channel) throws IOException {
    System.out.println("PHONE : " + msg.getPayload() );
    channel.basicAck(((Long) msg.getHeaders().get(AmqpHeaders.DELIVERY_TAG)), false);
  }
}
```

### 消息发布：

```java
  @Test
  void test02() {
    rabbitTemplate.convertAndSend(TopicConfig.TOPIC_EXCHANGE_NAME,"huawei.news","华为新闻");
    rabbitTemplate.convertAndSend(TopicConfig.TOPIC_EXCHANGE_NAME,"xxx.phone.xxx","手机短信");
    rabbitTemplate.convertAndSend(TopicConfig.TOPIC_EXCHANGE_NAME,"xiaomi.news","小米手机");
    rabbitTemplate.convertAndSend(TopicConfig.TOPIC_EXCHANGE_NAME,"xiaomi.phone.news","小米手机&手机短信");
  }
```

测试结果

![image-20220801144517130](https://pic.imgdb.cn/item/62e776618c61dc3b8ec57097.png)

## Header交换机

### 定义队列

```java
@Configuration
public class HeaderConfig {

  public static final String HEADER_QUEUE_NAME_NAME = "header_queue_name_name";
  public static final String HEADER_QUEUE_NAME_AGE = "header_queue_name_age";

  public static final String HEADER_EXCHANGE_NAME = "header_exchange_name";

  @Bean
  Queue headerNameQueue() {
    return new Queue(HEADER_QUEUE_NAME_NAME, true, false, false);
  }

  @Bean
  Queue headerAgeQueue() {
    return new Queue(HEADER_QUEUE_NAME_AGE, true, false, false);
  }

  @Bean
  HeadersExchange headersExchange() {
    return new HeadersExchange(HEADER_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding nameBing() {
    return BindingBuilder.bind(headerNameQueue())
      .to(headersExchange())
      // 如果将来消息头部中包含name属性，就算匹配成功
      .where("name").exists();
  }

  @Bean
  Binding ageBing() {
    return BindingBuilder.bind(headerAgeQueue())
      .to(headersExchange())
      // 如果将来消息头部中包含age属性且值为99，就算匹配成功
      .where("age")
      .matches(99);
  }
}
```

### 消费者

```java
@Component
public class HeaderReceiver {

  @RabbitListener(queues = HeaderConfig.HEADER_QUEUE_NAME_NAME)
  public void nameMsgHandler(byte[] msg) {
    System.out.println("nameMsg >>> "+new String(msg, 0, msg.length));
  }

  @RabbitListener(queues = HeaderConfig.HEADER_QUEUE_NAME_AGE)
  public void ageMsgHandler(byte[] msg) {
    System.out.println("ageMsgHandler >>> " + new String(msg, 0, msg.length));
  }
}
```

### 发布消息

```java
  @Test
  void test03() {
    Message nameMsg = MessageBuilder.withBody("hello zhangsan".getBytes()).setHeader("name", "name").build();
    Message ageMsg = MessageBuilder.withBody("hello lisi".getBytes()).setHeader("age", 99).build();
    rabbitTemplate.send(HeaderConfig.HEADER_EXCHANGE_NAME,null,nameMsg);
    rabbitTemplate.send(HeaderConfig.HEADER_EXCHANGE_NAME,null,ageMsg);
  }
```

代码运行

![image-20220801151603606](https://pic.imgdb.cn/item/62e77db48c61dc3b8ecd3dc8.png)

## 四种交换机总结

### 交换机的作用

之前的例子中，我们是通过队列发送和接收消息的，但是实际上里面还有一个重要的组合交换机，完整消息流程如下：


在RabbitMQ中，生产者不是直接将消息发送给消费者，生成者根本不知道这个消息要传递给哪些队列。实际上，生产者只是将消息发送到交换机。交换机收到消息到，根据交换机的类型和配置来处理消息，有如下几种情况：

将消息传送到特定的队列
有可能发送到多个队列中
也有可能丢弃消息
RabbitMQ各个组件的功能重新归纳一下如下：

生产者：发送消息
交换机：将收到的消息根据路由规则路由到特定队列
队列：用于存储消息
消费者：收到消息并消费

### 交换机的类型：

交换机主要包括如下4种类型：

Direct exchange（直连交换机）
Fanout exchange（扇型交换机）
Topic exchange（主题交换机）
Headers exchange（头交换机）

### 交换机的属性

除交换机类型外，在声明交换机时还可以附带许多其他的属性，其中最重要的几个分别是：

Name：交换机名称
Durability：是否持久化。如果持久性，则RabbitMQ重启后，交换机还存在
Auto-delete：当所有与之绑定的消息队列都完成了对此交换机的使用后，删掉它
Arguments：扩展参数
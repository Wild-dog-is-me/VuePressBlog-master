默认情况下，消息是不会过期的，也就是我们平日里在消息发送时，如果不设置任何消息过期的相关参数，那么消息是不会过期的，即使消息没被消费掉，也会一直存储在队列中。

TTL（Time-To-Live），消息存活的时间，即消息的有效期。如果我们希望消息能够有一个存活时间，那么我们可以通过设置 TTL 来实现这一需求。如果消息的存活时间超过了 TTL 并且还没有被消息，此时消息就会变成`死信`，关于`死信`以及`死信队列`

TTL 的设置有两种不同的方式：

1. 在声明队列的时候，我们可以在队列属性中设置消息的有效期，这样所有进入该队列的消息都会有一个相同的有效期。
2. 在发送消息的时候设置消息的有效期，这样不同的消息就具有不同的有效期。

那如果两个都设置了呢？

**以时间短的为准。**

当我们设置了消息有效期后，消息过期了就会被从队列中删除了（进入到死信队列，后文一样，不再标注），但是两种方式对应的删除时机有一些差异：

1. 对于第一种方式，当消息队列设置过期时间的时候，那么消息过期了就会被删除，因为消息进入 RabbitMQ 后是存在一个消息队列中，队列的头部是最早要过期的消息，所以 RabbitMQ 只需要一个定时任务，从头部开始扫描是否有过期消息，有的话就直接删除。
2. 对于第二种方式，当消息过期后并不会立马被删除，而是当消息要投递给消费者的时候才会去删除，因为第二种方式，每条消息的过期时间都不一样，想要知道哪条消息过期，必须要遍历队列中的所有消息才能实现，当消息比较多时这样就比较耗费性能，因此对于第二种方式，当消息要投递给消费者的时候才去删除。

## 设置单条消息过期时间

配置消息队列、配置交换机以及将两者绑定在一起。

```java
@Configuration
public class RabbitConfig {

  public static final String ODIN_MSG_DELAY_QUEUE_NAME = "odin_msg_delay_queue_name";
  public static final String ODIN_MSG_DELAY_EXCHANGE_NAME = "odin_msg_delay_exchange_name";

  @Bean
  Queue msgDelayQueue() {
    return new Queue(ODIN_MSG_DELAY_QUEUE_NAME, true, false, false);
  }

  @Bean
  DirectExchange msgDelayExchange() {
    return new DirectExchange(ODIN_MSG_DELAY_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding msgDelayQueueBinding() {
    return BindingBuilder.bind(msgDelayQueue())
      .to(msgDelayExchange())
      .with(ODIN_MSG_DELAY_QUEUE_NAME);
  }
  
}

```

接下来提供一个消息发送接口，如下：

```java
@RestController
public class HelloController {

  @Resource
  RabbitTemplate rabbitTemplate;

  @GetMapping("/send")
  public void hello() {
    Message message = MessageBuilder.withBody("hello Odin".getBytes())
      // 设置过期时间为10秒,消息到达mq 10s之内，如果没有人消费，则消息会过期
      .setExpiration("10000")
      .build();
    rabbitTemplate.send(RabbitConfig.ODIN_MSG_DELAY_EXCHANGE_NAME,RabbitConfig.ODIN_MSG_DELAY_QUEUE_NAME,message);
  }

}
```

在创建 Message 对象的时候我们可以设置消息的过期时间，这里设置消息的过期时间为 10 秒。

接下来我们启动项目，进行消息发送测试。当消息发送成功之后，由于没有消费者，所以这条消息并不会被消费。打开 RabbitMQ 管理页面，点击到 Queues 选项卡，10s 之后，我们会发现消息已经不见了：

![image-20220802210748023](https://pic.imgdb.cn/item/62e921a716f2c2beb1343cc4.png)

> 十秒后

![image-20220802210719532](https://pic.imgdb.cn/item/62e9218a16f2c2beb1341abd.png)

## 设置队列消息过期

配置消息队列、配置交换机以及将两者绑定在一起。

```java
@Configuration
public class RabbitConfig {

  public static final String ODIN_QUEUE_DELAY_QUEUE_NAME = "odin_queue_delay_queue_name";
  public static final String ODIN_QUEUE_DELAY_EXCHANGE_NAME = "odin_queue_delay_exchange_name";

  @Bean
  Queue msgDelayQueue() {
    Map<String, Object> args = new HashMap<>();
    // 给消息队列设置过期时间，该队列中的消息，若十秒内无人消费，则过期
    args.put("x-message-ttl", 1000);
    return new Queue(ODIN_QUEUE_DELAY_QUEUE_NAME, true, false, false);
  }

  @Bean
  DirectExchange msgDelayExchange() {
    return new DirectExchange(ODIN_QUEUE_DELAY_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding msgDelayQueueBinding() {
    return BindingBuilder.bind(msgDelayQueue())
      .to(msgDelayExchange())
      .with(ODIN_QUEUE_DELAY_QUEUE_NAME);
  }

}
```

接下来提供一个消息发送接口，如下：

```java
@RestController
public class HelloController {

  @Resource
  RabbitTemplate rabbitTemplate;

  @GetMapping("/send")
  public void hello() {
    rabbitTemplate.convertAndSend(RabbitConfig.ODIN_QUEUE_DELAY_EXCHANGE_NAME,RabbitConfig.ODIN_QUEUE_DELAY_QUEUE_NAME,"hello mq");
  }

}
```

## 特殊情况

将消息的过期时间 TTL 设置为 0，这表示如果消息不能立马消费则会被立即丢掉，这个特性可以部分替代 RabbitMQ3.0 以前支持的 immediate 参数，之所以所部分代替，是因为 immediate 参数在投递失败会有 basic.return 方法将消息体返回（这个功能可以利用死信队列来实现）。

### 死信队列

## 死信交换机

死信交换机，Dead-Letter-Exchange 即 DLX。

死信交换机用来接收死信消息（Dead Message）的，那什么是死信消息呢？一般消息变成死信消息有如下几种情况：

- 消息被拒绝(Basic.Reject/Basic.Nack) ，井且设置requeue 参数为false
- 消息过期
- 队列达到最大长度

当消息在一个队列中变成了死信消息后，此时就会被发送到 DLX，绑定 DLX 的消息队列则称为死信队列。

DLX 本质上也是一个普普通通的交换机，我们可以为任意队列指定 DLX，当该队列中存在死信时，RabbitMQ 就会自动的将这个死信发布到 DLX 上去，进而被路由到另一个绑定了 DLX 的队列上（即死信队列），绑定了死信交换机的队列就是死信队列。

## 实践

首先我们来创建一个死信交换机，接着创建一个死信队列，再将死信交换机和死信队列绑定到一起：

```java
@Configuration
public class RabbitDlxConfig {

  public static final String DLX_EXCHANGE_NAME = "dlx_exchange_name";

  public static final String DLX_QUEUE_NAME = "dlx_queue_name";

  @Bean
  DirectExchange directExchange() {
    return new DirectExchange(DLX_EXCHANGE_NAME, true, false);
  }

  @Bean
  Queue dlxQueue() {
    return new Queue(DLX_QUEUE_NAME, true, false, false);
  }

  @Bean
  Binding dlxBinding() {
    return BindingBuilder.bind(dlxQueue())
      .to(directExchange())
      .with(DLX_QUEUE_NAME);
  }
}
```

这其实跟普通的交换机，普通的消息队列没啥两样。

接下来为消息队列配置死信交换机，如下：

```java
  @Bean
  Queue msgQueue() {
    Map<String, Object> args = new HashMap<>();
    // 设置消息过期时间，一旦过期则进入死信队列中
    args.put("x-message-ttl", 0);
    // 指定死信队列的交换机
    args.put("x-dead-letter-exchange", RabbitDlxConfig.DLX_EXCHANGE_NAME);
    // 指定死信队列判断路由的ke y
    args.put("x-dead-letter-routing-key", RabbitDlxConfig.DLX_QUEUE_NAME);
    return new Queue(MSG_QUEUE_NAME, true, false, false,args);
  }
```

- x-dead-letter-exchange：配置死信交换机。
- x-dead-letter-routing-key：配置死信 `routing_key`。

```java
@RabbitListener(queues = QueueConfig.DLX_QUEUE_NAME)
public void dlxHandle(String msg) {
    System.out.println("dlx msg = " + msg);
}
```



将来发送到这个消息队列上的消息，如果发生了 nack、reject 或者过期等问题，就会被发送到 DLX 上，进而进入到与 DLX 绑定的消息队列上。

死信消息队列的消费和普通消息队列的消费一样。

```java
@RabbitListener(queues = QueueConfig.DLX_QUEUE_NAME)
public void dlxHandle(String msg) {
    System.out.println("dlx msg = " + msg);
}
```



### 延迟队列

整体上来说，在 RabbitMQ 上实现定时任务有两种方式：

- 利用 RabbitMQ 自带的消息过期和私信队列机制，实现定时任务。
- 使用 RabbitMQ 的 rabbitmq_delayed_message_exchange 插件来实现定时任务，这种方案较简单。

## 插件实现

> https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases

首先需要下载 rabbitmq_delayed_message_exchange 插件

```shell
wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases
```

下载完成后在命令行执行如下命令将下载文件拷贝到 Docker 容器中去：

这里第一个参数是宿主机上的文件地址，第二个参数是拷贝到容器的位置。

```shell
docker cp ./rabbitmq_delayed_message_exchange-3.9.0.ez some-rabbit:/plugins
```

接下来再执行如下命令进入到 RabbitMQ 容器中：

```shell
docker exec -it some-rabbit /bin/bash
```

启用成功之后，还可以通过如下命令查看所有安装的插件，看看是否有我们刚刚安装过的插件，如下：

```shell
rabbitmq-plugins list
```

![image-20220803155433190](https://pic.imgdb.cn/item/62ea29bc16f2c2beb119cac8.png)

> 代码

```java
@Configuration
public class RabbitConfig {

  public static final String DELAY_MSG_QUEUE_NAME = "delay_msg_queue_name";
  public static final String DELAY_MSG_EXCHANGE_NAME = "delay_msg_exchange_name";

  @Bean
  Queue delayQueue() {
    return new Queue(DELAY_MSG_QUEUE_NAME, true, false, false);
  }

  // 自定义交换机
  @Bean
  CustomExchange customExchange() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-delayed-type", "direct");
    return new CustomExchange(DELAY_MSG_EXCHANGE_NAME, "x-delayed-message", true, false,args);
  }

  @Bean
  Binding delayBinding() {
    return BindingBuilder.bind(delayQueue())
      .to(customExchange())
      .with(DELAY_MSG_QUEUE_NAME)
      .noargs();
  }
}
```

这里使用的交换机是 CustomExchange，这是一个 Spring 中提供的交换机，创建 CustomExchange 时有五个参数，含义分别如下：

- 交换机名称。
- 交换机类型，这个地方是固定的。
- 交换机是否持久化。
- 如果没有队列绑定到交换机，交换机是否删除。
- 其他参数。

最后一个 args 参数中，指定了交换机消息分发的类型，这个类型就是大家熟知的 direct、fanout、topic 以及 header 几种，用了哪种类型，将来交换机分发消息就按哪种方式来。

```java
@Component
public class MsgReceiver {

  private static final Logger logger = LoggerFactory.getLogger(MsgReceiver.class);

  @RabbitListener(queues = RabbitConfig.DELAY_MSG_QUEUE_NAME)
  public void handleMsg(String msg) {
    logger.info("handleMsg============{}",msg);
  }
}
```

```java
@RestController
public class HelloController {

  @Resource
  private RabbitTemplate rabbitTemplate;

  @GetMapping("/send")
  public void hello() {
    Message message = MessageBuilder.withBody(("hello mq" + new Date()).getBytes())
      // 设置消息发送的延迟时间
      .setHeader("x-delay", 3000).build();
    rabbitTemplate.send(RabbitConfig.DELAY_MSG_EXCHANGE_NAME, RabbitConfig.DELAY_MSG_QUEUE_NAME, message);
  }
}
```

在消息头中设置消息的延迟时间。

![image-20220803160736928](https://pic.imgdb.cn/item/62ea2ccc16f2c2beb11dd6de.png)

从日志中可以看到消息延迟已经实现了。

## DLX实现延迟队列

假如一条消息需要延迟 30 分钟执行，我们就设置这条消息的有效期为 30 分钟，同时为这条消息配置死信交换机和死信 `routing_key`，并且不为这个消息队列设置消费者，那么 30 分钟后，这条消息由于没有被消费者消费而进入死信队列，此时我们有一个消费者就在“蹲点”这个死信队列，消息一进入死信队列，就立马被消费了。

```java
@Configuration
public class RabbitConfig {

  public static final String ODIN_QUEUE_NAME = "odin_queue_name";
  public static final String ODIN_EXCHANGE_NAME = "odin_exchange_name";
  public static final String DELAY_EXCHANGE_NAME = "delay_exchange_name";
  public static final String DELAY_QUEUE_NAME = "delay_queue_name";

  @Bean
  Queue dlxQueue() {
    return new Queue(DELAY_QUEUE_NAME, true, false, false);
  }

  @Bean
  Queue msgQueue() {
    Map<String, Object> args = new HashMap<>();
    args.put("x-message-ttl", 10000);
    args.put("x-deal-exchange", DELAY_EXCHANGE_NAME);
    args.put("x-dead-letter-routing-key", DELAY_QUEUE_NAME);
    return new Queue(ODIN_QUEUE_NAME, true, false, false,args);
  }

  @Bean
  DirectExchange msgExchange() {
    return new DirectExchange(ODIN_EXCHANGE_NAME,true,false);
  }

  @Bean
  DirectExchange directExchange() {
    return new DirectExchange(DELAY_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding msgBinding() {
    return BindingBuilder.bind(msgQueue())
      .to(msgExchange())
      .with(DELAY_QUEUE_NAME);
  }

  @Bean
  Binding dlxBinding() {
    return BindingBuilder.bind(dlxQueue())
      .to(directExchange())
      .with(DELAY_QUEUE_NAME);
  }
}
```

这段配置代码虽然略长，不过原理其实简单。

- 配置可以分为两组，第一组配置死信队列，第二组配置普通队列。每一组都由消息队列、消息交换机以及 Binding 三者组成。
- 配置消息队列时，为消息队列指定死信队列，不熟悉的可以翻一下这篇文章，传送门：[RabbitMQ 中的消息会过期吗？](https://mp.weixin.qq.com/s?__biz=MzI1NDY0MTkzNQ==&mid=2247494827&idx=1&sn=c7e6d24cc9ce7d21f3f450a41b565ddf&scene=21#wechat_redirect)。
- 配置队列中的消息过期时间时，默认的时间单位时毫秒。

接下来我们为死信队列配置一个消费者，如下：

```java
@Component
public class MsgReceiver {
  private static final Logger logger = LoggerFactory.getLogger(MsgReceiver.class);


  @RabbitListener(queues = RabbitConfig.DELAY_QUEUE_NAME)
  public void handleMsg(String msg) {
    logger.info("handleMsg,{}", msg);
  }
}

```

最后我们在单元测试中发送一条消息：

```java
@SpringBootTest
class DelayQueueApplicationTests {

    @Autowired
    RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
        System.out.println(new Date());
        rabbitTemplate.convertAndSend(QueueConfig.JAVABOY_EXCHANGE_NAME, QueueConfig.JAVABOY_ROUTING_KEY, "hello javaboy!");
    }

}
```

10 秒之后这条消息会在死信队列的消费者中被打印出来。

### 
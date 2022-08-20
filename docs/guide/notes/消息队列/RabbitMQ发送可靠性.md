RabbitMQ 中的消息发送引入了 Exchange（交换机）的概念，消息的发送首先到达交换机上，然后再根据既定的路由规则，由交换机将消息路由到不同的 Queue（队列）中，再由不同的消费者去消费。

![image-20220804094525540](https://pic.imgdb.cn/item/62eb24ba16f2c2beb107fc3a.png)



大致的流程就是这样，所以要确保消息发送的可靠性，主要从两方面去确认：

1. 消息成功到达 Exchange
2. 消息成功到达 Queue

如果能确认这两步，那么我们就可以认为消息发送成功了。

如果这两步中任一步骤出现问题，那么消息就没有成功送达，此时我们可能要通过重试等方式去重新发送消息，多次重试之后，如果消息还是不能到达，则可能就需要人工介入了。

经过上面的分析，我们可以确认，要确保消息成功发送，我们只需要做好三件事就可以了：

1. 确认消息到达 Exchange。
2. 确认消息到达 Queue。
3. 开启定时任务，定时投递那些发送失败的消息。

## 开启事务机制

首先提供一个事务管理器

```java
@Bean
RabbitTransactionManager transactionManager(ConnectionFactory connectionFactory) {
  return new RabbitTransactionManager(connectionFactory);
}
```

接下来，在消息生产者上面做两件事：添加事务注解并设置通信信道为事务模式：

```java
/**
 * 1、客户端发送请求，将通信通道设置为事务模式
 * 2、服务端给出答复，同意将通信通道设置为事务模式
 * 3、发送消息
 * 4、提交事务
 * 5、服务端给出答复，确认事务提交
 */
@Service
public class MsgService {

  @Resource
  private RabbitTemplate rabbitTemplate;

  @Transactional
  public void send() {
    rabbitTemplate.convertAndSend(RabbitConfig.ODIN_MSG_EXCHANGE_NAME, RabbitConfig.ODIN_MSG_QUEUE_NAME, "hello mq");
    int i = 1 / 0;
  }
}
```

这里注意两点：

1. 发送消息的方法上添加 `@Transactional` 注解标记事务。
2. 调用 setChannelTransacted 方法设置为 true 开启事务模式。

这就 OK 了。

在上面的案例中，我们在结尾来了个 1/0 ，这在运行时必然抛出异常，我们可以尝试运行该方法，发现消息并未发送成功。



当我们开启事务模式之后，RabbitMQ 生产者发送消息会多出四个步骤：

1. 客户端发出请求，将信道设置为事务模式。
2. 服务端给出回复，同意将信道设置为事务模式。
3. 客户端发送消息。
4. 客户端提交事务。
5. 服务端给出响应，确认事务提交。

上面的步骤，除了第三步是本来就有的，其他几个步骤都是平白无故多出来的。所以大家看到，事务模式其实效率有点低，这并非一个最佳解决方案。我们可以想想，什么项目会用到消息中间件？一般来说都是一些高并发的项目，这个时候并发性能尤为重要。

所以，RabbitMQ 还提供了发送方确认机制（publisher confirm）来确保消息发送成功，这种方式，性能要远远高于事务模式。

## 发送方确认机制

在 application.properties 中配置开启消息发送方确认机制，如下：

```properties
spring.rabbitmq.publisher-confirm-type=correlated
spring.rabbitmq.publisher-returns=true
```

第一行是配置消息到达交换器的确认回调，第二行则是配置消息到达队列的回调。

第一行属性的配置有三个取值：

1. none：表示禁用发布确认模式，默认即此。
2. correlated：表示成功发布消息到交换器后会触发的回调方法。
3. simple：类似 correlated，并且支持 `waitForConfirms()` 和 `waitForConfirmsOrDie()` 方法的调用。

```java
@Configuration
public class RabbitConfig implements RabbitTemplate.ConfirmCallback,RabbitTemplate.ReturnCallback {

  public static final String ODIN_EXCHANGE_NAME = "odin_exchange_name";
  public static final String ODIN_QUEUE_NAME = "odin_queue_name";

  private static final Logger logger = LoggerFactory.getLogger(RabbitConfig.class);

  @Resource
  private RabbitTemplate rabbitTemplate;

  @PostConstruct
  public void initRabbitTemplate() {
    rabbitTemplate.setReturnCallback(this);
    rabbitTemplate.setConfirmCallback(this);
  }

  @Bean
  Queue queue() {
    return new Queue(ODIN_QUEUE_NAME, true, false, false);
  }

  @Bean
  DirectExchange directExchange() {
    return new DirectExchange(ODIN_EXCHANGE_NAME, true, false);
  }

  @Bean
  Binding msgBinding() {
    return BindingBuilder.bind(queue())
      .to(directExchange())
      .with(ODIN_QUEUE_NAME);
  }


  /**
   * 消息成功到达交换机会触发该方法
   */
  @Override
  public void confirm(CorrelationData correlationData, boolean b, String s) {
    if (b) { // 消息成功到达队列
      logger.info("{} 消息成功到达交换机",correlationData.getId());
    }else {
      logger.error("{}:消息发送失败", correlationData.getId());
    }
  }

  /**
   * 消息未成功到达队列，会触发该方法
   */
  @Override
  public void returnedMessage(Message message, int i, String s, String s1, String s2) {
    logger.error(message.toString()+"消息未成功到达队列");
  }
}

```

关于这个配置类：

1. 定义配置类，实现 `RabbitTemplate.ConfirmCallback` 和 `RabbitTemplate.ReturnsCallback` 两个接口，这两个接口，前者的回调用来确定消息到达交换器，后者则会在消息路由到队列失败时被调用。
2. 定义 initRabbitTemplate 方法并添加 @PostConstruct 注解，在该方法中为 rabbitTemplate 分别配置这两个 Callback。

```java
@RestController
public class HelloController {

  @Resource
  RabbitTemplate rabbitTemplate;

  @GetMapping("/send")
  public void hello() {
    rabbitTemplate.convertAndSend(RabbitConfig.ODIN_EXCHANGE_NAME,RabbitConfig.ODIN_QUEUE_NAME,"hello rabbitmq!".getBytes(),new CorrelationData(UUID.randomUUID().toString()));
  }

}
```

接下来我们对消息发送进行测试。

![image-20220804155302319](https://pic.imgdb.cn/item/62eb7ae916f2c2beb171d928.png)

我们尝试将消息发送到一个不存在的交换机中,控制台报错如下

![image-20220804155403125](https://pic.imgdb.cn/item/62eb7b2016f2c2beb1721ff8.png)

接下来我们给定一个真实存在的交换器，但是给一个不存在的队列

![image-20220804155516820](https://pic.imgdb.cn/item/62eb7b6916f2c2beb1728386.png)

![image-20220804155544245](https://pic.imgdb.cn/item/62eb7b8516f2c2beb172abcb.png)

可以看到，消息虽然成功达到交换器了，但是没有成功路由到队列（因为队列不存在）。

## 失败重试

前面所说的事务机制和发送方确认机制，都是发送方确认消息发送成功的办法。如果发送方一开始就连不上 MQ，那么 Spring Boot 中也有相应的重试机制，但是这个重试机制就和 MQ 本身没有关系了，这是利用 Spring 中的 retry 机制来完成的，具体配置如下：

```properties
spring.rabbitmq.template.retry.enabled=true
spring.rabbitmq.template.retry.initial-interval=1000ms
spring.rabbitmq.template.retry.max-attempts=10
spring.rabbitmq.template.retry.max-interval=10000ms
spring.rabbitmq.template.retry.multiplier=2
```

从上往下配置含义依次是：

- 开启重试机制。

- 重试起始间隔时间。

- 最大重试次数。

- 最大重试间隔时间。

- 间隔时间乘数。（这里配置间隔时间乘数为 2，则第一次间隔时间 1 秒，第二次重试间隔时间 2 秒，第三次 4 秒，以此类推）



配置完成后，再次启动 Spring Boot 项目，然后关掉 MQ，此时尝试发送消息，就会发送失败，进而导致自动重试。

## 业务重试

业务重试主要是针对消息没有到达交换器的情况。

如果消息没有成功到达交换器，根据我们第二小节的讲解，此时就会触发消息发送失败回调，在这个回调中，我们就可以做文章了！

整体思路是这样：

1. 首先创建一张表，用来记录发送到中间件上的消息，像下面这样：

![图片](https://pic.imgdb.cn/item/62eb803b16f2c2beb178fca1.png)

每次发送消息的时候，就往数据库中添加一条记录。这里的字段都很好理解：

- status：表示消息的状态，有三个取值，0，1，2 分别表示消息发送中、消息发送成功以及消息发送失败。
- tryTime：表示消息的第一次重试时间（消息发出去之后，在 tryTime 这个时间点还未显示发送成功，此时就可以开始重试了）。
- count：表示消息重试次数。

其他字段都很好理解

1. 在消息发送的时候，我们就往该表中保存一条消息发送记录，并设置状态 status 为 0，tryTime 为 1 分钟之后。
2. 在 confirm 回调方法中，如果收到消息发送成功的回调，就将该条消息的 status 设置为1（在消息发送时为消息设置 msgId，在消息发送成功回调时，通过 msgId 来唯一锁定该条消息）。
3. 另外开启一个定时任务，定时任务每隔 10s 就去数据库中捞一次消息，专门去捞那些 status 为 0 并且已经过了 tryTime 时间记录，把这些消息拎出来后，首先判断其重试次数是否已超过 3 次，如果超过 3 次，则修改该条消息的 status 为 2，表示这条消息发送失败，并且不再重试。对于重试次数没有超过 3 次的记录，则重新去发送消息，并且为其 count 的值+1。

当然这种思路有两个弊端：

1. 去数据库走一遭，可能拖慢 MQ 的 Qos，不过有的时候我们并不需要 MQ 有很高的 Qos，所以这个应用时要看具体情况。
2. 按照上面的思路，可能会出现同一条消息重复发送的情况，不过这都不是事，我们在消息消费时，解决好幂等性问题就行了。

当然，大家也要注意，消息是否要确保 100% 发送成功，也要看具体情况。
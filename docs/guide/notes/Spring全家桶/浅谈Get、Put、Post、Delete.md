### GET

> 1、GET 请求会向数据库发索取数据的请求，从而来获取信息，该请求就像数据库的 select 操作一样，只是用来查询一下数据，不会修改、增加数据，不会影响资源的内容，即该请求不会产生副作用。无论进行多少次操作，结果都是一样的。

### PUT

> 2、PUT 请求是向服务器端发送数据的（与 GET 不同）从而改变信息，该请求就像数据库的 update 操作一样，用来修改数据的内容，但是不会增加数据的种类等，也就是说无论进行多少次 PUT 操作，其结果并没有不同。

### POST

> 3、POST 请求同 PUT 请求类似，都是向服务器端发送数据的，但是该请求会改变数据的种类等资源，就像数据库的 insert 操作一样，会创建新的内容。几乎目前所有的提交操作都是用 POST 请求的。

### DELETE

> 4、DELETE 请求顾名思义，就是用来删除某一个资源的，该请求就像数据库的 delete 操作。

>就像前面所讲的一样，既然 PUT 和 POST 操作都是向服务器端发送数据的，那么两者有什>么区别呢? POST 主要作用在一个集合资源之上的（url），而 PUT 主要作用在一个具体资源之上的（url/xxx），通俗一下讲就是，如 URL 可以在客户端确定，那么可使用 PUT，>否则用 POST。

综上所述，我们可理解为以下：

| 请求   |   路径   | 操作 |
| ------ | :------: | ---- |
| POST   |   /url   | 创建 |
| DELETE | /url/xxx | 删除 |
| PUT    | /url/xxx | 更新 |
| GET    | /url/xxx | 查看 |
总结一下，Get 是向服务器发索取数据的一种请求，而 Post 是向服务器提交数据的一种请求，在 FORM（表单）中，Method默认为 “GET”，实质上，GET 和 POST 只是发送机制不同，并不是一个取一个发。
# ot.js + codemirror5 example

# overview

- TODO
  - 第一次同步选区光标时，第一个光标会出现持续不消失的问题

- 👀 注意
  - 服务端需要执行ot，客户端(在未收到ack却收到新op时)也需要执行ot
  - 服务端按op接收顺序串行处理，第一op立即ack，后面的op会让对应客户端处于awaitingConfirm状态，此时后面对应的客户端可能先收到第一个op而需要在本地ot转换，后面的op发送时就已经转换过了
  - 注意理解，服务端返回的第一op在其他客户端需要ot转换，服务端返回的后面的ot在客户端同步状态下可在客户端直接执行而无需转换
  - 优点是，客户端的op一般只需发送一次，且对操作能保存意图
# usage

```shell
npm run demo
npm run server
```

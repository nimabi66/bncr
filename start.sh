#!/bin/bash

# 启动 Node.js 脚本
node /bncr/start.js &
NODE_PID=$!

# 等待 10 秒后发送 SIGTERM 信号
sleep 70
kill -SIGTERM $NODE_PID

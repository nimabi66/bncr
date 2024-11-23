#!/bin/bash

# 启动 bncr 并保持前台运行，使用 `expect` 模拟输入
expect <<EOF
spawn bncr
expect "自定义鉴权url:"          # 等待 bncr 提示输入 URL
send "http://bncr.888862.xyz\r" # 输入自定义鉴权 URL 并回车
interact                        # 保持交互模式
EOF

#!/bin/bash
# 启动 bncr 程序
bncr &

# 等待程序启动（根据应用实际需要调整等待时间）
sleep 60

# 自动输入鉴权 URL（模拟用户输入）
echo "http://example.com/auth" | bncr

sleep 5

echo "5334601664:6e7588a501b6add4fc3a3e612a64d1ce9886864b" | bncr


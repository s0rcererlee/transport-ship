# 运输船：原站一致复刻

来源：https://claude-opus-5-5-cf-transport-ship.pages.dev/
源码：https://github.com/riba2534/claude-opus-5-5-demo/tree/main/cf-transport-ship
源码提交：54adc1fb64155f9dd7c1c90ecae7b8185ac540b8

未修改游戏源码、地图、界面、作者链接、音效或规则。仅将 package-lock.json 的包下载地址改为公共 npm registry。

## 构建

npm ci --ignore-scripts
npm run build
python3 -m http.server 8772 --bind 127.0.0.1 --directory dist

2026-09-26 构建的 dist/index.html 与原站下载 HTML 逐字节一致。
SHA256：f4f05b85295b85e0aa244bf314a667b3b396d7eda10715332c42f62e50c165ec

## 部署

bms-910 独立目录 /usr/share/nginx/html/transport-ship
独立 Nginx 配置 /etc/nginx/conf.d/transport-20939.conf
独立端口 20939，firewalld public 区域已添加运行时和永久 TCP 放行。
nginx -t 通过，服务器本地 HTTP 内容与构建一致。
公网 139.210.101.45:20939 直连超时，仍需核实上游端口映射/网络 ACL；不要当作已可公网访问。
没有修改鹈鹕游戏目录或 20933 配置。

临时试玩：https://mother-deputy-constant-keen.trycloudflare.com/
由本机 8772 服务和 Cloudflare Quick Tunnel 提供；依赖电脑在线，非长期域名。
临时域名返回 HTML 与本地构建一致。

## 已验证

- 桌面浏览器启动进入 6v6，共 12 名角色；机器人战斗和比分推进。
- AK-47 开火弹匣 30→29；换弹状态启动，完成后回到 30。
- 跳跃垂直速度为正，角色高度增加。
- 桌面和强制触屏模式无浏览器运行错误。
- 手机尺寸模拟发现菜单横向裁切；不是实机性能测试。
- 强制触屏模式重现 touchcancel 后 fire 仍为 true；测试后已复位。

详细建议见 OPTIMIZATION.md。为保持原站一致，本版尚未应用这些修改。

## 2026-09-26 手机优化版 mobile-2

已实施菜单自适应、Pointer Events 多指输入、取消/失焦/暂停输入复位、四武器直达、横竖屏安全区域布局、手机暂停入口、持续帧压力动态分辨率。原地图、武器伤害、AI 规则保留。

测试：node tests/mobile.mjs（Chrome 手机模拟，CDP 多点触控）。覆盖菜单宽度、双指开火独立释放、touchCancel、刀/手雷、摇杆取消、暂停复位、横屏边界和动态分辨率降级/恢复。尚未完成真实手机性能测量。

服务器 HTTPS：https://christina-textiles-story-jerry.trycloudflare.com/?v=mobile-2
systemd 服务：transport-tunnel.service，开机启动/失败重启，源站为服务器 127.0.0.1:20939。
隧道在服务器运行，不依赖本机；Quick Tunnel 重启后域名可能改变，不是固定域名。
20939 公网 IP 直连仍超时；抓包期间无连接被捕获，待云平台/路由端口映射确认。
回滚文件：/usr/share/nginx/html/transport-ship/index.before-mobile.html

## mouse-3

修复触屏模式忽略鼠标开火；鼠标与触控按 pointerType 分离。Pointer Lock 失败时启用画面内鼠标转向回退，普通浏览器保留锁定鼠标的无限转向。移除菜单和局内 GitHub/X 入口。
测试：node tests/mouse.mjs，覆盖桌面、强制触屏、模拟拒绝 Pointer Lock 的鼠标转向/开火/释放；手机回归亦通过。
线上版本参数：?v=mouse-3。

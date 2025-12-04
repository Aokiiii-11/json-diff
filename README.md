# JSON文件对比工具

一个功能强大的在线JSON文件差异对比工具，支持并排对比和内联对比两种模式，并提供差异导航功能。

## 功能特性

- 📁 支持本地JSON文件上传对比
- 📊 并排对比和内联对比两种视图模式
- 🎯 智能差异高亮显示（新增、删除、修改）
- 🧭 差异导航快速定位到每个差异点
- 🔍 支持"仅显示差异"模式
- 📱 响应式设计，支持各种设备

## 项目结构

```
json-diff-plugin/
├── index.html      # 主页面
├── styles.css      # 样式文件
├── app.js          # 核心功能实现
├── test1.json      # 测试文件1
├── test2.json      # 测试文件2
└── README.md       # 本说明文档
```

## 部署方法

### 方法一：静态文件部署（推荐）

本项目是一个纯静态网站，可以部署到任何支持静态文件的Web服务器。

1. **准备文件**
   - 将所有项目文件复制到您的Web服务器目录中

2. **常见部署选项**：
   
   - **Nginx/Apache**：将文件放入网站根目录或子目录
     ```bash
     # Nginx配置示例（nginx.conf）
     server {
         listen 80;
         server_name json-diff.yourdomain.com;
         root /path/to/json-diff-plugin;
         index index.html;
     }
     ```
   
   - **GitHub Pages**：
     - 创建GitHub仓库
     - 上传所有文件
     - 在仓库设置中启用GitHub Pages
   
   - **Netlify/Vercel**：
     - 连接GitHub仓库
     - 无需额外配置，自动部署

3. **本地测试**（部署前）
   ```bash
   cd json-diff-plugin
   python3 -m http.server 8000
   # 然后访问 http://localhost:8000
   ```

### 方法二：容器部署

使用Docker容器部署（可选）：

```bash
docker run -d -p 8080:80 -v /path/to/json-diff-plugin:/usr/share/nginx/html nginx
```

## 使用指南

1. **上传文件**：点击"选择文件A"和"选择文件B"按钮上传两个JSON文件
2. **开始对比**：点击"开始对比"按钮
3. **切换视图**：在"并排对比"和"内联对比"之间切换
4. **差异导航**：使用左侧差异导航栏快速跳转到各个差异点
5. **高级功能**：
   - 点击"仅显示差异"可只查看有变化的部分
   - 使用"展开全部"和"折叠全部"控制JSON树的显示

## 技术栈

- HTML5
- CSS3
- JavaScript (纯原生，无依赖)

## 浏览器兼容性

- Chrome: 最新2个版本
- Firefox: 最新2个版本
- Safari: 最新2个版本
- Edge: 最新2个版本

## 许可证

MIT License

## 贡献指南

欢迎提交Issue和Pull Request！

## 联系方式

如有问题或建议，请通过项目Issue与我们联系。
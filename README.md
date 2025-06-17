# website-mirror

非常简单的整站镜像工具。

支持以下特性：

-   `a` `img` `script` `audio` `video` `iframe` `link` 等大多数常见 DOM 的链接识别
-   自动为目录链接添加索引页（如 `index.html`），确保本地浏览时目录可直接访问
-   自动将 PHP 链接（如以 `.php` 结尾的 URL）转换为对应的 HTML 文件，便于本地浏览
-   断点续传
-   支持将不同的 url 参数单独保存为一个页面

# 怎么用？

重命名 `config.example.js` 为 `config.js`，并修改里面的配置以符合你的要求。

然后执行 `node index.js`

结果会输出到 `dist` 目录，源文件会保存到 `dist/_raw` 目录。

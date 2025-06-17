import { URL } from "url";

export default {
	scanLinks(html, pageUrl) {
		const links = [];
		const regexps = [
			/<a\s+[^>]*href=(["'])(.*?)\1/gi,
			/<img\s+[^>]*src=(["'])(.*?)\1/gi,
			/<link\s+[^>]*href=(["'])(.*?)\1/gi,
			/<script\s+[^>]*src=(["'])(.*?)\1/gi,
			/<source\s+[^>]*src=(["'])(.*?)\1/gi,
			/<video\s+[^>]*src=(["'])(.*?)\1/gi,
			/<audio\s+[^>]*src=(["'])(.*?)\1/gi,
			/<iframe\s+[^>]*src=(["'])(.*?)\1/gi,
			/<embed\s+[^>]*src=(["'])(.*?)\1/gi,
			/<object\s+[^>]*data=(["'])(.*?)\1/gi,
			// 额外处理img标签的onMouseOver/onMouseOut等事件属性里的资源
			/on(mouseover|mouseout)\s*=\s*["'][^"']*src\s*=\s*(['"])(.*?)\1/gi,
		];

		if (/\.css(\?|$)/i.test(pageUrl)) {
			regexps.push(/url\(\s*['"]?([^'")]+)['"]?\s*\)/gi);
		}

		const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, ""); // 移除HTML注释

		const matches = [];
		for (const re of regexps) {
			let match;
			while ((match = re.exec(cleanHtml)) !== null) {
				const m = match[2] || match[1];

				if (/^(https?:\/\/|javascript:)/i.test(m)) {
					continue;
				}

				matches.push([
					match[0], // 完整匹配的字符串
					m,
				]);
				links.push(m);
			}
		}
		for (let i = links.length - 1; i >= 0; i--) {}
		// 解析相对路径为绝对路径
		for (let i = 0; i < links.length; i++) {
			try {
				links[i] = new URL(links[i], pageUrl).href;
			} catch (e) {
				// 如果不是有效的URL，保留原值
			}
		}

		const localLinks = links.map((link) => this.urlToFileName(link, pageUrl));

		let replacedHtml = html;
		for (const [original, link] of matches) {
			let replaceTo = "/" + this.urlToFileName(link, pageUrl);
			if (link.includes("#")) {
				replaceTo += link.slice(link.indexOf("#"));
			}

			replacedHtml = replacedHtml.replace(original, original.replace(link, replaceTo));
		}

		return {
			links: Array.from(new Set(localLinks)),
			actualLinks: Array.from(new Set(links)),
			html: replacedHtml,
		};
	},

	urlToFileName(url, baseUrl) {
		const { pathname, search } = new URL(url, baseUrl);
		let filePath = decodeURIComponent(pathname);

		// 如果是目录，或没有扩展名，或扩展名为.php，则转为.html或/index.html
		if (filePath.endsWith("/") || !/[^/]+\.[a-zA-Z0-9]+$/.test(filePath) || filePath.endsWith(".php")) {
			if (filePath.endsWith(".php")) {
				filePath = filePath.replace(/\.php$/, ".html");
			} else if (filePath.endsWith("/")) {
				filePath += "index.html";
			} else {
				filePath += ".html";
			}
		}

		// 如果有查询参数，附加到文件名
		if (search) {
			const safeSearch = search.replace(/[\/:?&=\\#]+/g, "_");
			const extIndex = filePath.lastIndexOf(".");
			filePath = filePath.slice(0, extIndex) + safeSearch + filePath.slice(extIndex);
		}

		// 移除开头的斜杠
		if (filePath.startsWith("/")) {
			filePath = filePath.slice(1);
		}

		return filePath;
	},
};

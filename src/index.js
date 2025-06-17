import axios from "axios";
import config from "../config.js";
import helper from "./helper.js";
import fsExtra from "fs-extra";
import path from "path";

const pool = [];
const saved = new Set();

export default {
	async run() {
		console.log("Website:", config.website);
		await this.getPage(config.website);

		for (let i = 0; i < pool.length; i++) {
			const link = pool[i];
			await this.getPage(link);
		}

		// pool.push(...links);

		// console.log(pool);
		// console.log(
		// 	Object.fromEntries(
		// 		pool.map((link) => {
		// 			const fileName = helper.urlToFileName(link, config.website);
		// 			return [fileName, link];
		// 		})
		// 	)
		// );
	},
	async getPage(url) {
		if (saved.has(url)) {
			// console.log(`Already saved: ${url}`);
			return;
		}
		saved.add(url);

		if (config.ignoreExit.some((ext) => url.endsWith(ext))) {
			console.log(`Ignore       : ${url}`);
			return;
		}

		const file = helper.urlToFileName(url, config.website);
		const output = `./dist/${file}`;
		const outputRaw = `./dist/_raw/${file}`;

		let res;
		try {
			if (await fsExtra.exists(outputRaw)) {
				res = {
					data: await fsExtra.readFile(outputRaw),
					headers: {
						"content-type":
							{
								".html": "text/html",
								".css": "text/css",
							}[path.extname(file)] || "application/octet-stream",
					},
				};
			} else {
				console.log(`Fetching page: ${url}`);
				res = await axios({
					url,
					responseType: "arraybuffer",
					...config.axiosOptions,
				});
				fsExtra.outputFile(outputRaw, res.data);
			}
		} catch (error) {
			console.error(`Error        : ${url} `, error.message);
			return;
		}

		if (
			!res.headers["content-type"] ||
			!(res.headers["content-type"].includes("text/html") || res.headers["content-type"].includes("text/css"))
		) {
			await fsExtra.outputFile(output, res.data);
			return;
		}

		const scanResult = helper.scanLinks(res.data.toString(), url);
		await fsExtra.outputFile(output, new Buffer.from(scanResult.html, "utf-8"));
		pool.push(...scanResult.actualLinks);
	},
};

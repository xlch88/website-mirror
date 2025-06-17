export default {
	website: "http://www.example.com/",
	axiosOptions: {
		headers: {
			"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			"Accept-Language": "en-US,en;q=0.5",
			"Accept-Encoding": "gzip, deflate, br",
		},
		proxy: {
			protocol: "http",
			host: "127.0.0.1",
			port: 6565,
		},
		auth: {
			username: "xxxxxxxx",
			password: "hhhhhhhh",
		},
	},
	ignoreExit: [".zip"],
};

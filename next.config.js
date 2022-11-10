/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		appDir: true,
	},
	reactStrictMode: true,
	swcMinify: true,
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "witxacybuzwpgrvfoxmg.supabase.co",
				port: "",
				pathname: "/storage/v1/object/public/**",
			},
		],
	},
}

module.exports = nextConfig

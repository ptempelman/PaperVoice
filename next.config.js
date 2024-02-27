/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
        // Add a new rule to handle .node files
        config.module.rules.push({
            test: /\.node$/,
            use: 'null-loader',
        });

        return config;
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    swcMinify: true,
};


export default config;

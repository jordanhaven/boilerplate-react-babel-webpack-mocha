'use strict';

const webpack = require('webpack');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [
	new webpack.PrefetchPlugin('react'),
	new webpack.PrefetchPlugin('react-dom'),
	new webpack.optimize.DedupePlugin(),
	new webpack.optimize.OccurenceOrderPlugin(),
	new ExtractTextPlugin('styles.css', {
		allChunks: true,
	}),
	new CopyWebpackPlugin([
		{ from: './app/static/', to: 'app/static/' },
	]),
	new HtmlWebpackPlugin({
		title: 'TITLE',
		template: 'templates/index.html',
		hash: true,
	}),
];


function extractBundle(options) {
	const entry = {};
	entry[options.name] = options.entries;
	return {
		// Define an entry point needed for splitting.
		entry,
	};
}

const output = {
	filename: '[name].js',
	chunkFilename: '[id].chunk.js',
	path: 'public',
	publicPath: '/',
};

if (process.env.NODE_ENV === 'production') {
	// production builds use a root relative asset root, which we end up having to append in the TextureManager and SoundService
	// to account for the 3 different ways assets are required (dev, server, native)
	plugins.push(new webpack.DefinePlugin({
		'process.env.NODE_ENV': '"production"',
		'process.env.ASSET_ROOT': '"/"',
	}));
	plugins.push(new webpack.optimize.UglifyJsPlugin({
		compress: true,
		screw_ie8: true,
	}));
	output.publicPath = '';
}

const common = {
	entry: {
		main: './app/client.jsx',
	},
	output,
	devServer: {
		contentBase: './',
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: '/node_modules/',
				query: {
					presets: ['es2015', 'react'],
				},
			},
			{
				test: /\.scss$/,
				loader: ExtractTextPlugin.extract(['sass']),
			},
			{
				test: /\.html$/,
				loader: 'mustache?minify',
			},
		],
	},
	plugins,
};

// extract most of our libraries into a vendor chunk that wont change much
const config = merge(
	{},
	common,
	extractBundle({
		name: 'vendor',
		entries: [
			'react',
			'react-dom',
		],
	})
);

module.exports = validate(config);
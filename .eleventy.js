const htmlmin = require('html-minifier');
const dateFns = require('date-fns');
const lazyImagesPlugin = require('eleventy-plugin-lazyimages');
const syntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function (eleventyConfig) {
  // Pass through revealjs
  // See https://github.com/11ty/eleventy/issues/768#issue-522432961
  eleventyConfig.addPassthroughCopy({ 'node_modules/reveal.js': 'assets/js/reveal.js' });

  // https://www.jeffchiou.com/blog/building-a-site-with-eleventy/
  const markdownIt = require('markdown-it');
  const markdownLibrary = markdownIt({
    html: true,
    breaks: true,
    linkify: true,
    typographer: true,
  });
  markdownLibrary.use(require('@iktakahiro/markdown-it-katex'));
  eleventyConfig.setLibrary('md', markdownLibrary);

  // Slides need raw markdown to be processed by reveal
  // https://github.com/11ty/eleventy/issues/1206#issuecomment-718226128
  eleventyConfig.addCollection('slides', (collection) => {
    return (
      collection
        .getAll()
        // append the raw content
        .map((item) => {
          item.data.rawMarkdown = item.template.frontMatter.content || '';
          return item;
        })
    );
  });

  eleventyConfig.addPlugin(syntaxHighlight);

  eleventyConfig.addPlugin(lazyImagesPlugin, {
    transformImgPath: (imgPath) => {
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        // Handle remote file
        return imgPath;
      } else {
        return `./src/${imgPath}`;
      }
    },
  });

  eleventyConfig.setEjsOptions({
    rmWhitespace: true,
    context: {
      dateFns,
    },
  });

  eleventyConfig.setBrowserSyncConfig({
    files: './_site/assets/styles/main.css',
  });

  eleventyConfig.addTransform('htmlmin', (content, outputPath) => {
    if (outputPath.endsWith('.html')) {
      const minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
        minifyJS: true,
      });
      return minified;
    }

    return content;
  });

  return {
    dir: { input: 'src', output: '_site', data: '_data' },
  };
};

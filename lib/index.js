const program = require('commander');
const chalk = require('chalk');

const prompt = require('./prompt');
const utils = require('./utils');
const packageJson = require('../package.json');

const { getJSONData } = utils;

program
  .description(`${packageJson.description}
     site: ${chalk.green('https://front-end-rss.now.sh/')}
   github: ${chalk.green(packageJson.homepage)}
  version: ${packageJson.version}
  `)
  .option('-o, --origin [value]', '文章来源')
  .option('-c, --category [value]', '文章分类')
  .option('-l, --link [value]', '显示链接地址')
  .option('-s, --size [value]', '显示多少行', 10)
  .parse(process.argv);
  
async function run(jsonData){
  let all = jsonData.all;
  
  if(program.origin){
    const origin = await prompt.getOrigin(jsonData);

    all = all.filter((item) => item.rssTitle === origin);
  }

  if(program.category){
    const category = await prompt.getCategory(jsonData);
    const tag = jsonData.tags.find((item) => item.tag === category);

    all = all.filter((item) => (new RegExp(tag.keywords, 'gi')).test(item.title));
  }

  await prompt.showList(all, program.link, program.size);
}

// init
getJSONData(async (jsonData) => {
  if(jsonData && jsonData.updateTime){
    await run(jsonData);
  }
});
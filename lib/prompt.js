const fs = require('fs-extra');
const inquirer = require('inquirer');
const fuzzy = require('fuzzy');
const chalk = require('chalk');
const open = require('open');
const cliui = require('cliui');

inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'));

async function getOrigin(jsonData){
  const prompts = [
    {
      type: 'autocomplete',
      name: 'value',
      message: '请选择文章来源：',
      source: function(answers, input){
        return useFuzzy(input, jsonData.rss.map((item) => ({
          name: item.title,
        })));
      }
    }
  ];
  const res = await inquirer.prompt(prompts);

  return res.value;
}

async function getCategory(jsonData){
  const prompts = [
    {
      type: 'autocomplete',
      name: 'value',
      message: '请选择文章分类：',
      source: function(answers, input){
        return useFuzzy(input, jsonData.tags.map((item) => ({
          name: item.tag,
        })));
      }
    }
  ];
  const res = await inquirer.prompt(prompts);

  return res.value;
}

async function showList(list, showLink){
  let filterList = [];
  const prompts = [
    {
      type: 'autocomplete',
      name: 'value',
      message: chalk.green('请选择文章（或者输入关键字搜索）\n'),
      pageSize: 10,
      source: function(answers, input){
        input = input || '';

        const reg = new RegExp('(' + input + ')', 'gi');
        filterList = list
        .filter((item) => input ? reg.test(item.title + item.date + item.rssTitle) : true);
        const results = filterList.map((item, idx) => {
          let { title, date, rssTitle} = item;

          if(input){
            if(reg.test(title)) title = title.replace(reg, replacer);
            if(reg.test(date)) date = date.replace(reg, replacer);
            if(reg.test(rssTitle)) rssTitle = rssTitle.replace(reg, replacer);
          }

          const ui = cliui();
          const link = showLink ? ('\n' + chalk.grey(item.link)) : ''

          ui.div(
            {
              text: idx+1,
              width: 6,
            },
            {
              text: title + link,
              width: 70,
              padding: [0, 2, 0, 2]
            },
            {
              text: date,
              width: 12,
            },
            {
              text: rssTitle,
              width: 26,
            }
          );

          return {
            name: ui.toString(),
          }
        });

        return Promise.resolve(results);
      }
    },
    {
      type: 'confirm',
      name: 'openPage',
      message: '打开浏览器查看文章?',
    },
  ];
  const res = await inquirer.prompt(prompts);
  const index = parseInt(res.value.match(/^(\d)+/)[0], 10) - 1;
  const selected = filterList[index];

  if(res.openPage){
    await open(selected.link);
  }else{
    console.log('选中的文章：');
    console.log(chalk.green(selected.title + '（' + selected.link + '）'));
  }
}

function replacer($0, $1){
  return chalk.red($1);
};

function useFuzzy(input, data){
  input = input || '';

  return new Promise(function(resolve) {
    const results = fuzzy.filter(input, data.map(el => el.name));

    resolve(
      results.map(function(el) {
        return el.original
      })
    );
  });
}

module.exports = {
  getOrigin,
  getCategory,
  showList,
}
const path = require('path');
const zlib = require('zlib');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs-extra');
const download = require('download');

const fileRoot = path.join(__dirname, '../.data/');
const filePath = path.join(fileRoot, 'data.json');

function getByLocal(){
  try{
    let data = fs.readJSONSync(filePath);

    data.all = getAllData(data);

    return data;
  }catch(e){
    
  }
}

function getAllData(data){
  let all = [];
  
  data.links.forEach((item) => {
    const items = item.items.map((ite) => {
      ite.rssTitle = item.title;
      return ite;
    });
  
    all = all.concat(items);
  });

  all = all.sort((a, b) => {
    return a.date < b.date ? 1 : -1
  });
  
  return all
}

async function getJSONData(onFinish){
  const spinner = ora(`加载${ chalk.green('最新前端技术') }文章`).start();

  try{
    await download('https://front-end-rss.now.sh/data.json.br', fileRoot);

    await unCompress('br');

    spinner.stop();

    onFinish(getByLocal());
  }catch(e){
    const exist = fs.pathExistsSync(filePath);

    if(exist){
      spinner.warn(chalk.yellow('文章加载失败，使用本地缓存'));
      onFinish(getByLocal());
    }else{
      spinner.fail(chalk.red('文章加载失败'));
      onFinish();
    }
  }
}

function unCompress(ext){
  const dest = ext === 'gz' ? zlib.createGunzip() : zlib.createBrotliDecompress();
  const rs = fs.createReadStream(`${filePath}.${ext}`);
  const ws = fs.createWriteStream(filePath);

  return new Promise((resolve) => {
    ws.on('close', resolve);
    rs.pipe(dest).pipe(ws);
  });
}

module.exports = {
  getJSONData,
}
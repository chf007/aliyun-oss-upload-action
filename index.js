const os = require('os');
const fs = require('fs');
const path = require('path');
const dir = require('node-dir');
const OSS = require('ali-oss');
const core = require('@actions/core');
const github = require('@actions/github');


const accessKeyId = process.env.OSS_ACCESS_KEY_ID;
const accessKeySecret = process.env.OSS_ACCESS_KEY_SECRET;

const sourceDir = core.getInput('source-dir');
const destDir = core.getInput('dest-dir');
//const excludePattern = core.getInput('exclude-pattern');
const bucket = core.getInput('bucket');
const region = core.getInput('region');
const endpoint = core.getInput('endpoint');

if (os.type() === 'Windows_NT') {
  core.setFailed('暂不支持在 Windows 环境中执行 ❌');
  process.exit(1);
}

if (!accessKeyId) {
  core.setFailed('必须设置环境变量 OSS_ACCESS_KEY_ID ❌');
}

if (!accessKeySecret) {
  core.setFailed('必须设置环境变量 OSS_ACCESS_KEY_SECRET ❌');
}

if (!sourceDir) {
  core.setFailed('请配置 source-dir ❌');
}

if (!destDir) {
  core.setFailed('请配置 dest-dir ❌');
}

if (!bucket) {
  core.setFailed('请配置 bucket ❌');
}

if (!region) {
  core.setFailed('请配置 region ❌');
}

const ossOpt = {
  region,
  accessKeyId,
  accessKeySecret,
  bucket,
};

if (endpoint) {
  ossOpt.endpoint = endpoint;
}

const client = new OSS(ossOpt);

console.log(`==========> 当前 OSS Bucket: ${bucket}`);
console.log(`==========> 当前 OSS Region: ${region}`);
if (endpoint) {
  console.log(`==========> 当前 OSS Endpoint: ${endpoint}`);
}

const fileRelativePathRegExpPattern = `${sourceDir}/(.*)$`;

uploadToOss();

function uploadToOss() {

  dir.files(path.join(process.cwd(), sourceDir), (err, files) => {
    if (err) {
      if (err.code === 'ENOENT') {
        core.setFailed(`${sourceDir} 目录不存在`);
      } else {
        core.setFailed(`dir.files error: ${err}`);
      }
    }

    console.log(`==========> 开始上传文件到 OSS，共 ${files.length} 个文件`);

    const failFiles = [];

    Promise.all(
      files.map((filePath) => {
        return new Promise((resolve, reject) => {

          const uploadFileRelativePath = filePath.match(new RegExp(fileRelativePathRegExpPattern))[1];

          const key = `${destDir}/${uploadFileRelativePath}`;

          console.log(`开始上传：${filePath} --------> ${key}`);

          client.put(key, filePath).then(data => {
            console.log(`==========> ${key} 上传成功~ 🎉`);
            resolve(data);
          }).catch(error => {
            console.log(`${key} 上传失败！❌ error: ${error}`);
            failFiles.push({
              key,
              filePath,
            });
            resolve({});
          });
        });
      }),
    ).then((result) => {
      if (!failFiles.length) {
        console.log(`----------> 全部上传成功~ 🎉🎉🎉🎉🎉`);
      } else {
        console.log(`----------> 部分上传成功~ ⚠️⚠️⚠️⚠️⚠️，失败 ${failFiles.length} 个`);

        for (const item of failFiles) {
          console.log(`开始重新上传：${item.filePath} --------> ${item.key}`);

          client.put(item.key, item.filePath).then(data => {
            console.log(`==========> ${item.key} 上传成功~ 🎉`);
          }).catch(error2 => {
            core.setFailed(`${item.key} 重新上传失败！❌ error: ${error2}`);
          });
        }

      }
    });
  });
}

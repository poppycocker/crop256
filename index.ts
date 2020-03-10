import path from 'path'
import { promises as fsp, Dirent } from 'fs'
import sharp from 'sharp'
// import crop from 'smartcrop-sharp'
const cropper = require('smartcrop-sharp')

const L256 = 256

async function cropIn256(srcFilePath: string, dstDirPath: string) {
  const result = await cropper.crop(srcFilePath, { width: L256, height: L256 })
  const crop = result.topCrop
  await sharp(srcFilePath)
    .extract({
      width: crop.width,
      height: crop.height,
      left: crop.x,
      top: crop.y
    })
    .resize(L256, L256)
    .toFile(path.join(dstDirPath, path.basename(srcFilePath)))
}

async function run() {
  const cwd = process.cwd()
  const src = process.argv[2]
  const dst = process.argv[3]
  if (!src || !dst) {
    throw 'src-dir and dst-dir required!'
  }

  const srcDirents = await fsp.readdir(path.join(cwd, src), {
    withFileTypes: true
  })
  const srcPaths = srcDirents
    .filter(dirent => dirent.isFile)
    .map(dirent => path.join(cwd, src, dirent.name))

  const dstDir = path.join(cwd, dst)
  await fsp.mkdir(dstDir, { recursive: true })

  const promises = srcPaths.map(srcPath => cropIn256(srcPath, dstDir))
  await Promise.all(promises)
}

run()
  .then(() => console.log('done.'))
  .catch(e => console.error(e))

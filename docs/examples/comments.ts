import { readdir, readFile, writeFile } from "fs/promises";

Promise
  .resolve()
  .then(async () => {
    const dirIn = './elements'
    const dirOut = './elements-comments'
    const files = await readdir(dirIn)
    
    await Promise.all(files.map(async (file) => {
      writeFile(`${dirOut}/${file}`, (await readFile(`${dirIn}/${file}`))
        .toString()
        .trim()
        .split('\n')
        .map((line) => {
          return ` * ${line}`
        })
        .join('\n')
      )
    }))
  })

import { createHash } from "crypto"
import { readFile, readdir, writeFile, unlink } from "fs/promises"
import { join } from "path"


async function hashFile(songDir: string): Promise<string> {
  const hashedFilePath = join(songDir, "/", "hashed")
  try {
    return await readFile(hashedFilePath, "utf8")
  } catch (e) {}
  let infoDatBuffer
  try {
    infoDatBuffer = await readFile(join(songDir, "/", "info.dat"))
  } catch (e) {
    return
  }
  const infoDat = await JSON.parse(infoDatBuffer.toString("utf8"))
  const bufferArray: Buffer[] = [infoDatBuffer]

  for (const difficultyBeatmapSets of infoDat["_difficultyBeatmapSets"]) {
    for (const difficultyBeatmaps of difficultyBeatmapSets[
      "_difficultyBeatmaps"
      ]) {
      bufferArray.push(
        await readFile(
          join(songDir, "/", difficultyBeatmaps["_beatmapFilename"])
        )
      )
    }
  }

  const hash = createHash("sha1")
    .update(Buffer.concat(bufferArray))
    .digest("hex")
  writeFile(hashedFilePath, hash)
  return hash
}

export async function getAllHashes(songsDir: string): Promise<string[]> {
  const directories = (await readdir(songsDir, { withFileTypes: true }))
    .filter((dirEnt) => dirEnt.isDirectory())
    .map((dirEnt) => dirEnt.name)
  return Promise.all(
    directories.map((directory) => hashFile(join(songsDir, "/", directory)))
  )
}

async function testPrint() {
  await deleteHashFiles(
    "C:\\Users\\jdc10\\Downloads\\BSLegacyUtil (1)\\BSLegacyUtil\\Beat Saber\\Beat Saber_Data\\CustomLevels"
  )
  console.time("hashWithShortcut")

  console.timeEnd("hashWithShortcut")
  console.time("hashWithoutShortcut")
  await getAllHashes(
    "C:\\Users\\jdc10\\Downloads\\BSLegacyUtil (1)\\BSLegacyUtil\\Beat Saber\\Beat Saber_Data\\CustomLevels"
  )
  console.timeEnd("hashWithoutShortcut")
}

export async function deleteHashFiles(songsDir: string) {
  const directories = (await readdir(songsDir, { withFileTypes: true }))
    .filter((dirEnt) => dirEnt.isDirectory())
    .map((dirEnt) => dirEnt.name)
  directories.forEach((value) => {
    try {
      unlink(join(songsDir, value, "/", "hashed"))
    } catch (e) {}
  })
}

if (require.main === module) {
  testPrint()
}

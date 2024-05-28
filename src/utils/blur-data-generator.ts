import { getPlaiceholder } from "plaiceholder";

export async function getBlurData(src: string) {
  const buffer = await fetch(src).then(async (res) =>
    Buffer.from(await res.arrayBuffer()),
  );

  console.log(src);

  const data = await getPlaiceholder(buffer);
  return data;
}

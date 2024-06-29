import { youtubeApiClient } from "~/server/clients/oauth/youtube";

export async function getVideoIdsFromQuery(q: string): Promise<string[]> {
  try {
    // Get list of video ids for search query
    const results = await youtubeApiClient.search.list({
      q,
      part: ["snippet,id"],
      maxResults: 30,
    });

    const videoIds = results.data.items
      ?.map((item) => item.id?.videoId)
      .filter((v) => v !== undefined)
      .filter((v) => v !== null) as string[];

    console.log(results, "get video ids");

    return videoIds;
  } catch (err) {
    console.error(err);
    throw new Error(`Error occured while trying to generate tags`);
  }
}

export async function getVideoTagsByVideoIDs(
  videoIds: string[],
): Promise<string[][]> {
  try {
    const results = await youtubeApiClient.videos.list({
      id: videoIds,
      part: ["snippet"],
    });

    const tags = results.data.items
      ?.map((item) => item.snippet?.tags)
      .filter((v) => v !== undefined && v !== null) as string[][];

    return tags;
  } catch (err) {
    console.error(err);
    throw new Error(`Error occured while trying to generate tags`);
  }
}

export function sortTagsByOccurance(tags: string[][]): [string, number][] {
  // Join the 2d array of strings into 1d array (all tags in this single array)
  const videoTags = tags.reduce((prev, curr) => [...prev, ...curr], []);

  // Get an object that counts the occurance of each tag
  const count = videoTags.reduce(
    (prev, curr) => {
      prev[curr] = (prev[curr] ?? 0) + 1;
      return prev;
    },
    {} as Record<string, number>,
  );

  // Sort occurance count in descending order
  const sorted = Object.entries(count).sort((a, b) => -(a[1] - b[1]));

  return sorted;
}

export function chooseTagsUntilMaxStrLengthReached(
  chooseFrom: [string, number][],
  maxLength: number,
): string[] {
  console.log(chooseFrom);
  if (chooseFrom.length === 0) {
    throw new Error("Received empty list of tags");
  }

  const chosenTagsSet = new Set<string>([]);

  const selectedTags = [];
  let lengthOfTags = 0;
  let tagIdx = 0;
  while (lengthOfTags <= maxLength && tagIdx < chooseFrom.length) {
    const tag = chooseFrom[tagIdx]?.[0];

    if (tag === undefined) {
      throw new Error(`Received undefined tag: ${JSON.stringify(chooseFrom)}`);
    }

    const newTagLength = tag.length + 2 + lengthOfTags;

    if (newTagLength <= maxLength && !chosenTagsSet.has(tag.toUpperCase())) {
      selectedTags.push(tag);
      lengthOfTags = newTagLength;
      tagIdx++;
    } else break;
  }

  return selectedTags;
}

"use server";

// Server action that revalidates a path
// Useful so we can revalidate from the client side
import { revalidatePath } from "next/cache";

export const clearCacheByServerAction = async (
  path: string,
  type?: "layout" | "page",
) => {
  try {
    if (path) {
      revalidatePath(path, type);
    } else {
      revalidatePath("/", type);
    }
  } catch (err) {
    console.error(err);
  }
};

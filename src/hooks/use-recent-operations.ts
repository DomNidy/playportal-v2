"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { createClient } from "~/utils/supabase/client";

type UseRecentOperationsProps = {
  itemsPerPage: number;
};

export default function useRecentOperations({
  itemsPerPage,
}: UseRecentOperationsProps) {
  const supabase = createClient();

  return useInfiniteQuery({
    queryKey: ["recentOperations"],
    queryFn: async ({
      pageParam,
    }: {
      pageParam: { from: number; to: number };
    }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("operations_filemetadata")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("file_origin", "PlayportalBackend")
        .eq("user_id", user.id)
        .range(pageParam.from, pageParam.to)
        .limit(itemsPerPage);

      if (error ?? !data) {
        return [];
      }
      return data;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !Array.isArray(lastPage)) return null;
      if (lastPage.length < itemsPerPage) return null;

      const from = allPages.reduce((acc, page) => acc + (page?.length ?? 0), 0);
      const to = from + itemsPerPage + 1;

      return {
        from,
        to,
      };
    },
    initialPageParam: {
      from: 0,
      to: itemsPerPage,
    },
  });
}

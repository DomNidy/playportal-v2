// type UseDescriptionTemplatesReturn {
//     query:
//     mutation
// }

import { useQuery } from "@tanstack/react-query";
import { createClient } from "~/utils/supabase/client";

export default function useDescriptionTemplates() {
  const supabase = createClient();

  const fetchDescriptions = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Failed to get user");
      return null;
    }

    const { data: descriptionData, error: descriptionFetchErr } = await supabase
      .from("description_templates")
      .select("id,template_name")
      .eq("user_id", user.id);

    if (descriptionFetchErr) {
      console.error(descriptionFetchErr);
    }

    return descriptionData;
  };

  const descriptionsQuery = useQuery({
    queryKey: ["user", "descriptions"],
    queryFn: fetchDescriptions,
  });

  return descriptionsQuery;
}

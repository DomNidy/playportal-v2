import { useQuery } from "@tanstack/react-query";
import { toast } from "~/components/ui/Toasts/use-toast";
import { YoutubeDescriptionSchema } from "~/definitions/api-schemas";
import { createClient } from "~/utils/supabase/client";

// Used to fetch the full description of a description template from description template id
export function useFullDescriptionTemplate(descriptionTemplateId: string) {
  const supabase = createClient();

  const fullDescriptionQuery = useQuery({
    queryKey: ["description", descriptionTemplateId],
    queryFn: async () => {
      const { data, error: fetchDescriptionError } = await supabase
        .from("description_templates")
        .select("description")
        .eq("id", descriptionTemplateId)
        .single();

      if (fetchDescriptionError) {
        console.error(fetchDescriptionError);
      }

      if (!data?.description) {
        return null;
      }

      console.log(data?.description);

      const fullDescription = YoutubeDescriptionSchema.safeParse(
        data?.description,
      );

      if (!fullDescription.success) {
        console.log("Failed to parse description", fullDescription.error);
        toast({
          variant: "destructive",
          title: "Failed to load description template",
          description:
            "This template is invalid, please delete it and create a new one",
        });
        return null;
      }

      return {
        descriptionText: fullDescription.data.descriptionText,
      };
    },
  });

  return fullDescriptionQuery;
}

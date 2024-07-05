import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import TagGeneratorForm from "./TagGeneratorForm";

interface TagGeneratorProps {
  modalOpen: boolean;
  defaultTagQuery: string;
  setModalOpen: (isOpen: boolean) => void;
  setTagsCallback: (newTags: string[]) => void;
  triggerButton: React.ReactNode;
}

export default function TagGenerator({ ...props }: TagGeneratorProps) {
  const {
    modalOpen,
    setTagsCallback,
    setModalOpen,
    triggerButton,
    defaultTagQuery,
  } = props;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <div className="flex  max-w-[320px] flex-col gap-1">
          <DialogTitle>Tag Generator</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Generate SEO Optimized tags for your Video
          </p>
        </div>
        <TagGeneratorForm
          setTagsCallback={(tags) => {
            setTagsCallback(tags);
          }}
          defaultTagQuery={defaultTagQuery}
          setModalOpen={setModalOpen}
        />
      </DialogContent>
    </Dialog>
  );
}

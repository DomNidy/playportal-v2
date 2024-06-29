import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import TagGeneratorForm from "./TagGeneratorForm";

interface TagGeneratorProps {
  modalOpen: boolean;
  defaultTagQuery: string;
  onModalOpenChange: (isOpen: boolean) => void;
  setTagsCallback: (newTags: string[]) => void;
  triggerButton: React.ReactNode;
}

export default function TagGenerator({ ...props }: TagGeneratorProps) {
  const {
    modalOpen,
    setTagsCallback,
    onModalOpenChange,
    triggerButton,
    defaultTagQuery,
  } = props;

  return (
    <Dialog open={modalOpen} onOpenChange={onModalOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <div className="flex  max-w-[320px] flex-col gap-1">
          <DialogTitle>Tag Generator</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Generate SEO Optimized tags for your Video
          </p>
        </div>
        <div className="flex flex-col space-y-4">
          <TagGeneratorForm
            setTagsCallback={(tags) => {
              setTagsCallback(tags);
            }}
            defaultTagQuery={defaultTagQuery}
            setModalOpen={onModalOpenChange}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}

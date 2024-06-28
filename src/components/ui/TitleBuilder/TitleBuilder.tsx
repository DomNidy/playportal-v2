import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import { TitleBuilderForm } from "./TitleBuilderForm";

interface TitleBuilderProps {
  modalOpen: boolean;
  onModalOpenChange: (isOpen: boolean) => void;
  setTitleCallback: (newTitle: string, beatName: string) => void;
  triggerButton: React.ReactNode;
}

export default function TitleBuilder({ ...props }: TitleBuilderProps) {
  const { modalOpen, setTitleCallback, onModalOpenChange, triggerButton } =
    props;

  return (
    <Dialog open={modalOpen} onOpenChange={onModalOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <div className="flex max-w-[300px] flex-col gap-1">
          <DialogTitle>Title Builder</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Quickly construct a title for your video
          </p>
        </div>
        {/** It might be worth memoizing this setTitlCallback if the titlebuilder component gets bigger */}
        <TitleBuilderForm
          setTitleCallback={(title, beatName) => {
            setTitleCallback(title, beatName);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

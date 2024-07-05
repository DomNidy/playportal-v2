import { Dialog, DialogTrigger, DialogTitle, DialogContent } from "../Dialog";
import { TitleBuilderForm } from "./TitleBuilderForm";

interface TitleBuilderProps {
  modalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
  setTitleCallback: (newTitle: string, beatName: string) => void;
  triggerButton: React.ReactNode;
  defaultBeatName?: string;
}

export default function TitleBuilder({ ...props }: TitleBuilderProps) {
  const {
    modalOpen,
    setTitleCallback,
    defaultBeatName,
    setModalOpen,
    triggerButton,
  } = props;

  return (
    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
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
          onTitleBuilderCancel={() => setModalOpen(false)}
          defaultBeatName={defaultBeatName}
          setTitleCallback={(title, beatName) => {
            setTitleCallback(title, beatName);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

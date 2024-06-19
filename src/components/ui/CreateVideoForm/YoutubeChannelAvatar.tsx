import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar";

export const YoutubeChannelAvatar = memo(function YoutubeChannelAvatar({
  channelAvatar,
  channelTitle,
}: {
  channelAvatar: string | null;
  channelTitle: string;
}) {
  console.log("Rendered", channelTitle, channelAvatar);

  return (
    <Avatar className="mr-2 h-[16px] w-[16px] ">
      <AvatarImage
        src={channelAvatar ?? ""}
        alt="Youtube channel thumbnail"
        width={16}
        height={16}
        className="rounded-full"
      />
      <AvatarFallback>{channelTitle}</AvatarFallback>
    </Avatar>
  );
});

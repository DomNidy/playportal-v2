import { type YoutubeChannelSummary } from "~/definitions/db-type-aliases";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar";
import UnlinkYoutubeChannelButton from "./UnlinkYoutubeChannelButton";

export default function YoutubeChannelSummaryCard({
  accountSummary,
}: {
  accountSummary: YoutubeChannelSummary;
}) {
  const { channelAvatar, channelId, channelTitle } = accountSummary;

  return (
    <div className={`flex items-center justify-between`}>
      <div className="flex items-center space-x-4 ">
        <Avatar>
          <AvatarImage src={channelAvatar ?? ""} alt="Channel Avatar" />
          <AvatarFallback>{channelTitle}</AvatarFallback>
        </Avatar>

        <div>
          <h3 className="text-lg font-medium">{channelTitle}</h3>
        </div>
      </div>
      <UnlinkYoutubeChannelButton channelId={channelId} />
    </div>
  );
}

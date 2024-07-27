import { type YoutubeChannelSummary } from "~/definitions/db-type-aliases";
import { Avatar, AvatarFallback, AvatarImage } from "../Avatar/Avatar";
import UnlinkYoutubeChannelButton from "./UnlinkYoutubeChannelButton";
import { Link } from "../Link";

export default function YoutubeChannelSummaryCard({
  accountSummary,
}: {
  accountSummary: YoutubeChannelSummary;
}) {
  const { channelAvatar, channelId, channelTitle } = accountSummary;
  const channelLink = `https://www.youtube.com/channel/${channelId}`;
  return (
    <div className={`flex items-center justify-between`}>
      <div className="flex items-center space-x-4 ">
        <a target="_blank" href={channelLink}>
          <Avatar>
            <AvatarImage src={channelAvatar ?? ""} alt="Channel Avatar" />
            <AvatarFallback>{channelTitle}</AvatarFallback>
          </Avatar>
        </a>

        <div>
          <a
            target="_blank"
            className="text-lg font-medium underline-offset-1 hover:underline"
            href={channelLink}
          >
            {channelTitle}
          </a>
        </div>
      </div>
      <UnlinkYoutubeChannelButton channelId={channelId} />
    </div>
  );
}

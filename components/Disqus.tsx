import { verifyEngineSliceState } from "@dendronhq/common-frontend";
import { DiscussionEmbed } from "disqus-react";
import { useEngineAppSelector } from "../features/engine/hooks";
import { useDendronRouter } from "../utils/hooks";
import { getRootUrl } from "../utils/links";

const DisqusComments = (noteObj: any) => {
  const engine = useEngineAppSelector((state) => state.engine);
  if (!verifyEngineSliceState(engine)) {
    return null;
  }
  const url = getRootUrl(engine.config.site);
  const { note } = noteObj;
  console.log(note);
  if (!note.id) {
    return <></>;
  }

  const disqusShortname = "kiwijang";
  const disqusConfig = {
    url: `${url}/notes/${note.id}`,
    identifier: note.id, // Single post id
    title: note.title, // Single post title
  };
  return (
    <div>
      <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
    </div>
  );
};
export default DisqusComments;

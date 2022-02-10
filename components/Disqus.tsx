import { verifyEngineSliceState } from '@dendronhq/common-frontend';
import { Col, Divider } from 'antd';
import { DiscussionEmbed } from 'disqus-react';
import { useEngineAppSelector } from '../features/engine/hooks';
import { getRootUrl } from '../utils/links';

const DisqusComments = (noteObj: any) => {
  const engine = useEngineAppSelector((state) => state.engine);
  if (!verifyEngineSliceState(engine)) {
    return null;
  }
  const url = getRootUrl(engine.config.site);
  const { note } = noteObj;
  console.log(note);
  if (note.custom.status === 'w') {
    return (
      <span style={{ fontSize: '14px', color: 'lightgrey' }}>
        <span
          style={{
            display: 'inline-block',
            width: '8px',
            height: '8px',
            backgroundColor: 'pink',
            marginLeft: '10px',
            marginRight: '4px',
            borderRadius: '10px',
          }}
        ></span>
        pending notes (這篇文章還沒寫完)
      </span>
    );
  }
  if (
    !note.id ||
    note.id === 'root' ||
    note.parent === 'root' ||
    note.custom?.stub === true ||
    note.id === '03vN8OL5CrZW9GX2NX7oS' ||
    note.fname.split('.')[0] === 'tags' ||
    note.fname.split('.')[0] === '0drops'
  ) {
    return <></>;
  }

  const disqusShortname = 'kiwijang';
  const disqusConfig = {
    url: `${url}/notes/${note.id}`,
    identifier: note.id, // Single post id
    title: note.title, // Single post title
  };
  return (
    <Col xs={24} md={18}>
      <Divider dashed />
      <div style={{ paddingRight: '24px' }}>
        <DiscussionEmbed shortname={disqusShortname} config={disqusConfig} />
      </div>
      <Divider dashed />
    </Col>
  );
};
export default DisqusComments;

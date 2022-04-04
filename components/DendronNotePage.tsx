import {
  IntermediateDendronConfig,
  NoteProps,
  NotePropsDict,
} from '@dendronhq/common-all';
import {
  createLogger,
  DendronNote,
  LoadingStatus,
} from '@dendronhq/common-frontend';
import { Col, Row } from 'antd';
import _ from 'lodash';
import React from 'react';
import { DendronCollectionItem } from '../components/DendronCollection';
import DendronCustomHead from '../components/DendronCustomHead';
import DendronSEO from '../components/DendronSEO';
import DendronSpinner from '../components/DendronSpinner';
import { DendronTOC } from '../components/DendronTOC';
import { useCombinedDispatch, useCombinedSelector } from '../features';
import { browserEngineSlice } from '../features/engine';
import { DENDRON_STYLE_CONSTANTS } from '../styles/constants';
import { useDendronRouter, useIsMobile } from '../utils/hooks';
import DisqusComments from './Disqus';

const { LAYOUT, HEADER } = DENDRON_STYLE_CONSTANTS;

export type DendronNotePageProps = {
  // `InferGetStaticPropsType` doesn't get right types for some reason, hence the manual override here
  customHeadContent: string | null;
  noteIndex: NoteProps;
  note: NoteProps;
  body: string;
  collectionChildren: NoteProps[] | null;
  config: IntermediateDendronConfig;
  rootBody?: string;
};

export default function Note({
  note,
  body,
  collectionChildren,
  noteIndex,
  customHeadContent,
  config,
  rootBody,
}: DendronNotePageProps) {
  const logger = createLogger('Note');
  const { getActiveNoteId } = useDendronRouter();
  const [bodyFromState, setBody] = React.useState<string | undefined>(
    undefined
  );
  let id = getActiveNoteId();
  let rootId = '';
  if (id === 'root') {
    rootId = id;
    id = noteIndex.id;
  }

  // --- Hooks
  const dispatch = useCombinedDispatch();
  const engine = useCombinedSelector((state) => state.engine);
  logger.info({ ctx: 'enter', id });
  const { isMobile } = useIsMobile();

  // setup body
  React.useEffect(() => {
    logger.info({ ctx: 'updateNoteBody:enter', id });
    if (_.isUndefined(id)) {
      logger.info({ ctx: 'updateNoteBody:exit', id, state: 'id undefined' });
      return;
    }
    // loaded page statically
    if (id === note.id) {
      dispatch(
        browserEngineSlice.actions.setLoadingStatus(LoadingStatus.FULFILLED)
      );
      logger.info({ ctx: 'updateNoteBody:exit', id, state: 'id = note.id' });
      return;
    }
    logger.info({ ctx: 'updateNoteBody:fetch:pre', id });
    // otherwise, dynamically fetch page
    fetch(`/data/notes/${id}.html`).then(async (resp) => {
      logger.info({ ctx: 'updateNoteBody:fetch:post', id });
      const contents = await resp.text();
      setBody(contents);
      dispatch(
        browserEngineSlice.actions.setLoadingStatus(LoadingStatus.FULFILLED)
      );
    });
  }, [id]);

  let noteBody = id === note.id ? body : bodyFromState;

  if (_.isUndefined(noteBody)) {
    return <DendronSpinner />;
  }

  const maybeCollection =
    note.custom?.has_collection && !_.isNull(collectionChildren)
      ? collectionChildren.map((child: NoteProps) =>
          DendronCollectionItem({ note: child, noteIndex })
        )
      : null;

  if (id === rootId) {
    return (
      <>
        <DendronSEO note={note} config={config} />
        {customHeadContent && <DendronCustomHead content={customHeadContent} />}
        <Row>
          <Col span={24}>
            <Row>
              <Col xs={24} md={18}>
                <div style={{ paddingRight: `${LAYOUT.PADDING}px` }}>
                  <DendronNote
                    noteContent={rootBody ? rootBody : ''}
                    config={config}
                  />
                </div>
                {maybeCollection}
              </Col>
              <Col xs={0} md={6}>
                <DendronTOC note={note} offsetTop={HEADER.HEIGHT} />
              </Col>
              <DisqusComments note={note}></DisqusComments>
            </Row>
          </Col>
        </Row>
      </>
    );
  } else {
    return (
      <>
        <DendronSEO note={note} config={config} />
        {customHeadContent && <DendronCustomHead content={customHeadContent} />}
        <Row>
          <Col span={24}>
            <Row>
              <Col xs={24} md={18}>
                <div style={{ paddingRight: `${LAYOUT.PADDING}px` }}>
                  <DendronNote noteContent={noteBody} config={config} />
                </div>
                {maybeCollection}
              </Col>
              <Col xs={0} md={6}>
                <DendronTOC note={note} offsetTop={HEADER.HEIGHT} />
              </Col>
              <DisqusComments note={note}></DisqusComments>
            </Row>
          </Col>
        </Row>
      </>
    );
  }
}

export async function genLatestThreeThen(
  notes: NotePropsDict,
  id: string,
  rootId: string
): Promise<string> {
  let body = '';
  let drops: NoteProps | undefined;
  drops = notes['u4tSbmkJewrKonY3sL544'];
  // console.log(x);

  // console.log(!drops);
  if (!drops) {
    return '';
  }
  //若最新年份內<3
  let latestPrevYearNotes: string[] | undefined = [];
  let latestYearNotes: string[] | undefined = [];

  latestYearNotes = notes[drops.children[drops.children.length - 1]].children;
  latestPrevYearNotes =
    notes[drops.children[drops.children.length - 2]].children;

  // console.log(latestPrevYearNotes);
  // console.log(latestYearNotes);
  if (!latestPrevYearNotes.length || !latestYearNotes.length) {
    return '';
  }

  if (latestYearNotes!.length < 3) {
    let prev: { id: string; title: string } = {
      id: '',
      title: '',
    };
    let latestSec: { id: string; title: string } = {
      id: '',
      title: '',
    };
    let latest: { id: string; title: string } = {
      id: '',
      title: '',
    };

    let latestIds: { id: string; title: string }[] = [];

    prev = notes[latestPrevYearNotes![latestPrevYearNotes.length - 1]];
    latestSec = notes[latestYearNotes![0]];
    latest = notes[latestYearNotes![1]];

    latestIds.push({
      id: latest.id,
      title: latest.title,
    });
    latestIds.push({
      id: latestSec.id,
      title: latestSec.title,
    });
    latestIds.push({
      id: prev.id,
      title: prev.title,
    });

    let threeLatest = '';
    if (id === rootId) {
      // console.log(latestIds);
      latestIds.map((obj) => {
        threeLatest =
          threeLatest +
          `<div class="portal-container">
              <div class="portal-head">
                <a href="/notes/${obj.id}" class="portal-backlink">
                  <div class="portal-title"><span class="portal-text-title">${obj.title}</span></div>
                  <div class="portal-arrow">Go to text <span class="right-arrow">→</span></div>
                </a>
              </div>
          </div>`;
      });

      body = `<p style="margin-top: 20px;">最新文章</p>
                ${threeLatest}
                <hr>
                <h2 id="children"><a aria-hidden="true" class="anchor-heading" href="#children"><svg aria-hidden="true" viewBox="0 0 16 16"><use xlink:href="#svg-link"></use></svg></a>Children</h2>
                <ol>
                <li><a href="/notes/u4tSbmkJewrKonY3sL544">Drops</a></li>
                <li><a href="/notes/WAKWMq3SeVmlAmZRqCbpB">Other</a></li>
                <li><a href="/notes/rEbR1FrKkZzyjo6ahAgm3">Tags</a></li>
                <li><a href="/notes/Cybv0wy1d2NbWoMaJ9Xst">pending notes</a></li>
                </ol>`;

      return Promise.resolve(body);
    }
  } else {
    let latestThrid: { id: string; title: string } = {
      id: '',
      title: '',
    };
    let latestSec: { id: string; title: string } = {
      id: '',
      title: '',
    };
    let latest: { id: string; title: string } = {
      id: '',
      title: '',
    };

    let latestIds: { id: string; title: string }[] = [];

    latestThrid = notes[latestYearNotes![latestYearNotes!.length - 3]];
    latestSec = notes[latestYearNotes![latestYearNotes!.length - 2]];
    latest = notes[latestYearNotes![latestYearNotes!.length - 1]];

    latestIds.push({
      id: latest.id,
      title: latest.title,
    });
    latestIds.push({
      id: latestSec.id,
      title: latestSec.title,
    });
    latestIds.push({
      id: latestThrid.id,
      title: latestThrid.title,
    });

    let threeLatest = '';
    if (id === rootId) {
      // console.log(latestIds);
      latestIds.map((obj) => {
        threeLatest =
          threeLatest +
          `<div class="portal-container">
              <div class="portal-head group">
                <a href="/notes/${obj.id}" class="portal-backlink group">
                  <div class="portal-title"><span class="portal-text-title">${obj.title}</span></div>
                  <div class="portal-arrow">Go to text <span class="right-arrow">→</span></div>
                </a>
              </div>
          </div>`;
      });

      body = `<p style="margin-top: 20px;">最新文章</p>
                ${threeLatest}
                <hr>
                <h2 id="children"><a aria-hidden="true" class="anchor-heading" href="#children"><svg aria-hidden="true" viewBox="0 0 16 16"><use xlink:href="#svg-link"></use></svg></a>Children</h2>
                <ol>
                <li><a href="/notes/u4tSbmkJewrKonY3sL544">Drops</a></li>
                <li><a href="/notes/WAKWMq3SeVmlAmZRqCbpB">Other</a></li>
                <li><a href="/notes/rEbR1FrKkZzyjo6ahAgm3">Tags</a></li>
                <li><a href="/notes/Cybv0wy1d2NbWoMaJ9Xst">pending notes</a></li>
                </ol>`;

      return Promise.resolve(body);
    }
  }
  return Promise.resolve('');
}

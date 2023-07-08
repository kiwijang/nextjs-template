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
import React, { useEffect, useState } from 'react';
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
  // logger.info({ ctx: 'enter', id });
  const { isMobile } = useIsMobile();

  // setup body
  React.useEffect(() => {
    // logger.info({ ctx: 'updateNoteBody:enter', id });
    if (_.isUndefined(id)) {
      // logger.info({ ctx: 'updateNoteBody:exit', id, state: 'id undefined' });
      return;
    }
    // loaded page statically
    if (id === note.id) {
      dispatch(
        browserEngineSlice.actions.setLoadingStatus(LoadingStatus.FULFILLED)
      );
      // logger.info({ ctx: 'updateNoteBody:exit', id, state: 'id = note.id' });
      return;
    }
    // logger.info({ ctx: 'updateNoteBody:fetch:pre', id });
    // otherwise, dynamically fetch page
    fetch(`/data/notes/${id}.html`).then(async (resp) => {
      // logger.info({ ctx: 'updateNoteBody:fetch:post', id });
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
  } else if (id = 'about') {
    // logger.info({ ctx: 'noteBody', noteBody });
    const youtubeScript = `
    <script type="text/javascript" id="www-widgetapi-script" src="https://s.ytimg.com/yts/jsbin/www-widgetapi-vflS50iB-/www-widgetapi.js" async=""></script>
    <script src="https://www.youtube.com/player_api"></script>
    <script>
     try {
      execute();
  } catch(error) {
    if (error instanceof ReferenceError) {
      console.log(error)
    } else {
      console.log('Caught some other error.');
    }
  }

  function execute() {
    let player;
    let duration = 0;
    let currentTime = 0;
    let isMuted = true;
    let yt = null;
    let isSetup = true;
    let repeat = true;
    let firstTime = true;    
    let clock1 = null;
    
    if (window.location.href.split('/').includes('about')) {
      document.addEventListener('DOMContentLoaded', (event) => {
        console.log('goRepeat')
        goRepeat();

        if(document.getElementById('about')) {
          
          document.getElementById('bar-wrap').addEventListener('click',(e) => {
            console.log('ccc')
            const x = e.offsetX;
            let seekToTime = 0;
            const barWidth =  e.target.offsetWidth;
            if (player) {
              duration = player.getDuration();
              seekToTime = Math.floor(x/barWidth*duration);
              player.seekTo(seekToTime);
            }        
              
            currentTime = yt? (yt.playerInfo? yt.playerInfo.currentTime : player.getCurrentTime()) : player.getCurrentTime();
            document.getElementById('bar').style.width = String(currentTime / duration * 100)+'%';
          });          
              
          if (firstTime) {
            const updTimeLine = setInterval(() => {
              console.log('upd')
              if(!document.getElementById('bar')) {
                clearInterval(updTimeLine);
                return;
              }
              currentTime = yt? (yt.playerInfo? yt.playerInfo.currentTime : player.getCurrentTime()) : player.getCurrentTime();
              document.getElementById('bar').style.width = String(currentTime / duration * 100)+'%';
            }, 1000);

            firstTime = false;
          }
        }
        
        window.stopVideo = stopVideo;
        window.mute = mute;
        window.unMute = unMute;
        window.playMyVedio = playMyVedio;
        window.pauseVideo = pauseVideo;
        window.onYouTubePlayerAPIReady = onYouTubeIframeAPIReady;
        window.onPlayerReady = onPlayerReady;
      });    
    }
    
    function goRepeat() {        
      if (!document.getElementById('about')) { 
        repeat = true;         
        clock1 = setInterval( ()=> {
            if (isSetup) {
              isSetup = false;
              setup();
            }
            if (repeat) {
              repeat = false;
              goRepeat();
            }
        }, 500);
        return;
      } else {
        if (clock1) {
          clearInterval(clock1);
        }

        document.getElementById('bar-wrap').addEventListener('click',(e) => {
          console.log('ccc')
          const x = e.offsetX;
          let seekToTime = 0;
          const barWidth =  e.target.offsetWidth;
          if (player) {
            duration = player.getDuration();
            seekToTime = Math.floor(x/barWidth*duration);
            player.seekTo(seekToTime);
          }        
            
          currentTime = yt? (yt.playerInfo? yt.playerInfo.currentTime : player.getCurrentTime()) : player.getCurrentTime();
          document.getElementById('bar').style.width = String(currentTime / duration * 100)+'%';
        });          
            
        if (firstTime) {
          const updTimeLine = setInterval(() => {
            console.log('upd')
            if(!document.getElementById('bar')) {
              clearInterval(updTimeLine);
              return;
            }
            currentTime = yt? (yt.playerInfo? yt.playerInfo.currentTime : player.getCurrentTime()) : player.getCurrentTime();
            document.getElementById('bar').style.width = String(currentTime / duration * 100)+'%';
          }, 1000);

          firstTime = false;
        }
      }
    }

    function setup() {          
        if (typeof(YT) == 'undefined' || typeof(YT.Player) == 'undefined') {

            // 2. This code loads the IFrame Player API code asynchronously.
            const tag = document.createElement('script');    
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

        }

        onYouTubeIframeAPIReady();
    }

    
    // 3. This function creates an <iframe> (and YouTube player)
    //    after the API code downloads.
    function onYouTubeIframeAPIReady() {
      yt = new YT.Player('player', {
        height: '100',
        width: '250',
        videoId: 'GTlQhMRHXIg',
        playerVars: {
          autoplay: 0,
          controls: 0,
          loop: 1,
          playsinline: 1,
          origin: 'https://kiwijang.github.io',
        },
        events: {
          onReady: onPlayerReady,
        },
      });
    }

    // 4. The API will call this function when the video player is ready.
    function onPlayerReady(event) {
      isMuted = event.target.isMuted();
      if (isMuted) {
        document.getElementById('btn-mute').style.display = 'none';
        document.getElementById('btn-unMute').style.display = 'flex';
      } else {
        document.getElementById('btn-mute').style.display = 'flex';
        document.getElementById('btn-unMute').style.display = 'none';
      }

      // event.target.playVideo();
      player = event.target;
      // console.log(player)

      window.playMyVedio();
      window.stopVideo();

      duration = player.getDuration();

      currentTime = yt? (yt.playerInfo? yt.playerInfo.currentTime : player.getCurrentTime()) : player.getCurrentTime();
      document.getElementById('bar').style.width = String(currentTime/duration*100)+'%';   
    }

    function stopVideo() {
      if (!player) return;
      player.stopVideo();
    }
  
    function pauseVideo() {
      if (!player) return;
      player.pauseVideo();
    }
  
    function playMyVedio() {
      if (!player) return;
      player.playVideo();
    }
  
    function unMute() {
      checkIsMuted();
    }
  
    function mute() {
      checkIsMuted();
    }
  
    function checkIsMuted() {
      if (!player) return;
  
      if (document.getElementById('btn-mute').style.display !== 'flex') {
        document.getElementById('btn-mute').style.display = 'flex';
        document.getElementById('btn-unMute').style.display = 'none';
        
        player.unMute();
      } else {
        document.getElementById('btn-mute').style.display = 'none';
        document.getElementById('btn-unMute').style.display = 'flex';
        
        player.mute();
      }
    }
      
  }

  if (window.location.href.split('/').includes('1hmguwjh0m2q4slup1xcg03')) {
    document.addEventListener('DOMContentLoaded', (event) => {
        const ele = document.getElementById('my-input');
        const wrapArticle = document.getElementById('wrapArticle');
        if(!ele || !wrapArticle) return;
        ele.addEventListener('change', inputChange);
        function inputChange(){
          if(ele.value==='hello'){
            wrapArticle.classList.remove("hide");
          } else {
            wrapArticle.classList.add("hide");
          }
        };        
      });
  }
    </script>`;
    return (
      <>
        <DendronSEO note={note} config={config} />
        {youtubeScript && <DendronCustomHead content={youtubeScript} />}
        <Row>
          <Col span={24}>
            <Row>
              <Col xs={24} md={18}>
                <div style={{ paddingRight: `${LAYOUT.PADDING}px` }}>
                  <NoSsr>
                    <DendronNote noteContent={noteBody} config={config} />
                  </NoSsr>
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
    latestSec = notes[latestPrevYearNotes![latestPrevYearNotes.length - 2]];
    latest = notes[latestYearNotes![0]];

    latestIds.push({
      id: latest?.id,
      title: latest?.title,
    });
    latestIds.push({
      id: latestSec?.id,
      title: latestSec?.title,
    });
    latestIds.push({
      id: prev?.id,
      title: prev?.title,
    });

    let threeLatest = '';
    if (id === rootId) {
      // console.log(latestIds);
      latestIds.map((obj) => {
        threeLatest =
          threeLatest +
          `<div class="portal-container">
              <div class="portal-head">
                <a href="/notes/${obj?.id}" class="portal-backlink">
                  <div class="portal-title"><span class="portal-text-title">${obj?.title}</span></div>
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
      id: latest?.id,
      title: latest?.title,
    });
    latestIds.push({
      id: latestSec?.id,
      title: latestSec?.title,
    });
    latestIds.push({
      id: latestThrid?.id,
      title: latestThrid?.title,
    });

    let threeLatest = '';
    if (id === rootId) {
      // console.log(latestIds);
      latestIds.map((obj) => {
        threeLatest =
          threeLatest +
          `<div class="portal-container">
              <div class="portal-head group">
                <a href="/notes/${obj?.id}" class="portal-backlink group">
                  <div class="portal-title"><span class="portal-text-title">${obj?.title}</span></div>
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


const NoSsr = ({ children }: any): JSX.Element => {
  const [isMounted, setMount] = useState(false);

  useEffect(() => {
    setMount(true);
  }, []);

  return <>{isMounted ? children : null}</>;
};
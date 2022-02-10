import { MenuOutlined } from '@ant-design/icons';
import { ConfigUtils, IntermediateDendronConfig } from '@dendronhq/common-all';
import { Col, Layout, Row } from 'antd';
import Script from 'next/script';
import * as React from 'react';
import { useEngineAppSelector } from '../features/engine/hooks';
import { DENDRON_STYLE_CONSTANTS } from '../styles/constants';
import { DendronCommonProps } from '../utils/types';
import { DendronBreadCrumb } from './DendronBreadCrumb';
import DendronLogoOrTitle from './DendronLogoOrTitle';
import { FooterText } from './DendronNoteFooter';
import { DendronSearch } from './DendronSearch';
import DendronTreeMenu from './DendronTreeMenu';

const { Header, Content, Sider, Footer } = Layout;
const { LAYOUT, HEADER, SIDER } = DENDRON_STYLE_CONSTANTS;

export default function DendronLayout(
  props: React.PropsWithChildren<DendronCommonProps>
) {
  const [isCollapsed, setCollapsed] = React.useState(false);
  const [isResponsive, setResponsive] = React.useState(false);

  const sidebar = (
    <Sider
      width={isResponsive ? '100%' : SIDER.WIDTH}
      collapsible
      collapsed={isCollapsed && isResponsive}
      collapsedWidth={SIDER.COLLAPSED_WIDTH}
      onCollapse={(collapsed) => {
        setCollapsed(collapsed);
      }}
      breakpoint="sm"
      onBreakpoint={(broken) => {
        setResponsive(broken);
      }}
      style={{
        position: 'fixed',
        overflow: 'auto',
        height: `calc(100vh - ${HEADER.HEIGHT}px)`,
      }}
      trigger={null}
    >
      <DendronTreeMenu
        {...props}
        collapsed={isCollapsed && isResponsive}
        setCollapsed={setCollapsed}
      />
    </Sider>
  );

  const content = (
    <>
      <Content
        className="main-content"
        role="main"
        style={{ paddingLeft: `${LAYOUT.PADDING}px` }}
      >
        <DendronBreadCrumb {...props} />
        {props.children}
      </Content>
      <Row style={{ paddingLeft: `${LAYOUT.PADDING}px` }}>
        <FooterText></FooterText>
      </Row>
      <Footer
        style={{
          padding: `0 ${LAYOUT.PADDING}px ${LAYOUT.PADDING}px`,
        }}
      ></Footer>
    </>
  );

  const engine = useEngineAppSelector((state) => state.engine);
  const config = engine.config as IntermediateDendronConfig;
  const enableMermaid = ConfigUtils.getProp(config, 'mermaid');

  return (
    <Layout
      style={{
        width: '100%',
        minHeight: '100%',
        minWidth: '310px',
      }}
    >
      {enableMermaid && (
        <Script
          id="initmermaid"
          src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"
          onLoad={() => {
            const mermaid = (window as any).mermaid;
            // save for debugging
            // when trying to access mermaid in DOM, <div id="mermaid"></div> gets returned
            // we disambiguate by saving a copy of mermaid
            (window as any)._mermaid = mermaid;

            mermaid.initialize({
              startOnLoad: false,
            });
            // initialize
            mermaid.init();
          }}
        />
      )}
      <Header
        style={{
          position: 'sticky',
          top: 0,
          isolation: 'isolate',
          zIndex: 1,
          width: '100%',
          boxShadow: '0px 0px 2px 0px #000000',
          height: HEADER.HEIGHT,
        }}
      >
        <Row justify="center">
          <Col
            xs={0}
            sm={20}
            md={20}
            lg={19}
            className="gutter-row"
            id="my-search"
            style={{
              maxWidth: '992px',
            }}
          >
            <DendronSearch {...props} />
          </Col>
          <Col xs={6}>
            <DendronLogoOrTitle />
          </Col>
          <Col
            xs={4}
            sm={4}
            md={0}
            lg={0}
            style={{
              marginLeft: '4px',
              display: isResponsive ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MenuOutlined
              style={{ fontSize: 24, color: 'lightgrey' }}
              onClick={() => setCollapsed(!isCollapsed)}
            />
          </Col>
        </Row>
      </Header>
      <Layout className="site-layout">
        <Layout className="site-layout" style={{ flexDirection: 'row' }}>
          <Layout
            className="site-layout-sidebar"
            style={{
              flex: '0 0 auto',
              width: `calc((100% - ${LAYOUT.BREAKPOINTS.xl}) / 2 + ${
                // eslint-disable-next-line no-nested-ternary
                isResponsive
                  ? isCollapsed
                    ? SIDER.COLLAPSED_WIDTH
                    : '100%'
                  : SIDER.WIDTH
              }px)`,
              minWidth: isResponsive || isCollapsed ? 0 : SIDER.WIDTH,
              paddingLeft: `calc((100% - ${LAYOUT.BREAKPOINTS.xl}) / 2)`,
              // eslint-disable-next-line no-nested-ternary
            }}
          >
            {sidebar}
          </Layout>
          <Layout
            className="side-layout-main"
            style={{
              maxWidth: `calc(100% - ${
                // eslint-disable-next-line no-nested-ternary
                isResponsive
                  ? isCollapsed
                    ? SIDER.COLLAPSED_WIDTH + 24
                    : '100%'
                  : SIDER.WIDTH + 24
              }px)`,
              display: !isCollapsed && isResponsive ? 'none' : 'initial',
            }}
          >
            {content}
          </Layout>
        </Layout>
      </Layout>
    </Layout>
  );
}

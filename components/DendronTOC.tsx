import { NoteProps } from "@dendronhq/common-all";
import { Anchor } from "antd";
import _ from "lodash";
import { ComponentProps, useEffect, useState } from "react";

const Link = Anchor.Link;

const unslug = (slugs: string) => {
  slugs = slugs.replace(/_/g, "-");
  slugs = slugs.replace(/--/g, "-");
  const list: string[] = [];
  slugs.split("-").forEach((slug) => {
    list.push(slug.substr(0, 1).toUpperCase() + slug.substr(1));
  });
  return list.join(" ");
};

export const DendronTOC = ({
  note,
  ...rest
}: {
  note: NoteProps;
} & ComponentProps<typeof Anchor>) => {
  const [targetOffset, setTargetOffset] = useState<number | undefined>(
    undefined
  );
  useEffect(() => {
    setTargetOffset(window.innerHeight / 2);
  }, []);
  return (
    <>
      <Anchor
        style={{ zIndex: 1 }}
        className="dendron-toc"
        {...rest}
        targetOffset={targetOffset}
      >
        {Object.entries(note?.anchors).map(([key, entry]) => {
          let component;
          if (entry?.type === "header") {
            if (entry?.depth > 2) {
              component = (
                <div style={{ paddingLeft: "20px" }}>
                  <Link
                    href={`#${key}`}
                    title={unslug(entry?.text ?? entry?.value)}
                  ></Link>
                </div>
              );
            } else {
              component = (
                <div>
                  <Link
                    href={`#${key}`}
                    title={unslug(entry?.text ?? entry?.value)}
                  ></Link>
                </div>
              );
            }
          } else {
            return <></>;
          }
          return component;
        })}
        {note?.links?.length > 0 &&
        note?.links.some((link) => link.type === "backlink") ? (
          <Link href="#backlinks" title="Backlinks" />
        ) : (
          <></>
        )}
        {note?.children?.length > 0 ? (
          <Link href="#children" title="Children" />
        ) : (
          <></>
        )}
      </Anchor>
    </>
  );
};

export default DendronTOC;

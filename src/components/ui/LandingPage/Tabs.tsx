/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "~/utils/utils";

type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

export const Tabs = ({
  tabs: propTabs,
  containerClassName,
  activeTabClassName,
  tabClassName,
  contentClassName,
}: {
  tabs: Tab[];
  containerClassName?: string;
  activeTabClassName?: string;
  tabClassName?: string;
  contentClassName?: string;
}) => {
  // TODO: This will error if we do not pass any tabs (propTabs[0]!)
  const [active, setActive] = useState<Tab>(propTabs[0]!);
  const [tabs, setTabs] = useState<Tab[]>(propTabs);

  const moveSelectedTabToTop = (idx: number) => {
    const newTabs = [...propTabs];
    const selectedTab = newTabs.splice(idx, 1);
    newTabs.unshift(selectedTab[0]!);
    setTabs(newTabs);
    setActive(newTabs[0]!);
  };

  const [hovering, setHovering] = useState(false);

  return (
    <>
      <div
        className={cn(
          "no-visible-scrollbar relative flex h-28 w-full max-w-full flex-row items-center justify-center gap-4 overflow-auto overflow-y-clip [perspective:1000px] sm:h-auto sm:overflow-visible",
          containerClassName,
        )}
      >
        {propTabs.map((tab, idx) => (
          <button
            key={tab.title}
            onClick={() => {
              moveSelectedTabToTop(idx);
            }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            className={cn("relative rounded-full px-2 py-2", tabClassName)}
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {active.value === tab.value && (
              <motion.div
                layoutId="clickedbutton"
                transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                className={cn(
                  "border-1 absolute inset-0  rounded-full bg-ptl_accent-def text-black  ",
                  activeTabClassName,
                )}
              />
            )}

            <span className={`relative  flex font-semibold text-white `}>
              {tab.title}
            </span>
          </button>
        ))}
      </div>
      <div className="h-[2px] w-[250px] bg-white/5" />
      <FadeInDiv
        tabs={tabs}
        active={active}
        key={active.value}
        hovering={hovering}
        className={cn("mt-12", contentClassName)}
      />
    </>
  );
};

export const FadeInDiv = ({
  className,
  tabs,
  hovering,
}: {
  className?: string;
  key?: string;
  tabs: Tab[];
  active: Tab;
  hovering?: boolean;
}) => {
  const isActive = (tab: Tab) => {
    return tab.value === tabs[0]!.value;
  };
  return (
    <div className="relative h-full w-full ">
      {tabs.map((tab, idx) => (
        <motion.div
          key={tab.value}
          layoutId={tab.value}
          style={{
            scale: 1 - idx * 0.1,
            top: hovering ? idx * -50 : 0,
            zIndex: -idx,
            opacity: idx < 3 ? 1 - idx * 0.1 : 0,
          }}
          animate={{
            y: isActive(tab) ? [0, 40, 0] : 0,
          }}
          className={cn("absolute left-0 top-0 h-full w-full ", className)}
        >
          {tab.content}
        </motion.div>
      ))}
    </div>
  );
};

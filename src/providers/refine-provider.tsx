//src/providers/refine-provider.tsx

"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@providers/data-provider";
import { authProvider } from "@providers/auth-provider";
import React from "react";

export const RefineProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <Refine
      authProvider={authProvider}
      routerProvider={routerProvider}
      dataProvider={dataProvider}
      resources={[{
        name: "dashboard",
        list: "/dashboard",
      }, {
        name: "blog",
        list: "/blogs",
        create: "/blogs/create",
        edit: "/blogs/[id]/edit",
        show: "/blogs/[id]",
      }, {
        name: "testimonials",
        list: "/testimonials",
        create: "/testimonials/create",
        edit: "/testimonials/[id]/edit",
        show: "/testimonials/[id]",
      }, {
        name: "gallery",
        list: "/gallery",
        create: "/gallery/upload",
        edit: "/gallery/[id]/edit",
      }, {
        name: "popup",
        list: "/popup",
        create: "/popup/create",
        edit: "/popup/[id]/edit",
      }, {
        name: "faq",
        list: "/faq",
        create: "/faq/create",
        edit: "/faq/[id]/edit",
      }, {
        name: "terms",
        list: "/terms",
        edit: "/terms/edit",
      }, {
        name: "settings",
        list: "/settings",
      }, {
        name: "departments",
        list: "/departments",
        create: "/departments/create",
        edit: "/departments/[id]/edit",
        show: "/departments/[id]",
      }
    ]}
      options={{
        syncWithLocation: true,
        warnWhenUnsavedChanges: true,
        useNewQueryKeys: true,
        projectId: "vmdQ9d-RYppCU-IRjCNp",
      }}
    >
      {children}
    </Refine>
  );
};

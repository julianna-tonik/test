"use client";

import { createContext, useContext } from "react";

/**
 * SVG ids (masks, clip paths, gradients) must be unique on the page. The same illustration can be
 * mounted twice (phone + desktop layouts), so every mount point gives its subtree a prefix.
 */
export const IdScope = createContext("");
export const useScopedId = (id: string) => `${useContext(IdScope)}${id}`;

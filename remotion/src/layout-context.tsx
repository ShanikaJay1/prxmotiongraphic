import { createContext, useContext } from "react";
import { layout } from "./config";

export type LayoutOptions = typeof layout;
export const LayoutContext = createContext<LayoutOptions>(layout);
export const useLayout = () => useContext(LayoutContext);

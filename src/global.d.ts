import type { StreamingBlobPayloadInputTypes } from "@smithy/types";
import type { Dialog } from "electron";

declare global {
  interface Window {
    putObject: (
      Bucket: string,
      Key: string,
      body: StreamingBlobPayloadInputTypes,
    ) => Promise<void>;
    removeEmptyDirectories: (
      directory: string,
      exclude?: string[],
    ) => Promise<void>;
    getObjectText: (Bucket: string, Key: string) => Promise<string>;
    headObject: (Bucket: string, Key: string) => Promise<undefined>;
    getObjectBlob: (Bucket: string, Key: string) => Promise<Blob>;
    deleteObject: (Bucket: string, Key: string) => Promise<void>;
    focusedWindowIsMaximized: () => undefined | boolean;
    focusedWindowToggleMaximize: () => void;
    focusedWindowMinimize: () => void;
    focusedWindowClose: () => void;
    MonacoEnvironment: Environment;
    dialog: Dialog;
  }
}

import type { StreamingBlobPayloadInputTypes } from "@smithy/types";

import * as fsa from "stores/fsa";
import { watch, ref } from "vue";
import * as s3 from "stores/s3";

/* -------------------------------------------------------------------------- */

const remote = ref(false),
  bucket = ref("");

/* -------------------------------------------------------------------------- */

let fileSystemDirectoryHandle: FileSystemDirectoryHandle | undefined;

/* -------------------------------------------------------------------------- */

const io: () => typeof s3 | Window = () => (remote.value ? s3 : window);
const putObject = async (
    Key: string,
    body: StreamingBlobPayloadInputTypes,
    ContentType: string,
  ) => {
    if (bucket.value)
      if (fileSystemDirectoryHandle)
        await fsa.putObject(fileSystemDirectoryHandle, Key, body);
      else await io().putObject(bucket.value, Key, body, ContentType);
  },
  removeEmptyDirectories = async () => {
    const exclude = ["node_modules", ".git"];
    if (bucket.value)
      if (fileSystemDirectoryHandle)
        await fsa.removeEmptyDirectories(fileSystemDirectoryHandle, exclude);
      else await io().removeEmptyDirectories?.(bucket.value, exclude);
  },
  getObjectBlob = async (Key: string, ResponseCacheControl?: string) => {
    if (fileSystemDirectoryHandle)
      return fsa.getObjectBlob(fileSystemDirectoryHandle, Key);
    return io().getObjectBlob(bucket.value, Key, ResponseCacheControl);
  },
  getObjectText = async (Key: string, ResponseCacheControl?: string) => {
    if (fileSystemDirectoryHandle)
      return fsa.getObjectText(fileSystemDirectoryHandle, Key);
    return io().getObjectText(bucket.value, Key, ResponseCacheControl);
  },
  headBucket = async (Bucket: string, pin: undefined | string) => {
    try {
      await s3.headBucket(Bucket, pin);
      remote.value = true;
    } catch (err) {
      const { message } = err as Error;
      throw new Error(message);
    }
  },
  headObject = async (Key: string, ResponseCacheControl?: string) => {
    if (fileSystemDirectoryHandle)
      return fsa.headObject(fileSystemDirectoryHandle, Key);
    return io().headObject(bucket.value, Key, ResponseCacheControl);
  },
  deleteObject = async (Key: string) => {
    if (bucket.value)
      if (fileSystemDirectoryHandle)
        await fsa.deleteObject(fileSystemDirectoryHandle, Key);
      else await io().deleteObject(bucket.value, Key);
  },
  setFileSystemDirectoryHandle = (value: FileSystemDirectoryHandle) => {
    fileSystemDirectoryHandle = value;
  };

/* -------------------------------------------------------------------------- */

watch(bucket, (value) => {
  if (!value) {
    s3.setS3Client();
    remote.value = false;
    if (fileSystemDirectoryHandle) fileSystemDirectoryHandle = undefined;
  }
});

/* -------------------------------------------------------------------------- */

export {
  setFileSystemDirectoryHandle,
  removeEmptyDirectories,
  getObjectBlob,
  getObjectText,
  deleteObject,
  headBucket,
  headObject,
  putObject,
  bucket,
};

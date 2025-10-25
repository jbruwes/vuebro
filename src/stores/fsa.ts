/* -------------------------------------------------------------------------- */

import type { StreamingBlobPayloadInputTypes } from "@smithy/types";
import type { RunSequentialPromisesFulfilledResult } from "quasar";

import { runSequentialPromises } from "quasar";

/* -------------------------------------------------------------------------- */

const create = true;

/* -------------------------------------------------------------------------- */

const getHandle = async (
  Bucket: FileSystemDirectoryHandle,
  Key: string,
  Create = false,
) => {
  const branch = [undefined, ...Key.split("/")],
    handle = (
      await runSequentialPromises(
        branch.map(
          (leaf, index) =>
            async (
              resultAggregator: RunSequentialPromisesFulfilledResult<
                number,
                FileSystemDirectoryHandle | FileSystemFileHandle | undefined
              >[],
            ) => {
              if (leaf) {
                const { value } = resultAggregator[index - 1] ?? {};
                if (value?.kind === "directory") {
                  try {
                    return await value.getFileHandle(leaf, { create: false });
                  } catch {
                    try {
                      return await value.getDirectoryHandle(leaf, {
                        create: Create,
                      });
                    } catch {
                      return;
                    }
                  }
                }
              } else return Bucket;
            },
        ),
      )
    ).map(({ value }) => value);
  return branch.length === handle.length
    ? handle[handle.length - 1]
    : undefined;
};
const putObject = async (
    Bucket: FileSystemDirectoryHandle,
    Key: string,
    body: StreamingBlobPayloadInputTypes,
  ) => {
    const keys = Key.split("/"),
      name = keys.pop();
    if (name) {
      const handle = await getHandle(Bucket, keys.join("/"), true);
      if (handle?.kind === "directory") {
        const fileHandle = await handle.getFileHandle(name, { create }),
          writable = await fileHandle.createWritable();
        await writable.write(body as FileSystemWriteChunkType);
        await writable.close();
      }
    }
  },
  removeEmptyDirectories = async (
    directory: FileSystemDirectoryHandle,
    exclude: string[],
  ) => {
    if (exclude.includes(directory.name)) return;
    const values = (await Array.fromAsync(directory.values())).filter(
      ({ kind }) => kind === "directory",
    );
    await Promise.all(
      values.map((value) =>
        removeEmptyDirectories(value as FileSystemDirectoryHandle, exclude),
      ),
    );
    await Promise.allSettled(
      values.map(({ name }) => directory.removeEntry(name)),
    );
  },
  deleteObject = async (Bucket: FileSystemDirectoryHandle, Key: string) => {
    const keys = Key.split("/"),
      name = keys.pop();
    if (name) {
      const handle = await getHandle(Bucket, keys.join("/"));
      if (handle?.kind === "directory") await handle.removeEntry(name);
    }
  },
  headObject = async (Bucket: FileSystemDirectoryHandle, Key: string) => {
    const handle = await getHandle(Bucket, Key);
    if (handle?.kind === "file") return undefined;
    throw new Error("It's not a file");
  },
  getObjectBlob = async (Bucket: FileSystemDirectoryHandle, Key: string) => {
    const handle = await getHandle(Bucket, Key);
    if (handle?.kind === "file") return handle.getFile();
    return new Blob();
  },
  getObjectText = async (Bucket: FileSystemDirectoryHandle, Key: string) =>
    (await getObjectBlob(Bucket, Key)).text();

/* -------------------------------------------------------------------------- */

export {
  removeEmptyDirectories,
  getObjectBlob,
  getObjectText,
  deleteObject,
  headObject,
  putObject,
};

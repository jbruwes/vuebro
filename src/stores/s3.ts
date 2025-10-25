import type { StreamingBlobPayloadInputTypes } from "@smithy/types";
import type { S3ClientConfig } from "@aws-sdk/client-s3";
import type { TCredentials } from "@vuebro/shared";

import {
  DeleteObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { FetchHttpHandler } from "@smithy/fetch-http-handler";
import { validateCredentials } from "@vuebro/shared";
import { mergeDefaults } from "stores/defaults";
import { useStorage } from "@vueuse/core";
import CryptoJS from "crypto-js";

let s3Client: undefined | S3Client;

const credential = useStorage(
    "s3",
    () => {
      const value = {} as TCredentials;
      validateCredentials?.(value) as boolean;
      return value;
    },
    localStorage,
    { mergeDefaults },
  ),
  requestHandler = new FetchHttpHandler(),
  removeEmptyDirectories = undefined;

const setS3Client = (value?: S3Client) => {
  s3Client?.destroy();
  s3Client = value;
};
const headBucket = async (Bucket: string, pin: undefined | string) => {
    let { secretAccessKey, accessKeyId, endpoint, region } =
      credential.value[Bucket] ?? {};
    if (pin) {
      accessKeyId = CryptoJS.AES.decrypt(accessKeyId ?? "", pin).toString(
        CryptoJS.enc.Utf8,
      );
      endpoint = CryptoJS.AES.decrypt(endpoint ?? "", pin).toString(
        CryptoJS.enc.Utf8,
      );
      region = CryptoJS.AES.decrypt(region ?? "", pin).toString(
        CryptoJS.enc.Utf8,
      );
      secretAccessKey = CryptoJS.AES.decrypt(
        secretAccessKey ?? "",
        pin,
      ).toString(CryptoJS.enc.Utf8);
    }
    const credentials = { secretAccessKey, accessKeyId };
    s3Client = new S3Client({
      requestHandler,
      credentials,
      endpoint,
      region,
    } as S3ClientConfig);
    try {
      await s3Client.send(new HeadBucketCommand({ Bucket }));
    } catch (err) {
      setS3Client();
      const { message } = err as Error;
      throw new Error(message);
    }
  },
  getObject = async (
    Bucket: string,
    Key: string,
    ResponseCacheControl?: string,
  ) => {
    if (s3Client)
      try {
        const { ContentType, Body } = await s3Client.send(
          new GetObjectCommand({ ResponseCacheControl, Bucket, Key }),
        );
        const headers = new Headers({ "content-type": ContentType ?? "" });
        return new Response(Body as BodyInit, { headers });
      } catch {
        //
      }
    return new Response();
  },
  putObject = async (
    Bucket: string,
    Key: string,
    body: StreamingBlobPayloadInputTypes,
    ContentType: string,
  ) => {
    const Body =
      typeof body === "string" ? new TextEncoder().encode(body) : body;
    await s3Client?.send(
      new PutObjectCommand({ ContentType, Bucket, Body, Key }),
    );
  },
  headObject = async (
    Bucket: string,
    Key: string,
    ResponseCacheControl?: string,
  ) =>
    s3Client?.send(
      new HeadObjectCommand({ ResponseCacheControl, Bucket, Key }),
    ),
  getObjectBlob = async (
    Bucket: string,
    Key: string,
    ResponseCacheControl?: string,
  ) => (await getObject(Bucket, Key, ResponseCacheControl)).blob(),
  getObjectText = async (
    Bucket: string,
    Key: string,
    ResponseCacheControl?: string,
  ) => (await getObject(Bucket, Key, ResponseCacheControl)).text(),
  deleteObject = async (Bucket: string, Key: string) => {
    await s3Client?.send(new DeleteObjectCommand({ Bucket, Key }));
  };

export {
  removeEmptyDirectories,
  getObjectBlob,
  getObjectText,
  deleteObject,
  setS3Client,
  credential,
  headBucket,
  headObject,
  putObject,
};

import { basename } from 'path';

import { DataLakeServiceClient, StorageSharedKeyCredential } from '@azure/storage-file-datalake';
import pino from 'pino';

export const logger = pino({
    name: 'StatsWales-Alpha-App',
    level: 'debug'
});

const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME || 'your-storage-account-name';
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY || 'your-storage';
// const fileSystemName = process.env.AZURE_STORAGE_FILESYSTEM_NAME || 'your-filesystem-name';
const directoryName = process.env.AZURE_STORAGE_DIRECTORY_NAME || 'your-directory-name';
// const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'your-container-name';

const fileSystemName = 'swdlfs';

const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

const serviceClient = new DataLakeServiceClient(`https://${accountName}.dfs.core.windows.net`, sharedKeyCredential);

export function GetDataLakeServiceClient(): DataLakeServiceClient {
    return serviceClient;
}

// export async function createDirectory(directoryName: string) {
//     const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);
//     const directoryClient = fileSystemClient.getDirectoryClient(directoryName);

//     await directoryClient.create();
// }

export async function uploadFileToDataLake(fileName: string | undefined, fileContent: Buffer) {
    logger.debug(`accountName: ${accountName}, accountKey: ${accountKey}, fileSystemName: ${fileSystemName}`);
    if (fileName === undefined) {
        throw new Error('File name is undefined');
    }
    if (fileContent === undefined) {
        throw new Error('File name is undefined');
    }
    logger.debug(`Uploading file with file '${fileName}' to datalake`);
    const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);
    const directoryClient = fileSystemClient.getDirectoryClient(directoryName);
    const fileClient = directoryClient.getFileClient(fileName);
    const body = fileContent.toString();
    await fileClient.create();
    await fileClient.append(body, 0, fileContent.length);
    await fileClient.flush(fileContent.length);
}

export async function deleteFileFromDataLake(fileName: string) {
    const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);
    const directoryClient = fileSystemClient.getDirectoryClient(directoryName);
    const fileClient = directoryClient.getFileClient(fileName);

    await fileClient.delete();
}

export async function listFilesInDirectory() {
    const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);

    const files = await fileSystemClient.listPaths({ path: directoryName });
    const fileList = [];
    for await (const file of files) {
        if (file.name === undefined) {
            continue;
        }
        logger.debug(`File: ${file.name}, isDirectory: ${file.isDirectory}`);
        fileList.push({ name: basename(file.name), path: file.name, isDirectory: file.isDirectory });
    }
    return fileList;
}

export async function downloadFileFromDataLake(fileName: string) {
    const fileSystemClient = serviceClient.getFileSystemClient(fileSystemName);
    const directoryClient = fileSystemClient.getDirectoryClient(directoryName);
    const fileClient = directoryClient.getFileClient(fileName);

    const downloadResponse = await fileClient.read();
    const body = downloadResponse.readableStreamBody;
    if (body === undefined) {
        throw new Error('ReadableStreamBody is undefined');
    }

    const downloaded = await streamToBuffer(body);

    function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
        const chunks: Uint8Array[] = [];
        if (readableStream === undefined) {
            throw new Error('ReadableStream is undefined');
        }
        return new Promise((resolve, reject) => {
            readableStream.on('data', (data) => {
                chunks.push(data);
            });
            readableStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            readableStream.on('error', reject);
        });
    }

    return downloaded;
}

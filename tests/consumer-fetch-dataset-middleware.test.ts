import { Request, Response, NextFunction } from 'express';

import { fetchPublishedDataset } from '../src/consumer/middleware/fetch-dataset';
import { ApiException } from '../src/shared/exceptions/api.exception';
import { NotFoundException } from '../src/shared/exceptions/not-found.exception';
import { UnknownException } from '../src/shared/exceptions/unknown.exception';

const validDatasetId = '5caeb8ed-ea64-4a58-8cf0-b728308833e5';

const mockReq = (datasetId: string, getPublishedDataset: jest.Mock) =>
  ({ params: { datasetId }, query: {}, body: {}, conapi: { getPublishedDataset } }) as unknown as Request;

const mockRes = () => ({ locals: {}, redirect: jest.fn() }) as unknown as Response;

describe('fetchPublishedDataset middleware', () => {
  it('should set res.locals and call next on success', async () => {
    const dataset = { id: validDatasetId, title: 'Test Dataset' };
    const getPublishedDataset = jest.fn().mockResolvedValue(dataset);
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(res.locals.datasetId).toBe(validDatasetId);
    expect(res.locals.dataset).toBe(dataset);
    expect(next).toHaveBeenCalledWith();
  });

  it('should return NotFoundException for an invalid dataset ID', async () => {
    const getPublishedDataset = jest.fn();
    const req = mockReq('not-a-uuid', getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(getPublishedDataset).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should return NotFoundException when the API returns 404', async () => {
    const getPublishedDataset = jest.fn().mockRejectedValue(new ApiException('Not Found', 404));
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should return NotFoundException when the API returns 401 (do not leak dataset existence)', async () => {
    const getPublishedDataset = jest.fn().mockRejectedValue(new ApiException('Unauthorized', 401));
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should return NotFoundException when the API returns 403 (do not leak dataset existence)', async () => {
    const getPublishedDataset = jest.fn().mockRejectedValue(new ApiException('Forbidden', 403));
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(expect.any(NotFoundException));
  });

  it('should pass through ApiException with a non-error status code', async () => {
    const apiError = new ApiException('Moved Permanently', 301);
    const getPublishedDataset = jest.fn().mockRejectedValue(apiError);
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(apiError);
  });

  it('should pass through the original error when the API returns 500', async () => {
    const apiError = new ApiException('Internal Server Error', 500);
    const getPublishedDataset = jest.fn().mockRejectedValue(apiError);
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(apiError);
  });

  it('should pass through unexpected errors without a status property', async () => {
    const unexpectedError = new Error('Cannot read properties of undefined');
    const getPublishedDataset = jest.fn().mockRejectedValue(unexpectedError);
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(unexpectedError);
  });

  it('should pass through the original error on network failure (UnknownException)', async () => {
    const networkError = new UnknownException('Service Unavailable');
    const getPublishedDataset = jest.fn().mockRejectedValue(networkError);
    const req = mockReq(validDatasetId, getPublishedDataset);
    const res = mockRes();
    const next = jest.fn();

    await fetchPublishedDataset(req, res, next as NextFunction);

    expect(next).toHaveBeenCalledWith(networkError);
  });
});

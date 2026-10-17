import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { ObjectId } from "mongodb";

const { fakeCollection } = vi.hoisted(() => ({
  fakeCollection: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock("../src/db.js", () => ({
  getIssuesCollection: () => fakeCollection,
  getDb: vi.fn(),
}));

const { app } = await import("../src/app.js");

describe("time tracking endpoints", () => {
  beforeEach(() => {
    fakeCollection.findOne.mockReset();
    fakeCollection.findOneAndUpdate.mockReset();
  });

  it("POST /issues/:id/time-log appends the current user's positive hours", async () => {
    const id = new ObjectId();
    const updatedIssue = {
      _id: id,
      timeLog: [
        {
          userId: "user-placeholder-001",
          hoursWorked: 1.5,
          loggedOn: new Date(),
        },
      ],
    };
    fakeCollection.findOneAndUpdate.mockResolvedValue(updatedIssue);

    const response = await request(app)
      .post(`/issues/${id}/time-log`)
      .send({ hoursWorked: 1.5 });

    expect(response.status).toBe(201);
    expect(response.body.timeLog).toHaveLength(1);
    expect(response.body.timeLog[0]).toMatchObject({
      userId: "user-placeholder-001",
      hoursWorked: 1.5,
    });
    expect(response.body.timeLog[0].loggedOn).toBeTruthy();
    expect(fakeCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: id },
      {
        $push: {
          timeLog: {
            $each: [
              expect.objectContaining({
                userId: "user-placeholder-001",
                hoursWorked: 1.5,
              }),
            ],
            $sort: { loggedOn: 1 },
          },
        },
      },
      { returnDocument: "after" },
    );
  });

  it("POST /issues/:id/time-log rejects zero hours", async () => {
    const id = new ObjectId();

    const response = await request(app)
      .post(`/issues/${id}/time-log`)
      .send({ hoursWorked: 0 });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationFailed");
    expect(fakeCollection.findOneAndUpdate).not.toHaveBeenCalled();
  });

  it("GET /issues/:id/time-log/summary returns totals sorted by user id", async () => {
    const id = new ObjectId();
    fakeCollection.findOne.mockResolvedValue({
      _id: id,
      timeLog: [
        { userId: "user-z", hoursWorked: 1 },
        { userId: "user-a", hoursWorked: 2 },
        { userId: "user-z", hoursWorked: 0.5 },
      ],
    });

    const response = await request(app).get(
      `/issues/${id}/time-log/summary`,
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      issueId: id.toHexString(),
      totalHours: 3.5,
      byUser: [
        { userId: "user-a", hours: 2 },
        { userId: "user-z", hours: 1.5 },
      ],
    });
  });

  it("GET /issues/:id/time-log/summary rejects malformed IDs before querying", async () => {
    const response = await request(app).get(
      "/issues/abc/time-log/summary",
    );

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationFailed");
    expect(fakeCollection.findOne).not.toHaveBeenCalled();
  });

  it("GET /issues/:id/time-log/summary returns 404 for an unknown issue", async () => {
    const id = new ObjectId();
    fakeCollection.findOne.mockResolvedValue(null);

    const response = await request(app).get(
      `/issues/${id}/time-log/summary`,
    );

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Issue not found");
  });
});

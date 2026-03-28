export type Review = {
  id: string;
  eventId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerRole: "volunteer" | "organization";
  targetId: string;
  targetName: string;
  rating: number;
  comment: string;
  createdAt: string;
  reliability?: number;
  communication?: number;
  effort?: number;
  organizationQuality?: number;
  instructionsClarity?: number;
  overallExperience?: number;
};

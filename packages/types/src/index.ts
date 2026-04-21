export type UserRole = "MEMBER" | "TALENT" | "ADMIN";
export type ListingStatus = "DRAFT" | "PENDING_REVIEW" | "ACTIVE" | "REJECTED" | "SUSPENDED";
export type VerificationStatus = "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
export type SubscriptionPlan = "FREE" | "PREMIUM" | "ELITE";

export interface ApiEnvelope<T> {
  data: T;
  error: string | null;
}

export interface SessionUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  verificationStatus: VerificationStatus;
}

export interface ListingCard {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  city: string;
  country: string;
  baseRate: number;
  currency: string;
  isFeatured: boolean;
  ownerName: string | null;
  ownerImage: string | null;
  coverUrl: string | null;
  rating: number;
  reviewCount: number;
}

export interface ListingDetail extends ListingCard {
  bio: string | null;
  languages: string[];
  tags: string[];
  media: Array<{
    id: string;
    url: string;
    type: "IMAGE" | "VIDEO";
    moderationStatus: "PENDING" | "APPROVED" | "REJECTED" | "FLAGGED";
  }>;
}

export interface CheckoutSessionRequest {
  userId: string;
  email: string;
  priceId: string;
  mode: "subscription" | "payment";
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface SocketTokenResponse {
  userId: string;
  token: string;
  expiresAt: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface CreateMessagePayload {
  conversationId: string;
  senderId: string;
  body: string;
}

export interface ModerationReviewResult {
  approved: boolean;
  labels: Array<{
    name: string;
    confidence: number;
  }>;
}

export interface StoragePresignRequest {
  fileName: string;
  contentType: string;
}

export interface StoragePresignResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
}

export interface SumsubAccessTokenResponse {
  token: string;
  userId: string;
  levelName: string;
}

export interface WebRtcSessionDescription {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp: string;
}

export interface WebRtcIceCandidate {
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment: string | null;
}

export interface CallOfferPayload {
  conversationId: string;
  fromUserId: string;
  sdp: WebRtcSessionDescription;
}

export interface CallAnswerPayload {
  conversationId: string;
  fromUserId: string;
  sdp: WebRtcSessionDescription;
}

export interface CallIceCandidatePayload {
  conversationId: string;
  fromUserId: string;
  candidate: WebRtcIceCandidate;
}

export interface CallControlPayload {
  conversationId: string;
  fromUserId: string;
}

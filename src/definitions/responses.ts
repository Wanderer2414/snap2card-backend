export interface Time {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  gmt: string;
}

export interface SuccessResponse {
  status: "success";
}

export interface ErrorResponse {
  status: "error";
  message: string;
}

export interface AccountLoginResponse extends SuccessResponse {
  data: {
    token: string;
  };
}

export interface AccountRetrieveResponse extends SuccessResponse {
  data: {
    email: string;
    name: string;
    phone: string;
    createdAt: Time;
  };
}

export type AccountEditResponse = SuccessResponse;

export type AccountLogoutResponse = SuccessResponse;

export interface ActivitiesRetrieveResponse extends SuccessResponse {
  data: {
    streak: number;
    cardsThisMonth: number;
    offset: number;
    counts: number[];
  };
}

export interface CardCreateResponse extends SuccessResponse {
  data: {
    numOfCard: number;
    cards: CardListItem[];
  };
}

export type CardEditResponse = SuccessResponse;

export interface CardListItem {
  id: string;
  frontSide: string;
}

export interface CardListResponse extends SuccessResponse {
  data: {
    numOfCard: number;
    cards: CardListItem[];
  };
}

export interface CardRetrieveItem {
  id: string;
  frontSide: string;
  backSide: string;
}

export interface CardRetrieveResponse extends SuccessResponse {
  data: CardRetrieveItem[];
}

export type CategoryEditResponse = SuccessResponse;

export interface CategoryItem {
  id: string;
  name: string;
  numOfCard: number;
  createdAt: Time;
}

export interface CategoryListResponse extends SuccessResponse {
  data: {
    categoryNum: number;
    categories: CategoryItem[];
  };
}

export interface CategoryRetrieveResponse extends SuccessResponse {
  data: {
    name: string;
    numOfCard: number;
    createdAt: Time;
    cardIds: string[];
  };
}

export interface HistoryItem {
  id: string;
  cardId: string;
  amount: number;
  currency: string;
  description: string;
  occurredAt: Time;
}

export interface HistoryRetrieveResponse extends SuccessResponse {
  data: HistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export interface VocabularyGenerationSource {
  type: "scan" | "pdf";
}

export interface GeneratedVocabularyCard {
  term: string;
  definition: string;
  translation: string;
  partOfSpeech?: string | null;
  example?: string | null;
  sourceSentence?: string | null;
  difficulty?: string | null;
}

export interface VocabularyGenerationResponse extends SuccessResponse {
  data: {
    source: VocabularyGenerationSource;
    cards: GeneratedVocabularyCard[];
  };
}

export type ApiResponse =
  | AccountLoginResponse
  | AccountRetrieveResponse
  | AccountEditResponse
  | AccountLogoutResponse
  | ActivitiesRetrieveResponse
  | CardCreateResponse
  | CardEditResponse
  | CardListResponse
  | CardRetrieveResponse
  | CategoryEditResponse
  | CategoryListResponse
  | CategoryRetrieveResponse
  | HistoryRetrieveResponse
  | VocabularyGenerationResponse
  | ErrorResponse;

export function Time(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  gmt: string
): Time {
  return { year, month, day, hour, minute, second, gmt };
}

export function AccountLogin(token: string): AccountLoginResponse {
  return { status: "success", data: { token } };
}

export function AccountRetrieve(
  email: string,
  name: string,
  phone: string,
  createdAt: Time
): AccountRetrieveResponse {
  return { status: "success", data: { email, name, phone, createdAt } };
}

export function AccountEdit(): AccountEditResponse {
  return { status: "success" };
}

export function AccountLogout(): AccountLogoutResponse {
  return { status: "success" };
}

export function ActivitiesRetrieve(
  streak: number,
  cardsThisMonth: number,
  offset: number,
  counts: number[]
): ActivitiesRetrieveResponse {
  return { status: "success", data: { streak, cardsThisMonth, offset, counts } };
}

export function CardCreate(numOfCard: number, cards: CardListItem[]): CardCreateResponse {
  return { status: "success", data: { numOfCard, cards } };
}

export function CardEdit(): CardEditResponse {
  return { status: "success" };
}

export function CardListItem(id: string, frontSide: string): CardListItem {
  return { id, frontSide };
}

export function CardList(numOfCard: number, cards: CardListItem[]): CardListResponse {
  return { status: "success", data: { numOfCard, cards } };
}

export function CardRetrieveItem(
  id: string,
  frontSide: string,
  backSide: string
): CardRetrieveItem {
  return { id, frontSide, backSide };
}

export function CardRetrieve(data: CardRetrieveItem[]): CardRetrieveResponse {
  return { status: "success", data };
}

export function CategoryEdit(): CategoryEditResponse {
  return { status: "success" };
}

export function CategoryItem(
  id: string,
  name: string,
  numOfCard: number,
  createdAt: Time
): CategoryItem {
  return { id, name, numOfCard, createdAt };
}

export function CategoryList(
  categoryNum: number,
  categories: CategoryItem[]
): CategoryListResponse {
  return { status: "success", data: { categoryNum, categories } };
}

export function CategoryRetrieve(
  name: string,
  numOfCard: number,
  createdAt: Time,
  cardIds: string[]
): CategoryRetrieveResponse {
  return { status: "success", data: { name, numOfCard, createdAt, cardIds } };
}

export function HistoryItem(
  id: string,
  cardId: string,
  amount: number,
  currency: string,
  description: string,
  occurredAt: Time
): HistoryItem {
  return { id, cardId, amount, currency, description, occurredAt };
}

export function HistoryRetrieve(
  data: HistoryItem[],
  page: number,
  limit: number,
  total: number
): HistoryRetrieveResponse {
  return { status: "success", data, meta: { page, limit, total } };
}

export function GeneratedVocabularyCard(
  term: string,
  definition: string,
  translation: string,
  partOfSpeech: string | null = null,
  example: string | null = null,
  sourceSentence: string | null = null,
  difficulty: string | null = null
): GeneratedVocabularyCard {
  return { term, definition, translation, partOfSpeech, example, sourceSentence, difficulty };
}

export function VocabularyGeneration(
  source: VocabularyGenerationSource,
  cards: GeneratedVocabularyCard[]
): VocabularyGenerationResponse {
  return { status: "success", data: { source, cards } };
}

export function ErrorResponse(message: string): ErrorResponse {
  return { status: "error", message };
}

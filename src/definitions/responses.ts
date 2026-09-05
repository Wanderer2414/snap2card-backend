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
    dailyGoal: number;
    createdAt: Time;
  };
}

export type AccountEditResponse = SuccessResponse;

export type AccountLogoutResponse = SuccessResponse;

export interface DailyLearnedCountResponse extends SuccessResponse {
  data: {
    count: number;
  };
}

export interface MonthlyLearnedCountItem {
  day: string;
  cardCount: number;
}

export interface MonthlyLearnedCountResponse extends SuccessResponse {
  data: MonthlyLearnedCountItem[];
}

export interface CardCreateResponse extends SuccessResponse {
  data: {
    numOfCard: number;
    cards: CardListItem[];
  };
}

export interface CardCreateItem {
  frontSide: string;
  backSide: string;
}

export interface CardIdItem {
  id: string;
}

export interface CardCreateIdResponse extends SuccessResponse {
  data: {
    numOfCard: number;
    cards: CardIdItem[];
  };
}

export interface CardCreateTextResponse extends SuccessResponse {
  data: {
    numOfCard: number;
    cards: CardCreateItem[];
  };
}

export type CardEditResponse = SuccessResponse;

export type CardDeleteResponse = SuccessResponse;

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

export type CategoryDeleteResponse = SuccessResponse;

export interface CategoryItem {
  id: string;
  name: string;
  numOfCard: number;
  mastery: number | null;
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
    mastery: number | null;
    createdAt: Time;
    cardIds: string[];
  };
}

export interface RecentCategoryItem {
  categoryId: string;
  name: string;
  mastery: number | null;
  lastTakenAt: Time;
}

export interface RecentCategoryTakeListResponse extends SuccessResponse {
  data: RecentCategoryItem[];
}

export interface ExamCreateResponse extends SuccessResponse {
  data: {
    examId: string;
  };
}

export interface ExamStartResponse extends SuccessResponse {
  data: {
    examLogId: string;
  };
}

export type ExamResultResponse = SuccessResponse;

export interface ExamQuizItem {
  quizId: string;
  frontSide: string;
  backSide: string;
}

export interface ExamReviewResponse extends SuccessResponse {
  data: {
    numOfQuiz: number;
    quizzes: ExamQuizItem[];
  };
}

export interface ReviewLogQuizResultItem {
  quizId: string;
  frontSide: string;
  backSide: string;
  accountAnswer: boolean;
  resultScore: number;
  totalScore: number;
}

export interface ReviewLogDetailItem {
  logId: string;
  examName: string;
  examLevel: string;
  resultScore: number;
  totalScore: number;
  numOfQuiz: number;
  dateDone: Time;
  quizResults: ReviewLogQuizResultItem[];
}

export interface ReviewLogDetailResponse extends SuccessResponse {
  data: ReviewLogDetailItem;
}

export interface AccountRegisterResponse extends SuccessResponse {
  data: {
    accountId: string;
  };
}

export interface CategoryCreateResponse extends SuccessResponse {
  data: {
    categoryId: string;
  };
}

export type CategoryToCardResponse = SuccessResponse;

export type CardToCategoryResponse = SuccessResponse;

export interface CategoryLogItem {
  logId: string;
  examName: string;
  score: number;
  totalScore: number;
  start: Time;
  end: Time;
}

export interface CategoryLogRelatedResponse extends SuccessResponse {
  data: CategoryLogItem[];
}

export type ExamCompletedResponse = SuccessResponse;

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
  | DailyLearnedCountResponse
  | MonthlyLearnedCountResponse
  | CardCreateResponse
  | CardCreateTextResponse
  | CardCreateIdResponse
  | CardEditResponse
  | CardDeleteResponse
  | CardListResponse
  | CardRetrieveResponse
  | CategoryEditResponse
  | CategoryDeleteResponse
  | CategoryListResponse
  | CategoryRetrieveResponse
  | RecentCategoryTakeListResponse
  | ExamCreateResponse
  | ExamStartResponse
  | ExamResultResponse
  | ExamReviewResponse
  | ReviewLogDetailResponse
  | AccountRegisterResponse
  | CategoryCreateResponse
  | CategoryToCardResponse
  | CardToCategoryResponse
  | CategoryLogRelatedResponse
  | ExamCompletedResponse
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
  dailyGoal: number,
  createdAt: Time
): AccountRetrieveResponse {
  return { status: "success", data: { email, name, phone, dailyGoal, createdAt } };
}

export function AccountEdit(): AccountEditResponse {
  return { status: "success" };
}

export function AccountLogout(): AccountLogoutResponse {
  return { status: "success" };
}

export function DailyLearnedCount(count: number): DailyLearnedCountResponse {
  return { status: "success", data: { count } };
}

export function MonthlyLearnedCountItem(day: string, cardCount: number): MonthlyLearnedCountItem {
  return { day, cardCount };
}

export function MonthlyLearnedCount(data: MonthlyLearnedCountItem[]): MonthlyLearnedCountResponse {
  return { status: "success", data };
}

export function CardCreate(numOfCard: number, cards: CardListItem[]): CardCreateResponse {
  return { status: "success", data: { numOfCard, cards } };
}

export function CardCreateItem(frontSide: string, backSide: string): CardCreateItem {
  return { frontSide, backSide };
}

export function CardCreateText(numOfCard: number, cards: CardCreateItem[]): CardCreateTextResponse {
  return { status: "success", data: { numOfCard, cards } };
}

export function CardIdItem(id: string): CardIdItem {
  return { id };
}

export function CardCreateId(numOfCard: number, cards: CardIdItem[]): CardCreateIdResponse {
  return { status: "success", data: { numOfCard, cards } };
}

export function CardEdit(): CardEditResponse {
  return { status: "success" };
}

export function CardDelete(): CardDeleteResponse {
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

export function CategoryDelete(): CategoryDeleteResponse {
  return { status: "success" };
}

export function CategoryItem(
  id: string,
  name: string,
  numOfCard: number,
  mastery: number | null,
  createdAt: Time
): CategoryItem {
  return { id, name, numOfCard, mastery, createdAt };
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
  mastery: number | null,
  createdAt: Time,
  cardIds: string[]
): CategoryRetrieveResponse {
  return { status: "success", data: { name, numOfCard, mastery, createdAt, cardIds } };
}

export function RecentCategoryItem(
  categoryId: string,
  name: string,
  mastery: number | null,
  lastTakenAt: Time
): RecentCategoryItem {
  return { categoryId, name, mastery, lastTakenAt };
}

export function RecentCategoryTakeList(data: RecentCategoryItem[]): RecentCategoryTakeListResponse {
  return { status: "success", data };
}

export function ExamCreate(examId: string): ExamCreateResponse {
  return { status: "success", data: { examId } };
}

export function ExamStart(examLogId: string): ExamStartResponse {
  return { status: "success", data: { examLogId } };
}

export function ExamResult(): ExamResultResponse {
  return { status: "success" };
}

export function ExamQuizItem(quizId: string, frontSide: string, backSide: string): ExamQuizItem {
  return { quizId, frontSide, backSide };
}

export function ExamReview(numOfQuiz: number, quizzes: ExamQuizItem[]): ExamReviewResponse {
  return { status: "success", data: { numOfQuiz, quizzes } };
}

export function ReviewLogQuizResultItem(
  quizId: string,
  frontSide: string,
  backSide: string,
  accountAnswer: boolean,
  resultScore: number,
  totalScore: number
): ReviewLogQuizResultItem {
  return { quizId, frontSide, backSide, accountAnswer, resultScore, totalScore };
}

export function ReviewLogDetailItem(
  logId: string,
  examName: string,
  examLevel: string,
  resultScore: number,
  totalScore: number,
  numOfQuiz: number,
  dateDone: Time,
  quizResults: ReviewLogQuizResultItem[]
): ReviewLogDetailItem {
  return { logId, examName, examLevel, resultScore, totalScore, numOfQuiz, dateDone, quizResults };
}

export function ReviewLogDetail(data: ReviewLogDetailItem): ReviewLogDetailResponse {
  return { status: "success", data };
}

export function AccountRegister(accountId: string): AccountRegisterResponse {
  return { status: "success", data: { accountId } };
}

export function CategoryCreate(categoryId: string): CategoryCreateResponse {
  return { status: "success", data: { categoryId } };
}

export function CategoryToCard(): CategoryToCardResponse {
  return { status: "success" };
}

export function CardToCategory(): CardToCategoryResponse {
  return { status: "success" };
}

export function CategoryLogItem(
  logId: string,
  examName: string,
  score: number,
  totalScore: number,
  start: Time,
  end: Time
): CategoryLogItem {
  return { logId, examName, score, totalScore, start, end };
}

export function CategoryLogRelated(data: CategoryLogItem[]): CategoryLogRelatedResponse {
  return { status: "success", data };
}

export function ExamCompleted(): ExamCompletedResponse {
  return { status: "success" };
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
